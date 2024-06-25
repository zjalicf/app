import { WorkerContext } from '~/@types/app';
import { ImageObject, IFolder, IVault, WEntity } from '~/@types';
import { CloudServiceAction, ServiceKey, UtilActions } from '~/constants';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { IO } from '~/workers/database/device/io/entity';

type SyncToDeviceOptions = {
    documents: boolean;
    events: boolean;
    tasks: boolean;
    folders: boolean;
    images: boolean;
};

export class DeviceWriter<T extends Record<string, any>> {
    private context: WorkerContext;
    private io: IO;
    private source: IndexedDBBase<T>;

    constructor(ctx: WorkerContext, io: IO, source: IndexedDBBase<T>) {
        this.context = ctx;
        this.io = io;
        this.source = source;
    }

    async convertToMD(vaultId: string, content: string | string[]) {
        if (!Array.isArray(content)) {
            content = [content];
        }
        const { payload: convertedContent } = await this.context.invoke<{
            payload: string[];
        }>(ServiceKey.UTILS, UtilActions.PARSE_HTML_TO_MD, {
            vaultId,
            entity: content.map(content => ({ content, vaultId })),
            callerContext: 'writer.ts/convertToMD',
        });
        return convertedContent;
    }

    async syncEntity(
        vault: IVault,
        storage: IndexedDBBase<T>,
        filter?: (entity: T) => boolean,
        extension = '.md',
    ) {
        const filemap = new Set<string>();
        if (!storage.canStoreLocally) return;
        const entities = await storage.list(vault.id, undefined, filter);
        const entitiesContent = entities.map(entity =>
            storage.getContent(entity),
        );
        const createFilepath = async (entity: T): Promise<string> => {
            const filepathBase = await storage.createFilepathBase(
                entity,
                entity,
                true,
                vault,
            );
            let filepath = filepathBase + extension;
            let index = 0;
            while (filemap.has(filepath)) {
                index++;
                filepath = filepathBase + ` ${index}${extension}`;
            }
            filemap.add(filepath);
            return filepath;
        };

        const entitiesToWrite = await Promise.all(
            entities.map(async (entity): Promise<WEntity> => {
                const metadata = storage.createDeviceWriteMeta(entity);
                metadata.filepath = await createFilepath(entity);
                // @ts-ignore
                entity.filepath = metadata.filepath;
                await storage.save(vault.id, entity, {
                    writeToDevice: false,
                    updatedAt: false,
                });
                return metadata;
            }),
        );
        const parsedContents = await storage.convertContentForWriting(
            vault.id,
            entitiesContent.map(
                content => ({ content, vaultId: vault.id } as any),
            ),
        );

        return this.io.createBatch(
            vault.id,
            entitiesToWrite.map((entity, index) => {
                return {
                    ...entity,
                    content: parsedContents[index],
                };
            }),
        );
    }

    async exportImagesBatch(vault: IVault): Promise<any> {
        const imageObjects = await this.context.$deviceService.Images.list(
            vault.id,
        );
        const register = new Set<string>();
        const imageObjectsWithFilepath = await Promise.all(
            imageObjects.map(async e => ({
                ...e,
                filepath:
                    await this.context.$deviceService.Images.createFilePath(
                        e,
                        e,
                        false,
                        vault,
                        register,
                    ),
            })),
        );

        const fetchImage = async (
            imageObj: ImageObject,
        ): Promise<Uint8Array> => {
            const imageData = await this.context.invoke<Blob>(
                ServiceKey.CLOUD,
                CloudServiceAction.RETRIEVE,
                {
                    entity: 'images',
                    payload: imageObj,
                    callerContext: 'writer.ts/fetchImage',
                },
            );
            return new Uint8Array(await imageData.arrayBuffer());
        };

        const batchSave = async (imageObjects: ImageObject[]): Promise<any> => {
            const imagesWithContent = await Promise.all(
                imageObjects.map(async image => {
                    return {
                        ...image,
                        content: await fetchImage(image),
                    };
                }),
            );

            return this.context.invoke(
                ServiceKey.DEVICE,
                'attachment:createBatch',
                imagesWithContent,
            );
        };

        while (imageObjectsWithFilepath.length > 0) {
            const batch = imageObjectsWithFilepath.splice(0, 5);
            await batchSave(batch);
        }
    }

    createFolder(project: IFolder) {
        return this.context.invoke(ServiceKey.DEVICE, 'folder:create', project);
    }

    createFoldersBatch(projects: IFolder[]) {
        return this.context.invoke(
            ServiceKey.DEVICE,
            'folder:createBatch',
            projects,
        );
    }

    renameFolder(project: IFolder, mods: IFolder, oldObj: IFolder) {
        return this.context
            .invoke<{ payload: any }>(ServiceKey.DEVICE, 'folder:update', {
                project,
                mods,
                oldObj,
            })
            .then(({ payload }) => payload);
    }

    deleteFolder(project: IFolder) {
        return this.context.invoke(ServiceKey.DEVICE, 'folder:delete', project);
    }

    create(entity: WEntity) {
        return this.io.create(entity);
    }

    createBatch(vaultId: string, entities: WEntity[]) {
        return this.io.createBatch(vaultId, entities);
    }

    update(mods: WEntity, oldObj: WEntity) {
        return this.io.update(mods, oldObj);
    }

    delete(entity: WEntity) {
        return this.io.delete(entity);
    }
}
