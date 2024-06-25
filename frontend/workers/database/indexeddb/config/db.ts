import DexieDB, { Table } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import '../Dexie.Observable/src/Dexie.Observable';
import '../dexie-syncable/dexie-syncable';
import { IUser, IVault, SessionData } from '../types';
import { AcreomProtocol, CloudWrapper } from '~/workers/database/protocol';
import { CloudServiceAction, LoadProgressState, ServiceKey } from '~/constants';
import { WorkerContext } from '~/@types/app';
import { registerVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { ProtocolReporter } from '~/workers/database/reporter/protocol';
import {
    ImporterEvents,
    ProgressReporter,
} from '~/workers/database/reporter/interface';

declare module 'dexie' {
    interface DbEvents {
        (
            eventName: 'changes',
            subscriber: (changes: IDatabaseChange[], partial: boolean) => void,
        ): void;

        (eventName: 'cleanup', subscriber: () => any): void;

        (eventName: 'message', subscriber: (msg: MessageEvent) => any): void;
    }
}

const getDatabaseVersion = (dbName: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        // Open a connection to the database
        const request = indexedDB.open(dbName);

        // On success, retrieve the version and resolve the promise
        request.onsuccess = function (event) {
            const db = (event.target as any)?.result;
            if (!db) {
                resolve(0);
            } else {
                resolve(db.version);
            }
            db.close();
        };

        // On error, reject the promise
        request.onerror = function () {
            reject(new Error('could not open database'));
        };
    });
};

type AppSettings = {};

const ACREOM_CONFIG_DATABASE_VERSION = 3.0;

class AcreomConfigIndexedDB extends DexieDB {
    public initialized: boolean = false;
    private vaults!: Table<IVault, string>;
    private users!: Table<IUser, string>;
    private appSettings!: Table<AppSettings, string>;
    private sessionData!: Table<SessionData, string>;
    private activeVault!: Table<{ id: string }, string>;
    private recoveryKeys!: Table<
        { id: string; userId: string; encryptedData: string },
        string
    >;

    public syncProtocol!: AcreomProtocol | null;
    private static _instance: AcreomConfigIndexedDB;
    private cloudSyncPromise: Promise<void> = Promise.resolve();
    private context!: WorkerContext;
    private isReady: boolean = false;

    constructor(version = ACREOM_CONFIG_DATABASE_VERSION) {
        super('acreom-config-database');
        if (AcreomConfigIndexedDB._instance) {
            return AcreomConfigIndexedDB._instance;
        }

        AcreomConfigIndexedDB._instance = this;
        this.version(version).stores({
            vaults: '&&id, name, type',
            users: '&&id',
            appSettings: '&&id',
            recoveryKeys: '&&id',
            _activeVault: '&&id',
            _sessionData: '&id',
        });

        this.vaults = this.table<IVault, string>('vaults');
        this.users = this.table<IUser, string>('users');
        this.sessionData = this.table<SessionData, string>('_sessionData');
        this.appSettings = this.table<AppSettings, string>('appSettings');
        this.activeVault = this.table<{ id: string }, string>('_activeVault');
        this.recoveryKeys = this.table<any, string>('recoveryKeys');
    }

    async retrieveVaultDatabaseVersions() {
        await this.open();

        const vaults = await this.vaults.toArray();

        this.close();

        const versions = await Promise.all<{ name: string; version: number }>(
            vaults.map(async vault => {
                const result = await getDatabaseVersion(vault.id).catch(
                    () => 0,
                );
                return { name: vault.id, version: result };
            }),
        );
        return versions;
    }

    async initialize(ctx: WorkerContext) {
        if (this.initialized) return;
        this.initialized = true;
        this.context = ctx;
        console.log('initializing worker acreom-config-database');

        await this.registerSyncProtocol(ctx);

        await this.open().catch(err => {
            ctx.emit(ServiceKey.SENTRY, 'trackError', err);
            console.log(err);
        });
        const vaults = (await ctx.$deviceService?.Vaults.list('')) as IVault[];

        vaults.map(vault => registerVaultIndexedDB(vault, this.context));
        // @ts-ignore
        this.on('changes', (changes: IDatabaseChange[]) => {
            changes.forEach(change => {
                if (change.table === 'users') {
                    if (change.type === 1) {
                        ctx.emit(
                            ServiceKey.STORE,
                            'dispatch:user/indexedDBCreate',
                            (change as ICreateChange).obj,
                        );
                    }
                    if (change.type === 2) {
                        ctx.emit(
                            ServiceKey.STORE,
                            'dispatch:user/indexedDBUpdate',
                            (change as IUpdateChange).obj,
                        );
                    }
                    if (change.type === 3) {
                        ctx.emit(
                            ServiceKey.STORE,
                            'dispatch:user/indexedDBDelete',
                            (change as IDeleteChange).oldObj?.id,
                        );
                    }
                    return;
                }
                if (change.table !== this.activeVault.name) return;
                if (change.key !== 1) return;
                ctx.emit(ServiceKey.STORE, 'vault/reloadData', change.key);
            });
        });
        this.context.emit(ServiceKey.NUXT, 'emit', {
            event: 'vaults-initialized',
        });
        return new Promise<void>(resolve => {
            this.on('ready', () => {
                console.log('acreom config database ready');
                resolve();
            });
        });
    }

    private async retrieveActiveVault(): Promise<{ id: string } | null> {
        const rows = await this.activeVault.toArray();
        if (rows.length) {
            return rows[0];
        }
        return null;
    }

    async getActiveVault(): Promise<IVault | null> {
        let activeVault: Partial<IVault> | null =
            await this.retrieveActiveVault();
        const vaults = await this.vaults.toArray();
        const stillExists =
            vaults.find(({ id }) => activeVault?.id === id) ?? null;
        activeVault = stillExists;
        if (!activeVault || !stillExists) {
            if (!vaults.length) {
                return null;
            }
            activeVault = vaults[0];
            await this.setActiveVault(activeVault.id!);
        }

        return activeVault as IVault;
    }

    async setActiveVault(id: string) {
        const activeVault = await this.activeVault.toArray();
        await this.activeVault.bulkDelete(
            activeVault.map(({ id: _id }) => _id),
        );
        await this.activeVault.put({ id }, id);
    }

    async registerSyncProtocol(ctx: WorkerContext) {
        const loadReporter = new ProtocolReporter(
            ctx,
            'acreom-config-database',
        );
        const sendReporter = new ProtocolReporter(
            ctx,
            'acreom-config-database',
        );
        if (!this.syncProtocol) {
            this.isReady = false;
            this.syncProtocol = new AcreomProtocol(
                ctx,
                null,
                this.configSyncableServices,
                sendReporter,
                loadReporter,
            );
        }

        let callback = () => {};
        this.cloudSyncPromise = new Promise<void>(resolve => {
            callback = () => {
                resolve();
            };
        });

        DexieDB.Syncable.registerSyncProtocol(
            this.syncProtocol.protocolName,
            this.syncProtocol.syncProtocol(() => {
                callback();
                ctx.emit(ServiceKey.DATABASE, 'protocol-loaded', null);
            }),
        );
        const logger = (status: number, url: string) => {
            const logString = `[${url} acreom-config-database]: Protocol ${DexieDB.Syncable.StatusTexts[
                status
            ].toLowerCase()}`;
            console.log(logString);
        };

        this.syncable.on('statusChanged', (status, url) => {
            logger(status, url);
        });

        this.registerProgressListeners(
            loadReporter,
            LoadProgressState.CLOUD_VAULT_LOADING,
        );
        this.registerProgressListeners(
            sendReporter,
            LoadProgressState.CLOUD_VAULT_SENDING,
        );
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
                    cloudStatus: {
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
                    cloudStatus: {
                        state: LoadProgressState.OKAY,
                        info: data,
                    },
                },
            );
        });
    }

    async connectSyncProtocol(
        ctx: WorkerContext,
        cb?: Function | null,
        options = {},
    ) {
        ctx.emit(
            ServiceKey.CLOUD,
            CloudServiceAction.WEBSOCKETS_INITIALIZE,
            null,
        );
        if (!this.syncProtocol) await this.registerSyncProtocol(ctx);

        await this.syncable
            .connect(
                this.syncProtocol!.protocolName as string,
                ctx.$config.baseUrl,
                options,
            )
            .then(() => {
                console.log(
                    this.syncProtocol?.protocolName,
                    'protocol connected',
                );
                if (!this._localSyncNode.isMaster) {
                    cb?.();
                    ctx.emit(ServiceKey.DATABASE, 'protocol-loaded', null);
                }
            })
            .catch((err: Error) => {
                ctx.emit(ServiceKey.SENTRY, 'trackError', err);
                console.log(err);
            });
    }

    disconnectSync(ctx: WorkerContext) {
        return this.syncable.disconnect(ctx.$config.baseUrl);
    }

    get configSyncableServices() {
        return [
            {
                eventName: 'vault',
                tableName: 'vaults',
                service: new CloudWrapper<IVault>(this.context, 'vaults'),
                indexedDB: this.context.$deviceService.Vaults,
                table: () => {
                    return this.Vaults;
                },
                filter: async (change: any) => {
                    if ((change as IDatabaseChange).type === 3) {
                        return true;
                    }
                    if ((change as IDatabaseChange).type === 1) {
                        return (change as ICreateChange).obj.type === 'remote';
                    }
                    const vault = await this.Vaults.get(
                        (change as IDatabaseChange).key,
                    );
                    return (
                        vault?.type === 'remote' ||
                        (change as IUpdateChange).mods.type
                    );
                },
                onRemoteFetch: async (vaults: IVault[]) => {
                    const activeVault = await this.getActiveVault();
                    if (!activeVault && vaults?.[0]?.id) {
                        await this.setActiveVault(vaults?.[0]?.id);
                    }
                },
            },
            {
                eventName: 'user',
                tableName: 'users',
                service: new CloudWrapper<IUser>(this.context, 'user'),
                indexedDB: this.context.$deviceService.Users,
                table: () => {
                    return this.Users;
                },
                filter: (change: any) => {
                    if ([1, 3].includes(change.type)) {
                        return false;
                    }
                    return !Object.keys(change.mods).some(key =>
                        key.includes('credentials'),
                    );
                },
            },
            {
                eventName: 'app-settings',
                tableName: 'appSettings',
                service: new CloudWrapper<AppSettings>(
                    this.context,
                    'app-settings',
                ),
                indexedDB: this.context.$deviceService.AppSettings,
                table: () => {
                    return this.AppSettings;
                },
            },
            {
                eventName: 'recovery-keys',
                tableName: 'recoveryKeys',
                service: new CloudWrapper<AppSettings>(
                    this.context,
                    'recovery-keys',
                ),
                indexedDB: this.context.$deviceService.RecoveryKeys,
                table: () => {
                    return this.RecoveryKeys;
                },
            },
        ];
    }

    get Vaults() {
        return this.vaults;
    }

    get Users() {
        return this.users;
    }

    get AppSettings() {
        return this.appSettings;
    }

    get SessionData() {
        return this.sessionData;
    }

    get RecoveryKeys() {
        return this.recoveryKeys;
    }

    waitForCloudSync() {
        return this.cloudSyncPromise;
    }
}

export const acreomConfigIndexedDB = new AcreomConfigIndexedDB();
