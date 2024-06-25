import { Table } from 'dexie';
import {
    AdditionalContext,
    createDetachedSignatureAsymmetric,
    createPasswordDerivedSecret,
    createRawJSONDatagram,
    decryptSymmetric,
    encryptSymmetric,
    generatePublicPrivateKeyPair,
    generateSymmetricKey,
    SignatureContext,
    verifyDetachedSignatureAsymmetric,
} from '@skiff-org/skiff-crypto';
import { v4 } from 'uuid';
import { IndexedDBBase } from './base';
import { WorkerContext } from '~/@types/app';

type RecoveryKeyEntry = {
    id: string;
    userId: string;
    encryptedData: string;
};

export class RecoveryKeysIndexedDB extends IndexedDBBase<RecoveryKeyEntry> {
    shouldStoreLocally = false;
    protected context: WorkerContext;
    protected deviceService: any;
    protected entity = 'recoveryKey';

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.deviceService = ctx.$deviceService;
    }

    table(_vaultId: string): Table<RecoveryKeyEntry, string> {
        return this.deviceService.configDatabase.RecoveryKeys;
    }

    encrypt(
        privateKeys: ReturnType<typeof generatePublicPrivateKeyPair>,
        key: string,
    ) {
        return encryptSymmetric(
            privateKeys,
            key,
            createRawJSONDatagram('acreom://datagram/recoveryKey'),
        );
    }

    decryptAndVerifyRecovery(encryptedData: string, recoveryKeyString: string) {
        const recoveryKey = recoveryKeyString.slice(0, 43) + '=';
        const signature = recoveryKeyString.slice(43);
        const keys = decryptSymmetric<
            ReturnType<typeof generatePublicPrivateKeyPair>
        >(
            encryptedData,
            recoveryKey,
            createRawJSONDatagram('acreom://datagram/recoveryKey'),
        );
        const isValid = verifyDetachedSignatureAsymmetric(
            [recoveryKey, encryptedData].join('/'),
            signature,
            keys.signingPublicKey,
            SignatureContext.RecoveryData,
            AdditionalContext.NoContext,
        );

        return {
            isValid,
            keys,
        };
    }

    async createRecoveryKey(
        privateKeys: ReturnType<typeof generatePublicPrivateKeyPair>,
    ) {
        const recoveryKey = createPasswordDerivedSecret(
            generateSymmetricKey(),
            generateSymmetricKey(),
        );
        const encryptedKeys = this.encrypt(privateKeys, recoveryKey);
        const signature = createDetachedSignatureAsymmetric(
            [recoveryKey, encryptedKeys].join('/'),
            privateKeys.signingPrivateKey!,
            SignatureContext.RecoveryData,
            AdditionalContext.NoContext,
        );
        const recoveryKeyEntry = {
            id: v4(),
            encryptedData: encryptedKeys,
        };
        await this.save('', recoveryKeyEntry);
        return {
            recoveryKey: [recoveryKey.slice(0, -1), signature].join(''),
            id: recoveryKeyEntry.id,
        };
    }
}
