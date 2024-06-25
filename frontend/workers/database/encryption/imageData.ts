import { EntityEncryption } from '~/workers/database/encryption/entity';
import { WorkerContext } from '~/@types/app';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { imageEncryptedProperties } from '~/workers/encryption/datagrams';
export class ImageDataEncryption extends EntityEncryption<any> {
    constructor(ctx: WorkerContext) {
        super(ctx, EncryptionDatagramType.IMAGE_DATA, imageEncryptedProperties);
    }

    deserializeEncrypted(entity: any, encryptedData: string): any {
        return {
            ...this.clearEncryptedProperties(entity),
            encryptedData: [entity.encryptionKey, encryptedData].join(':'),
        };
    }
}
