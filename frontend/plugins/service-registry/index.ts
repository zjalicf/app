import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { Adapters } from './adapters';
import { ServiceRegistry } from '~/plugins/service-registry/hub';

declare module '@nuxt/types' {
    interface Context {
        $serviceRegistry: ServiceRegistry;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $serviceRegistry: ServiceRegistry;
    }
}

declare module 'vuex/types' {
    interface Store<S> {
        readonly $serviceRegistry: ServiceRegistry;
    }
}
const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const serviceRegistry = new ServiceRegistry();

    ctx.$serviceRegistry = serviceRegistry;

    Adapters.forEach(({ key, Service }) => {
        ctx.$serviceRegistry.register(key, new Service(ctx), true);
    });
    inject('serviceRegistry', serviceRegistry);
};

export default servicesPlugin;
const registry = new ServiceRegistry();
export type ServiceRegistryType = typeof registry;
