import { Context } from '@nuxt/types';

type AppState = {
    newVaultConfig: {
        filepath: string | null;
        name: string;
        color: string;
        openExisting: boolean; // new vault or import folder
        type: 'local' | 'remote';
        ICSUrl: string | null;
        appleCalendarAccess: number | null;
    };
};

export const state: () => AppState = () => ({
    newVaultConfig: {
        filepath: null,
        name: '',
        color: '#FDA4AF',
        openExisting: false, // new vault or import folder
        type: 'remote',
        ICSUrl: null,
        appleCalendarAccess: null,
    },
});

export const getters = {
    config: (state: AppState) => state.newVaultConfig,
};

export const mutations = {
    update(state: AppState, value: Partial<AppState['newVaultConfig']>) {
        state.newVaultConfig = { ...state.newVaultConfig, ...value };
    },
    clear(state: AppState) {
        state.newVaultConfig = {
            filepath: null,
            name: '',
            color: '#FDA4AF',
            openExisting: false, // new vault or import folder
            type: 'remote',
            ICSUrl: null,
            appleCalendarAccess: null,
        };
    },
};

export const actions = {
    update(
        this: Context,
        { commit }: any,
        payload: Partial<AppState['newVaultConfig']>,
    ) {
        commit('update', payload);
    },

    clear(this: Context, { commit }: any) {
        commit('clear');
    },
};
