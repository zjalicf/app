import { WorkerContext } from '~/@types/app';
import { WEntity } from '~/@types';
import { ServiceKey } from '~/constants';

export interface IO {
    create(entity: WEntity): Promise<any>;
    createBatch(vaultId: string, entities: WEntity[]): Promise<any>;
    update(mods: WEntity, oldObj: WEntity): Promise<any>;
    delete(entity: WEntity): Promise<any>;
    read(filepath: string): Promise<WEntity>;
    readBatch(filepaths: string[]): Promise<WEntity[]>;
}

enum DeviceAction {
    CREATE = 'entity:create',
    CREATE_BATCH = 'entity:createBatch',
    UPDATE = 'entity:update',
    DELETE = 'entity:delete',
    READ = 'entity:read',
    READ_BATCH = 'entity:batchRead',
}

export class EntityIO implements IO {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    create(entity: WEntity) {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                DeviceAction.CREATE,
                entity,
            )
            .then(({ payload }) => payload);
    }

    createBatch(vaultId: string, entities: WEntity[]) {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                DeviceAction.CREATE_BATCH,
                {
                    vaultId,
                    entities,
                },
            )
            .then(({ payload }) => payload);
    }

    update(mods: WEntity, oldObj: WEntity) {
        return this.context
            .invoke<{ payload: any }>(ServiceKey.DEVICE, DeviceAction.UPDATE, {
                mods,
                oldObj,
            })
            .then(({ payload }) => payload);
    }

    delete(entity: WEntity) {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                DeviceAction.DELETE,
                entity,
            )
            .then(({ payload }) => payload);
    }

    read(filepath: string): Promise<WEntity> {
        return this.context
            .invoke<{ payload: WEntity }>(
                ServiceKey.DEVICE,
                DeviceAction.READ,
                filepath,
            )
            .then(({ payload }) => payload);
    }

    readBatch(filepaths: string[]): Promise<WEntity[]> {
        return this.context
            .invoke<{ payload: WEntity[] }>(
                ServiceKey.DEVICE,
                DeviceAction.READ_BATCH,
                filepaths,
            )
            .then(({ payload }) => payload);
    }
}
