import { Context } from '@nuxt/types';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

type AppState = {
    localConflicts: any[];
};

export const state: () => AppState = () => ({
    localConflicts: [],
});

export const getters = {
    localConflicts: (state: AppState) => {
        return state.localConflicts;
    },
};

export const mutations = {
    set: (state: AppState, conflicts: any) => {
        state.localConflicts = conflicts;
    },
    add: (state: AppState, conflicts: any) => {
        if (Array.isArray(conflicts)) {
            state.localConflicts = [...state.localConflicts, ...conflicts];
        } else {
            state.localConflicts.push(conflicts);
        }
    },
    clear: (state: AppState) => {
        state.localConflicts = [];
    },
};

export const actions = {
    async refresh(this: Context, { commit, rootGetters }: any) {
        const conflicts = await this.$serviceRegistry.invoke<any[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: '_localConflicts',
                vaultId: rootGetters['vault/active']?.id,
                payload: { vaultId: rootGetters['vault/active']?.id },
                callerContext: 'localConflicts.ts refresh',
            },
        );
        if (!conflicts?.length) return;
        commit('set', conflicts);
    },
    checkConflicts(this: Context, { dispatch }: any) {
        dispatch('refresh');
    },
    indexedDBUpdate(this: Context, { commit }: any, conflicts: any | any[]) {
        commit('add', conflicts);
    },
    indexedDBDelete(this: Context, { commit }: any, ids: string | string[]) {
        // ids = isArray(ids) ? ids : [ids];
        // // first update content
        // for (const id of ids) {
        // commit('delete', id);
        // }
    },
    async list(this: Context, { commit, rootGetters }: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;

        const conflicts = await this.$workers.database.list<any[]>(
            rootGetters['vault/active'].id,
            'localConflicts',
        );

        commit('set', conflicts);
    },
    async delete(this: Context, { commit, rootGetters }: any, entity: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;

        const conflicts = await this.$workers.database.delete<any[]>(
            rootGetters['vault/active'].id,
            entity,
            'localConflicts',
        );

        commit('delete', conflicts);
    },
};
