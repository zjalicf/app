import { IDocument } from '~/components/document/model';
import { EntityEncryption } from '~/workers/database/encryption/entity';
import { imagesRegex } from '~/constants/regexp';
import { WorkerContext } from '~/@types/app';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { documentEncryptedProperties } from '~/workers/encryption/datagrams';

export class DocumentEncryption extends EntityEncryption<IDocument> {
    constructor(context: WorkerContext) {
        super(
            context,
            EncryptionDatagramType.DOCUMENT,
            documentEncryptedProperties,
        );
    }

    async encryptContent(
        vaultId: string,
        data: Partial<IDocument>,
        originalEntity: IDocument | null,
    ): Promise<(IDocument & { encryptedData: string }) | null> {
        const isEnablingSharing: boolean =
            !!data.sharingUuid && !originalEntity?.sharingUuid;
        const isDisablingSharing: boolean =
            'sharingUuid' in data &&
            !data.sharingUuid &&
            !!originalEntity?.sharingUuid;
        if (isEnablingSharing) {
            this.decryptAttachmentsOnEnableSharing(
                vaultId,
                data,
                originalEntity,
            ).catch(e => {
                console.log('decryptAttachmentsOnEnableSharing', e);
            });
        }
        if (
            isEnablingSharing ||
            (!isDisablingSharing && !!originalEntity?.sharingUuid)
        ) {
            const rawData = {
                ...originalEntity,
                ...data,
                encryptedData: '',
            };
            return rawData as IDocument & { encryptedData: string };
        }
        if (isDisablingSharing) {
            this.encryptAttachmentsOnDisableSharing(
                vaultId,
                data,
                originalEntity,
            ).catch(e => {
                console.log('encryptAttachmentsOnDisableSharing', e);
            });
        }
        const result = await super.encryptContent(
            vaultId,
            data,
            originalEntity,
        );
        return result;
    }

    async decryptAttachmentsOnEnableSharing(
        vaultId: string,
        data: Partial<IDocument>,
        originalEntity: IDocument | null,
    ) {
        const imageIds = this.extractImagesFromContent(
            data.content ?? originalEntity?.content ?? '',
        );
        const batchSize = 5;
        let chunk = [];
        do {
            chunk = imageIds.splice(0, batchSize);
            const promises = chunk.map(imageId =>
                this.context.$deviceService.Images.decryptForSharing(
                    vaultId,
                    imageId,
                ),
            );
            await Promise.all(promises);
        } while (imageIds.length > 0);
    }

    async encryptAttachmentsOnDisableSharing(
        vaultId: string,
        data: Partial<IDocument>,
        originalEntity: IDocument | null,
    ) {
        const imageIds = this.extractImagesFromContent(
            data.content ?? originalEntity?.content ?? '',
        );
        const batchSize = 5;
        let chunk = [];
        do {
            chunk = imageIds.splice(0, batchSize);
            const promises = chunk.map(imageId =>
                this.context.$deviceService.Images.encryptOnDisableSharing(
                    vaultId,
                    imageId,
                ),
            );
            await Promise.all(promises);
        } while (imageIds.length > 0);
    }

    extractImagesFromContent(content: string): string[] {
        const match = content.matchAll(imagesRegex);
        if (!match) return [];

        const imageIds = new Set<string>();
        for (const entity of match) {
            const entityId = entity[1];
            if (entityId === 'new') continue;
            imageIds.add(entityId);
        }
        return [...imageIds];
    }

    async encryptContentBulk(
        vaultId: string,
        data: Partial<IDocument>[],
    ): Promise<(IDocument & { encryptedData: string })[]> {
        const sharedEntities = data.filter(entity => entity.sharingUuid);
        const nonSharedEntities = data.filter(entity => !entity.sharingUuid);
        const encryptedEntities = await super.encryptContentBulk(
            vaultId,
            nonSharedEntities,
        );
        return [
            ...encryptedEntities,
            ...(sharedEntities.map(entity => ({
                ...entity,
                encryptedData: '',
            })) as any[]),
        ];
    }

    hasEncryptableProperties(data: Partial<IDocument>): boolean {
        if ('sharingUuid' in data) {
            return true;
        }
        return super.hasEncryptableProperties(data);
    }
}
