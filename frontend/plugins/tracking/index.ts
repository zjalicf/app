import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { Tracker } from './tracking';
import { currentTimezone } from '~/helpers/date';

declare module '@nuxt/types' {
    interface Context {
        $tracking: Tracker;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $tracking: Tracker;
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $tracking: Tracker;
    }
}

const suggestionsPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const tracker = new Tracker(
        {
            platform: ctx.$config.platform,
            os: ctx.$config.os,
            defaultProperties: {
                version: ctx.store.getters.latest,
                timezone: currentTimezone(),
            },
            store: ctx.store,
        },
        ctx.$config.trackingUrl,
        ctx.$config.trackingUrlV2,
    );

    ctx.$tracking = tracker;
    inject('tracking', tracker);

    ctx.app.router?.afterEach((to, from) => {
        tracker.trackEvent('page_visit', {
            to: to.name,
            from: from.name,
        });
    });
};

export default suggestionsPlugin;
