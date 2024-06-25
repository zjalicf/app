import { Context } from '@nuxt/types';

export class SentryAdapter {
    sentry!: any;

    constructor(ctx: Context) {
        this.sentry = ctx.$sentry;
    }

    execute(operation: string, payload: any) {
        try {
            if (operation === 'trackEvent') {
                this.sentry.captureMessage(payload.message);
                return;
            }
            this.sentry.captureException(payload);
        } catch (e) {
            console.log(e);
        }
    }
}
