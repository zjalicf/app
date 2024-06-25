interface AppState {
    activeVersion: string | null;
}

export const state: () => AppState = () => ({
    activeVersion: null,
});

export const getters = {
    active(state: AppState) {
        return state.activeVersion;
    },
};

export const mutations = {
    seen(state: AppState, version: string) {
        state.activeVersion = version;
    },
};

export const actions = {
    seen({ commit }: any, version: string) {
        commit('seen', version);
    },
};
