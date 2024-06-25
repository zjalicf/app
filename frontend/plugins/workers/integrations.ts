import { BaseWrapper } from '~/plugins/workers/base';
import { WorkerContext } from '~/@types/app';
import { IntegrationsActions } from '~/constants';

export class IntegrationsWrapper extends BaseWrapper {
    private initialized = false;

    initialize(ctx: Partial<WorkerContext>) {
        if (this.initialized) return Promise.resolve();
        this.initialized = true;
        return this.invoke(IntegrationsActions.INITIALIZE, ctx);
    }
}
