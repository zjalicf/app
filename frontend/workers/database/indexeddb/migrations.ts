import { Table } from 'dexie';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import {
    availableMigrations,
    MigrationConfig,
    MigrationState,
} from '~/workers/database/indexeddb/migration-scripts';
import { AtomicQueue } from '~/workers/database/device/queue';

export class MigrationsIndexedDB extends IndexedDBBase<MigrationConfig> {
    shouldStoreLocally = false;
    protected entity = 'migrations';
    queue: Record<string, AtomicQueue> = {};

    protected table(vaultId: string): Table<any, string | number> {
        return acreomVaultIndexedDB(vaultId).Migrations;
    }

    async migrateRemote(vaultId: string) {
        const migrations = await this.getAvailableMigrations(vaultId, 'remote');
        if (!migrations.length) return Promise.resolve();
        this.queueMigrations(vaultId, migrations);
        return this.awaitMigrations(vaultId);
    }

    async migrateLocal(vaultId: string) {
        const migrations = await this.getAvailableMigrations(vaultId, 'local');
        if (!migrations.length) return Promise.resolve();
        this.queueMigrations(vaultId, migrations);
        return this.awaitMigrations(vaultId);
    }

    queueMigrations(vaultId: string, migrations: MigrationConfig[]) {
        if (!this.queue[vaultId]) {
            this.queue[vaultId] = new AtomicQueue();
        }

        for (const migration of migrations) {
            const migrationObj = availableMigrations[`${migration.version}`];
            if (!migrationObj || !migrationObj[migration.type]) continue;
            this.queue[vaultId].execute(async () => {
                try {
                    await migrationObj[migration.type]?.(vaultId, this.context);
                    await this.updateMigrationState(
                        vaultId,
                        migration.id,
                        MigrationState.DONE,
                    );
                } catch (err: any) {
                    console.log(err);
                    await this.updateMigrationState(
                        vaultId,
                        migration.id,
                        MigrationState.FAILED,
                        {
                            errorMessage: err.message,
                        },
                    );
                }
            });
        }
    }

    awaitMigrations(vaultId: string) {
        return this.queue[vaultId].awaitQueueFinish();
    }

    updateMigrationState(
        vaultId: string,
        id: string,
        state: MigrationState,
        payload: Record<string, any> = {},
    ) {
        return this.save(vaultId, {
            id,
            state,
            ...payload,
        });
    }

    getAvailableMigrations(vaultId: string, type: string) {
        return this.table(vaultId)
            .toCollection()
            .filter((migration: any) => {
                return (
                    migration.type === type &&
                    migration.state === MigrationState.PENDING
                );
            })
            .sortBy('version');
    }
}
