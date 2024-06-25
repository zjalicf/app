import { Context } from '@nuxt/types';
import {
    createKeyFromSecret,
    createPasswordDerivedSecret,
    createRawCompressedJSONDatagram,
    createRawJSONDatagram,
    decryptSymmetric,
    encryptSymmetric,
    generatePublicPrivateKeyPair,
    generateSymmetricKey,
} from '@skiff-org/skiff-crypto';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { SafeElectronWindow } from '~/@types';
import { IUser } from '~/workers/database/indexeddb/types';

type UserPrivateKeys = ReturnType<typeof generatePublicPrivateKeyPair>;
type RecoveryJSONContent = { recoveryKey: string; id: string };
const UserPrivateKeysDatagram =
    createRawCompressedJSONDatagram<UserPrivateKeys>('userPrivateKeys');
const SessionKeyDatagram = createRawJSONDatagram<{ hkdf: string }>(
    'ddl://acreom/session-key',
);
const SessionEncryptionKeyDatagram = createRawJSONDatagram<{
    sessionKey: string;
}>('ddl://acreom/session-encryption-key');

export class Encryption {
    context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    get isEnabled() {
        return !!this.context.store.getters['user/user']?.privateKeys;
    }

    sessionIdentifier(userId: string) {
        return 'user_session:' + userId;
    }

    passwordDerivedSecret(password: string, salt: string) {
        return createKeyFromSecret(password, salt);
    }

    deriveHKDF(secret: string, salt: string) {
        return createPasswordDerivedSecret(secret, salt);
    }

    createSessionEncryptionKey(): any {
        return crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            false,
            ['encrypt', 'decrypt'],
        );
    }

    decryptUserPrivateKeys(privateKeys: string, hkdf: string): UserPrivateKeys {
        return decryptSymmetric(privateKeys, hkdf, UserPrivateKeysDatagram);
    }

    encryptUserPrivateKeys(privateKeys: UserPrivateKeys, hkdf: string) {
        return encryptSymmetric(privateKeys, hkdf, UserPrivateKeysDatagram);
    }

    createUserPrivateKeys() {
        return generatePublicPrivateKeyPair();
    }

    async storeKeyInSession(key: string, userId: string) {
        if (this.context.$utils.isElectron()) {
            const electron = (window as SafeElectronWindow).electron;
            const sessionKey = generateSymmetricKey();
            const encryptedHkdf = encryptSymmetric(
                {
                    hkdf: key,
                },
                sessionKey,
                SessionKeyDatagram,
            );
            const encryptedSessionKey = await electron.crypto.encrypt(
                sessionKey,
            );
            await this.context.$serviceRegistry
                .service(ServiceKey.DATABASE)
                .SessionData.save('', {
                    id: userId,
                    sessionKey: encryptedSessionKey,
                });
            this.context.$appStorage.set(
                this.sessionIdentifier(userId),
                encryptedHkdf,
            );
            return;
        }

        if (this.context.$utils.isMobile) {
            const sessionKey = generateSymmetricKey();
            const encryptedHkdf = encryptSymmetric(
                {
                    hkdf: key,
                },
                sessionKey,
                SessionKeyDatagram,
            );
            // const encryptedSessionKey =

            const sessionEncryptionKey = generateSymmetricKey();
            const encryptedSessionKey = encryptSymmetric(
                {
                    sessionKey,
                },
                sessionEncryptionKey,
                SessionEncryptionKeyDatagram,
            );

            const { SecureStorage } = await import(
                '@aparajita/capacitor-secure-storage'
            );

            await SecureStorage.setSynchronize(false);

            await SecureStorage.set('sessionKey', sessionEncryptionKey);

            await this.context.$serviceRegistry
                .service(ServiceKey.DATABASE)
                .SessionData.save('', {
                    id: userId,
                    sessionKey: encryptedSessionKey,
                });
            this.context.$appStorage.set(
                this.sessionIdentifier(userId),
                encryptedHkdf,
            );
            return;
        }
        const sessionKey = await this.createSessionEncryptionKey();
        const encryptedHkdf = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            sessionKey.publicKey,
            Buffer.from(key),
        );
        await this.context.$serviceRegistry
            .service(ServiceKey.DATABASE)
            .SessionData.save('', {
                id: userId,
                sessionKey,
            });
        const encodedHkdf = btoa(JSON.stringify(new Uint8Array(encryptedHkdf)));
        this.context.$appStorage.set(
            this.sessionIdentifier(userId),
            encodedHkdf,
        );
    }

    get user() {
        return this.context.store.getters['user/user'];
    }

    async restoreKeyFromSession() {
        const user = await this.context.$serviceRegistry.invoke<IUser | null>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_USER,
            {
                callerContext:
                    'encryption/encryption.ts get user restoreKeyFromSession',
            },
        );

        if (!user) return false;

        const encryptedHkdf = this.context.$appStorage.get(
            this.sessionIdentifier(user.id),
        );
        if (!encryptedHkdf) return false;

        if (this.context.$utils.isElectron()) {
            const [encryptedSessionKey] = await this.context.$serviceRegistry
                .service(ServiceKey.DATABASE)
                .SessionData.list('');
            if (!encryptedSessionKey) return false;

            const sessionKey = await (
                window as SafeElectronWindow
            ).electron.crypto.decrypt(encryptedSessionKey.sessionKey);
            const hkdfObject = decryptSymmetric(
                encryptedHkdf,
                sessionKey,
                SessionKeyDatagram,
            );
            if (!hkdfObject?.hkdf) return false;
            await this.context.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                {
                    payload: {
                        data: hkdfObject.hkdf,
                        userId: user.id,
                    },
                    callerContext:
                        'encryption/encryption.ts unlock private keys restoreKeyFromSession',
                },
            );
            return this.isEncryptionUnlocked();
        }

        if (this.context.$utils.isMobile) {
            const [encryptedSessionKey] = await this.context.$serviceRegistry
                .service(ServiceKey.DATABASE)
                .SessionData.list('');
            if (!encryptedSessionKey) return false;

            const { SecureStorage } = await import(
                '@aparajita/capacitor-secure-storage'
            );

            const sessionEncryptionKey = (await SecureStorage.get(
                'sessionKey',
            )) as string | null;

            if (!sessionEncryptionKey) {
                return false;
            }
            try {
                const { sessionKey } = decryptSymmetric(
                    encryptedSessionKey.sessionKey,
                    sessionEncryptionKey,
                    SessionEncryptionKeyDatagram,
                );
                const hkdfObject = decryptSymmetric(
                    encryptedHkdf,
                    sessionKey,
                    SessionKeyDatagram,
                );

                if (!hkdfObject?.hkdf) return false;
                await this.context.$serviceRegistry.invoke(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                    {
                        payload: {
                            data: hkdfObject.hkdf,
                            userId: user.id,
                        },
                        callerContext:
                            'encryption/encryption.ts unlock private keys 2 restoreKeyFromSession',
                    },
                );
                return this.isEncryptionUnlocked();
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        try {
            const decodedData = new Uint8Array(
                Object.values(JSON.parse(atob(encryptedHkdf))),
            );
            const restoredSuccessfully =
                await this.context.$serviceRegistry.invoke<boolean>(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.RESTORE_SESSION_KEY,
                    {
                        payload: { data: decodedData, userId: user.id },
                        callerContext:
                            'encryption/encryption.ts restore session key restoreKeyFromSession',
                    },
                );
            return restoredSuccessfully;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    generateSalt() {
        return generateSymmetricKey();
    }

    isEncryptionEnabled(): boolean {
        return !!this.context.store.getters['user/user']?.privateKeys;
    }

    isEncryptionUnlocked(): Promise<boolean | null> {
        return this.context.$serviceRegistry.invoke<boolean>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DID_RESTORE_SESSION_KEY,
            {
                callerContext: 'encryption/encryption.ts isEncryptionUnlocked',
            },
        );
    }

    openPassphraseModal(onSuccess?: () => void, onClose?: () => void) {
        let success = false;
        onClose =
            onClose ??
            (() => {
                const activeVault = this.context.store.getters['vault/active'];
                if (!activeVault || activeVault.type === 'local') return;
                const localVaults = this.context.store.getters['vault/local'];
                if (!localVaults?.length) return;
                this.context.store.dispatch(
                    'vault/activate',
                    localVaults[0].id,
                );
            });

        const component =
            this.context.$config.platform === 'mobile'
                ? () =>
                      import(
                          '@/components/modal/EncryptionPassphraseModalMobile.vue'
                      )
                : () =>
                      import(
                          '@/components/modal/EncryptionPassphraseModal.vue'
                      );

        window.$nuxt.$vfm.show({
            component,
            bind: {
                modalName: 'EncryptionPassphraseModal',
            },
            on: {
                success: () => {
                    success = true;
                    onSuccess?.();
                },
                closed: () => {
                    if (success) return;
                    onClose?.();
                },
            },
        } as any);
    }

    createRecoveryJSON(recoveryData: RecoveryJSONContent) {
        const arraybuffer = Buffer.from(JSON.stringify(recoveryData)).buffer;
        const blob = new Blob([arraybuffer], {
            type: 'application/octet-stream',
        });

        return this.context.$utils.fileSystem.saveAs(
            blob,
            'acreom-recovery-key.json',
        );
    }

    async parseFileToRecoveryJSON(file: File) {
        const jsonString = await file.text();
        try {
            const recoveryJSON = JSON.parse(jsonString);
            return recoveryJSON;
        } catch (err) {
            return null;
        }
    }

    validateRecoveryJSON(recoveryJSON: RecoveryJSONContent) {
        const { recoveryKey, id } = recoveryJSON;
        if (!recoveryKey || !id) return false;
        return true;
    }

    async enableEncryption(passphrase: string) {
        try {
            const passphraseSalt = this.generateSalt();
            const hkdfSalt = this.generateSalt();
            const passphraseHash = await this.passwordDerivedSecret(
                passphrase,
                passphraseSalt,
            );
            const hkdf = this.deriveHKDF(passphraseHash, hkdfSalt);
            const privateKeys = this.createUserPrivateKeys();
            const encryptedPrivateKeys = this.encryptUserPrivateKeys(
                privateKeys,
                hkdf,
            );

            await this.storeKeyInSession(hkdf, this.user.id);
            await this.context.store.dispatch('user/updateRemote', {
                id: this.user.id,
                passphraseSalt,
                hkdfSalt,
                privateKeys: encryptedPrivateKeys,
            });
            await this.context.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                {
                    payload: {
                        data: hkdf,
                        userId: this.user.id,
                    },
                    callerContext:
                        'encryption/encryption.ts unlock private keys enableEncryption',
                },
            );
            this.context.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.ENABLE_ENCRYPTION,
                {},
            );
            close();
        } catch (e) {
            console.log(e);
            close();
        }
    }
}
