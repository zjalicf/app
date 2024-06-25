import {
    generateSymmetricKey,
    stringEncryptAsymmetric,
} from '@skiff-org/skiff-crypto';
import { ServiceKey } from '~/constants';
import {
    EncryptionDatagramType,
    EncryptionWorkerActions,
} from '~/workers/encryption/constants';
import { WorkerContext } from '~/@types/app';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';

export interface Encryption<T> {
    isEncryptable: boolean;
    createEncryptionKey: () => string | undefined;
    shouldEncrypt: (vaultId: string) => boolean;
    decryptData: (vaultId: string, data: T[]) => Promise<T[]>;
    encryptContentBulk: (
        vaultId: string,
        data: Partial<T>[],
    ) => Promise<(T & { encryptedData: string })[]>;
    encryptContent: (
        vaultId: string,
        data: Partial<T>,
        originalEntity: T | null,
    ) => Promise<(T & { encryptedData: string }) | null>;
}

export class EntityEncryption<T extends Record<string, any>>
    implements Encryption<T>
{
    context: WorkerContext;
    encryptionDatagramType: EncryptionDatagramType;
    encryptedProperties: (keyof T)[];

    constructor(
        context: WorkerContext,
        datagramType: EncryptionDatagramType,
        encryptedProperties: (keyof T)[],
    ) {
        this.context = context;
        this.encryptionDatagramType = datagramType;
        this.encryptedProperties = encryptedProperties;
    }

    get isEncryptable() {
        return this.encryptionDatagramType !== EncryptionDatagramType.NONE;
    }

    async decryptData(vaultId: string, data: T[]) {
        if (!this.shouldEncrypt(vaultId)) return data;

        const decryptedData = await this.context.invoke<Partial<T>[]>(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.DECRYPT_SYMMETRIC_BULK,
            {
                type: this.encryptionDatagramType,
                keys: this.context.$deviceService.encryptionKeys,
                data:
                    data.map(entity => ({
                        id: entity.id,
                        encryptedData: entity.encryptedData,
                        encryptionKey: entity.encryptionKey,
                    })) ?? [],
                callerContext: 'encryption/entity.ts/decryptData',
            },
        );
        return data.map((entity, index) => {
            return this.deserializeDecrypted(entity, decryptedData[index]);
        });
    }

    async encryptContentBulk(
        vaultId: string,
        entities: (Partial<T> & { encryptionKey?: string | null })[],
    ): Promise<(T & { encryptedData: string })[]> {
        if (!this.shouldEncrypt(vaultId)) return entities as any;
        const toEncrypt = entities.map(entity => {
            if (!entity.encryptionKey) {
                entity.encryptionKey = this.createEncryptionKey();
            }
            return entity;
        });

        const encryptedData = await this.context.invoke<string[]>(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.ENCRYPT_SYMMETRIC_BULK,
            {
                type: this.encryptionDatagramType,
                data: toEncrypt,
                keys: this.context.$deviceService.encryptionKeys,
                callerContext: 'encryption/entity.ts/encryptContentBulk',
            },
        );

        return entities.map((entity, index) => {
            return this.deserializeEncrypted(entity as T, encryptedData[index]);
        });
    }

    async encryptContent(
        vaultId: string,
        mods: Partial<T> & { encryptionKey?: string | null },
        originalEntity: T | null,
    ) {
        if (!this.shouldEncrypt(vaultId)) return null;
        if (!originalEntity) {
            mods.encryptionKey =
                mods.encryptionKey ?? this.createEncryptionKey();
        }
        if (!this.hasEncryptableProperties(mods)) {
            return null;
        }

        const toEncrypt = { ...originalEntity, ...mods } as T;
        const encryptedData = await this.context.invoke<string>(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.ENCRYPT_SYMMETRIC,
            {
                type: this.encryptionDatagramType,
                data: toEncrypt,
                keys: this.context.$deviceService.encryptionKeys,
                callerContext: 'encryption/entity.ts/encryptContent',
            },
        );
        return this.deserializeEncrypted(toEncrypt, encryptedData);
    }

    shouldEncrypt(vaultId: string) {
        if (this.encryptionDatagramType === EncryptionDatagramType.NONE)
            return false;
        if (!this.encryptedProperties.length) return false;
        const vaultDb = acreomVaultIndexedDB(vaultId);
        const isRemote = vaultDb?.type === 'remote';
        return (
            !!this.encryptionDatagramType &&
            isRemote &&
            !!this.context.$deviceService.encryptionKeys
        );
    }

    createEncryptionKey(): string | undefined {
        if (!this.context.$deviceService.encryptionKeys?.privateKey)
            return undefined;
        const encryptionKey = generateSymmetricKey();
        return stringEncryptAsymmetric(
            this.context.$deviceService.encryptionKeys!.privateKey,
            { key: this.context.$deviceService.encryptionKeys!.publicKey },
            encryptionKey,
        );
    }

    protected hasEncryptableProperties(mods: Partial<T>) {
        return this.encryptedProperties.some(key => key in mods);
    }

    protected clearEncryptedProperties(entity: T) {
        return this.encryptedProperties.reduce(
            (acc: any, key: keyof T) => {
                acc[key] = null;
                return acc;
            },
            { ...entity } as any,
        );
    }

    deserializeEncrypted(
        entity: T,
        encryptedData: string,
    ): T & { encryptedData: string } {
        return {
            ...this.clearEncryptedProperties(entity),
            encryptedData,
        };
    }

    deserializeDecrypted(entity: T, decryptedData: Partial<T>): T {
        return {
            ...entity,
            ...decryptedData,
            encrypted: !!entity.encryptedData,
            encryptedData: undefined,
        };
    }
}
