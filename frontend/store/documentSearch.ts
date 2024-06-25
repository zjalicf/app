interface AppState {
    open: boolean;
    term: string | null;
    editorActive: boolean;
    numResults: number;
    currentIndex: number;
    selectedNodePosition: { from: number; to: number };
    shouldFocus: boolean;
}

export const state: () => AppState = () => ({
    open: false,
    term: null,
    editorActive: false,
    numResults: 0,
    currentIndex: 0,
    selectedNodePosition: { from: 0, to: 0 },
    shouldFocus: false,
});

export const getters = {
    open: (state: AppState) => state.open,
    term: (state: AppState) => state.term,
    numResults: (state: AppState) => state.numResults,
    currentIndex: (state: AppState) => state.currentIndex,
    selectedNodePosition: (state: AppState) => state.selectedNodePosition,
    shouldFocus: (state: AppState) => state.shouldFocus,
};

export const mutations = {
    open: (state: AppState) => {
        state.open = true;
    },
    close: (state: AppState) => {
        state.open = false;
    },
    setTerm: (state: AppState, newTerm: string) => {
        state.term = newTerm;
    },
    setNumResults: (state: AppState, amount: number) => {
        state.numResults = amount;
    },
    setCurrentIndex: (state: AppState, index: number) => {
        state.currentIndex = index;
    },
    setSelectedNodePosition: (state: AppState, nodePosition: any) => {
        state.selectedNodePosition = nodePosition;
    },
    focus: (state: AppState) => {
        state.shouldFocus = true;
    },
    resetFocus: (state: AppState) => {
        state.shouldFocus = false;
    },
};

export const actions = {
    open: ({ commit }: any) => {
        commit('open');
        commit('focus');
    },
    close: ({ commit, getters }: any) => {
        if (!getters.open) return;
        commit('close');
        commit('setTerm', null);
    },
    setTerm: ({ commit }: any, newTerm: string) => {
        commit('setTerm', newTerm);
    },
    setNumResults: ({ commit }: any, amount: number) => {
        commit('setNumResults', amount);
    },
    setCurrentIndex: ({ commit }: any, index: number) => {
        commit('setCurrentIndex', index);
    },
    setSelectedNodePosition: ({ commit }: any, nodePosition: any) => {
        commit('setSelectedNodePosition', nodePosition);
    },
    unfocus: ({ commit }: any) => {
        commit('resetFocus');
    },
};
