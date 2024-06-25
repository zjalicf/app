import { Table } from 'dexie';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { IEvent } from '~/@types';

export class AppSettingsIndexedDB extends IndexedDBBase<IEvent> {
    shouldStoreLocally = false;
    protected entity = 'appSettings';

    protected table(_vaultId?: string): Table<any, string | number> {
        return this.context.$deviceService.configDatabase.AppSettings;
    }
}
