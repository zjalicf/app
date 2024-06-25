import { Context } from '@nuxt/types';
import { TabGroup } from '~/@types/app';
import { LocalConfigIds } from '~/constants';

type AppState = {
    taskViewSettings: {
        showCompleted: boolean;
        sortBy: 'manual' | 'date' | 'title' | 'createdAt';
        groupBy: null | 'document' | 'label' | 'time';
        filterByLabels: any[];
        filterByDocument: any;
    };
    tabSettings: { tabGroups: TabGroup[] };
};

export const state: () => AppState = () => ({
    taskViewSettings: {
        showCompleted: false,
        sortBy: 'manual',
        groupBy: 'document',
        filterByLabels: [],
        filterByDocument: null,
    },
    tabSettings: { tabGroups: [] },
});

export const getters = {
    taskViewSettings: (state: AppState) => {
        return state.taskViewSettings;
    },
    tabGroups: (state: AppState) => {
        return state.tabSettings;
    },
};

export const mutations = {
    initialize(state: AppState & Record<string, any>, value: any[]) {
        value.map(
            ({ id, ...values }: { id: string }) =>
                (state[id] = { ...state[id], ...values }),
        );
    },
    clear: (state: AppState) => {
        state.taskViewSettings = {
            showCompleted: false,
            sortBy: 'manual',
            groupBy: 'document',
            filterByLabels: [],
            filterByDocument: null,
        };
        state.tabSettings = { tabGroups: [] };
    },
    updateTaskViewSettings(
        state: AppState,
        value: Partial<AppState['taskViewSettings']>,
    ) {
        state.taskViewSettings = {
            ...state.taskViewSettings,
            ...value,
        };
    },
    updateTabGroups(
        state: AppState,
        value: AppState['tabSettings']['tabGroups'],
    ) {
        state.tabSettings = {
            ...state.tabSettings,
            tabGroups: value,
        };
    },
};

export const actions = {
    async initialize(
        this: Context,
        { commit, rootGetters, dispatch, getters }: any,
    ) {
        if (!this.$workers.database) return;
        if (!rootGetters['vault/active']) return;
        const data = await this.$workers.database.LocalConfig.list(
            rootGetters['vault/active'].id,
        );
        commit('clear');
        commit('initialize', data);
        dispatch('tabs/initialize', getters.tabGroups, { root: true });
        dispatch('view/initialize', undefined, { root: true });
    },
    clear(this: Context, { commit, dispatch }: any) {
        dispatch('tabs/closeAll', null, { root: true });
        commit('clear');
    },
    refresh(this: Context, { dispatch }: any) {
        dispatch('initialize');
    },
    updateTaskViewSettings(
        this: Context,
        { commit, rootGetters }: any,
        value: Partial<AppState['taskViewSettings']>,
    ) {
        if (!this.$workers.database) return;
        commit('updateTaskViewSettings', value);
        const { id } = rootGetters['vault/active'];
        this.$workers.database?.LocalConfig.save(id, {
            id: LocalConfigIds.TASK_VIEW_SETTINGS,
            ...value,
        });
    },
    updateTabGroups(
        this: Context,
        { commit, rootGetters }: any,
        value: AppState['tabSettings'],
    ) {
        if (!this.$workers.database) return;
        commit('updateTabGroups', value);
        const { id } = rootGetters['vault/active'];
        this.$workers.database?.LocalConfig.save(id, {
            id: LocalConfigIds.TAB_SETTINGS,
            tabGroups: value,
        });
    },
};
