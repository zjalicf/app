import { Table } from 'dexie';
import { IndexedDBBase } from './base';
import { IUser } from './types';
import { WorkerContext } from '~/@types/app';

export class UsersIndexedDB extends IndexedDBBase<IUser> {
    shouldStoreLocally = false;
    protected context: WorkerContext;
    protected deviceService: any;
    protected entity = 'user';

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.deviceService = ctx.$deviceService;
    }

    table(_vaultId: string): Table<IUser, string> {
        return this.deviceService.configDatabase.Users;
    }
}
