interface AppState {
    updateChecking: boolean;
    updateAvailable: boolean;
    updateDownloading: boolean;
    updateError: boolean;
    updateProgress: number;
}

export const state = (): AppState => ({
    updateChecking: false,
    updateAvailable: false,
    updateDownloading: false,
    updateError: false,
    updateProgress: 0,
});

export const getters = {
    updateChecking(state: AppState) {
        return state.updateChecking;
    },
    updateAvailable(state: AppState) {
        return state.updateAvailable;
    },
    updateDownloading(state: AppState) {
        return state.updateDownloading;
    },
    updateError(state: AppState) {
        return state.updateError;
    },
    updateProgress(state: AppState) {
        return state.updateProgress;
    },
};

export const mutations = {
    updateChecking(state: AppState, value: boolean) {
        state.updateChecking = value;
    },
    updateAvailable(state: AppState, value: boolean) {
        state.updateAvailable = value;
    },
    updateDownloading(state: AppState, value: boolean) {
        state.updateDownloading = value;
    },
    updateError(state: AppState, value: boolean) {
        state.updateError = value;
    },
    updateProgress(state: AppState, value: number) {
        state.updateProgress = value;
    },
};
