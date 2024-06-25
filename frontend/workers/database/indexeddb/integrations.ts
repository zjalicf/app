import { Table, Transaction } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import defaultsDeep from 'lodash/defaultsDeep';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { acreomVaultIndexedDB } from './connector';
import { IntegrationConfig } from '~/workers/integrations/index';
import {
    AnalyticsAction,
    IntegrationsActions,
    IntegrationType,
    JiraIntegrationAction,
    ServiceKey,
} from '~/constants';
import { WorkerContext } from '~/@types/app';
import { IEvent } from '~/@types';
import { JiraIntegrationDataType } from '~/constants/jira';
import { GithubIntegrationAction } from '~/components/github/github';
import { IntegrationEncryption } from '~/workers/database/encryption/integration';
import { LinearIntegrationConfig } from '~/@types/integrations';
import {
    LinearIntegrationActions,
    LinearIntegrationDataType,
} from '~/constants/linear';
import { filterLinearIssuesByView } from '~/workers/integrations/linear/helpers';

// TODO: handle other types of objects eg date, infinity...
export function customDefaultsDeep(object: any, source: any): any {
    // Create a shallow copy of the object to avoid mutations
    const result: any = { ...object };

    // Iterate over source properties
    Object.keys(source).forEach((key: string) => {
        // If the key doesn't exist in the result or is undefined, copy the value from the source
        if (!result.hasOwnProperty(key) || result[key] === undefined) {
            result[key] = source[key];
        } else if (isObject(result[key]) && isObject(source[key])) {
            // If the property is an object in both the result and source, merge them recursively
            // without modifying the originals
            result[key] = customDefaultsDeep(result[key], source[key]);
        }
        // If it's an array or other type, do nothing as we don't want to merge arrays or overwrite the value
    });

    return result;
}

function isObject(item: any): boolean {
    // Check if the item is an object and not null or an array
    return (
        item &&
        typeof item === 'object' &&
        !(item instanceof Date) &&
        !Array.isArray(item)
    );
}

export class IntegrationsIndexedDB extends IndexedDBBase<any> {
    shouldStoreLocally = false;
    context: WorkerContext;
    protected entity = 'integration';
    encryption: IntegrationEncryption;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.encryption = new IntegrationEncryption(ctx);
    }

    table(vaultId: string): Table<any, string> {
        return acreomVaultIndexedDB(vaultId).Integrations;
    }

    protected async syncToVuex(vaultId: string, change: IDatabaseChange) {
        await super.syncToVuex(vaultId, change);
        let createChange: ICreateChange | null = null;
        switch (change.type) {
            case 1: // CREATE
                createChange = change as ICreateChange;
                this.emit(
                    ServiceKey.STORE,
                    'integration/indexedDBUpdate',
                    createChange.obj,
                );
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    IntegrationsActions.MANUAL_RUN,
                    {
                        vaultId,
                        id: createChange.key,
                    },
                );
                break;
        }
    }

    async save(
        vaultId: string,
        entity: Partial<IntegrationConfig<any>>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IntegrationConfig<any>>> {
        meta = defaultsDeep(meta, {
            writeToDevice: false,
            postprocess: true,
            updatedAt: true,
            encrypt: true,
        });
        const databaseEntity = await this.retrieve(vaultId, entity.id!);
        let updateObject = customDefaultsDeep(entity, databaseEntity ?? {});

        const shouldEncrypt =
            meta?.encrypt &&
            this.encryption?.shouldEncrypt(vaultId) &&
            this.encryption?.isIntegrationEncryptable(
                updateObject.type as IntegrationType,
            );

        if (meta?.updatedAt) {
            updateObject.updatedAt = new Date();
        }

        if (shouldEncrypt) {
            if (!updateObject.data.encryptionKey) {
                updateObject.data.encryptionKey =
                    this.encryption.createEncryptionKey();
            }
            updateObject = await this.encryption.encryptContent(
                vaultId,
                updateObject,
                updateObject,
            );
        }
        return this.saveToDatabase(
            vaultId,
            updateObject,
            !!databaseEntity,
            meta,
        );
    }

    async saveBulk(
        vaultId: string,
        entities: Partial<any>[],
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<any>[]> {
        const entityIds = entities.map(entity => entity.id);
        const databaseEntities = await this.listByIds(vaultId, entityIds);
        const entitiesMap = new Map(
            databaseEntities.map(entity => [entity.id, entity]),
        );
        const updateTimestamp = new Date();
        const isVaultEncrypted =
            meta?.encrypt && this.encryption?.shouldEncrypt(vaultId);
        let updateEntities = entities.map(entity => {
            const existingEntity = entitiesMap.get(entity.id);
            const updateObject = customDefaultsDeep(
                entity,
                existingEntity ?? {},
            );
            if (meta?.updatedAt) {
                updateObject.updatedAt = updateTimestamp;
            }
            const shouldEncrypt =
                isVaultEncrypted &&
                this.encryption?.isIntegrationEncryptable(
                    updateObject.type as IntegrationType,
                );
            if (shouldEncrypt && !entity.data.encryptionKey) {
                updateObject.data.encryptionKey =
                    this.encryption.createEncryptionKey();
            }

            return updateObject;
        });

        if (isVaultEncrypted) {
            updateEntities = await this.encryption.encryptContentBulk(
                vaultId,
                updateEntities,
            );
        }

        await this.saveToDatabaseBulk(vaultId, updateEntities, meta);

        if (meta?.postprocess) {
            this.postprocessEntity(vaultId, updateEntities, meta);
        }
        return updateEntities;
    }

    saveToDatabase(
        vaultId: string,
        entity: Partial<IntegrationConfig<any>>,
        update: boolean = true,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IntegrationConfig<any>>> {
        return new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.clientId ?? this.clientId;
                    if (update) {
                        await this.table(vaultId).update(
                            entity.id as string,
                            entity,
                        );
                    } else {
                        await this.table(vaultId).put(entity);
                    }
                    trx.on('complete', () => {
                        if (meta?.postprocess) {
                            this.postprocessEntity(vaultId, [entity], {
                                ...meta,
                                writeToDevice: false,
                            });
                        }
                        resolve(entity);
                    });
                },
            );
        });
    }

    saveToDatabaseBulk(
        vaultId: string,
        entities: Partial<any>[],
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<any>[]> {
        return new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId).name,
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.clientId || this.clientId;

                    await this.table(vaultId).bulkPut(entities);
                    trx.on('complete', () => {
                        if (meta?.postprocess) {
                            this.postprocessEntity(vaultId, entities, {
                                ...meta,
                                writeToDevice: false,
                            });
                        }
                        resolve(entities);
                    });
                },
            );
        });
    }

    async retrieve(vaultId: string, id: string): Promise<any | null> {
        const entity = await this.table(vaultId)
            .get(id)
            .catch(() => null);
        if (!entity) return null;
        if (
            !this.encryption?.shouldEncrypt(vaultId) ||
            !entity.data?.encryptedData ||
            !entity.data?.encryptionKey
        )
            return entity;

        const decryptedEntities = await this.encryption?.decryptData(vaultId, [
            entity,
        ]);
        if (!decryptedEntities.length) return entity;
        const decryptedEntity = decryptedEntities.shift()!;
        return {
            ...entity,
            ...decryptedEntity,
            encryptionKey: entity?.encryptionKey,
        };
    }

    async delete(
        vaultId: string,
        entity: Partial<IntegrationConfig<any>>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<any>> {
        const deletedEntity = await super.delete(vaultId, entity, meta);
        await this.afterDeleteCleanUp(vaultId, deletedEntity);
        return deletedEntity;
    }

    async afterDeleteCleanUp(
        vaultId: string,
        entity: Partial<IntegrationConfig<any>>,
    ) {
        if (entity.type === IntegrationType.ICS_CALENDAR) {
            const eventsToDelete = await acreomVaultIndexedDB(vaultId)
                .Events.filter(obj => {
                    return (
                        obj.integrationType === entity.type &&
                        obj.integrationId === entity.id
                    );
                })
                .toArray();
            acreomVaultIndexedDB(vaultId).Events.bulkDelete(
                eventsToDelete.map(({ id }) => id),
            );
        }
        if (entity.type === IntegrationType.GOOGLE_CALENDAR) {
            const eventsToDelete =
                await this.context.$deviceService.GoogleCalendarEventsIndexedDB.list(
                    vaultId,
                    undefined,
                    (obj: IEvent) => {
                        return (
                            obj.integrationType === entity.type &&
                            obj.integrationId === entity.id
                        );
                    },
                );
            await this.context.$deviceService.GoogleCalendarEventsIndexedDB.deleteBulk(
                vaultId,
                eventsToDelete,
            );
        }
        const integrationData =
            await this.context.$deviceService.IntegrationsDataIndexedDB.list(
                vaultId,
                undefined,
                (obj: any) => {
                    return (
                        obj.integrationType === entity.type &&
                        obj.integrationId === entity.id
                    );
                },
            );
        if (!integrationData.length) return;
        await this.context.$deviceService.IntegrationsDataIndexedDB.deleteBulk(
            vaultId,
            integrationData,
        );
    }

    subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );

        this.context.emit(ServiceKey.DEVICE, 'notification:updateIntegration', {
            vaultId,
            change,
        });

        // @ts-ignore
        const integration = change.obj as IntegrationConfig<any>;

        if (change.type === 1) {
            if (integration.type === IntegrationType.LINEAR) {
                this.processLinearChange(vaultId, change);
            }
        }

        if (change.type === 2) {
            if (integration.type === IntegrationType.LINEAR) {
                this.processLinearChange(vaultId, change);
            }
            if (integration.type === IntegrationType.JIRA) {
                this.handleModification(vaultId, change);
            }

            if (integration.type === IntegrationType.GITHUB) {
                this.handleGithubModification(vaultId, change);
            }
        }
        return Promise.resolve();
    }

    initialize(vaultId: string) {
        super.initialize(vaultId);
    }

    subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        if (change.type === 1) {
            // @ts-ignore
            const integration = change.obj as IntegrationConfig<any>;
            if (integration.type === IntegrationType.LINEAR) {
                this.processLinearChange(vaultId, change);
            }
            if (integration.type === IntegrationType.JIRA) {
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    JiraIntegrationAction.GET_METADATA,
                    {
                        config: integration,
                    },
                );
            }
            if (integration.type === IntegrationType.GITHUB) {
                // I have created the integration on remote or I just logged in and it is loaded for first time
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    GithubIntegrationAction.INITIALIZE,
                    {
                        config: integration,
                    },
                );
            }
        }
        if (change.type === 2) {
            // @ts-ignore
            const integration = change.obj as IntegrationConfig<any>;
            // @ts-ignore
            const oldIntegration = change.oldObj as IntegrationConfig<any>;
            if (integration.type === IntegrationType.LINEAR) {
                this.processLinearChange(vaultId, change);
            }
            if (
                integration.type === IntegrationType.JIRA &&
                integration.data.projects.length > 0 &&
                !oldIntegration?.data?.projects?.length
            ) {
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    JiraIntegrationAction.INITIALIZE,
                    {
                        projects:
                            integration.data.projects?.filter(
                                (project: any) => project.syncEnabled,
                            ) ?? [],
                        config: integration,
                        initial: true,
                    },
                );
            }

            if (integration.type === IntegrationType.JIRA) {
                this.handleModification(vaultId, change);
            }

            if (integration.type === IntegrationType.GITHUB) {
                this.handleGithubModification(vaultId, change);
            }
        }

        this.context.emit(ServiceKey.DEVICE, 'notification:updateIntegration', {
            vaultId,
            change,
        });
        return Promise.resolve();
    }

    processLinearChange(vaultId: string, change: IDatabaseChange) {
        if ((change as IDatabaseChange).type === 1) {
            const integration = (change as ICreateChange)
                .obj as IntegrationConfig<LinearIntegrationConfig>;
            return this.linearProcessCreate(vaultId, integration);
        }
        if ((change as IDatabaseChange).type === 2) {
            const integration = (change as IUpdateChange)
                .obj as IntegrationConfig<LinearIntegrationConfig>;
            const oldIntegration = (change as IUpdateChange)
                .oldObj as IntegrationConfig<LinearIntegrationConfig>;
            return this.linearProcessModifications(
                vaultId,
                integration,
                oldIntegration,
            );
        }
        return null;
    }

    async linearProcessCreate(
        vaultId: string,
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        await this.context.invoke<LinearIntegrationConfig>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.INITIALIZE_INTEGRATION,
            { integration },
        );

        const teams = integration.data.teams ?? [];
        const views = integration.data?.views ?? [];
        if (!teams.length) return;

        await this.prepareLinearTeams(integration, teams);

        if (!views.length) return;

        return this.loadLinearViews(integration, views);
    }

    async linearProcessModifications(
        vaultId: string,
        integration: IntegrationConfig<LinearIntegrationConfig>,
        oldIntegration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const teams = integration.data.teams ?? [];
        const oldTeams = oldIntegration.data.teams ?? [];

        const newTeams = teams.filter(teamId => !oldTeams.includes(teamId));
        const removedTeams = oldTeams.filter(teamId => !teams.includes(teamId));
        if (newTeams.length) {
            await this.prepareLinearTeams(integration, newTeams);
        }
        if (removedTeams.length) {
            await this.removeTeamsData(integration, removedTeams);
        }

        const views = integration.data.views ?? [];
        const oldViews = oldIntegration.data.views ?? [];
        const newViews = views.filter(
            view => !oldViews.some(v => v.id === view.id),
        );
        const removedViews = oldViews.filter(
            view => !views.some(v => v.id === view.id),
        );
        const modifiedViews = views.filter(view =>
            oldViews.some(v => v.id === view.id && !isEqual(v, view)),
        );
        if (removedViews.length > 0) {
            this.clearIssues(vaultId, integration, views);
        }

        const loadableViews = [...modifiedViews, ...newViews];
        if (!loadableViews.length) return;

        return this.loadLinearViews(integration, loadableViews);
    }

    prepareLinearTeams(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teams: string[],
    ) {
        const teamIds = teams
            .map(teamId => {
                return teamId?.split('/')?.pop()! ?? null;
            })
            .filter(v => !!v);
        return this.context.invoke(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.PREPARE_TEAM_DATA,
            {
                integration,
                teamIds,
            },
        );
    }

    removeTeamsData(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teams: string[],
    ) {
        const teamIds = teams.map(team => team.split('/').pop()!);
        return this.context.$deviceService.IntegrationsDataIndexedDB.table(
            integration.vaultId,
        )
            .filter((obj: any) => {
                return (
                    obj.integrationType === integration.type &&
                    obj.integrationId === integration.id &&
                    !obj.id.startsWith(LinearIntegrationDataType.TEAM) &&
                    teamIds.some(teamId => obj.id.includes(teamId))
                );
            })
            .delete();
    }

    loadLinearViews(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        views: any[],
    ) {
        return this.context.invoke(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.LOAD_VIEWS_ISSUES,
            {
                integration,
                views,
            },
        );
    }

    async clearIssues(
        vaultId: string,
        integration: IntegrationConfig<LinearIntegrationConfig>,
        validViews: any[],
    ) {
        const issueGenerator =
            this.context.$deviceService.IntegrationsDataIndexedDB.listPaginated(
                vaultId,
                null,
                100,
                (obj: any) => {
                    return (
                        obj.integrationType === integration.type &&
                        obj.integrationId === integration.id &&
                        obj.id.startsWith(LinearIntegrationDataType.ISSUE)
                    );
                },
            );

        for await (const issues of issueGenerator) {
            if (!issues.length) return;
            const ids = new Set<string>();
            for (const view of validViews) {
                const validIssues = filterLinearIssuesByView(issues, view);
                for (const validIssue of validIssues) {
                    ids.add(validIssue.id);
                }
            }

            await this.context.$deviceService.IntegrationsDataIndexedDB.deleteBulk(
                vaultId,
                issues.filter((issue: any) => !ids.has(issue.id)),
            );
        }
    }

    async encryptChanges(vaultId: string, changes: IDatabaseChange[]) {
        if (!this.encryption?.shouldEncrypt(vaultId)) {
            return changes;
        }

        const createChanges = changes.filter(
            change => change.type === 1,
        ) as ICreateChange[];
        const updateChanges = changes.filter(
            change => change.type === 2,
        ) as IUpdateChange[];
        const deleteChanges = changes.filter(
            change => change.type === 3,
        ) as IDeleteChange[];

        const obj: any[] = [];
        const mods: any[] = [];
        const oldObj: any[] = [];
        let objIndex = 0;
        let modsIndex = 0;
        let oldObjIndex = 0;
        for (const change of changes) {
            const updateChange = change as IUpdateChange;
            if (
                updateChange.mods &&
                (updateChange.obj?.data?.encryptionKey ||
                    updateChange.mods?.data?.encryptionKey)
            ) {
                mods.push({
                    ...updateChange.mods,
                    data: {
                        ...updateChange.mods.data,
                        encryptionKey:
                            updateChange.obj?.data?.encryptionKey ??
                            updateChange.mods?.data?.encryptionKey,
                    },
                });
            }
            if (updateChange.obj?.data?.encryptionKey) {
                obj.push(updateChange.obj);
            }
            if (updateChange.oldObj?.data?.encryptionKey) {
                oldObj.push(updateChange.oldObj);
            }
        }
        const [encryptedObjs, encryptedMods, encryptedOldObjs] =
            await Promise.all([
                this.encryption?.encryptContentBulk(vaultId, obj),
                this.encryption?.encryptContentBulk(vaultId, mods),
                this.encryption?.encryptContentBulk(vaultId, oldObj),
            ]);

        return changes.map(change => {
            const updateChange = { ...change } as IUpdateChange;
            if (
                updateChange.mods &&
                (updateChange.obj?.data?.encryptionKey ||
                    updateChange.mods?.data?.encryptionKey)
            ) {
                updateChange.mods = {
                    ...updateChange.mods,
                    ...encryptedMods[modsIndex++],
                };
            }
            if (updateChange.obj?.data?.encryptionKey) {
                updateChange.obj = {
                    ...updateChange.obj,
                    ...encryptedObjs[objIndex++],
                };
            }
            if (updateChange.oldObj?.data?.encryptionKey) {
                updateChange.oldObj = {
                    ...updateChange.oldObj,
                    ...encryptedOldObjs[oldObjIndex++],
                };
            }
            return updateChange;
        });
    }

    async decryptChanges(
        vaultId: string,
        changes: IDatabaseChange[],
    ): Promise<IDatabaseChange[]> {
        if (!this.encryption?.shouldEncrypt(vaultId)) return changes;

        const createChanges = changes.filter(
            change => change.type === 1,
        ) as ICreateChange[];
        const updateChanges = changes.filter(
            change => change.type === 2,
        ) as IUpdateChange[];
        const deleteChanges = changes.filter(
            change => change.type === 3,
        ) as IDeleteChange[];

        const decryptedCreateChanges = await this.decryptCreateChanges(
            vaultId,
            createChanges,
        );
        const decryptedUpdateChanges = await this.decryptUpdateChanges(
            vaultId,
            updateChanges,
        );
        const decryptedDeleteChanges = await this.decryptDeleteChanges(
            vaultId,
            deleteChanges,
        );
        let createIndex = 0;
        let updateIndex = 0;
        let deleteIndex = 0;
        return changes.map((change: IDatabaseChange) => {
            if ((change as IDatabaseChange).type === 1) {
                return decryptedCreateChanges[createIndex++];
            }
            if ((change as IDatabaseChange).type === 2) {
                return decryptedUpdateChanges[updateIndex++];
            }
            return decryptedDeleteChanges[deleteIndex++];
        });
    }

    async decryptCreateChanges(
        vaultId: string,
        createChanges: ICreateChange[],
    ): Promise<ICreateChange[]> {
        const objData = createChanges.map(change => change.obj);
        const decryptedData = await this.encryption.decryptData(
            vaultId,
            objData,
        );
        return createChanges.map((change, index) => ({
            ...change,
            obj: decryptedData[index],
        }));
    }

    async decryptUpdateChanges(
        vaultId: string,
        updateChanges: IUpdateChange[],
    ): Promise<IUpdateChange[]> {
        const objData = updateChanges.map(change => change.obj);
        const oldObjData = updateChanges.map(change => change.oldObj);

        const [decryptedObjData, decryptedOldObjData] = await Promise.all([
            this.encryption.decryptData(vaultId, objData),
            this.encryption.decryptData(vaultId, oldObjData),
        ]);
        return updateChanges.map((change, index) => {
            if (
                change.mods.data?.encryptedData ||
                change.mods['data.encryptedData']
            ) {
                if (change.mods.data?.encryptedData) {
                    delete change.mods.data.encryptedData;
                }
                if (change.mods['data.encryptedData']) {
                    delete change.mods['data.encryptedData'];
                }
                return {
                    ...change,
                    obj: decryptedObjData[index],
                    mods: {
                        ...decryptedObjData[index],
                    },
                    oldObj: decryptedOldObjData[index],
                };
            }
            return {
                ...change,
                obj: decryptedObjData[index],
                oldObj: decryptedOldObjData[index],
            };
        });
    }

    async decryptDeleteChanges(
        vaultId: string,
        deleteChanges: IDeleteChange[],
    ): Promise<IDeleteChange[]> {
        const oldObjData = deleteChanges.map(change => change.oldObj ?? {});
        const decryptedData = await this.encryption.decryptData(
            vaultId,
            oldObjData,
        );

        return deleteChanges.map((change, index) => ({
            ...change,
            oldObj: decryptedData[index],
        }));
    }

    async handleModification(vaultId: string, change: IDatabaseChange) {
        // @ts-ignore
        const integration = change.obj as IntegrationConfig<any>;
        // @ts-ignore
        const oldIntegration = change.oldObj as IntegrationConfig<any>;

        const oldProjects =
            oldIntegration?.data?.projects?.filter(
                (project: any) => project.syncEnabled,
            ) ?? [];
        const newProjects =
            integration?.data?.projects?.filter(
                (project: any) => project.syncEnabled,
            ) ?? [];

        const addedProjects = newProjects.filter(
            (project: any) =>
                !oldProjects.some((p: any) => p.id === project.id),
        );
        const removedProjects = oldProjects.filter(
            (project: any) =>
                !newProjects.some((p: any) => p.id === project.id),
        );
        const projects =
            await this.context.$deviceService.IntegrationsDataIndexedDB.listByIds(
                vaultId,
                integration?.data?.projects.map((p: any) => p.id),
            );
        const projectsToUpdate = projects.filter((p: any) => {
            const project = integration?.data?.projects.find(
                (pr: any) => pr.id === p.id,
            );
            return project?.syncEnabled !== p.syncEnabled;
        });
        await this.context.$deviceService.IntegrationsDataIndexedDB.saveBulk(
            vaultId,
            projectsToUpdate.map((p: any) => ({
                ...p,
                syncEnabled:
                    integration?.data?.projects?.find(
                        (pr: any) => pr.id === p.id,
                    )?.syncEnabled ?? p.syncEnabled,
            })),
            { clientId: '*' },
        );

        if (addedProjects.length) {
            this.emit(
                ServiceKey.INTEGRATIONS,
                JiraIntegrationAction.INITIALIZE,
                {
                    projects: addedProjects,
                    config: integration,
                    initial: true,
                },
            );
        }
        if (removedProjects.length) {
            const ids = new Set(
                removedProjects.map(({ id }: any) => id?.split('/')?.[2]),
            );
            const integrationData =
                await this.context.$deviceService.IntegrationsDataIndexedDB.list(
                    vaultId,
                    undefined,
                    (obj: any) => {
                        const projectId = (
                            obj?.properties?.project ?? obj.id
                        )?.split('/')?.[2];

                        return (
                            obj.integrationType === integration.type &&
                            obj.integrationId === integration.id &&
                            ids.has(projectId) &&
                            !obj.id?.startsWith(JiraIntegrationDataType.PROJECT)
                        );
                    },
                );
            if (!integrationData.length) return;
            await this.context.$deviceService.IntegrationsDataIndexedDB.deleteBulk(
                vaultId,
                integrationData,
            );
        }
    }

    handleGithubModification(_vaultId: string, change: IDatabaseChange) {
        // @ts-ignore
        const integration = change.obj as IntegrationConfig<any>;
        const repos = integration.data.repositories;

        // @ts-ignore
        const oldIntegration = change.oldObj as IntegrationConfig<any>;
        const oldRepos = oldIntegration.data.repositories;

        const reposToAdd = difference(repos, oldRepos);
        const reposToRemove = difference(oldRepos, repos);

        if (repos.length && !oldRepos.length) {
            this.emit(
                ServiceKey.INTEGRATIONS,
                GithubIntegrationAction.INITIALIZE,
                {
                    config: integration,
                },
            );
        } else {
            for (const repoId of reposToAdd) {
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    GithubIntegrationAction.INITIAL_LOAD_REPOSITORY,
                    {
                        id: repoId,
                        config: integration,
                    },
                );
            }

            for (const repoId of reposToRemove) {
                this.emit(
                    ServiceKey.INTEGRATIONS,
                    GithubIntegrationAction.REMOVE_REPOSITORY,
                    {
                        id: repoId,
                        config: integration,
                    },
                );
            }
        }
    }
}
