import { WorkerBase } from '~/workers/base';
import { ServiceKey } from '~/constants';
import { EncryptionWorkerActions } from '~/workers/encryption/constants';
import { encryptionFactory } from '~/workers/encryption/factory';
import {
    DocumentDatagram,
    FolderDatagram,
    ImageDatagram,
    ImageObjectDatagram,
    IntegrationDatagram,
    VersionDatagram,
    ViewDatagram,
} from '~/workers/encryption/datagrams';

export class EncryptionWorker extends WorkerBase {
    protected invokeTimeout: number = 20_000;
    protected serviceKey = ServiceKey.ENCRYPTION;

    public constructor() {
        super();
        encryptionFactory.registerDatagram(DocumentDatagram);
        encryptionFactory.registerDatagram(FolderDatagram);
        encryptionFactory.registerDatagram(ImageDatagram);
        encryptionFactory.registerDatagram(ImageObjectDatagram);
        encryptionFactory.registerDatagram(ViewDatagram);
        encryptionFactory.registerDatagram(IntegrationDatagram);
        encryptionFactory.registerDatagram(VersionDatagram);
    }

    getEncryptionKey(data: any, keys: any) {
        return encryptionFactory
            .asymmetric()
            .decrypt(data?.encryptionKey, keys.privateKey, keys.publicKey);
    }

    async processMessage(operation: string, payload: any): Promise<any> {
        let crypto: any = null;
        switch (operation) {
            case EncryptionWorkerActions.ENCRYPT_SYMMETRIC:
                return encryptionFactory
                    .symmetric(payload.type)
                    .encrypt(
                        payload.data,
                        this.getEncryptionKey(payload.data, payload.keys),
                    );
            case EncryptionWorkerActions.DECRYPT_SYMMETRIC:
                return encryptionFactory
                    .symmetric(payload.type)
                    .decrypt(
                        payload.data.encryptedData,
                        this.getEncryptionKey(payload.data, payload.keys),
                    );
            case EncryptionWorkerActions.ENCRYPT_SYMMETRIC_BULK:
                crypto = encryptionFactory.symmetric(payload.type);
                return payload.data.map((data: any) => {
                    if (!data?.encryptionKey) return data;
                    return crypto.encrypt(
                        data,
                        this.getEncryptionKey(data, payload.keys),
                    );
                });
            case EncryptionWorkerActions.DECRYPT_SYMMETRIC_BULK:
                crypto = encryptionFactory.symmetric(payload.type);
                return payload.data.map((data: any) => {
                    if (!data?.encryptedData || !data?.encryptionKey) {
                        return data;
                    }
                    try {
                        let retryCount = 0;
                        let result = crypto.decrypt(
                            data.encryptedData,
                            this.getEncryptionKey(data, payload.keys),
                        );

                        while (result.encryptedData && retryCount < 5) {
                            retryCount++;
                            result = crypto.decrypt(
                                result.encryptedData,
                                this.getEncryptionKey(result, payload.keys),
                            );
                        }

                        return result;
                    } catch (e) {
                        console.log(e);
                        return data;
                    }
                });
            case EncryptionWorkerActions.ENCRYPT_ASYMMETRIC:
                return encryptionFactory
                    .asymmetric()
                    .encrypt(
                        payload.data,
                        payload.keys.privateKey,
                        payload.keys.publicKey,
                    );
            case EncryptionWorkerActions.DECRYPT_ASYMMETRIC:
                return encryptionFactory
                    .asymmetric()
                    .decrypt(
                        payload.data,
                        payload.keys.privateKey,
                        payload.keys.publicKey,
                    );
            case EncryptionWorkerActions.ENCRYPT_ASYMMETRIC_BULK:
                crypto = encryptionFactory.asymmetric();
                return payload.data.map((data: string) => {
                    return crypto.encrypt(
                        data,
                        payload.keys.privateKey,
                        payload.keys.publicKey,
                    );
                });
            case EncryptionWorkerActions.DECRYPT_ASYMMETRIC_BULK:
                crypto = encryptionFactory.asymmetric();
                return payload.data.map((data: string) => {
                    return crypto.decrypt(
                        data,
                        payload.keys.privateKey,
                        payload.keys.publicKey,
                    );
                });
        }
    }
}
