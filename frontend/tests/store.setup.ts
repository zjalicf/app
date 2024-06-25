import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { v4 } from 'uuid';
import * as documentStore from '~/store/document';
import * as taskStore from '~/store/tasks';
import * as projectStore from '~/store/folder';
import * as eventStore from '~/store/event';
import * as integrationStore from '~/store/integration';
import * as integrationDataStore from '~/store/integrationData';
import * as vaultStore from '~/store/vault';
import * as labelStore from '~/store/label';
import * as appSettingsStore from '~/store/appSettings';
import { $serviceRegistry } from '~/tests/service-registry.setup';
import { LabelController } from '~/plugins/entities/label';
import { PageController } from '~/plugins/entities/page';

const stores = [
    {
        name: 'document',
        store: documentStore,
    },
    {
        name: 'project',
        store: projectStore,
    },
    {
        name: 'tasks',
        store: taskStore,
    },
    {
        name: 'event',
        store: eventStore,
    },
    {
        name: 'integration',
        store: integrationStore,
    },
    {
        name: 'integrationData',
        store: integrationDataStore,
    },
    {
        name: 'vault',
        store: vaultStore,
    },
    {
        name: 'label',
        store: labelStore,
    },
    {
        name: 'appSettings',
        store: appSettingsStore,
    },
];

const localVue = createLocalVue();
localVue.use(Vuex);

export const createStore = () => {
    const store = new Vuex.Store({
        modules: {
            ...stores.reduce((acc, { name, store }) => {
                acc[name] = {
                    state: store.state(),
                    getters: store.getters,
                    actions: store.actions as any,
                    mutations: store.mutations,
                    namespaced: true,
                };
                return acc;
            }, {} as any),
        },
    });

    const vaultId = v4();

    store.commit('vault/initialize', [{ id: vaultId }]);
    store.commit('vault/active', { id: vaultId });

    // @ts-ignore
    store.$serviceRegistry = $serviceRegistry;
    // @ts-ignore
    store.$tracking = {
        trackEvent: (...args) => {},
    };

    // @ts-ignore
    store.$entities = {
        label: new LabelController({ store } as any),
        page: new PageController({ store } as any),
    };

    // @ts-ignore
    store.$workers = {
        database: {
            Tasks: {
                save: (..._args: any) => null,
            },
        },
    };
    // @ts-ignore
    store.$utils = {
        refreshCalendarData: () => null,
    };

    return store;
};
