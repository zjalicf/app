import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import {
    ComponentsRegistry,
    ComponentType,
    RepositoryItem,
} from '~/plugins/components-repository/repository';

declare module '@nuxt/types' {
    interface Context {
        $componentsRepository: ComponentsRegistry;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $componentsRepository: ComponentsRegistry;
    }
}

const componentsRepository: ComponentsRegistry = new ComponentsRegistry();

export const registerEntityComponents = (
    type: ComponentType,
    componentsObject: RepositoryItem,
) => {
    componentsRepository.add(type, componentsObject);
};

const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    componentsRepository.initialize(ctx);
    inject('componentsRepository', componentsRepository);
    ctx.$componentsRepository = componentsRepository;
};

export default servicesPlugin;
