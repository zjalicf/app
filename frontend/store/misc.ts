import { SafeElectronWindow } from '~/@types';

interface AppState {
    sidebarOpen: boolean;
    sidebarWidth: number;
    windowFocused: boolean;
    windowMaximized: boolean;
    billingOption: string;
    isOnline: boolean;
    isOnBackground: boolean;
    viewportWidth: number;
}

export const state = (): AppState => ({
    sidebarOpen: window.innerWidth > 1080,
    sidebarWidth: 250,
    windowFocused: true,
    windowMaximized: false,
    isOnline: true,
    billingOption: 'monthly',
    isOnBackground: false,
    viewportWidth: 1080,
});

export const getters = {
    sidebarOpen(state: AppState) {
        return state.sidebarOpen;
    },
    sidebarWidth(state: AppState) {
        return state.sidebarWidth;
    },
    windowFocus(state: AppState) {
        return state.windowFocused;
    },
    windowMaximized(state: AppState) {
        return state.windowMaximized;
    },
    isOnline(state: AppState) {
        return state.isOnline;
    },
    isOnBackground(state: AppState) {
        return state.isOnBackground;
    },
    billingOption(state: AppState) {
        return state.billingOption;
    },
    viewportWidth(state: AppState) {
        return state.viewportWidth;
    },
};

export const mutations = {
    toggleSidebar(state: AppState) {
        state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarWidth(state: AppState, width: number) {
        state.sidebarWidth = width;
    },
    focusWindow(state: AppState) {
        state.windowFocused = true;
    },
    blurWindow(state: AppState) {
        state.windowFocused = false;
    },
    setWindowFocus(state: AppState, value: boolean) {
        state.windowFocused = value;
    },
    openSidebar(state: AppState) {
        state.sidebarOpen = true;
    },
    closeSidebar(state: AppState) {
        state.sidebarOpen = false;
    },
    setWindowMaximized(state: AppState, value: boolean) {
        state.windowMaximized = value;
    },
    setOnlineState(state: AppState, value: boolean) {
        state.isOnline = value;
    },
    setBillingOption(state: AppState, value: string) {
        state.billingOption = value;
    },
    isOnBackground(state: AppState, value: boolean) {
        state.isOnBackground = value;
    },
    setViewportWidth(state: AppState, value: number) {
        state.viewportWidth = value;
    },
};

export const actions = {
    toggleSidebar({ getters, commit }: any) {
        if (getters.sidebarOpen) {
            commit('closeSidebar');
        } else {
            commit('openSidebar');
        }
    },
    focusWindow({ commit }: any) {
        commit('focusWindow');
    },
    blurWindow({ commit }: any) {
        commit('blurWindow');
    },
    async setFocusWindowState({ commit }: any) {
        const state = await (
            window as SafeElectronWindow
        ).electron.focusState();
        commit('setWindowFocus', state);
    },
    async initializeWindowMaximized({ commit }: any) {
        const state = await (
            window as SafeElectronWindow
        ).electron.isWindowMaximized();
        commit('setWindowMaximized', state);
    },
    windowMaximized({ commit }: any) {
        commit('setWindowMaximized', true);
    },
    windowUnmaximized({ commit }: any) {
        commit('setWindowMaximized', false);
    },
    isOnline({ commit }: any, value: boolean) {
        commit('setOnlineState', value);
    },
    billingOptionChanged({ commit }: any, value: string) {
        commit('setBillingOption', value);
    },
    isOnBackground({ commit }: any, value: boolean) {
        commit('isOnBackground', value);
    },
    setViewportWidth({ commit }: any, value: number) {
        commit('setViewportWidth', value);
    },
};
