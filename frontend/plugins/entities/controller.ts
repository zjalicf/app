import { Context } from '@nuxt/types';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

export class EntityController<T> {
    protected storeEntity: string = 'controller';
    protected dbTable: string = 'controller';
    readonly context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    get activeVaultId() {
        return this.context.store.getters['vault/activeVaultId'];
    }

    byId(id: string): T | null {
        return this.context.store.getters[`${this.storeEntity}/byId`](id);
    }

    list() {
        return this.context.store.getters[`${this.storeEntity}/list`];
    }

    saveToStore(entity: Partial<T>) {
        return this.context.store.dispatch(
            `${this.storeEntity}/update`,
            entity,
        );
    }

    delete(id: string | any) {
        return this.context.store.dispatch(`${this.storeEntity}/delete`, id);
    }

    saveToDB(vaultId: string, entity: Partial<T>, meta?: any) {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: this.dbTable,
                vaultId,
                payload: {
                    vaultId,
                    entity,
                    meta,
                },
                callerContext: 'entities/controller.ts saveToDB ',
            },
        );
    }
}
