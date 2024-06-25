import Dexie, { Table } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IUpdateChange,
} from 'dexie-observable/api';
import { acreomVaultIndexedDB, registerVaultIndexedDB } from './connector';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { WorkerContext } from '~/@types/app';

import { AnalyticsAction, ServiceKey } from '~/constants';
import { IVault } from '~/workers/database/indexeddb/types';
import { StorageType } from '~/workers/utils/parsers';

export class VaultsIndexedDB extends IndexedDBBase<IVault> {
    shouldStoreLocally = false;
    protected context: WorkerContext;
    protected deviceService: any;
    protected entity = 'vault';
    public parserIndex = StorageType.VAULT;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.deviceService = ctx.$deviceService;
    }

    table(_vaultId: string): Table<IVault, string> {
        return this.context.$deviceService.configDatabase.Vaults;
    }

    protected database(_vaultId?: string): Dexie {
        return this.context.$deviceService.configDatabase;
    }

    protected async subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );
    }

    async list(
        vaultId: string,
        query?: any,
        filter?: (e: IVault) => boolean,
        paginationId?: string | null,
    ): Promise<IVault[]> {
        const vaults = await super.list(
            vaultId ?? '',
            query,
            filter,
            paginationId,
        );
        return vaults;
    }

    async save(
        vaultId: string,
        entity: Partial<IVault>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IVault>> {
        const vault = await super.save(vaultId, entity, meta);
        if (!vault.id) return vault;
        if (!acreomVaultIndexedDB(vault.id)) {
            await registerVaultIndexedDB(vault, this.context).initialize(
                this.context,
            );
            await acreomVaultIndexedDB(vault.id).registerSyncProtocol();
        }
        acreomVaultIndexedDB(vault.id).setVault(vault as IVault);
        return vault;
    }

    async delete(
        vaultId: string,
        entity: Partial<IVault>,
        meta: Partial<IndexedDBMeta> = { writeToDevice: true },
    ): Promise<Partial<IVault>> {
        await super.delete(vaultId, entity, meta);
        if (entity.filepath && this.isElectron) {
            await this.context.$deviceService.disconnectWatch(entity as IVault);
        }
        await this.context.$deviceService.deleteVault(entity as IVault);

        return entity;
    }

    protected async syncToVuex(vaultId: string, change: IDatabaseChange) {
        if (change.type === 2) {
            (change as IUpdateChange).obj = {
                ...(change as IUpdateChange).obj,
                ...(change as IUpdateChange).mods,
            };
        }
        await super.syncToVuex(vaultId, change);
        let createChange: ICreateChange | null = null;

        switch (change.type) {
            case 1: // CREATE
                createChange = change as ICreateChange;
                this.handleNewVaultChange(createChange);
                this.emit(
                    ServiceKey.STORE,
                    'vault/indexedDBUpdate',
                    createChange.obj,
                );
                break;
        }
    }

    async handleNewVaultChange(change: ICreateChange) {
        const vault = change.obj as IVault;
        const vaultDB = registerVaultIndexedDB(vault, this.context);
        await vaultDB.initialize(this.context);
        if (vault.type === 'local') return;

        const isEncryptionEnabled =
            await this.context.$deviceService.isEncryptionEnabledForUser();
        const isEncryptionUnlocked =
            this.context.$deviceService.isEncryptionUnlocked;
        if (isEncryptionEnabled && !isEncryptionUnlocked) {
            return;
        }
        await vaultDB.registerSyncProtocol();
    }
}
