import { IpcMain, IpcMainEvent } from 'electron';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { WEntity } from '../../frontend/@types';
import { filterUndefinedProperties, isString } from '../helpers/utils';
import { Reader, Writer } from './io';
import { watchList } from './vault';

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    const mergeEntity = (
        original: Partial<WEntity>,
        fromDisk: Partial<WEntity>,
    ): Partial<WEntity> => {
        return {
            ...original,
            ...fromDisk,
            metadata: {
                ...original.metadata,
                ...fromDisk.metadata,
            },
        };
    };

    ipcMain?.handle(
        DEVICE_ACTIONS.FILE_EXISTS,
        async (_: IpcMainEvent, path: string) => {
            return await Reader.exists(path);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_READ,
        async (_event: IpcMainEvent, entity: Partial<WEntity>) => {
            const wentity = await Reader.readFile(entity.filepath);

            return mergeEntity(entity, wentity);
        },
    );
    ipcMain.on('importer-loader-port', (e, _msg) => {
        const [port] = e.ports;
        port.addListener('message', async msg => {
            const entities = msg.data;
            if (isString(entities) && entities === 'done') {
                port.close();
                return;
            }
            const filepaths = entities.map(({ filepath }) => filepath);
            const contents = await Reader.readFilesBatch(filepaths);
            const entitiesWithContent = contents.map((content, index) => {
                const output = mergeEntity(entities[index], content);
                output.metadata.id =
                    entities[index]?.metadata?.id ||
                    entities[index]?.id ||
                    content.metadata.id;
                output.metadata.order =
                    entities[index].order ?? output.metadata.order;
                return output;
            });
            port.postMessage(entitiesWithContent);
        });
        port.start();
        port.addListener('close' as any, () => {
            port.close();
        });
    });
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_BATCH_READ,
        async (_event: IpcMainEvent, entities: Partial<WEntity>[]) => {
            const filepaths = entities.map(({ filepath }) => filepath);
            const contents = await Reader.readFilesBatch(filepaths);
            return contents.map((content, index) => {
                const output = mergeEntity(entities[index], content);
                output.metadata.id =
                    entities[index]?.metadata?.id ||
                    entities[index]?.id ||
                    content.metadata.id;
                return output;
            });
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_CREATE,
        async (_: IpcMainEvent, entity: WEntity) => {
            await Writer.writeFile(entity.vaultId, entity);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_CREATE_BATCH,
        async (_: IpcMainEvent, vaultId: string, entities: WEntity[]) => {
            await Writer.writeFileBatch(vaultId, entities);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_UPDATE,
        async (_: IpcMainEvent, modifications: WEntity, oldEntity: WEntity) => {
            try {
                const modificationsYamlHeader = modifications.yamlHeader;
                const oldYamlHeader = oldEntity.metadata.yamlHeader;
                delete modifications.metadata.yamlHeader;
                delete oldEntity.metadata.yamlHeader;
                const yamlHeader = {
                    ...oldYamlHeader,
                    ...modificationsYamlHeader,
                    ...modifications.metadata,
                };
                const mergedChanges = filterUndefinedProperties<WEntity>({
                    ...oldEntity,
                    ...filterUndefinedProperties<WEntity>(modifications),
                    metadata: filterUndefinedProperties<WEntity>({
                        ...oldEntity.metadata,
                        ...modifications.metadata,
                        ...yamlHeader,
                    }),
                });

                const content = Writer.getContent(modifications);
                if (
                    content !== undefined ||
                    Object.keys(mergedChanges.metadata).length
                ) {
                    await Writer.writeFile(oldEntity.vaultId, {
                        ...mergedChanges,
                        filepath: oldEntity?.filepath ?? mergedChanges.filepath,
                    });
                }

                if (!modifications?.filepath || !oldEntity?.filepath) return;
                if (modifications.filepath !== oldEntity.filepath) {
                    watchList[oldEntity.vaultId]?.registerRename(
                        modifications.filepath,
                    );
                    await Writer.rename(
                        oldEntity.vaultId,
                        oldEntity.filepath,
                        modifications.filepath,
                    );
                }
            } catch (err) {
                console.log(err);
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ENTITY_REMOVE,
        async (_: IpcMainEvent, entity: WEntity) => {
            await Writer.trash(entity.vaultId, entity);
        },
    );
};
