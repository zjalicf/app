import { Table } from 'dexie';
import { IndexedDBBase } from './base';
import { SessionData } from './types';
import { WorkerContext } from '~/@types/app';

export class SessionDataIndexedDB extends IndexedDBBase<SessionData> {
    shouldStoreLocally = false;
    protected context: WorkerContext;
    protected deviceService: any;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.deviceService = ctx.$deviceService;
    }

    table(_vaultId: string): Table<any, string> {
        return this.deviceService.configDatabase.SessionData;
    }

    clear() {
        return this.table('').clear();
    }
}
