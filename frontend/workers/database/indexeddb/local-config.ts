import { Table } from 'dexie';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { acreomVaultIndexedDB } from './connector';

export class LocalConfigIndexedDB extends IndexedDBBase<any> {
    shouldStoreLocally = false;
    entity = 'vaultConfig';

    table(vaultId: string): Table<any, string> {
        return acreomVaultIndexedDB(vaultId).LocalConfig;
    }
}
