import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { Tabs } from './tabs';

declare module '@nuxt/types' {
    interface Context {
        $tabs: Tabs;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $tabs: Tabs;
    }
}

const tabsPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const tabs = new Tabs(ctx);

    ctx.$tabs = tabs;
    inject('tabs', tabs);
};

export default tabsPlugin;
