import { Context } from '@nuxt/types';
import { Store } from 'vuex';

export class StoreAdapter {
    private store: Store<any>;

    constructor(ctx: Context) {
        this.store = ctx.store;
    }

    execute(operation: string, payload: any) {
        const [method, op] = operation.split(':');
        switch (method) {
            case 'getters':
                if (payload) {
                    return this.store.getters[op](payload);
                }
                return this.store.getters[op];
            case 'dispatch':
                return this.store.dispatch(op, payload);
            default:
                return null;
        }
    }
}
