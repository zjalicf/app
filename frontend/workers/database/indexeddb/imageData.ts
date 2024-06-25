import { Table, Transaction } from 'dexie';
import isObject from 'lodash/isObject';
import { defaultsDeep } from 'lodash';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { ImageObject } from '~/@types';
import { CloudServiceAction, ServiceKey } from '~/constants';
import {
    blobToBuffer,
    decryptedBytesToBuffer,
    serializeImage,
} from '~/helpers/image';
import { WorkerContext } from '~/@types/app';
import { ImageDataEncryption } from '~/workers/database/encryption/imageData';

export class ImageDataIndexedDB extends IndexedDBBase<any> {
    shouldStoreLocally = false;
    entity = 'imageData';

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.encryption = new ImageDataEncryption(ctx);
    }

    protected table(vaultId: string): Table<any, string | number> {
        return acreomVaultIndexedDB(vaultId).ImageData;
    }

    async save(vaultId: string, imageObj: any, meta: any): Promise<any> {
        meta = defaultsDeep(meta, {
            writeToDevice: true,
            postprocess: true,
            updatedAt: true,
            encrypt: true,
        });
        let encryptedImageObject = imageObj;
        if (meta?.encrypt) {
            const encryptionKey = this.encryption.createEncryptionKey();
            encryptedImageObject = await this.encryption.encryptContent(
                vaultId,
                {
                    ...imageObj,
                    encryptionKey,
                },
                null,
            );
        }

        return new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.writeToDevice
                            ? meta?.clientId || this.clientId
                            : 'device';
                    await this.table(vaultId).put(
                        encryptedImageObject ?? imageObj,
                    );
                    trx.on('complete', () => {
                        resolve(imageObj);
                    });
                },
            );
        });
    }

    async readFromDisk(
        vaultId: string,
        image: ImageObject,
    ): Promise<string | null> {
        const attachmentData = await this.context.invoke<{
            payload: string;
        }>(ServiceKey.DEVICE, 'attachment:read', image);
        return attachmentData.payload;
    }

    async fetchImageFromRemote(image: ImageObject): Promise<Buffer | null> {
        const data = await this.context.invoke<Blob>(
            ServiceKey.CLOUD,
            CloudServiceAction.RETRIEVE,
            {
                entity: 'images',
                payload: image,
                callerContext: 'indexeddb/imageData.ts/fetchImageFromRemote',
            },
        );

        try {
            if (image?.encryptionKey) {
                const encryptedString = await data.text();
                const [encryptionKey, encryptedData] =
                    encryptedString.split(':');
                const decryptedData = await this.encryption.decryptData(
                    image.vaultId,
                    [
                        {
                            id: image.id,
                            encryptionKey,
                            encryptedData,
                        },
                    ],
                );
                if (!isObject(decryptedData[0]!.data)) {
                    return decryptedData[0]!.data;
                }
                return decryptedBytesToBuffer(decryptedData[0]!.data);
            }
            return blobToBuffer(data);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async retrieveDecryptedImage(
        vaultId: string,
        image: ImageObject,
    ): Promise<string | null> {
        const imageObject = await this.context.$deviceService.Images.retrieve(
            vaultId,
            image.id,
        ).catch(() => null);
        if (!imageObject) return null;
        let imageData = null;
        if (imageObject.isOnDisk && imageObject.filepath) {
            imageData = await this.readFromDisk(vaultId, imageObject);
            if (imageData) {
                return imageData;
            }
        }
        const imageBuffer = await this.fetchImageFromRemote(imageObject!).catch(
            () => null,
        );
        if (!imageBuffer) return null;
        return serializeImage(imageBuffer);
    }
}
