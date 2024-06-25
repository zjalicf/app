import { SortingOptions } from '~/constants';

interface AppState {
    todayOrdering: SortingOptions;
}

export const state: () => AppState = () => ({
    todayOrdering: SortingOptions.DATE,
});

export const getters = {
    todayOrdering(state: AppState) {
        return state.todayOrdering;
    },
};

export const mutations = {
    todayOrdering(state: AppState, todayOrdering: SortingOptions) {
        state.todayOrdering = todayOrdering;
    },
};

export const actions = {
    todayOrdering({ commit }: any, todayOrdering: SortingOptions) {
        commit('todayOrdering', todayOrdering);
    },
};
