import { Context } from '@nuxt/types';
import { Vue } from 'vue-property-decorator';
import { isMobile } from '~/helpers';

interface AppState {
    open: boolean;

    panelTab: 'apps' | 'xray' | 'integrations';
    calendarType: string;
    date: Date;
    calendarAllDayExpanded: boolean;

    collapsed: Record<string, boolean>;
}

export const state: () => AppState = () => ({
    open: !isMobile(),
    panelTab: 'apps',
    calendarType: 'day',
    date: new Date(),
    calendarAllDayExpanded: false,
    collapsed: { no_page: false },
});

export const getters = {
    open: (state: AppState) => state.open,
    panelTab: (state: AppState) => state.panelTab,
    calendarType: (state: AppState) => state.calendarType,
    calendarAllDayExpanded: (state: AppState) => state.calendarAllDayExpanded,
    collapsed: (state: AppState) => state.collapsed,
};

export const mutations = {
    open: (state: AppState) => {
        state.open = true;
    },
    close: (state: AppState) => {
        state.open = false;
    },
    toggle: (state: AppState) => {
        state.open = !state.open;
    },
    setPanelTab: (state: AppState, tab: 'apps' | 'xray') => {
        state.panelTab = tab;
    },
    setCalendarType: (state: AppState, type: string) => {
        state.calendarType = type;
    },
    calendarAllDayExpandedToggle: (state: AppState) => {
        state.calendarAllDayExpanded = !state.calendarAllDayExpanded;
    },
    collapse: (state: AppState, payload: { id: string; value: boolean }) => {
        if (state.collapsed[payload.id] === payload.value) return;
        Vue.set(state.collapsed, payload.id, payload.value);
    },
};

export const actions = {
    open(this: Context, { commit }: any) {
        this.$shortcutsManager.enableNamespace('app-panel');
        commit('open');
    },
    close(this: Context, { commit }: any) {
        this.$shortcutsManager.disableNamespace('app-panel');
        commit('close');
    },
    toggle: ({ commit }: any) => {
        commit('toggle');
    },
    setPanelTab(this: Context, { commit }: any, tab: 'apps' | 'xray') {
        commit('setPanelTab', tab);
    },
    setCalendarType: ({ commit, rootGetters, dispatch }: any, type: string) => {
        dispatch(
            'integration/calendarRangeChange',
            {
                date: rootGetters['dailyDoc/calendarDate'],
                type,
            },
            { root: true },
        );
        commit('setCalendarType', type);
    },
    calendarAllDayExpandedToggle: ({ commit }: any) => {
        commit('calendarAllDayExpandedToggle');
    },
};
