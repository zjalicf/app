import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { AccessControl } from './access-control';

declare module '@nuxt/types' {
    interface Context {
        $accessControl: AccessControl;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $accessControl: AccessControl;
    }
}

const accessControlPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const accessControl = new AccessControl(ctx);

    ctx.$accessControl = accessControl;
    inject('accessControl', accessControl);
};

export default accessControlPlugin;
