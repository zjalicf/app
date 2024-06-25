import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { Encryption } from '~/plugins/encryption/encryption';

declare module '@nuxt/types' {
    interface Context {
        $encryption: Encryption;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $encryption: Encryption;
    }
}

export default (ctx: Context, inject: Inject) => {
    const encryption = new Encryption(ctx);

    ctx.$encryption = encryption;
    inject('encryption', encryption);
};
