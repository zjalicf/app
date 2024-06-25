import { Context } from '@nuxt/types';
import { Vue } from 'vue-property-decorator';
import { Color, ServiceKey, SortingOptions, SourceOptions } from '~/constants';

interface AppState {
    defaultCalendar: {
        id: 'acreom';
        name: 'acreom';
        defaultReminders: {
            method: string;
            minutes: number;
        }[];
        acreomColorId: Color;
        visible: boolean;
    };
    tasksInCalendarConfig: {
        id: 'tasks';
        name: 'Tasks';
        defaultReminders: {
            method: string;
            minutes: number;
        }[];
        acreomColorId: Color;
        visible: boolean;
    };
    pagesInCalendarConfig: {
        id: 'pages';
        name: 'Pages';
        defaultReminders: {
            method: string;
            minutes: number;
        }[];
        acreomColorId: Color;
        visible: boolean;
    };
    integrationsOptions: Record<string, any>;
    assistantOptions: {
        assistantEnabled: boolean;
        assistantSource: string;
    };
    sidebarOptions: {
        hideTypes: string[];
    };
}

const defaultState = (): AppState => {
    return {
        defaultCalendar: {
            id: 'acreom',
            name: 'acreom',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.TURQUOISE,
            visible: true,
        },
        tasksInCalendarConfig: {
            id: 'tasks',
            name: 'Tasks',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.PINK,
            visible: true,
        },
        pagesInCalendarConfig: {
            id: 'pages',
            name: 'Pages',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.BLUE,
            visible: true,
        },
        integrationsOptions: {},
        assistantOptions: {
            assistantEnabled: false,
            assistantSource: 'local',
        },
        sidebarOptions: {
            hideTypes: [],
        },
    };
};

export const state: () => AppState = () => {
    return {
        defaultCalendar: {
            id: 'acreom',
            name: 'acreom',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.TURQUOISE,
            visible: true,
        },
        tasksInCalendarConfig: {
            id: 'tasks',
            name: 'Tasks',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.PINK,
            visible: true,
        },
        pagesInCalendarConfig: {
            id: 'pages',
            name: 'Pages',
            defaultReminders: [{ method: 'popup', minutes: 10 }],
            acreomColorId: Color.BLUE,
            visible: true,
        },
        integrationsOptions: {},
        assistantOptions: {
            assistantSource: 'local',
            assistantEnabled: false,
        },
        sidebarOptions: {
            hideTypes: [],
        },
    };
};

export const getters = {
    defaultCalendar(state: AppState) {
        return { ...state.defaultCalendar, id: 'acreom' };
    },
    tasksInCalendarConfig(state: AppState) {
        return state.tasksInCalendarConfig;
    },
    pagesInCalendarConfig(state: AppState) {
        return state.pagesInCalendarConfig;
    },
    integrationsOptions(state: AppState) {
        return state.integrationsOptions;
    },
    assistantOptions(state: AppState) {
        return state.assistantOptions;
    },
    sidebarOptions(state: AppState) {
        return state.sidebarOptions;
    },
};

export const mutations = {
    initialize(state: AppState & Record<string, any>, value: any[]) {
        const originalState = { ...defaultState() };

        for (const key in state) {
            const setting = value.find(({ id }) => id === key);

            if (setting) {
                Vue.set(state, key, {
                    ...state[key],
                    ...setting,
                });
            } else {
                // @ts-ignore
                Vue.set(state, key, { ...originalState[key] });
            }
        }
    },
    updateDefaultCalendar(
        state: AppState,
        calendarData: Partial<AppState['defaultCalendar']>,
    ) {
        state.defaultCalendar = {
            ...state.defaultCalendar,
            ...calendarData,
        };
    },
    updateTasksInCalendarConfig(
        state: AppState,
        tasksInCalendarConfig: Partial<AppState['tasksInCalendarConfig']>,
    ) {
        state.tasksInCalendarConfig = {
            ...state.tasksInCalendarConfig,
            ...tasksInCalendarConfig,
        };
    },
    updatePagesInCalendarConfig(
        state: AppState,
        pagesInCalendarConfig: Partial<AppState['pagesInCalendarConfig']>,
    ) {
        state.pagesInCalendarConfig = {
            ...state.pagesInCalendarConfig,
            ...pagesInCalendarConfig,
        };
    },
    updateIntegrationsOptions(
        state: AppState,
        value: Partial<AppState['integrationsOptions']>,
    ) {
        Object.entries(value).forEach(([key, _value]) => {
            state.integrationsOptions[key] = {
                ...state.integrationsOptions[key],
                ..._value,
            };
        });
    },
    updateAssistantOptions(
        state: AppState,
        value: Partial<AppState['assistantOptions']>,
    ) {
        state.assistantOptions = { ...state.assistantOptions, ...value };
    },
    updateSidebarOptions(
        state: AppState,
        value: Partial<AppState['sidebarOptions']>,
    ) {
        state.sidebarOptions = { ...state.sidebarOptions, ...value };
    },
};

export const actions = {
    async initialize(this: Context, { commit, rootGetters }: any) {
        if (!this.$workers.database) return;
        if (!rootGetters['vault/active']) return;
        const data = await this.$workers.database.LocalConfig.list(
            rootGetters['vault/active'].id,
        );
        commit('initialize', data);
        this.$utils.refreshCalendarData();
    },
    refresh(this: Context, { dispatch }: any) {
        return dispatch('initialize');
    },
    updateDefaultCalendar(
        this: Context,
        { commit, getters, rootGetters }: any,
        {
            vaultId,
            value,
        }: {
            vaultId: string;
            value: Partial<AppState['defaultCalendar']>;
        },
    ) {
        if (!this.$workers.database) return;
        const { id } = rootGetters['vault/active'];
        if (id === vaultId) {
            commit('updateDefaultCalendar', value);
        }

        const newValue = {
            ...getters.defaultCalendar,
            ...value,
            id: 'defaultCalendar',
        };

        this.$serviceRegistry.emit(
            ServiceKey.DEVICE,
            'notification:updateLocalConfig',
            {
                vaultId,
                change: [newValue],
            },
        );

        this.$workers.database.LocalConfig.save(vaultId, newValue);
        this.$utils.refreshCalendarData();
    },
    updateTasksInCalendarConfig(
        this: Context,
        { commit, getters, rootGetters }: any,
        {
            vaultId,
            value,
        }: {
            vaultId: string;
            value: Partial<AppState['tasksInCalendarConfig']>;
        },
    ) {
        if (!this.$workers.database) return;
        const { id } = rootGetters['vault/active'];
        if (id === vaultId) {
            commit('updateTasksInCalendarConfig', value);
        }

        const newValue = {
            ...getters.tasksInCalendarConfig,
            ...value,
            id: 'tasksInCalendarConfig',
        };

        this.$serviceRegistry.emit(
            ServiceKey.DEVICE,
            'notification:updateLocalConfig',
            {
                vaultId,
                change: [newValue],
            },
        );

        this.$workers.database.LocalConfig.save(vaultId, newValue);
        this.$utils.refreshCalendarData();
    },
    updatePagesInCalendarConfig(
        this: Context,
        { commit, getters, rootGetters }: any,
        {
            vaultId,
            value,
        }: {
            vaultId: string;
            value: Partial<AppState['pagesInCalendarConfig']>;
        },
    ) {
        if (!this.$workers.database) return;
        const { id } = rootGetters['vault/active'];
        if (id === vaultId) {
            commit('updatePagesInCalendarConfig', value);
        }

        const newValue = {
            ...getters.pagesInCalendarConfig,
            ...value,
            id: 'pagesInCalendarConfig',
        };

        this.$serviceRegistry.emit(
            ServiceKey.DEVICE,
            'notification:updateLocalConfig',
            {
                vaultId,
                change: [newValue],
            },
        );

        this.$workers.database.LocalConfig.save(vaultId, newValue);
        this.$utils.refreshCalendarData();
    },
    updateIntegrationsOptions(
        this: Context,
        { commit, rootGetters }: any,
        value: Partial<AppState['integrationsOptions']>,
    ) {
        if (!this.$workers.database) return;
        commit('updateIntegrationsOptions', value);
        const { id } = rootGetters['vault/active'];
        this.$workers.database.LocalConfig.save(id, {
            id: 'integrationsOptions',
            ...value,
        });
    },
    updateAssistantOptions(
        this: Context,
        { commit, rootGetters }: any,
        value: Partial<AppState['assistantOptions']>,
    ) {
        if (!this.$workers.database) return;
        commit('updateAssistantOptions', value);
        const { id } = rootGetters['vault/active'];
        this.$workers.database.LocalConfig.save(id, {
            id: 'assistantOptions',
            ...value,
        });
    },
    updateSidebarOptions(
        this: Context,
        { commit, rootGetters }: any,
        value: Partial<AppState['sidebarOptions']>,
    ) {
        if (!this.$workers.database) return;
        commit('updateSidebarOptions', value);
        const { id } = rootGetters['vault/active'];
        this.$workers.database.LocalConfig.save(id, {
            id: 'sidebarOptions',
            ...value,
        });
    },
};
