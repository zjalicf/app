import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { CloudService } from '~/plugins/storage-service/cloud';

declare module '@nuxt/types' {
    interface Context {
        $cloudService: CloudService;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $cloudService: CloudService;
    }
}

const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const cloudService = new CloudService(ctx);

    ctx.$cloudService = cloudService;
    inject('cloudService', cloudService);
};

export default servicesPlugin;
