import { defaultsDeep } from 'lodash';
import {
    BasicWatchEvent,
    IFolder,
    RenameWatchEvent,
    WatchEvent,
} from '~/@types';
import { WorkerContext } from '~/@types/app';
import { LoadProgressState, ServiceKey, UtilActions } from '~/constants';
import { FileImporter } from '~/workers/database/device/importer';
import { MDLoader } from '~/workers/database/device/importer/loader';
import { MDParser } from '~/workers/database/device/parser';
import { DeviceReporter } from '~/workers/database/reporter';
import {
    ImporterEvents,
    ProgressReporter,
} from '~/workers/database/reporter/interface';
import { StorageType } from '~/workers/utils/parsers';
import { customMerge } from '~/helpers/util';

export class DeviceWatcher {
    private context: WorkerContext;
    private importers: Record<string, FileImporter>;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
        this.importers = {};

        this.processWatchEvents = this.processWatchEvents.bind(this);
    }

    private hasImporter(vaultId: string) {
        return !!this.importers[vaultId];
    }

    private async createImporter(vaultId: string) {
        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );
        if (!vault) return;
        const reporter = new DeviceReporter(this.context, vaultId);
        this.registerProgressListeners(
            reporter,
            LoadProgressState.IMPORTING_NEW_CHANGES,
        );
        this.importers[vaultId] = new FileImporter(
            vault,
            this.context,
            new MDLoader(this.context),
            new MDParser(this.context),
            this.context.$deviceService.dbResolver(),
            reporter,
            {
                copy: false,
                batchSize: 50,
            },
        );
    }

    async processWatchEvents(events: WatchEvent[]) {
        const acreomEntityEvents = events.filter(event =>
            ['document', 'folder'].includes(event.entity),
        );
        const attachments = events.filter(event =>
            ['attachment'].includes(event.entity),
        );

        const configs = events.filter(event =>
            ['config'].includes(event.entity),
        );

        const vaults = events.filter(event => ['vault'].includes(event.entity));

        for (const vault of vaults) {
            const vaultId = vault.data.vaultId;
            const existingVault =
                await this.context.$deviceService.Vaults.retrieve('', vaultId);
            if (!existingVault) {
                this.context.$deviceService.disconnectWatch({
                    id: vaultId,
                } as any);
                continue;
            }
            if (existingVault.type !== 'local') {
                await this.context.$deviceService.Vaults.save(
                    '',
                    {
                        id: vaultId,
                        filepath: undefined,
                    },
                    { clientId: 'device' },
                );
                this.context.$deviceService.removeFilepathFromEntities(vaultId);
                continue;
            }
            await this.context.$deviceService.Vaults.delete('', existingVault, {
                clientId: 'device',
            });
        }

        const attachmentEvents = attachments.reduce((acc, event) => {
            acc[event.data.vaultId] = acc[event.data.vaultId] || [];
            acc[event.data.vaultId].push(event);
            return acc;
        }, {} as Record<string, any[]>);

        for (const vaultId in attachmentEvents) {
            const isBeingDeleted = vaults.some(
                event => event.data.vaultId === vaultId,
            );
            if (isBeingDeleted) continue;
            const attachments = attachmentEvents[vaultId];
            const toAdd = attachments.filter(
                event => event.event === 'add',
            ) as BasicWatchEvent[];
            const toDelete = attachments.filter(
                event => event.event === 'delete',
            ) as BasicWatchEvent[];

            await Promise.all([
                this.context.invoke(
                    ServiceKey.UTILS,
                    UtilActions.INDEX_ENTITY,
                    {
                        vaultId,
                        type: StorageType.DEVICE_MEDIA,
                        entity: toAdd.map(event => event.data),
                        callerContext: 'watcher.ts/processWatchEvent',
                    },
                ),
                this.context.invoke(
                    ServiceKey.UTILS,
                    UtilActions.REMOVE_ENTITY,
                    {
                        vaultId,
                        type: StorageType.DEVICE_MEDIA,
                        entity: toDelete.map(event => event.data),
                        callerContext: 'watcher.ts/processWatchEvent',
                    },
                ),
            ]);
            const imagesToDelete =
                await this.context.$deviceService.Images.listByFilepath(
                    vaultId,
                    toDelete.map(event => event.data.filepath),
                );
            await Promise.all([
                this.context.$deviceService.Images.deleteBulk(
                    vaultId,
                    imagesToDelete,
                ),
                this.context.invoke(
                    ServiceKey.UTILS,
                    UtilActions.REMOVE_ENTITY,
                    {
                        vaultId,
                        type: StorageType.IMAGE,
                        entity: imagesToDelete,
                        callerContext: 'watcher.ts/processWatchEvent',
                    },
                ),
            ]);
        }

        const configEvents = configs.reduce((acc, event) => {
            acc[event.data.vaultId] = acc[event.data.vaultId] || [];
            acc[event.data.vaultId].push(event);
            return acc;
        }, {} as Record<string, any[]>);

        for (const vaultId in configEvents) {
            if (!this.hasImporter(vaultId)) {
                await this.createImporter(vaultId);
            }
            const addOrChangeEvents = configEvents[vaultId].filter(
                event =>
                    this.isRegularEvent(event, 'add') ||
                    this.isRegularEvent(event, 'change'),
            ) as BasicWatchEvent[];
            const deleteEvents = configEvents[vaultId].filter(event =>
                this.isRegularEvent(event, 'delete'),
            ) as BasicWatchEvent[];

            await this.addOrUpdateProjects(vaultId, addOrChangeEvents);
            await this.deleteProjects(vaultId, deleteEvents);
        }

        const vaultsEntityEvents = acreomEntityEvents.reduce((acc, event) => {
            acc[event.data.vaultId] = acc[event.data.vaultId] || [];
            acc[event.data.vaultId].push(event);
            return acc;
        }, {} as Record<string, WatchEvent[]>);

        for (const vaultId in vaultsEntityEvents) {
            const isBeingDeleted = vaults.some(
                event => event.data.vaultId === vaultId,
            );
            if (isBeingDeleted) continue;
            if (!this.hasImporter(vaultId)) {
                await this.createImporter(vaultId);
            }
            const addEvents = vaultsEntityEvents[vaultId].filter(event =>
                this.isRegularEvent(event, 'add'),
            ) as BasicWatchEvent[];
            const changeEvents = vaultsEntityEvents[vaultId].filter(event =>
                this.isRegularEvent(event, 'change'),
            ) as BasicWatchEvent[];
            const deleteEvents = vaultsEntityEvents[vaultId].filter(event =>
                this.isRegularEvent(event, 'delete'),
            ) as BasicWatchEvent[];
            const renameEvents = vaultsEntityEvents[vaultId].filter(event =>
                this.isRenameEvent(event),
            ) as RenameWatchEvent[];

            // first rename in case some events happened in the renamed folder.
            await this.renameEntities(vaultId, renameEvents);
            await this.deleteEntities(vaultId, deleteEvents);
            await this.addEntities(vaultId, addEvents);
            await this.updateEntities(vaultId, changeEvents);
        }
    }

    async addOrUpdateProjects(vaultId: string, events: BasicWatchEvent[]) {
        const projectsIndexedDB =
            this.importers[vaultId].dbFactory.resolve('folder');
        const projectsFilepaths = events.map(event => {
            return event.data.dir;
        });

        const projects = await projectsIndexedDB.listByFilepath(
            vaultId,
            projectsFilepaths,
        );
        const response = await this.context.invoke<{ payload: any[] }>(
            ServiceKey.DEVICE,
            'entity:batchRead',
            events.map(e => e.data),
        );
        if (!response?.payload) return;
        const metadata = response.payload.map(data => data.metadata.yamlHeader);
        await projectsIndexedDB.saveBulk(
            vaultId,
            projects.map((project, index) => {
                return {
                    ...project,
                    type: metadata[index].type || project.type || 'folder',
                    icon: metadata[index].icon || project.icon || null,
                    properties: customMerge(
                        project.properties,
                        metadata[index],
                    ),
                };
            }),
            {
                writeToDevice: false,
                clientId: 'device',
            },
        );
    }

    async deleteProjects(vaultId: string, events: BasicWatchEvent[]) {
        const projectsIndexedDB =
            this.importers[vaultId].dbFactory.resolve('folder');
        const projectsFilepaths = events.map(event => {
            return event.data.dir;
        });

        const projects = await projectsIndexedDB.listByFilepath(
            vaultId,
            projectsFilepaths,
        );
        const response = await this.context.invoke<{ payload: any[] }>(
            ServiceKey.DEVICE,
            'entity:batchRead',
            events.map(e => e.data),
        );
        if (!response?.payload) return;
        // TODO: the `properties: undefined` is not ideal
        await projectsIndexedDB.saveBulk(
            vaultId,
            projects.map((project, index) => {
                return {
                    ...project,
                    type: 'folder',
                    icon: project.icon ?? null,
                    properties: undefined,
                };
            }),
            {
                writeToDevice: false,
                clientId: 'device',
            },
        );
    }

    async addEntities(vaultId: string, entities: BasicWatchEvent[]) {
        const listDirEntities = entities.map(entity => entity.data);
        const projectFilepaths = new Set<string>(
            listDirEntities.map((entity: any) => entity.dir),
        );
        const projects =
            await this.context.$deviceService.Projects.listByFilepath(vaultId, [
                ...projectFilepaths.values(),
            ]);

        const existingEntities = await this.listEntitiesByFilepaths(
            vaultId,
            listDirEntities.map(entity => entity.filepath),
        );

        const existingFilepaths = new Set<string>(
            Object.values(existingEntities)
                .flat(1)
                .map((entity: any) => entity.filepath),
        );

        const projectMap = projects.reduce((acc, project) => {
            acc[project.filepath!] = project;
            return acc;
        }, {} as Record<string, IFolder>);

        const processedEntities = listDirEntities.map((entity: any) => {
            const project = projectMap[entity.dir];
            if (entity.isDirectory) {
                const exists = projectMap[entity.filepath];
                return {
                    ...entity,
                    id: exists?.id ?? entity.id,
                    parentId: project?.id ?? null,
                };
            }
            return {
                ...entity,
                parentId: project?.id ?? null,
            };
        });

        await this.importers[vaultId].importFilepaths(
            processedEntities.filter(
                entity => !existingFilepaths.has(entity.filepath),
            ),
        );
    }

    async updateEntities(vaultId: string, entities: BasicWatchEvent[]) {
        const listDirEntities = entities.map(entity => entity.data);
        const filepathsSet = new Set([
            ...listDirEntities.map(entity => entity.filepath),
            ...listDirEntities.map(entity => entity.dir),
        ]);

        const { folders, documents } = await this.listEntitiesByFilepaths(
            vaultId,
            [...filepathsSet],
        );

        const projectMap = this.createEntityMap(folders);
        const documentMap = this.createEntityMap(documents);

        const updatedListDirs = this.importers[vaultId].getUpdatedFilepaths(
            listDirEntities,
            { map: projectMap, array: folders },
            { map: documentMap, array: documents },
        );

        await this.importers[vaultId].importFilepaths(updatedListDirs);
    }

    async deleteEntities(vaultId: string, entities: BasicWatchEvent[]) {
        const listDirEntities = entities.map(entity => entity.data);
        const { folders, documents } = await this.listEntitiesByFilepaths(
            vaultId,
            listDirEntities.map(entity => entity.filepath),
        );
        await this.importers[vaultId].deleteMissingEntities([
            ...folders.map(entity => ({ ...entity, kind: 'folder' })),
            ...documents.map(entity => ({ ...entity, kind: 'document' })),
        ]);
    }

    async renameEntities(vaultId: string, entities: RenameWatchEvent[]) {
        const { folders, documents } = await this.listEntitiesByFilepaths(
            vaultId,
            [
                ...entities.map(entity => entity.data.from.filepath),
                ...entities.map(entity => entity.data.to.dir),
                ...entities.map(entity => entity.data.from.dir),
            ],
        );
        const projectMap = this.createEntityMap(folders);
        const documentMap = this.createEntityMap(documents);

        const getOldEntity = (entity: any) => {
            return (
                (projectMap[entity.filepath] || documentMap[entity.filepath]) ??
                null
            );
        };
        const existingDirs = folders.reduce((acc, curr) => {
            acc[curr.filepath!] = curr.id;
            return acc;
        }, {} as any);
        const filepathToExistingId = entities
            .filter(e => e.data.from.isDirectory)
            .reduce((acc, entity) => {
                acc[entity.data.to.filepath] =
                    acc[entity.data.from.filepath] ?? entity.data.to.id;
                return acc;
            }, existingDirs);

        const importableEntities = entities.map(entity => {
            const oldEntity = getOldEntity(entity.data.from);
            return {
                ...entity.data.to,
                id: oldEntity?.id ?? entity.data.to?.id,
                parentId: filepathToExistingId[entity.data.to.dir] ?? null,
            };
        });
        await this.importers[vaultId].importFilepaths(importableEntities);
    }

    async listEntitiesByFilepaths(vaultId: string, filepaths: string[]) {
        const uniqueFilepaths = [...new Set(filepaths)];
        const [folders, documents] = await Promise.all([
            this.context.$deviceService.Projects.listByFilepath(
                vaultId,
                uniqueFilepaths,
            ),
            this.context.$deviceService.Documents.listByFilepath(
                vaultId,
                uniqueFilepaths,
            ),
        ]);

        return {
            folders,
            documents,
        };
    }

    createEntityMap(
        entities: (any & { filepath: string })[],
    ): Record<string, any> {
        return entities.reduce((acc, entity) => {
            acc[entity.filepath!] = entity;
            return acc;
        }, {} as Record<string, any>);
    }

    isRenameEvent(event: WatchEvent): event is RenameWatchEvent {
        return event.event === 'rename';
    }

    isRegularEvent(
        event: WatchEvent,
        kind: BasicWatchEvent['event'],
    ): event is BasicWatchEvent {
        return event.event === kind;
    }

    registerProgressListeners(
        reporter: ProgressReporter,
        progressState: LoadProgressState,
    ) {
        reporter.on(ImporterEvents.PROGRESS, data => {
            const vaultId = data.vaultId;
            delete data.vaultId;

            this.context.emit(
                ServiceKey.STORE,
                'dispatch:vault/setVaultStatus',
                {
                    vaultId,
                    deviceStatus: {
                        state: progressState,
                        info: data,
                    },
                },
            );
        });
        reporter.on(ImporterEvents.COMPLETE, data => {
            const vaultId = data.vaultId;
            delete data.vaultId;

            this.context.emit(
                ServiceKey.STORE,
                'dispatch:vault/setVaultStatus',
                {
                    vaultId,
                    status: {
                        state: LoadProgressState.OKAY,
                        info: data,
                    },
                },
            );
        });
    }
}
