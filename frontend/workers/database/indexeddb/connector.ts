import DexieDB, { Table } from 'dexie';
import { v4, validate } from 'uuid';
import './Dexie.Observable/src/Dexie.Observable';
import './dexie-syncable/dexie-syncable';
import isString from 'lodash/isString';
import { AcreomProtocol, CloudWrapper } from '~/workers/database/protocol';
import { IDocument } from '~/components/document/model';
import { ITask } from '~/components/task/model';
import { IEvent, IFolder } from '~/@types';
import { WorkerContext, CloudResponse, IVersion } from '~/@types/app';
import {
    IntegrationsActions,
    IntegrationType,
    LoadProgressState,
    ServiceKey,
} from '~/constants';
import { IntegrationConfig } from '~/workers/integrations';
import { IVault } from '~/workers/database/indexeddb/types';
import {
    availableMigrations,
    MigrationConfig,
    MigrationState,
} from '~/workers/database/indexeddb/migration-scripts';
import { ProtocolReporter } from '~/workers/database/reporter/protocol';
import {
    ImporterEvents,
    ProgressReporter,
} from '~/workers/database/reporter/interface';
import { IView } from '~/components/view/model';
import { deserializeImage, serializeImage } from '~/helpers/image';

export const ACREOM_DATABASE_VERSION = 6.4;

export class AcreomVaultIndexedDB extends DexieDB {
    private documents: Table<IDocument, string>;
    private tasks: Table<ITask, string>;
    private events: Table<IEvent, string>;
    private projects: Table<IFolder, string>;
    private integrations: Table<any, string>;
    private images: Table<any, string>;
    private _config: Table<any, string>;
    private _imageData: Table<any, string>;
    private _migrations: Table<any, string>;
    private _localConflicts: Table<any, string>;
    private cloudSyncPromise: Promise<void> = Promise.resolve();
    private views: Table<IView, string>;
    private versions: Table<IVersion, string>;

    private googleCalendarEvents: Table<any, string>;
    private integrationsData: Table<any, string>;
    public isActive: boolean = false;
    public initialized: boolean = false;
    public context!: WorkerContext;
    public syncProtocol!: AcreomProtocol | null;
    public vault: IVault;

    loggingRegistered = false;

    constructor(
        database = 'acreom-database-v2',
        version = ACREOM_DATABASE_VERSION,
        vault: any,
        context: WorkerContext,
    ) {
        super(database);
        this.vault = vault;
        this.context = context;

        this.on('ready', () => {
            console.log('indexedDB Ready');
        });

        this.migrateDatabase(version);
        this.documents = this.table<IDocument, string>('documents');
        this.projects = this.table<IFolder, string>('projects');
        this.tasks = this.table<ITask, string>('tasks');
        this.events = this.table<IEvent, string>('events');
        this.integrations = this.table<any, string>('integrations');
        this.images = this.table<any, string>('images');
        this._config = this.table<any, string>('_config');
        this._imageData = this.table<any, string>('_imageData');
        this._localConflicts = this.table<any, string>('_localConflicts');
        this.googleCalendarEvents = this.table<any, string>(
            'googleCalendarEvents',
        );
        this.integrationsData = this.table<any, string>('integrationsData');
        this.views = this.table<IView, string>('views');
        this.versions = this.table<any, string>('versions');
        this._migrations = this.table<any, string>('_migrations');
    }

    get vaultId() {
        return this.vault.id;
    }

    get filepath() {
        return this.vault.filepath;
    }

    get type() {
        return this.vault.type;
    }

    migrateDatabase(version: number) {
        const entities = {
            documents: '&&id, &filepath',
            tasks: '&&id, &filepath',
            projects: '&&id, &filepath',
            integrations: '&&id, type',
            events: '&&id, &filepath',
            _config: 'id',
            images: '&&id, documentId',
            _imageData: '&&id',
            googleCalendarEvents: 'id, summary, calendarId',
            _localConflicts: '&&id',
            integrationsData: 'id, type',
            views: '&&id',
            versions: '&&id, entityId',
            _migrations: '&&id, version',
        };
        const initialVersion =
            this.context.$deviceService.initialDBVersions?.[this.vaultId] ?? 0;

        const migrations = this.getAvailableMigrations(version, initialVersion);

        if (!initialVersion) {
            this.on('populate', trx => {
                const items: MigrationConfig[] = [];
                for (const [migrationVersion, migration] of migrations) {
                    if ('local' in migration) {
                        items.push({
                            id: v4(),
                            version: migrationVersion,
                            type: 'local',
                            state: MigrationState.PENDING,
                        });
                    }
                    if (this.vault.type === 'remote' && 'remote' in migration) {
                        items.push({
                            id: v4(),
                            version: migrationVersion,
                            type: 'remote',
                            state: MigrationState.PENDING,
                        });
                    }
                }
                return trx.table('_migrations').bulkAdd(items);
            });
        }

        for (const [migrationVersion, migration] of migrations) {
            this.version(migrationVersion)
                .stores(entities)
                .upgrade(trx => {
                    const items: MigrationConfig[] = [];
                    if ('local' in migration) {
                        items.push({
                            id: v4(),
                            version: migrationVersion,
                            type: 'local',
                            state: MigrationState.PENDING,
                        });
                    }
                    if (this.vault.type === 'remote' && 'remote' in migration) {
                        items.push({
                            id: v4(),
                            version: migrationVersion,
                            type: 'remote',
                            state: MigrationState.PENDING,
                        });
                    }
                    return trx.table('_migrations').bulkAdd(items);
                });
        }

        if (
            migrations.some(
                ([migrationVersion]) =>
                    Math.floor(version * 10) ===
                    Math.floor(migrationVersion * 10),
            )
        ) {
            return;
        }

        this.version(version).stores(entities);
    }

    getAvailableMigrations(version: number, initialVersion: number) {
        if (!initialVersion) {
            return Object.entries(availableMigrations).map(
                ([migrationVersion, migration]) =>
                    [parseFloat(migrationVersion), migration] as [number, any],
            );
        }
        return Object.entries(availableMigrations)
            .map(
                ([migrationVersion, migration]) =>
                    [parseFloat(migrationVersion), migration] as [number, any],
            )
            .filter(
                ([migrationVersion]) =>
                    Math.floor(migrationVersion * 10) <=
                    Math.floor(version * 10),
            );
    }

    async initializeNotifications(ctx: WorkerContext) {
        const integrations = await ctx.$deviceService.Integrations.list(
            this.vaultId,
        );
        const localConfig = await ctx.$deviceService.LocalConfig.list(
            this.vaultId,
        );

        ctx.emit(ServiceKey.DEVICE, 'notification:initialize', {
            vaultId: this.vaultId,
            integrations,
            localConfig,
        });
    }

    async initialize(ctx: WorkerContext) {
        if (this.initialized) return;

        console.log('initializing ' + this.vaultId);
        this.context = ctx;
        this.initialized = true;
        const isElectron = ctx.$config.platform === 'desktop';

        await this.open()
            .then(() => {
                console.log('connection opened');
            })
            .catch(err => {
                err.message =
                    `could not open database for vault '${this.vaultId}': ` +
                    err.message;
                ctx.emit(ServiceKey.SENTRY, 'trackError', err);
                console.log(err);
            });
        this.on('close', reason => {
            const message = isString(reason) && 'DB Closed ' + reason;
            ctx.emit(
                ServiceKey.SENTRY,
                'trackError',
                new Error(message || 'DB Closed'),
            );
        });

        if (isElectron) {
            this.initializeNotifications(ctx);
        }

        ctx.$deviceService.Tasks.initialize(this.vaultId);
        ctx.$deviceService.Projects.initialize(this.vaultId);
        ctx.$deviceService.Events.initialize(this.vaultId);
        ctx.$deviceService.Images.initialize(this.vaultId);
        ctx.$deviceService.Documents.initialize(this.vaultId);
        ctx.$deviceService.Integrations.initialize(this.vaultId);
        ctx.$deviceService.LocalConflicts.initialize(this.vaultId);
        ctx.$deviceService.GoogleCalendarEventsIndexedDB.initialize(
            this.vaultId,
        );
        ctx.$deviceService.IntegrationsDataIndexedDB.initialize(this.vaultId);
        ctx.$deviceService.Views.initialize(this.vaultId);
        ctx.$deviceService.Versions.initialize(this.vaultId);

        if (this.vault.type === 'local' && !this.vault.filepath) {
            setTimeout(() => {
                this.context.emit(ServiceKey.NUXT, 'emit', {
                    event: 'force-filepath',
                    data: this.vault,
                });
            }, 1000);
            return;
        }

        await ctx.$deviceService.Migrations.migrateLocal(this.vaultId); // always before connected to cloud

        if (this.filepath) {
            if (isElectron) {
                this.registerWatch(this.vault);
            }
        }
    }

    setVault(vault: IVault) {
        if (this.vaultId !== vault.id) return;
        this.vault = vault;
    }

    getSyncStatus() {
        return this.syncable.getStatus(this.context.$config.baseUrl);
    }

    async disconnectSync(shouldDelete: boolean = false) {
        const status = await this.syncable.getStatus(
            this.context.$config.baseUrl,
        );
        if (status === 0) return;

        await this.syncable.disconnect(this.context.$config.baseUrl);
        if (shouldDelete) {
            await this._syncNodes
                .filter(node => node.type === 'remote')
                .delete();
        }
    }

    async connectSync() {
        if (!this.syncProtocol) {
            this.createProtocolInstance();
        }
        const status = await this.syncable.getStatus(
            this.context.$config.baseUrl,
        );
        if (status !== 0) return;
        return this.syncable.connect(
            this.syncProtocol!.protocolName,
            this.context.$config.baseUrl,
        );
    }

    registerWatch(vault: IVault) {
        return this.context.emit(ServiceKey.DEVICE, 'vault:registerWatch', {
            path: vault.filepath,
            id: vault.id,
        });
    }

    disconnectWatch(vault: IVault) {
        return this.context.emit(ServiceKey.DEVICE, 'vault:removeWatch', {
            path: vault.filepath,
            id: vault.id,
        });
    }

    createProtocolInstance() {
        if (this.syncProtocol) return;
        const loadReporter = new ProtocolReporter(this.context, this.vaultId);
        const sendReporter = new ProtocolReporter(this.context, this.vaultId);
        this.syncProtocol = new AcreomProtocol(
            this.context,
            this.vaultId,
            this.vaultSyncableServices,
            sendReporter,
            loadReporter,
        );

        let callback = () => {
            this.triggerIntegrationsSync();
        };

        if (this.vault.filepath && this.vault.type === 'remote') {
            this.cloudSyncPromise = new Promise<void>(resolve => {
                callback = () => {
                    this.triggerIntegrationsSync();
                    resolve();
                };
            });
        }

        DexieDB.Syncable.registerSyncProtocol(
            this.syncProtocol.protocolName,
            this.syncProtocol.syncProtocol(callback),
        );

        const logger = (status: number, url: string) => {
            const logString = `[${url} ${
                this.vaultId
            }]: Protocol ${DexieDB.Syncable.StatusTexts[status].toLowerCase()}`;
            console.log(logString);
        };

        if (this.loggingRegistered) return;
        this.loggingRegistered = true;
        this.syncable.on('statusChanged', (status, url) => {
            logger(status, url);

            this.context.emit(
                ServiceKey.STORE,
                'dispatch:vault/setSyncStatus',
                {
                    status,
                    vaultId: this.vaultId,
                },
            );
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

    waitForCloudSync() {
        return this.cloudSyncPromise;
    }

    async registerSyncProtocol(options: Record<string, any> = {}, retry = 0) {
        this.createProtocolInstance();
        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            this.vaultId,
        );
        if (!vault || vault.type === 'local') return;
        try {
            await this.syncable.connect(
                this.syncProtocol!.protocolName,
                this.context.$config.baseUrl,
                options,
            );
        } catch (err: any) {
            if (
                retry < 5 &&
                err.message ===
                    'Precondition failed: local sync node is missing. Make sure Dexie.Observable is active!'
            ) {
                setTimeout(() => {
                    this.registerSyncProtocol(options, retry + 1);
                }, retry + 100);
                return;
            }
            console.log(err);
            this.context.emit(ServiceKey.SENTRY, 'trackError', err.message);
        }
    }

    triggerIntegrationsSync() {
        this.context.emit(
            ServiceKey.INTEGRATIONS,
            IntegrationsActions.MANUAL_RUN,
            { vaultId: this.vaultId },
        );
    }

    async _disconnectSync() {
        if (!this.syncProtocol) return;
        await this.syncProtocol?.disconnectWebsockets();
        await this.syncable.delete(this.context.$config.baseUrl);
        DexieDB.Syncable.unregisterSyncProtocol(
            this.syncProtocol!.protocolName,
        );
        this.syncProtocol = null;

        setTimeout(() => {
            this.transaction('rw', '_syncNodes', () => {
                this._syncNodes.toCollection().modify({ myRevision: -1 });
            });
        }, 1500);
    }

    get vaultSyncableServices() {
        return [
            {
                eventName: 'document',
                tableName: 'documents',
                service: new CloudWrapper<CloudResponse<IDocument>>(
                    this.context,
                    'documents',
                ),
                indexedDB: this.context.$deviceService.Documents,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Documents,
                filter: (change: any) => {
                    const localModkeys = [
                        'updatedAt',
                        'clientId',
                        'filepath',
                        'id',
                        'sequence',
                        'updateId',
                    ];
                    if (change.type === 2) {
                        return !Object.keys(change.mods).every((key: string) =>
                            localModkeys.includes(key),
                        );
                    }
                    return true;
                },
            },
            {
                eventName: 'task',
                tableName: 'tasks',
                service: new CloudWrapper<CloudResponse<ITask>>(
                    this.context,
                    'tasks',
                ),
                indexedDB: this.context.$deviceService.Tasks,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Tasks,
                filter: (change: any) => {
                    const localModkeys = [
                        'updatedAt',
                        'clientId',
                        'filepath',
                        'id',
                    ];
                    if (change.type === 2) {
                        return !Object.keys(change.mods).every((key: string) =>
                            localModkeys.includes(key),
                        );
                    }
                    return true;
                },
            },
            {
                eventName: 'project',
                tableName: 'projects',
                service: new CloudWrapper<CloudResponse<IFolder>>(
                    this.context,
                    'projects',
                ),
                indexedDB: this.context.$deviceService.Projects,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Projects,
                filter: (change: any) => {
                    const localModkeys = [
                        'updatedAt',
                        'clientId',
                        'filepath',
                        'id',
                        'expanded',
                    ];
                    if (change.type === 2) {
                        return !Object.keys(change.mods).every((key: string) =>
                            localModkeys.includes(key),
                        );
                    }
                    return true;
                },
            },
            {
                eventName: 'integration',
                tableName: 'integrations',
                service: new CloudWrapper<
                    CloudResponse<IntegrationConfig<any>>
                >(this.context, 'integrations'),
                indexedDB: this.context.$deviceService.Integrations,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Integrations,
                filter: (change: any) => {
                    if (change.type === 1) {
                        return (
                            change.obj.type !== IntegrationType.APPLE_CALENDAR
                        );
                    }
                    if (change.type === 2) {
                        return (
                            change.obj.type !==
                                IntegrationType.APPLE_CALENDAR &&
                            Object.keys(change.mods).some((key: string) =>
                                key?.startsWith('data'),
                            )
                        );
                    }
                    return true;
                },
                onRemoteDelete: async (
                    vaultId: string | null,
                    entities: IntegrationConfig<any>[],
                ) => {
                    if (!vaultId) return;

                    const integrations =
                        await this.context.$deviceService.Integrations.listByIds(
                            vaultId,
                            entities.map(e => e.id),
                        );
                    integrations.map(integration =>
                        this.context.$deviceService.Integrations.afterDeleteCleanUp(
                            vaultId,
                            integration,
                        ).catch(e =>
                            console.log(
                                'could not execute after delete cleanup on integration',
                                integration.id,
                                integration.type,
                                e,
                            ),
                        ),
                    );
                },
            },
            {
                eventName: 'view',
                tableName: 'views',
                service: new CloudWrapper<CloudResponse<IView>>(
                    this.context,
                    'views',
                ),
                indexedDB: this.context.$deviceService.Views,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Views,
                filter: (change: any) => {
                    const localModkeys = [
                        'updatedAt',
                        'clientId',
                        'id',
                        'editing',
                        'filters',
                    ];
                    if (change.type === 2) {
                        return !Object.keys(change.mods).every((key: string) =>
                            localModkeys.includes(key),
                        );
                    }
                    return true;
                },
            },
            {
                eventName: 'event',
                tableName: 'events',
                service: new CloudWrapper<CloudResponse<IEvent>>(
                    this.context,
                    'events',
                ),
                indexedDB: this.context.$deviceService.Events,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Events,
                filter: async (change: any) => {
                    if (change.type === 1) {
                        return (
                            (change.obj as IEvent)?.integrationType !==
                            IntegrationType.ICS_CALENDAR
                        );
                    }
                    if (change.type === 2) {
                        if (
                            change.mods.sendUpdates === false &&
                            Object.keys(change.mods).length < 3 // only sendUpdates and updatedAt in object
                        ) {
                            return false;
                        }
                        const event = await acreomVaultIndexedDB(
                            this.vaultId,
                        ).Events.get(change.key);
                        return (
                            event?.integrationType !==
                            IntegrationType.ICS_CALENDAR
                        );
                    }
                    if (!validate(change.key)) return false;

                    const localModkeys = [
                        'updatedAt',
                        'clientId',
                        'filepath',
                        'id',
                    ];

                    if (change.type === 2) {
                        return !Object.keys(change.mods).every((key: string) =>
                            localModkeys.includes(key),
                        );
                    }

                    return true;
                },
            },
            {
                eventName: 'image',
                tableName: 'images',
                service: new CloudWrapper<CloudResponse<any>>(
                    this.context,
                    'images',
                ),
                indexedDB: this.context.$deviceService.Images,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Images,
                filter: async (change: any) => {
                    try {
                        if (change.type === 1) {
                            const imageData =
                                await this.context.$deviceService.ImageData.retrieve(
                                    this.vaultId,
                                    change.obj.id,
                                    { decrypt: false },
                                );
                            if (!change.obj.remoteUri && imageData) {
                                if (
                                    !imageData?.data &&
                                    !imageData?.encryptedData
                                )
                                    return false;

                                change.obj.data =
                                    imageData?.encryptedData ??
                                    new Blob([
                                        deserializeImage(imageData?.data)
                                            .buffer,
                                    ]);
                                return true;
                            }
                            if (change.obj.remoteUri) return true;
                            if (!change.obj.filepath && !imageData)
                                return false;
                            const { payload: imageBuffer } = await this.context
                                .invoke<{ payload: Buffer }>(
                                    ServiceKey.DEVICE,
                                    'attachment:read',
                                    {
                                        filepath: change.obj.filepath,
                                    },
                                )
                                .catch(() => ({ payload: null }));
                            if (!imageBuffer) return false;
                            const serializedImage = serializeImage(imageBuffer);
                            const encryptedContents: any[] =
                                await this.context.$deviceService.ImageData.saveBulk(
                                    change.obj.vaultId,
                                    [
                                        {
                                            id: change.key,
                                            data: serializedImage,
                                            encryptionKey:
                                                change.obj?.encryptionKey,
                                        },
                                    ],
                                    {
                                        encrypt: true,
                                    },
                                );
                            const encryptedImage = encryptedContents.shift()!;
                            if (
                                !encryptedImage?.data &&
                                !encryptedImage?.encryptedData
                            )
                                return false;
                            change.obj.data =
                                encryptedImage?.encryptedData ??
                                new Blob([imageBuffer.buffer]);
                            return true;
                        }
                        if (change.type === 2) {
                            const folderMods = 'folderId' in change.mods;
                            const imageData =
                                await this.context.$deviceService.ImageData.retrieve(
                                    this.vaultId,
                                    change.key,
                                    { decrypt: false },
                                );
                            if (
                                !imageData ||
                                (!imageData.data && !imageData.encryptedData)
                            )
                                return folderMods;
                            change.mods.data =
                                imageData?.encryptedData ??
                                new Blob([
                                    deserializeImage(imageData?.data).buffer,
                                ]);
                            return true;
                        }
                        return true;
                    } catch (e) {
                        console.log(e);
                        return true;
                    }
                },
                onComplete: async (change: any) => {
                    try {
                        if (!change || change.type !== 1) return;
                        if (
                            change.obj.remoteUri ||
                            change.obj.filepath ||
                            !change.obj.data
                        )
                            return;
                        await this.context.$deviceService.ImageData.delete(
                            this.vaultId,
                            change.key,
                        );
                    } catch (e) {
                        console.log(e);
                    }
                },
            },
            {
                eventName: 'version',
                tableName: 'versions',
                service: new CloudWrapper<CloudResponse<IVersion>>(
                    this.context,
                    'versions',
                ),
                indexedDB: this.context.$deviceService.Versions,
                table: (vaultId: string | undefined) =>
                    acreomVaultIndexedDB(vaultId!).Versions,
                filter: (_change: any) => {
                    return true;
                },
            },
        ];
    }

    get Documents() {
        return this.documents;
    }

    get Tasks() {
        return this.tasks;
    }

    get Events() {
        return this.events;
    }

    get Projects() {
        return this.projects;
    }

    get LocalConfig() {
        return this._config;
    }

    get Integrations() {
        return this.integrations;
    }

    get Images() {
        return this.images;
    }

    get ImageData() {
        return this._imageData;
    }

    get LocalConflicts() {
        return this._localConflicts;
    }

    get GoogleCalendarEvents() {
        return this.googleCalendarEvents;
    }

    get IntegrationsData() {
        return this.integrationsData;
    }

    get Migrations() {
        return this._migrations;
    }

    get Views() {
        return this.views;
    }

    get Versions() {
        return this.versions;
    }
}

export const vaultDatabase: Record<string, AcreomVaultIndexedDB> = {};

export const deleteVaultIndexedDB = (vaultId: string): void => {
    vaultDatabase[vaultId]?.close();
    setTimeout(async () => {
        await vaultDatabase[vaultId]?.vip.delete();
        delete vaultDatabase[vaultId];
    }, 200);
};

export const registerVaultIndexedDB = (
    vault: any,
    context: WorkerContext,
): AcreomVaultIndexedDB => {
    if (vaultDatabase[vault.id]) {
        return vaultDatabase[vault.id];
    }
    const newVaultDB = new AcreomVaultIndexedDB(
        vault.id,
        ACREOM_DATABASE_VERSION,
        vault,
        context,
    );
    vaultDatabase[vault.id] = newVaultDB;
    return newVaultDB;
};

export const acreomVaultIndexedDB = (vaultId: string): AcreomVaultIndexedDB => {
    if (
        vaultDatabase[vaultId] &&
        vaultDatabase[vaultId].context.$config.platform !== 'web' &&
        !vaultDatabase[vaultId].isOpen()
    ) {
        vaultDatabase[vaultId].open();
    }
    return vaultDatabase[vaultId] ?? null;
};
