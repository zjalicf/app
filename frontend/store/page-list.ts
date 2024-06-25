interface AppState {
    drag: { entityId: string; data: any } | null;
}

export const state = (): AppState => ({
    drag: null,
});

export const getters = {
    dragData: (state: AppState) => {
        return state.drag;
    },
};

export const mutations = {
    setDrag: (
        state: AppState,
        data: { entityId: string; data: any } | null,
    ) => {
        state.drag = data;
    },
    clearDrag: (state: AppState) => {
        state.drag = null;
    },
};
