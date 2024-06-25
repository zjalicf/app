import { v4 } from 'uuid';
import { EntityController } from '~/plugins/entities/controller';
import { IVault, SafeElectronWindow } from '~/@types';
import {
    DatabaseServiceAction,
    IntegrationsActions,
    ServiceKey,
} from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

export class VaultController extends EntityController<IVault> {
    protected storeEntity = 'vault';
    protected dbTable = 'vaults';

    get isLocal(): boolean {
        return this.active?.type === 'local';
    }

    get isRemote(): boolean {
        return this.active?.type === 'remote';
    }

    get active(): IVault | null {
        return this.context.store.getters['vault/active'];
    }

    activate(id: string) {
        return this.context.store.dispatch('vault/activate', id);
    }

    get pagesLoaded() {
        return this.context.store.getters['document/isLoaded'];
    }

    get viewsLoaded() {
        return this.context.store.getters['view/isLoaded'];
    }

    get foldersLoaded() {
        return this.context.store.getters['project/isLoaded'];
    }

    get integrationsLoaded() {
        return this.context.store.getters['integrationData/isLoaded'];
    }

    isVaultLoaded() {
        return this.pagesLoaded && this.viewsLoaded && this.foldersLoaded;
    }

    async initialize() {
        await this.initializeConfigDB();

        const dbHasVaults = await this.dbHasVaults();
        if (dbHasVaults) {
            await this.context.$encryption.restoreKeyFromSession();
            this.context.$workers.integrations?.execute(
                IntegrationsActions.START,
                {},
            );

            await this.initializeVaultsToStore();
            this.context.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.INITIALIZE_AVAILABE_VAULTS,
            );
            const activeVault = await this.getActiveVaultFromDB();

            this.context.store.dispatch('vault/activate', activeVault!.id, {
                root: true,
            });
        }
    }

    initializeConfigDB() {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.INITIALIZE_CONFIG_DATABASE,
            { callerContext: 'entities/vault.ts initializeConfigDB' },
        );
    }

    async dbHasVaults() {
        const vaults = await this.context.$serviceRegistry.invoke<IVault[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'vaults',
                callerContext: 'entities/vault.ts dbHasVaults',
            },
        );
        return !!vaults?.length ?? false;
    }

    async initializeVaultsToStore() {
        const vaults = await this.context.$serviceRegistry.invoke<IVault[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'vaults',
                callerContext: 'entities/vault.ts initializeVaultsToStore',
            },
        );
        this.context.store.commit('vault/initialize', vaults);
    }

    async getActiveVaultFromDB() {
        const vault = await this.context.$serviceRegistry.invoke<IVault>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_ACTIVE_VAULT,
            { callerContext: 'entities/vault.ts getActiveVaultFromDB' },
        );
        return vault;
    }

    createVaultFolder(filepath: string) {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DEVICE,
            'vault:createRootFolder',
            {
                path: filepath,
                callerContext: 'entities/vault.ts createVaultFolder',
            },
        );
    }

    syncToDisk(vaultId: string) {
        this.context.$serviceRegistry.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SYNC_CONTENT_TO_DEVICE,
            {
                vaultId,
                payload: {
                    vault: this.byId(vaultId),
                },
            },
        );
    }

    removeFilepathFromEntities(vaultId: string) {
        this.context.$serviceRegistry.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.REMOVE_FILEPATH_FROM_ENTITIES,
            {
                vaultId,
                payload: {
                    vaultId,
                },
            },
        );
    }

    async turnOnCloudSync(vaultId: string) {
        const user = this.context.store.getters['user/user'];
        if (user?.privateKeys) {
            await this.context.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.ENABLE_ENCRYPTION_ON_VAULT,
                {
                    vaultId,
                    payload: {
                        vaultId,
                    },
                    callerContext:
                        'entities/vault.ts enable encryption turnOnCloudSync',
                },
            );
        }
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.REGISTER_SYNC_PROTOCOL,
            {
                vaultId,
                payload: {
                    vaultId,
                },
                callerContext:
                    'entities/vault.ts register sync turnOnCloudSync',
            },
        );
    }

    turnOffCloudSync(vaultId: string) {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.UNREGISTER_SYNC_PROTOCOL,
            {
                vaultId,
                payload: {
                    vaultId,
                },
                callerContext: 'entities/vault.ts turnOffCloudSync',
            },
        );
    }

    async createNewVault(source: TrackingActionSource) {
        const config = this.context.store.getters['onboarding/config'];
        const id = v4();

        const vaultOptions = {
            id,
            filepath: config.filepath,
            color: config.color,
            name: config.name,
            type: config.type,
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!config.openExisting && config.filepath) {
            const vaultPath = await (
                window as SafeElectronWindow
            ).electron.createFolder(
                config.filepath,
                config.name ?? 'New Vault',
            );

            if (vaultPath) {
                vaultOptions.filepath = vaultPath;
            }
        }

        await this.context.store.dispatch('vault/update', vaultOptions);
        const icsUrl = config.ICSUrl;
        const appleCalendarAccess = config.appleCalendarAccess;
        if (icsUrl !== null) {
            await this.context.$entities.icsIntegration.createFromUrl(
                config.ICSUrl,
                id,
            );
        }

        if (appleCalendarAccess !== null) {
            await this.context.$entities.appleCalendar.createIntegration(id);
        }

        await this.context.store.dispatch('vault/activate', {
            id: vaultOptions.id,
            redirect: false,
        });

        if (vaultOptions.filepath) {
            this.context.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.LOAD_NEW_VAULT,
                {
                    payload: {
                        vaultId: id,
                    },
                },
            );
        }

        await this.context.store.dispatch('createOnboarding', id);
        await this.context.$utils.onboarding.clearNewVault();

        this.context.$tracking.trackEventV2(TrackingType.VAULT, {
            action: TrackingAction.CREATE,
            source,
            sourceMeta:
                config.type === 'remote'
                    ? TrackingActionSourceMeta.REMOTE
                    : TrackingActionSourceMeta.LOCAL,
        });
        return vaultOptions;
    }
}
