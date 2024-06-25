import { IDocument } from '~/components/document/model';
import { EntityEncryption } from '~/workers/database/encryption/entity';
import { WorkerContext } from '~/@types/app';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { folderEncryptedProperties } from '~/workers/encryption/datagrams';
import { IFolder } from '~/@types';

export class FolderEncryption extends EntityEncryption<IFolder> {
    constructor(context: WorkerContext) {
        super(
            context,
            EncryptionDatagramType.FOLDER,
            folderEncryptedProperties,
        );
    }

    async encryptContent(
        vaultId: string,
        data: Partial<IFolder>,
        originalEntity: IFolder | null,
    ): Promise<(IFolder & { encryptedData: string }) | null> {
        const isEnablingSharing: boolean =
            !!data.sharingUuid && !originalEntity?.sharingUuid;
        const isDisablingSharing: boolean =
            'sharingUuid' in data &&
            !data.sharingUuid &&
            !!originalEntity?.sharingUuid;
        if (
            isEnablingSharing ||
            (!isDisablingSharing && !!originalEntity?.sharingUuid)
        ) {
            return {
                ...originalEntity,
                ...data,
                encryptedData: '',
            } as IFolder & { encryptedData: string };
        }
        return super.encryptContent(vaultId, data, originalEntity);
    }

    async encryptContentBulk(
        vaultId: string,
        data: Partial<IFolder>[],
    ): Promise<(IFolder & { encryptedData: string })[]> {
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
