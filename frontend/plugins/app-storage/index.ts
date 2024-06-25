import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { AppStorage } from './app-storage';

declare module '@nuxt/types' {
    interface Context {
        $appStorage: AppStorage;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $appStorage: AppStorage;
    }
}

const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const appStorage = new AppStorage();

    ctx.$appStorage = appStorage;
    inject('appStorage', appStorage);
};

export default servicesPlugin;
