import { Table } from 'dexie';
import {
    IndexedDBBase,
    IndexedDBMeta,
} from '~/workers/database/indexeddb/base';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { ServiceKey } from '~/constants';

export class LocalConflictsIndexedDB extends IndexedDBBase<any> {
    shouldStoreLocally = false;
    entity = 'localConflicts';

    protected table(vaultId: string): Table<any, string | number> {
        return acreomVaultIndexedDB(vaultId).LocalConflicts;
    }

    async postprocessEntity(
        vaultId: string,
        _entities: Partial<any>[],
        _meta?: IndexedDBMeta,
    ) {
        await this.context.emit(
            ServiceKey.STORE,
            'dispatch:localConflicts/checkConflicts',
            { vaultId },
        );
    }
}
