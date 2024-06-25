import { WorkerContext, CloudResponse } from '~/@types/app';
import { CloudServiceAction, ServiceKey } from '~/constants';

export class CloudWrapper<T> {
    private context: WorkerContext;
    private entity: string;

    constructor(ctx: WorkerContext, entity: string) {
        this.context = ctx;
        this.entity = entity;
    }

    retrieve(id: string, vaultId: string) {
        return this.context.invoke<T>(
            ServiceKey.CLOUD,
            CloudServiceAction.RETRIEVE,
            {
                entity: this.entity,
                payload: {
                    vaultId,
                    id,
                },
                callerContext: 'protocol/cloudWrapper.ts/retrieve',
            },
        );
    }

    list(vaultId: string, timestamp?: number) {
        return this.context.invoke<T[]>(
            ServiceKey.CLOUD,
            CloudServiceAction.LIST,
            {
                entity: this.entity,
                payload: {
                    vaultId,
                    timestamp,
                },
                callerContext: 'protocol/cloudWrapper.ts/list',
            },
        );
    }

    initialLoad(
        vaultId: string,
        requestedEntities: { type: string; timestamp: number }[],
    ) {
        return this.context.invoke<
            CloudResponse<{ type: string; entries: any[] }[]>
        >(ServiceKey.CLOUD, CloudServiceAction.INITIAL_LOAD, {
            entity: this.entity,
            payload: {
                vaultId,
                requestedEntities,
            },
            callerContext: 'protocol/cloudWrapper.ts/initialLoad',
        });
    }

    initialLoadDeleteChanges(
        vaultId: string,
        requestedEntities: { type: string; timestamp: number }[],
    ) {
        return this.context.invoke<
            CloudResponse<{ type: string; entries: any[] }[]>
        >(ServiceKey.CLOUD, CloudServiceAction.INITIAL_LOAD_DELETE_CHANGES, {
            entity: this.entity,
            payload: {
                vaultId,
                requestedEntities,
            },
            callerContext: 'protocol/cloudWrapper.ts/initialLoadDeleteChanges',
        });
    }

    listDeleteChanges(vaultId: string | null, timestamp: number) {
        return this.context.invoke<T[]>(
            ServiceKey.CLOUD,
            CloudServiceAction.LIST_DELETE_CHANGES,
            {
                entity: this.entity,
                payload: {
                    vaultId,
                    timestamp,
                },
                callerContext: 'protocol/cloudWrapper.ts/listDeleteChanges',
            },
        );
    }

    save(entity: any, options: any, vaultId: string) {
        return this.context.invoke<T>(
            ServiceKey.CLOUD,
            CloudServiceAction.SAVE,
            {
                entity: this.entity,
                payload: {
                    vaultId,
                    options,
                    entity,
                },
                callerContext: 'protocol/cloudWrapper.ts/save',
            },
        );
    }

    updateBatch(entities: any, vaultId: string) {
        return this.context.invoke<T>(
            ServiceKey.CLOUD,
            CloudServiceAction.SAVE_BATCH,
            {
                entity: this.entity,
                payload: {
                    entities,
                    vaultId,
                    options: {
                        create: false,
                    },
                },
                callerContext: 'protocol/cloudWrapper.ts/updateBatch',
            },
        );
    }

    createBatch(entities: any, vaultId: string) {
        return this.context.invoke<T>(
            ServiceKey.CLOUD,
            CloudServiceAction.SAVE_BATCH,
            {
                entity: this.entity,
                payload: {
                    entities,
                    vaultId,
                    options: {
                        create: true,
                    },
                },
                callerContext: 'protocol/cloudWrapper.ts/createBatch',
            },
        );
    }

    delete(id: string, vaultId: string) {
        return this.context.invoke<T>(
            ServiceKey.CLOUD,
            CloudServiceAction.DELETE,
            {
                entity: this.entity,
                payload: {
                    vaultId,
                    id,
                },
                callerContext: 'protocol/cloudWrapper.ts/delete',
            },
        );
    }
}
