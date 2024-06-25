import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { ShortcutsManager } from './manager';

declare module '@nuxt/types' {
    interface Context {
        $shortcutsManager: ShortcutsManager;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $shortcutsManager: ShortcutsManager;
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $shortcutsManager: ShortcutsManager;
    }
}

const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const shortcutsManager = new ShortcutsManager(ctx);

    ctx.$shortcutsManager = shortcutsManager;
    inject('shortcutsManager', shortcutsManager);
};

export default servicesPlugin;
