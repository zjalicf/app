import { Transaction } from 'dexie';
import { WorkerContext } from '~/@types/app';
import { Migrator } from '~/workers/database/indexeddb/migration-scripts/inline-tasks';
import { migrateViews } from '~/workers/database/indexeddb/migration-scripts/views-6.1';
import { migrateArchiveView } from '~/workers/database/indexeddb/migration-scripts/views-6.2';
import { migrateJira } from '~/workers/database/indexeddb/migration-scripts/jira-6.3';

export const migrations: Record<
    string,
    (trx: Transaction) => Promise<void> | void
> = {};

export type MigrationFunction = (
    vaultId: string,
    context: WorkerContext,
) => Promise<void>;

export enum MigrationState {
    PENDING = 'pending',
    DONE = 'done',
    FAILED = 'failed',
}

export type MigrationConfig = {
    id: string;
    type: 'local' | 'remote';
    state: MigrationState;
    version: number;
};

export const availableMigrations: Record<
    string,
    {
        local?: MigrationFunction;
        remote?: MigrationFunction;
    }
> = {
    '5.9': {
        local: async (vaultId, context) => {
            const migrator = new Migrator(vaultId, context);
            await migrator.initialize();
            await migrator.run();
        },
        remote: async (vaultId, context) => {
            const migrator = new Migrator(vaultId, context);
            await migrator.initialize();
            await migrator.run();
        },
    },
    '6.1': {
        local: async (vaultId, context) => {
            await migrateViews(vaultId, context);
        },
        remote: async (vaultId, context) => {
            await migrateViews(vaultId, context);
        },
    },
    '6.2': {
        local: async (vaultId, context) => {
            await migrateArchiveView(vaultId, context);
        },
        remote: async (vaultId, context) => {
            await migrateArchiveView(vaultId, context);
        },
    },
    '6.3': {
        local: async (vaultId, context) => {
            await migrateJira(vaultId, context);
        },
    },
};
