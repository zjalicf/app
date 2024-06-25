import {
    ApplyRemoteChangesFunction,
    IPersistedContext,
    ISyncProtocol,
    PollContinuation,
    ReactiveContinuation,
} from 'dexie-syncable/api';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import * as semver from 'semver';
import flatten from 'flat';
import { Table } from 'dexie';
import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import { add } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import { CloudWrapper } from './cloudWrapper';
import { ProgressReporter } from '~/workers/database/reporter/interface';
import { IVault } from '~/@types';
import { WorkerContext } from '~/@types/app';
import {
    AnalyticsAction,
    CloudServiceAction,
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { isCloudServiceResponse } from '~/helpers/util';
import { isValidDate } from '~/helpers/date';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { IDocument } from '~/components/document/model';
import { IUser } from '~/workers/database/indexeddb/types';

declare module 'dexie-syncable/api' {
    interface IPersistedContext {
        isFirstRound?: boolean;
        socketsConnected?: boolean;
        online?: boolean;
        offlineEdit?: boolean;
        lastSyncTimestamp: Record<string, number>;
        lastFetchTimestamp: number;
    }
}

type ServicesObject<T extends { id: string | number }> = {
    eventName: string;
    tableName: string;
    service: CloudWrapper<any>;
    table: (vaultId?: string) => Table<T, string | number>;
    indexedDB: IndexedDBBase<T>;
    onComplete?: (change: IDatabaseChange) => Promise<void> | void;
    onRemoteFetch?: (entities: T[]) => Promise<void> | void;
    filter?: (change: IDatabaseChange) => Promise<boolean> | boolean;
    onRemoteDelete?: (vaultId: string | null, entities: T[]) => void;
};

const DEFAULT_RETRY_TIMEOUT = 1000;
const JITTER_BASE = DEFAULT_RETRY_TIMEOUT / 4;
const RETRYABLE_STATUS_CODES = [
    StatusCodes.REQUEST_TIMEOUT,
    StatusCodes.TOO_MANY_REQUESTS,
];
const BATCH_ISSUE_STATUS_CODES = [
    StatusCodes.BAD_REQUEST,
    StatusCodes.INTERNAL_SERVER_ERROR,
    StatusCodes.REQUEST_TOO_LONG,
    StatusCodes.NOT_FOUND,
];

const PROTOCOL_RETRY_STATUS_CODES = [
    StatusCodes.GATEWAY_TIMEOUT,
    StatusCodes.BAD_GATEWAY,
    StatusCodes.SERVICE_UNAVAILABLE,
    undefined,
    -1, // indicates network errors such as ECONNABORTED etc
];

export class AcreomProtocol {
    private context: WorkerContext;
    private syncableServices: ServicesObject<any>[];
    private vault: string | null;
    private isConfig: boolean = false;
    private sendReporter: ProgressReporter;
    private loadReporter: ProgressReporter;

    public connected: boolean = false;

    constructor(
        ctx: WorkerContext,
        vault: string | null,
        syncableServices: ServicesObject<any>[],
        sendReporter: ProgressReporter,
        loadReporter: ProgressReporter,
    ) {
        this.isConfig = !vault;
        this.vault = vault;
        this.context = ctx;
        this.sendReporter = sendReporter;
        this.loadReporter = loadReporter;

        this.syncableServices = syncableServices;
        this.syncProtocol = this.syncProtocol.bind(this);
    }

    get protocolName() {
        return `acreom-sync-${this.isConfig ? 'config' : this.vault}`;
    }

    computeBackoff(retry: number): number {
        const exponentialBase = Math.round(Math.pow(retry % 7, Math.E));
        return (
            exponentialBase * DEFAULT_RETRY_TIMEOUT -
            Math.random() * exponentialBase * JITTER_BASE
        );
    }

    incrementalRetry(
        fn: (backoff: number) => void,
        retry: number,
        isFinite = true,
    ) {
        if (!isFinite && retry > 6) {
            return fn(Infinity);
        }
        return fn(this.computeBackoff(retry));
    }

    disconnectWebsockets() {
        return this.context.emit(
            ServiceKey.CLOUD,
            CloudServiceAction.WEBSOCKETS_DISCONNECT_NAMESPACE,
            { vaultId: this.vault },
        );
    }

    registerWebsocketNamespace() {
        return this.context.invoke(
            ServiceKey.CLOUD,
            CloudServiceAction.WEBSOCKETS_REGISTER_NAMESPACE,
            {
                vaultId: this.vault,
                callerContext: 'protocol.ts/registerWebsocketsNamespace',
            },
        );
    }

    async updateProgress(state = 'LOADING') {
        if (this.isConfig) return;
        await this.context.invoke(
            ServiceKey.STORE,
            'dispatch:vault/indexedDBUpdate',
            {
                id: this.vault,
                status: {
                    state,
                    message: 'Syncing data to cloud',
                },
                isStatusUpdate: true,
            },
        );
    }

    isSyncable(table: string): boolean {
        return this.syncableServices.some(
            ({ tableName }) => tableName === table,
        );
    }

    private async isLoggedIn() {
        const isLoggedIn = await this.context
            .invoke<{ payload: boolean }>(
                ServiceKey.STORE,
                'getters:auth/loggedIn',
                null,
            )
            .then(({ payload }) => payload);
        if (!isLoggedIn) {
            return false;
        }
        return true;
    }

    get isOnline() {
        return this.context.$deviceService.isOnline;
    }

    async prepareContext(context: IPersistedContext) {
        if (!context.migrations) {
            context.migrations = [];
        }
        if (!context.lastSyncTimestamp) {
            context.lastSyncTimestamp = this.syncableServices.reduce(
                (acc, { tableName }) => {
                    acc[tableName] = 1;
                    return acc;
                },
                {} as Record<string, number>,
            );
        }
        if (isNumber(context.lastSyncTimestamp)) {
            const lastSyncTimestamp = context.lastSyncTimestamp;

            context.lastSyncTimestamp = this.syncableServices.reduce(
                (acc, { tableName }) => {
                    acc[tableName] = lastSyncTimestamp;
                    return acc;
                },
                {} as Record<string, number>,
            );
        }
        this.migrateContext(context);
        await context.save().catch(() => {});
    }

    migrateContext(context: IPersistedContext) {
        if (!context.migrations.includes('1.2')) {
            context.lastSyncTimestamp.integrations = 1;
            context.migrations.push('1.2');
        }
    }

    syncProtocol(cb?: () => void): ISyncProtocol {
        let sync = async (
            context: IPersistedContext,
            _url: string,
            options: any,
            baseRevision: any,
            _syncedRevision: any,
            changes: IDatabaseChange[],
            _partial: boolean,
            applyRemoteChanges: ApplyRemoteChangesFunction,
            onChangesAccepted: () => void,
            onSuccess: (
                continuation: ReactiveContinuation | PollContinuation,
            ) => void,
            onError: (err: Error, again?: number) => void,
        ) => {
            this.sendReporter.start();
            this.loadReporter.start();
            const isLoggedIn = await this.isLoggedIn();
            if (!isLoggedIn) {
                onError(new Error('Is Not Logged In'), Infinity);
                this.context.$deviceService.disconnectSync(
                    {
                        id: this.vault,
                    },
                    true,
                );
                return;
            }

            if (!this.isOnline) {
                onError(new Error('Network offline'), Infinity);
                this.context.$deviceService.disconnectSync({ id: this.vault });
                return;
            }

            if (this.isConfig) {
                const user = await this.userService
                    .retrieve('', '')
                    .then(({ data }) => data)
                    .catch(() => null);
                if (!user) {
                    onError(
                        new Error(
                            'could not fetch user for compatibility check',
                        ),
                        Infinity,
                    );
                    this.context.$deviceService.startNetworkCheck();
                    this.context.$deviceService.disconnectSync({
                        id: this.vault,
                    });
                    return;
                }
                const { compatible, message } = await this.checkCompatibility(
                    user,
                );
                if (!compatible && message) {
                    onError(new Error(message), Infinity);

                    this.context.$deviceService.disconnectSync({
                        id: this.vault,
                    });
                    return;
                }
            }
            await this.prepareContext(context);

            changes = changes.filter(change => this.isSyncable(change.table));
            if (changes.length >= 10) {
                this.updateProgress();
            }
            // refactor, separation of concerns
            // isOnline, loggedIn, data concerns (isSyncable)
            // lastSyncTimestamp
            // sort and refactor to functions
            //
            // MOVE THIS!

            this.registerSocketEventListeners(
                context,
                this.syncableServices,
                applyRemoteChanges,
                baseRevision,
            );
            await this.registerWebsocketNamespace();

            context.services = this.syncableServices.map(
                ({ tableName }) => tableName,
            );
            await context.save().catch(() => {});

            let filteredChanges = changes;
            try {
                filteredChanges = await this.fetchAndApplyRemoteChanges(
                    context,
                    this.syncableServices,
                    changes,
                    applyRemoteChanges,
                    baseRevision,
                );
            } catch (e: any) {
                // TODO: create retry logic.
                onError(e, Infinity);
                this.context.$deviceService.disconnectSync({ id: this.vault });
                return;
            }

            try {
                await this.registerLocalChangesProcessor(
                    context,
                    filteredChanges,
                    applyRemoteChanges,
                    baseRevision,
                    onChangesAccepted,
                    onSuccess,
                    onError,
                );
            } catch (err: any) {
                onError(err, Infinity);
                if (err.name === ShouldDisconnectError.type) {
                    this.context.$deviceService.startNetworkCheck();
                    this.context.$deviceService.disconnectSync({
                        id: this.vault,
                    });
                }
                return;
            }

            this.connected = true;

            if (cb) {
                setTimeout(() => {
                    cb?.();
                }, 250);
            }
            this.registerRemoteFetchListener(
                context,
                this.syncableServices,
                applyRemoteChanges,
                baseRevision,
            );
        };

        sync = sync.bind(this);

        return {
            sync,
        };
    }

    async checkCompatibility(user: IUser) {
        const currentSemver = semver.parse(this.context.$config.version)!;
        const currentVersionMinimalSemver = semver.parse(
            this.context.$config.compatibility.minimal,
        )!;
        const minimalCompatibilitySemver = semver.parse(
            user.compatibility?.minimal ?? '',
        );
        if (minimalCompatibilitySemver) {
            const isCompatible = currentSemver?.compare(
                minimalCompatibilitySemver,
            );
            // -1 means current version is lower than minimal
            if (isCompatible === -1) {
                this.context.emit(
                    ServiceKey.DATABASE,
                    'protocol-compatibility-error',
                    null,
                );
                this.context.emit(ServiceKey.NUXT, 'redirect', {
                    route: '/upgrade',
                });

                return {
                    message:
                        'Incompatible version, download the latest version from https://acreom.com/downloads',
                    compatible: false,
                };
            }
        }
        if (
            !minimalCompatibilitySemver ||
            currentVersionMinimalSemver.compare(minimalCompatibilitySemver) ===
                1
        ) {
            await this.userService.save(
                {
                    id: user.id,
                    compatibility: {
                        minimal: currentVersionMinimalSemver!.raw,
                    },
                },
                {
                    create: false,
                },
                '',
            );
        }
        return {
            compatible: true,
            message: null,
        };
    }

    removeRemoteFetchListener() {
        this.context.$deviceService.off(
            `protocol:fetch-remote-data:${this.vault ?? 'acreom-config'}`,
        );
    }

    registerRemoteFetchListener(
        _context: IPersistedContext,
        _services: ServicesObject<any>[],
        _applyRemoteChanges: ApplyRemoteChangesFunction,
        _baseRevision: any,
    ) {
        const key = `protocol:fetch-remote-data:${
            this.vault ?? 'acreom-config'
        }`;
        this.context.$deviceService.off(key);
        this.context.$deviceService.on(key, () => {
            // this.fetchAndApplyRemoteChanges(
            //     context,
            //     services,
            //     [],
            //     applyRemoteChanges,
            //     baseRevision,
            // );
        });
    }

    async preprocessEntity(
        table: Table<any, string | number>,
        entity: Record<string, any>,
    ) {
        const dbEntity = await table.get(entity.id);
        const recursiveTraverse = (
            original: Record<string, any>,
            destination: Record<string, any>,
            path: string[] = [],
        ) => {
            forEach(destination, (obj, key) => {
                if (!obj) return;
                const currentPath = [...path, key];
                if (!isArray(obj) && isObject(obj)) {
                    recursiveTraverse(original, obj, [...path, key]);
                    return;
                }
                if (isArray(obj)) {
                    const arr = get(original, currentPath.join('.'));
                    if (arr) {
                        if (obj.length < arr.length) {
                            for (let i = 0; i < arr.length - obj.length; i++) {
                                obj.push(undefined);
                            }
                        }
                    }
                    recursiveTraverse(original, obj, [...path, key]);
                }
            });
        };
        recursiveTraverse(dbEntity, entity);
    }

    decryptIncomingData(
        remoteData: any[],
        services: ServicesObject<any>[],
    ): Promise<any[][]> {
        return Promise.all(
            services.map(async ({ indexedDB }, index) => {
                if (!indexedDB.isEncryptableInProtocol)
                    return remoteData[index];
                const data = await indexedDB.encryption.decryptData(
                    this.vault!,
                    remoteData[index].data,
                );
                return {
                    data,
                };
            }),
        );
    }

    async decryptChanges(localChangesToApply: IDatabaseChange[]) {
        if (!this.vault) return localChangesToApply;
        const changesPerTable = localChangesToApply.reduce((acc, change) => {
            if (!acc[change.table]) {
                acc[change.table] = [];
            }
            acc[change.table].push(change);
            return acc;
        }, {} as Record<string, any[]>);

        const decryptedChanges = await Promise.all(
            Object.entries(changesPerTable).map(
                ([table, changes]: [string, any[]]) => {
                    const service = this.resolveServiceByTable(table);
                    if (!service.indexedDB.isEncryptableInProtocol)
                        return changes;
                    return service.indexedDB.decryptChanges(
                        this.vault!,
                        changes,
                    );
                },
            ),
        );
        return decryptedChanges.flat();
    }

    async encryptChanges(changes: IDatabaseChange[]) {
        if (!this.vault) return changes;
        const changesPerTable = changes.reduce((acc, change) => {
            if (!acc[change.table]) {
                acc[change.table] = [];
            }
            acc[change.table].push(change);
            return acc;
        }, {} as Record<string, any[]>);

        const encryptedChanges = await Promise.all(
            Object.entries(changesPerTable).map(
                async ([table, changes]: [string, any[]]) => {
                    const service = this.resolveServiceByTable(table);
                    if (!service.indexedDB.isEncryptableInProtocol)
                        return changes;
                    const encryptedChanges =
                        await service.indexedDB.encryptChanges(
                            this.vault!,
                            changes.map((change: any) => {
                                if (change.type === 2) {
                                    change.mods = change.obj
                                        ? {
                                              ...change.obj,
                                              ...flatten.unflatten(
                                                  change.mods ?? {},
                                              ),
                                          }
                                        : flatten.unflatten(change.mods);
                                }
                                return change;
                            }),
                        );
                    return encryptedChanges;
                },
            ),
        );
        return encryptedChanges.flat();
    }

    async fetchAndApplyRemoteChanges(
        context: IPersistedContext,
        services: ServicesObject<any>[],
        localChanges: IDatabaseChange[],
        applyRemoteChanges: ApplyRemoteChangesFunction,
        baseRevision: any,
    ) {
        let vault: IVault | null | undefined = null;
        if (this.vault) {
            vault = await this.context.$deviceService.Vaults.retrieve(
                '',
                this.vault!,
            );
        }
        const lastFetchTimestamp = context.lastFetchTimestamp;
        let remoteData: any[] = await this.fetchRemoteData(
            services,
            lastFetchTimestamp,
        );
        let localChangesToApply = localChanges;

        if (this.context.$deviceService.isEncryptionEnabled) {
            remoteData = await this.decryptIncomingData(remoteData, services);
            localChangesToApply = await this.decryptChanges(
                localChangesToApply,
            );
        }
        const remoteDeleteChanges: any[] = await this.fetchDeleteChanges(
            context,
            services,
            lastFetchTimestamp,
        );
        context.lastFetchTimestamp = new Date().getTime();
        context.save();
        const remoteChanges = await this.transformDataToChanges(
            context,
            vault!,
            remoteData,
            services,
        );
        let applicableDeleteChanges = services.map(({ tableName }, index) => {
            // @ts-ignore
            if (!Array.isArray(remoteDeleteChanges[index]?.data)) return [];

            const service = this.resolveServiceByTable(tableName);
            service.onRemoteDelete?.(
                this.vault,
                remoteDeleteChanges[index]?.data,
            );

            return (
                // @ts-ignore
                remoteDeleteChanges[index]?.data?.map(change => {
                    return {
                        type: 3,
                        table: tableName,
                        key: change.id,
                        source: 'sync',
                    } as IDeleteChange;
                }) || []
            );
        }, [] as IDeleteChange[]);

        const filterOutLocalVaultDeletes = (
            changesArrays: IDeleteChange[][],
        ) => {
            return changesArrays
                .filter(v => !!v)
                .map(changes => {
                    return changes.filter(entity => {
                        if (entity.table !== 'vaults') return true;
                        return (
                            acreomVaultIndexedDB(entity.key)?.type === 'remote'
                        );
                    });
                });
        };
        if (this.isConfig) {
            applicableDeleteChanges = filterOutLocalVaultDeletes(
                applicableDeleteChanges,
            );
        }
        const filteredChanges = [...applicableDeleteChanges, ...remoteChanges];
        const allRemoteChanges = filteredChanges
            .filter(v => !!v)
            .reduce((acc, changes) => {
                return [...acc, ...changes.filter((v: any) => !!v)];
            }, []);

        const changeSet = new Set<string>(
            allRemoteChanges.map(
                (change: IDatabaseChange) => `${change.table}-${change.key}`,
            ),
        );

        const filteredLocalChanges = localChangesToApply.filter(change => {
            const key = `${change.table}-${change.key}`;
            return !changeSet.has(key);
        });

        if (vault) {
            const { applicableRemoteChanges, applicableLocalChanges } =
                await this.resolveDailyDocs(
                    vault,
                    filteredLocalChanges,
                    allRemoteChanges,
                );
            const maybeEncryptedRemoteChanges = await this.encryptChanges(
                applicableRemoteChanges,
            );
            const maybeEncryptedLocalChanges = await this.encryptChanges(
                applicableLocalChanges,
            );
            await applyRemoteChanges(
                this.flattenMods(maybeEncryptedRemoteChanges),
                baseRevision,
            );
            this.loadReporter.done();
            return maybeEncryptedLocalChanges;
        }

        const maybeEncryptedRemoteChanges = await this.encryptChanges(
            allRemoteChanges,
        );
        const maybeEncryptedLocalChanges = await this.encryptChanges(
            filteredLocalChanges,
        );
        await applyRemoteChanges(
            this.flattenMods(maybeEncryptedRemoteChanges),
            baseRevision,
        );
        this.loadReporter.done();
        return maybeEncryptedLocalChanges;
    }

    flattenMods(changes: IDatabaseChange[]): IDatabaseChange[] {
        return changes.map((change: IDatabaseChange) => {
            if (change.type !== 2) {
                return change;
            }
            return {
                ...change,
                mods: (change as IUpdateChange).mods,
            };
        });
    }

    async fetchRemoteData(
        services: ServicesObject<any>[],
        lastFetchTimestamp: number,
    ) {
        if (this.isConfig) {
            return await Promise.all(
                services.map(async ({ service, onRemoteFetch }) => {
                    const data = await service.list(
                        this.vault!,
                        lastFetchTimestamp ?? undefined,
                    );
                    // @ts-ignore
                    onRemoteFetch?.(data.data);
                    return data;
                }),
            );
        }
        const response = await this.cloudLoader.initialLoad(
            this.vault!,
            services.map(service => {
                return {
                    type: service.eventName,
                    timestamp: lastFetchTimestamp ?? 1,
                };
            }),
        );
        return response.data.map(({ entries }) => ({
            data: entries,
        }));
    }

    async fetchDeleteChanges(
        context: IPersistedContext,
        services: ServicesObject<any>[],
        lastFetchTimestamp: number,
    ) {
        if (this.isConfig) {
            return await Promise.all(
                services.map(({ service, tableName }) =>
                    service.listDeleteChanges(
                        this.vault,
                        context.lastSyncTimestamp?.[tableName] || 1,
                    ),
                ),
            );
        }
        const response = await this.cloudLoader.initialLoadDeleteChanges(
            this.vault!,
            services.map(service => {
                return {
                    type: service.eventName,
                    timestamp: lastFetchTimestamp ?? 1,
                };
            }),
        );
        return response.data.map(({ entries }) => ({
            data: entries,
        }));
    }

    async transformDataToChanges(
        context: IPersistedContext,
        vault: IVault,
        remoteData: any[],
        services: ServicesObject<any>[],
    ) {
        const register = new Set<string>();
        return await Promise.all(
            remoteData.map(async ({ data }: any, index: number) => {
                if (!data) return data;
                if (!Array.isArray(data)) {
                    throw new TypeError('Bad response content');
                }
                return this.transformToChanges(
                    services[index].eventName,
                    await Promise.all(
                        data
                            .filter(({ updatedAt }: any) => {
                                const updatedAtTs = add(
                                    isValidDate(new Date(updatedAt))
                                        ? new Date(updatedAt)
                                        : new Date(),
                                    { days: 7 },
                                ).getTime();

                                return (
                                    updatedAtTs >
                                    (context.lastSyncTimestamp?.[
                                        services[index].tableName
                                    ] || 1)
                                );
                            })
                            .map((data: any) =>
                                this.processEntity(
                                    'update',
                                    services[index].eventName,
                                    data,
                                    register,
                                    vault!,
                                ),
                            ),
                    ),
                );
            }),
        );
    }

    async resolveDailyDocs(
        vault: IVault,
        localChanges: IDatabaseChange[],
        remoteChanges: IDatabaseChange[],
    ) {
        const {
            remoteDailyDocChanges,
            otherRemoteChanges,
            documentDeleteChanges,
        } = remoteChanges.reduce(
            (acc, change) => {
                if (change.table === 'documents' && change.type === 3) {
                    acc.documentDeleteChanges.push(change as IDeleteChange);
                }
                if (change.table !== 'documents' || change.type !== 1) {
                    acc.otherRemoteChanges.push(change);
                    return acc;
                }
                const createChange = change as ICreateChange;
                if (!createChange.obj.dailyDoc) {
                    acc.otherRemoteChanges.push(createChange);
                    return acc;
                }

                acc.remoteDailyDocChanges.push(createChange);
                return acc;
            },
            {
                remoteDailyDocChanges: [] as ICreateChange[],
                otherRemoteChanges: [] as IDatabaseChange[],
                documentDeleteChanges: [] as IDeleteChange[],
            },
        );
        if (!remoteDailyDocChanges.length) {
            return {
                applicableRemoteChanges: remoteChanges,
                applicableLocalChanges: localChanges,
            };
        }

        const documentsService = this.resolveServiceByTable('documents');
        const deleteChangesMap = documentDeleteChanges.reduce((acc, val) => {
            acc.add(val.key);
            return acc;
        }, new Set<string>());
        const existingDailyDocs = await documentsService.indexedDB.list(
            vault.id,
            undefined,
            (entity: IDocument) => {
                if (!entity.dailyDoc) return false;
                return remoteDailyDocChanges.some(({ obj }: ICreateChange) => {
                    return (
                        obj.dailyDoc === entity.dailyDoc &&
                        !deleteChangesMap.has(entity.id)
                    );
                });
            },
        );

        const { applicableRemoteChanges, applicableLocalChanges } =
            this.mergeDailyDocs(
                existingDailyDocs,
                remoteDailyDocChanges as ICreateChange[],
            );
        return {
            applicableRemoteChanges: [
                ...otherRemoteChanges,
                ...applicableRemoteChanges,
            ] as IDatabaseChange[],
            applicableLocalChanges: [
                ...localChanges.filter(
                    change =>
                        change.table !== 'documents' ||
                        !applicableLocalChanges.some(
                            (c: IDatabaseChange) => c.key === change.key,
                        ),
                ),
                ...applicableLocalChanges,
            ] as IDatabaseChange[],
        };
    }

    mergeDailyDocs(
        existingDailyDocs: IDocument[],
        remoteDailyDocChanges: ICreateChange[],
    ): {
        applicableRemoteChanges: IDatabaseChange[];
        applicableLocalChanges: IDatabaseChange[];
    } {
        const applicableRemoteChanges = [];
        const applicableLocalChanges = [];
        const existingDailyDocsMap = existingDailyDocs.reduce(
            (acc: Record<string, IDocument[]>, value: IDocument) => {
                if (!acc[value.dailyDoc!]) {
                    acc[value.dailyDoc!] = [];
                }
                acc[value.dailyDoc!].push(value);
                return acc;
            },
            {} as Record<string, IDocument[]>,
        );
        remoteDailyDocChanges.forEach((doc: ICreateChange) => {
            if (!existingDailyDocsMap[doc.obj.dailyDoc]) {
                doc.source = 'sync';
                applicableRemoteChanges.push(doc);
                return;
            }
            const docIndex = existingDailyDocsMap[doc.obj.dailyDoc].findIndex(
                d => d.id === doc.key,
            );
            if (docIndex > -1) {
                const currentDoc =
                    existingDailyDocsMap[doc.obj.dailyDoc][docIndex];
                if (
                    new Date(doc.obj.updatedAt).getTime() >
                    new Date(currentDoc.updatedAt).getTime()
                ) {
                    existingDailyDocsMap[doc.obj.dailyDoc][docIndex] = doc.obj;
                }
            } else {
                existingDailyDocsMap[doc.obj.dailyDoc].push(doc.obj);
            }
        });
        const existingDailyDocIds = existingDailyDocs.reduce((acc, value) => {
            acc.add(value.id);
            return acc;
        }, new Set());

        const existingDocArrays = Object.values(existingDailyDocsMap);
        for (const sameDayDocs of existingDocArrays) {
            const oldestDoc: IDocument = sameDayDocs.reduce(
                (acc: IDocument, doc: IDocument) => {
                    if (
                        new Date(doc.createdAt).getTime() <
                        new Date(acc.createdAt).getTime()
                    ) {
                        return doc;
                    }
                    return acc;
                },
                sameDayDocs[0],
            );
            const docsToMerge = sameDayDocs
                .filter((doc: IDocument) => doc.id !== oldestDoc.id)
                .sort((a: IDocument, b: IDocument) => {
                    const aTime = new Date(a.createdAt).getTime();
                    const bTime = new Date(b.createdAt).getTime();
                    return aTime > bTime ? 1 : -1;
                });
            const updatedDailyDoc = docsToMerge.reduce(
                (acc: IDocument, doc: IDocument) => {
                    let newContent = acc.content + doc.content;
                    if (acc.id === doc.id) {
                        const currentUpdatedAt = new Date(
                            acc.updatedAt,
                        ).getTime();
                        const nextUpdatedAt = new Date(doc.updatedAt).getTime();
                        newContent =
                            currentUpdatedAt < nextUpdatedAt
                                ? doc.content
                                : acc.content;
                    }
                    acc.content = newContent;
                    return acc;
                },
                { ...oldestDoc },
            );

            updatedDailyDoc.updatedAt = new Date();

            const deleteChanges = docsToMerge.map((doc: IDocument) => {
                return {
                    type: 3,
                    table: 'documents',
                    key: doc.id,
                    source: '*',
                } as IDeleteChange;
            });

            const createChange: ICreateChange | IUpdateChange = {
                type: 1,
                table: 'documents',
                key: updatedDailyDoc.id,
                obj: updatedDailyDoc,
                source: '*',
            };
            let updateChange: IUpdateChange | null = null;

            if (existingDailyDocIds.has(updatedDailyDoc.id)) {
                updateChange = {
                    type: 2,
                    table: 'documents',
                    key: updatedDailyDoc.id,
                    mods: updatedDailyDoc,
                    source: '*',
                } as any;
            }
            applicableLocalChanges.push(createChange, ...deleteChanges);
            applicableRemoteChanges.push(
                updateChange ?? createChange,
                ...deleteChanges,
            );
        }
        return {
            applicableRemoteChanges,
            applicableLocalChanges,
        };
    }

    async processEntity(
        action: string,
        eventName: string,
        entity: Record<string, any>,
        register: Set<string> = new Set(),
        vault?: IVault | null,
    ): Promise<Record<string, any>> {
        if (!this.vault) return entity;
        const serviceObject = this.resolveServiceByEvent(eventName);
        if (!serviceObject.indexedDB.canStoreLocally) return entity;
        if (!vault) {
            vault = await this.context.$deviceService.Vaults.retrieve(
                '',
                this.vault!,
            );
        }
        if (!vault?.filepath) return entity;

        let mergedEntity = { ...entity };
        if (action !== 'delete') {
            const dbEntity = await serviceObject.indexedDB.retrieve(
                vault!.id,
                entity.id,
            );
            if (dbEntity) {
                mergedEntity = {
                    ...dbEntity,
                    ...mergedEntity,
                };
            }
        }

        if (!mergedEntity.filepath) {
            const filepath = await serviceObject.indexedDB.createFilePath(
                entity,
                mergedEntity,
                true,
                vault!,
            );
            mergedEntity.filepath = filepath;
        }
        return mergedEntity;
    }

    registerLocalChangesProcessor(
        context: IPersistedContext,
        changes: IDatabaseChange[],
        applyRemoteChanges: ApplyRemoteChangesFunction,
        baseRevision: any,
        onChangesAcceptedRoot: () => void,
        onSuccess: (
            continuation: ReactiveContinuation | PollContinuation,
        ) => void,
        onError: (err: Error, again?: number) => void,
    ): Promise<any[] | void> {
        let retryCounter = 1;
        const reactFunction = (
            changes: IDatabaseChange[],
            _baseRevision: any,
            __: boolean,
            onChangesAccepted: () => void,
        ) => {
            if (!this.isOnline) {
                this.context.$deviceService.disconnectSync({ id: this.vault });
                return;
            }
            changes = changes.filter(change => this.isSyncable(change.table));
            if (changes.length >= 10) {
                this.updateProgress();
            }
            this.processLocalChanges(
                context,
                changes,
                applyRemoteChanges,
                _baseRevision,
                onChangesAccepted,
                onError,
            )
                .then(() => {
                    retryCounter = 1;
                })
                .catch((err: any | ShouldDisconnectError) => {
                    if (err.name === ShouldDisconnectError.type) {
                        this.context.$deviceService.startNetworkCheck();
                        return this.context.$deviceService.disconnectSync({
                            id: this.vault,
                        });
                    }
                    console.log(err);

                    this.incrementalRetry(
                        (backoff: number) => {
                            onError(err, backoff);
                        },
                        retryCounter,
                        true,
                    );
                    retryCounter++;
                });
        };
        return this.processLocalChanges(
            context,
            changes,
            applyRemoteChanges,
            baseRevision,
            onChangesAcceptedRoot,
            onError,
        )
            .then(() => {
                onSuccess({
                    react: reactFunction,
                    disconnect: async () => {
                        this.connected = false;
                        context.socketsConnected = false;
                        this.removeRemoteFetchListener();
                        this.removeSocketEventListeners();
                        await this.disconnectWebsockets();
                    },
                });
                retryCounter = 1;
            })
            .catch(err => {
                if (err.name === ShouldDisconnectError.type) {
                    throw err;
                }
                console.log(err);
                this.incrementalRetry(
                    (backoff: number) => {
                        onError(err, backoff);
                    },
                    retryCounter,
                    true,
                );
                retryCounter++;
            });
    }

    removeSocketEventListeners() {
        this.syncableServices.forEach(({ eventName }) => {
            const listenerKey = this.isConfig
                ? `acreom-config-${eventName}`
                : `${this.vault}-${eventName}`;
            this.context.off(listenerKey);
        });
    }

    registerSocketEventListeners(
        context: IPersistedContext,
        services: ServicesObject<any>[],
        applyRemoteChanges: ApplyRemoteChangesFunction,
        baseRevision: any,
    ) {
        services.forEach(({ eventName, indexedDB }) => {
            const listenerKey = this.isConfig
                ? `acreom-config-${eventName}`
                : `${this.vault}-${eventName}`;
            this.context.on(listenerKey, async payload => {
                const message = payload as Record<string, any> & {
                    action: string;
                };
                const entityKey = eventName;
                const changes: IDatabaseChange[] = [];
                if (!Array.isArray(message[entityKey])) {
                    message[entityKey] = [message[entityKey]];
                }
                if (indexedDB.isEncryptableInProtocol) {
                    const existingEntities = await indexedDB.listByIds(
                        this.vault!,
                        message[entityKey].map((v: any) => v.id),
                    );
                    message[entityKey] = message[entityKey].map((v: any) => {
                        const existingEntity = existingEntities.find(
                            (entity: any) => entity.id === v.id,
                        );
                        if (existingEntity) {
                            return {
                                ...v,
                                encryptionKey:
                                    existingEntity?.encryptionKey ??
                                    v?.encryptionKey,
                            };
                        }
                        return v;
                    });

                    message[entityKey] = await indexedDB.encryption.decryptData(
                        this.vault!,
                        message[entityKey],
                    );
                }

                await Promise.all(
                    message[entityKey].map(async (val: any) => {
                        const processedPayload = await this.processEntity(
                            message.action,
                            entityKey,
                            val,
                        );

                        switch (message.action) {
                            case 'create':
                                changes.push({
                                    type: 1,
                                    table: this.resolveTable(entityKey).name,
                                    obj: processedPayload,
                                    key: processedPayload.id,
                                    source: 'sync',
                                } as ICreateChange);
                                context.lastSyncTimestamp[
                                    this.resolveTable(entityKey).name
                                ] =
                                    new Date(
                                        processedPayload.updatedAt,
                                    ).getTime() || Date.now();

                                if (
                                    entityKey === 'integration' &&
                                    processedPayload.type ===
                                        IntegrationType.GOOGLE_CALENDAR
                                ) {
                                    this.context.emit(
                                        ServiceKey.ANALYTICS,
                                        AnalyticsAction.TRACK_EVENT,
                                        {
                                            eventType: 'integration',
                                            properties: {
                                                action: 'create',
                                                entity_id: processedPayload.id,
                                                type: IntegrationType.GOOGLE_CALENDAR,
                                            },
                                        },
                                    );
                                }

                                break;
                            case 'update':
                                if (
                                    ['event', 'integration'].includes(entityKey)
                                ) {
                                    await this.preprocessEntity(
                                        this.resolveTable(entityKey),
                                        val,
                                    );
                                }
                                changes.push({
                                    type: 2,
                                    table: this.resolveTable(entityKey).name,
                                    mods: processedPayload,
                                    key: processedPayload.id,
                                    source: 'sync',
                                } as IUpdateChange);
                                context.lastSyncTimestamp[
                                    this.resolveTable(entityKey).name
                                ] =
                                    new Date(
                                        processedPayload.updatedAt,
                                    ).getTime() || Date.now();
                                break;
                            case 'delete':
                                this.resolveServiceByEvent(
                                    entityKey,
                                )?.onRemoteDelete?.(this.vault, [val]);
                                changes.push({
                                    type: 3,
                                    table: this.resolveTable(entityKey).name,
                                    key: val.id,
                                    source: 'sync',
                                } as IDeleteChange);
                                context.lastSyncTimestamp[
                                    this.resolveTable(entityKey).name
                                ] = Date.now();

                                break;
                        }
                    }),
                );

                if (changes.length) {
                    let maybeEncryptedChanges = changes;
                    if (indexedDB.isEncryptableInProtocol) {
                        maybeEncryptedChanges = await this.encryptChanges(
                            changes,
                        );
                    }
                    const flattenedChanges = this.flattenMods(
                        maybeEncryptedChanges,
                    );
                    await applyRemoteChanges(flattenedChanges, baseRevision);
                    await context.save();
                }
            });
        });
    }

    async transformToChanges(
        event: string,
        entities: any[],
    ): Promise<(IDatabaseChange | null)[]> {
        const service = this.resolveServiceByEvent(event);
        const existingEntities = await service.indexedDB.listByIds(
            this.vault ?? '',
            entities.map(entity => entity.id),
        );
        const existingMap = existingEntities.reduce((acc, value) => {
            acc[value.id] = value;
            return acc;
        }, {} as Record<string, any>);
        return entities.map(entity => {
            const exists = existingMap[entity.id];
            if (!exists) {
                return {
                    type: 1,
                    obj: entity,
                    key: entity.id,
                    table: service.tableName,
                    source: 'sync',
                } as ICreateChange;
            }
            if (
                new Date(entity.updatedAt).getTime() <
                new Date(exists.updatedAt).getTime()
            ) {
                return null;
            }
            return {
                type: 2,
                mods: entity,
                table: service.tableName,
                key: entity.id,
                source: 'sync',
            } as IUpdateChange;
        });
    }

    applyFilters(change: IDatabaseChange): Promise<boolean> | boolean {
        const clientId = this.context.$config.clientId;
        if (
            change.source &&
            ![clientId, 'device', 'importer', '*'].includes(change.source)
        ) {
            return Promise.resolve(false);
        }
        const service = this.syncableServices.find(
            s => s.tableName === change.table,
        );
        if (!service) {
            return Promise.resolve(false);
        }
        if (!service.filter) return Promise.resolve(true);
        return service.filter(change);
    }

    resolveTable(event: string): Table<any, string | number> {
        const service = this.syncableServices.find(s => s.eventName === event);
        if (!service) {
            throw new Error('unknown event to table mapping');
        }
        return service.table(this.vault!);
    }

    get cloudLoader() {
        return new CloudWrapper(this.context, 'loader');
    }

    resolveCloudAPI(table: string): CloudWrapper<any> {
        const service = this.syncableServices.find(s => s.tableName === table);
        if (!service) {
            throw new Error('unknown table to service mapping');
        }
        return service.service;
    }

    get userService(): CloudWrapper<any> {
        return this.syncableServices.find(s => s.tableName === 'users')!
            .service;
    }

    resolveServiceByEvent(event: string): ServicesObject<any> {
        const service = this.syncableServices.find(s => s.eventName === event);
        if (!service) {
            throw new Error('unknown event to service object mapping');
        }
        return service;
    }

    resolveServiceByTable(table: string): ServicesObject<any> {
        const service = this.syncableServices.find(s => s.tableName === table);
        if (!service) {
            throw new Error('unknown table to service object mapping');
        }
        return service;
    }

    async syncLocalChange(change: IDatabaseChange): Promise<any> {
        if (!change) return;
        const remoteAPI = this.resolveCloudAPI(change.table);
        const handleVaultTypeChange = async (vaultChange: IUpdateChange) => {
            const vault = await this.resolveTable('vault').get(change.key);
            if (vaultChange.mods?.type === 'remote') {
                return remoteAPI.save(
                    vault,
                    {
                        create: true,
                    },
                    this.vault!,
                );
            }
            if (vaultChange.mods?.type === 'local') {
                return remoteAPI.delete(vaultChange.key, this.vault!);
            }
            return remoteAPI.save(
                this.filterOutProperties({
                    ...(await this.unflattenUpdateObject(
                        change as IUpdateChange,
                    )),
                    id: change.key,
                }),
                {
                    create: false,
                },
                this.vault!,
            );
        };

        switch (change.type) {
            case 1:
                return remoteAPI.save(
                    this.filterOutProperties((change as ICreateChange).obj),
                    {
                        create: true,
                    },
                    this.vault!,
                );
            case 2:
                if (change.table === 'vaults') {
                    return handleVaultTypeChange(change as IUpdateChange);
                }
                return remoteAPI.save(
                    this.filterOutProperties({
                        ...(await this.unflattenUpdateObject(
                            change as IUpdateChange,
                        )),
                        id: change.key,
                    }),
                    {
                        create: false,
                    },
                    this.vault!,
                );
            case 3:
                return remoteAPI.delete(
                    (change as IDeleteChange).key,
                    this.vault!,
                );
            default:
                return Promise.resolve();
        }
    }

    async unflattenUpdateObject(
        change: IUpdateChange,
    ): Promise<Record<string, any>> {
        const tempObj = flatten.unflatten(
            (change as IUpdateChange).mods,
        ) as Record<string, any>;
        const indexedDb = this.syncableServices
            .find(({ tableName }) => tableName === change.table)
            ?.table(this.vault!);

        const dbObj = await indexedDb!.get(change.key); // TODO: indexedDb can be undefined?
        const newObj = merge(dbObj, tempObj);
        return Object.keys(tempObj).reduce((acc, key) => {
            return {
                ...acc,
                [key]: newObj[key],
            };
        }, {} as Record<string, any>);
    }

    async processLocalChanges(
        context: IPersistedContext,
        changes: IDatabaseChange[],
        _applyRemoteChanges: ApplyRemoteChangesFunction,
        _baseRevision: any,
        onChangesAccepted: () => void,
        _onError: (err: Error, timeout: number) => void,
    ): Promise<any[] | void> {
        if (!this.isOnline) {
            this.context.$deviceService.disconnectSync({ id: this.vault });
            throw new ShouldDisconnectError();
        }

        const filteredChanges = (
            await Promise.all(
                changes.map(async (change: IDatabaseChange) => {
                    const shouldProcess = await this.applyFilters(change);
                    if (!shouldProcess) return null;
                    return change;
                }),
            )
        ).filter(v => !!v) as IDatabaseChange[];

        this.sendReporter.progress(0, filteredChanges.length);

        const batchChanges = async (
            changes: IDatabaseChange[],
            syncFn: (changes: IDatabaseChange[]) => Promise<any>,
            batchSize = 20,
        ) => {
            while (changes.length) {
                const batch = changes.splice(0, batchSize);
                await syncFn(batch);
                this.sendReporter.progress(batch.length);
                await context.save().catch(() => {});
            }
        };

        const createChanges = filteredChanges.filter(
            change => change.type === 1,
        );
        const updateChanges = filteredChanges.filter(
            change => change.type === 2,
        );
        const deleteChanges = filteredChanges.filter(
            change => change.type === 3,
        );

        await batchChanges(createChanges, changes =>
            this.sendCreateChanges(changes),
        );
        await batchChanges(updateChanges, changes =>
            this.sendUpdateChanges(changes),
        );
        await batchChanges(deleteChanges, changes =>
            this.sendSingleChanges(changes),
        );
        filteredChanges.forEach(val => {
            let updatedAt = Date.now();
            if (val.key === 1 && (val as ICreateChange).obj?.updatedAt) {
                updatedAt = Math.max(
                    new Date((val as ICreateChange).obj.updatedAt).getTime(),
                    updatedAt,
                );
            }
            if (val.key === 2 && (val as IUpdateChange).mods?.updatedAt) {
                updatedAt = Math.max(
                    new Date((val as IUpdateChange).mods.updatedAt).getTime(),
                    updatedAt,
                );
            }
            if (val.key === 3 && (val as IDeleteChange).oldObj?.updatedAt) {
                updatedAt = Math.max(
                    new Date((val as IDeleteChange).oldObj.updatedAt).getTime(),
                    updatedAt,
                );
            }
            context.lastSyncTimestamp[val.table] =
                new Date(updatedAt).getTime() || Date.now();
        });
        await context.save().catch(() => {});
        await onChangesAccepted();
        this.sendReporter.done();
        await this.updateProgress('DONE');
        filteredChanges.map(change => {
            const serviceObject = this.resolveServiceByTable(change.table);
            return serviceObject.onComplete?.(change);
        });
    }

    sendUpdateChanges(updateChanges: IDatabaseChange[]): Promise<any[]> {
        const updateChangeToTableMap = updateChanges.reduce((acc, change) => {
            if (!acc[change.table]) {
                acc[change.table] = [];
            }
            acc[change.table].push(change as ICreateChange);
            return acc;
        }, {} as Record<string, ICreateChange[]>);

        return Promise.all(
            Object.keys(updateChangeToTableMap).map(table => {
                if (updateChangeToTableMap[table].length > 1) {
                    return this.sendBatchChanges(
                        table,
                        updateChangeToTableMap[table],
                        false,
                    );
                }
                return this.sendSingleChanges(updateChangeToTableMap[table]);
            }),
        );
    }

    sendCreateChanges(createChanges: IDatabaseChange[]): Promise<any[]> {
        const createChangeToTableMap = createChanges.reduce((acc, change) => {
            if (!acc[change.table]) {
                acc[change.table] = [];
            }
            acc[change.table].push(change as ICreateChange);
            return acc;
        }, {} as Record<string, ICreateChange[]>);

        return Promise.all(
            Object.keys(createChangeToTableMap).map(table => {
                if (createChangeToTableMap[table].length > 1) {
                    return this.sendBatchChanges(
                        table,
                        createChangeToTableMap[table],
                        true,
                    );
                }
                return this.sendSingleChanges(createChangeToTableMap[table]);
            }),
        );
    }

    async sendBatchChanges(
        table: string,
        changes: (ICreateChange | IUpdateChange)[],
        creating = true,
    ): Promise<any> {
        const remoteAPI = this.resolveCloudAPI(table);
        let response = [];
        if (creating) {
            response = await remoteAPI.createBatch(
                changes.map(change => this.filterOutProperties(change.obj)),
                this.vault!,
            );
        } else {
            response = await remoteAPI.updateBatch(
                changes.map(change =>
                    this.filterOutProperties({
                        id: change.key,
                        ...(change as IUpdateChange).mods,
                    }),
                ),
                this.vault!,
            );
        }
        if (!isCloudServiceResponse(response)) return null;
        if (PROTOCOL_RETRY_STATUS_CODES.includes(response.status)) {
            throw new ShouldDisconnectError();
        }
        if (RETRYABLE_STATUS_CODES.includes(response.status)) {
            await this.retrySendingChanges(changes);
        }
        if (BATCH_ISSUE_STATUS_CODES.includes(response.status)) {
            await this.retrySendingChanges(changes);
        }
    }

    async sendSingleChanges(changes: IDatabaseChange[]): Promise<void> {
        const responses = await this.sendChanges(changes);

        const mappedChanges = responses.map((response, index) => {
            if (!isCloudServiceResponse(response)) return null;
            if (PROTOCOL_RETRY_STATUS_CODES.includes(response.status)) {
                throw new ShouldDisconnectError();
            }
            if (!RETRYABLE_STATUS_CODES.includes(response.status)) {
                return null;
            }
            return changes[index];
        });
        const retryableChanges = mappedChanges.filter(
            change => change !== null,
        ) as IDatabaseChange[];
        if (retryableChanges.length === 0) return;
        await this.retrySendingChanges(changes);
    }

    async retrySendingChanges(changes: IDatabaseChange[]) {
        const retries: Promise<void>[] = [];
        let retry = 1;
        const retryChangesPromise = (): void => {
            if (retry > 5) {
                this.nativeProtocolRetry();
            }
            retries.push(
                new Promise<void>(resolve => {
                    setTimeout(() => {
                        resolve();
                        retry++;
                    }, this.computeBackoff(retry));
                }),
            );
        };
        await retryChangesPromise();
        let retryableChanges: IDatabaseChange[] = changes;

        for (const retryPromise of retries) {
            await retryPromise;
            const responses = await this.sendChanges(retryableChanges);
            const mappedChanges = responses.map((response, index) => {
                if (!isCloudServiceResponse(response)) return null;
                if (PROTOCOL_RETRY_STATUS_CODES.includes(response.status)) {
                    throw new ShouldDisconnectError();
                }
                if (!RETRYABLE_STATUS_CODES.includes(response.status))
                    return null;
                return retryableChanges[index];
            });
            retryableChanges = mappedChanges.filter(
                change => change !== null,
            ) as IDatabaseChange[];
            if (retryableChanges.length === 0) return;
            await retryChangesPromise();
        }
    }

    sendChanges(changes: IDatabaseChange[]): Promise<any[]> {
        const promises = changes.map(change =>
            this.syncLocalChange(change as IDatabaseChange).catch(err => {
                console.log(err);
                return null;
            }),
        );
        return Promise.all(promises);
    }

    nativeProtocolRetry() {
        throw new Error('network error, retrying');
    }

    filterOutProperties(obj: any): any {
        const properties = ['filepath'];
        return properties.reduce(
            (acc, key) => {
                if (key in acc) {
                    acc[key] = undefined;
                }
                return acc;
            },
            { ...obj },
        );
    }
}

class ShouldDisconnectError extends Error {
    static type = 'should_disconnect';
    constructor() {
        super();
        this.message = 'Error: recieved network error, should disconnect';
        this.name = ShouldDisconnectError.type;
    }
}
