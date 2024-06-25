import { Context } from '@nuxt/types';

interface AppState {
    status: number;
    lastStatusTimestamp: number;
    visible: boolean;
    statusText: string;
    dismissed: boolean;
}

export const state = (): AppState => ({
    status: 0,
    lastStatusTimestamp: Date.now(),
    visible: false,
    statusText: 'Connecting...',
    dismissed: false,
});

export const getters = {
    lastStatusTimestamp(state: AppState) {
        return state.lastStatusTimestamp;
    },
    status(state: AppState) {
        return state.status;
    },
    statusText(state: AppState) {
        return state.statusText;
    },
    visible(state: AppState) {
        return state.visible;
    },
    dismissed(state: AppState) {
        return state.dismissed;
    },
};

export const mutations = {
    set(state: AppState, val: AppState['status']) {
        state.status = val;
        state.lastStatusTimestamp = Date.now();
    },
    setVisible(state: AppState, visible: AppState['visible']) {
        state.visible = visible;
    },
    setStatusText(state: AppState, text: AppState['statusText']) {
        state.statusText = text;
    },
    setDismissed(state: AppState, dismissed: AppState['visible']) {
        state.dismissed = dismissed;
    },
};

let interval: any = null;

export const actions = {
    clear({ commit }: any, visible: boolean = true) {
        commit('set', 0);
        commit('setVisible', visible);
        commit('setDismissed', false);
        clearInterval(interval);
        interval = null;
    },
    set(
        this: Context,
        { commit, getters, dispatch }: any,
        status: AppState['status'],
    ) {
        const previousStatus = getters.status;
        commit('set', status);

        if (previousStatus === 2 && status === 3) {
            interval = setTimeout(() => {
                clearTimeout(interval);
                commit('setVisible', true);
                commit('setStatusText', 'Connecting...');
            }, 3000);
            return;
        }
        if (previousStatus === 3 && status === 2) {
            clearTimeout(interval);
            interval = setTimeout(() => {
                commit('setVisible', false);
                commit('setDismissed', false);
            }, 2000);
            return;
        }

        clearTimeout(interval);
        if ([1, 3].includes(status)) {
            commit('setVisible', true);
            commit('setStatusText', 'Connecting...');
        } else if (status === 0 || status === 4 || status === -1) {
            commit('setVisible', true);
            commit('setStatusText', 'No connection. Working offline.');
            // } else if (status === 3) {
            //     commit('setVisible', true);
            //     commit('setStatusText', 'Syncing changes...');
        } else if (status === 2) {
            if (!this.$utils.isMobile) {
                return dispatch('clear', false);
            }
            commit('setVisible', true);
            commit('setStatusText', 'Connected. All changes synced.');
            interval = setTimeout(() => {
                commit('setVisible', false);
                commit('setDismissed', false);
            }, 2000);
        }
    },
};
