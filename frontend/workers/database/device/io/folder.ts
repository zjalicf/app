import { WorkerContext } from '~/@types/app';
import { WEntity } from '~/@types';
import { ServiceKey } from '~/constants';
import { IO } from '~/workers/database/device/io/entity';

enum FolderActions {
    CREATE = 'project:create',
    CREATE_BATCH = 'project:createBatch',
    DELETE = 'project:delete',
    UPDATE = 'project:update',

    READ = 'project:read',
    READ_BATCH = 'project:batchRead',
}

export class FolderIO implements IO {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    read(_filepath: string): Promise<WEntity> {
        throw new Error('Method not implemented.');
    }

    readBatch(_filepaths: string[]): Promise<WEntity[]> {
        throw new Error('Method not implemented.');
    }

    create(entity: WEntity) {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                FolderActions.CREATE,
                entity,
            )
            .then(({ payload }) => payload);
    }

    createBatch(_vaultId: string, entities: WEntity[]): Promise<void> {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                FolderActions.CREATE_BATCH,
                entities,
            )
            .then(({ payload }) => payload);
    }

    update(mods: WEntity, oldObj: WEntity) {
        return this.context
            .invoke<{ payload: any }>(ServiceKey.DEVICE, FolderActions.UPDATE, {
                mods,
                oldObj,
            })
            .then(({ payload }) => payload);
    }

    delete(entity: WEntity) {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                FolderActions.DELETE,
                entity,
            )
            .then(({ payload }) => payload);
    }
}
