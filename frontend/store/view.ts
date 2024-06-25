import { Context } from '@nuxt/types';
import isArray from 'lodash/isArray';
import { Vue } from 'vue-property-decorator';
import { deserializeDates } from '~/helpers/date';
import { IView } from '~/components/view/model';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

interface AppState {
    isLoaded: boolean;
    views: Record<string, IView>;
    list: string[];
}

export const state = (): AppState => ({
    views: {},
    list: [],
    isLoaded: false,
});

export const getters = {
    isLoaded: (state: AppState) => {
        return state.isLoaded;
    },
    list: (state: AppState) => {
        return state.list.map(id => state.views[id]);
    },
    byId: (state: AppState) => (id: string | null) => {
        if (!id) return null;
        return state.views[id] ?? null;
    },
};

export const mutations = {
    clear: (state: AppState, defaultViews: IView[] = []) => {
        Vue.set(
            state,
            'views',
            defaultViews.reduce((acc, view) => {
                acc[view.id] = Object.freeze(view);
                return acc;
            }, {} as Record<IView['id'], IView>),
        );
        Vue.set(
            state,
            'list',
            defaultViews.map(({ id }) => id),
        );
    },
    initialize: (state: AppState, views: IView[]) => {
        Vue.set(
            state,
            'views',
            views.reduce((acc, view) => {
                acc[view.id] = Object.freeze(view);
                return acc;
            }, {} as Record<IView['id'], IView>),
        );
        Vue.set(
            state,
            'list',
            views.map(({ id }) => id),
        );
    },
    update: (state: AppState, view: IView) => {
        const previousState = state.views[view.id] ?? {};
        const updateObject = { ...previousState, ...view };
        const listIndex = state.list.indexOf(view.id);
        Vue.set(state.views, view.id, Object.freeze(updateObject));
        Vue.set(
            state.list,
            listIndex < 0 ? state.list.length : listIndex,
            view.id,
        );
    },
    updateBatch: (state: AppState, views: IView[]) => {
        const updatingViews = {} as Record<string, IView>;
        const list = [];
        const indexes = state.list.reduce((acc, id, index) => {
            acc[id] = index;
            return acc;
        }, {} as any);
        for (const view of views) {
            const previousState = state.views[view.id] ?? {};
            const updateObject = { ...previousState, ...view };
            const listIndex = indexes[view.id] ?? -1;
            if (listIndex < 0) {
                indexes[updateObject.id] = state.list.length;
                list.push(updateObject.id);
            }
            updatingViews[view.id] = Object.freeze(updateObject);
        }
        state.views = { ...state.views, ...updatingViews };
        state.list = [...state.list, ...list];
    },
    delete: (state: AppState, id: string) => {
        const listIndex = state.list.indexOf(id);
        if (listIndex >= 0) {
            Vue.delete(state.list, listIndex);
        }
        Vue.delete(state.views, id);
    },
    updateViewOptions: (
        state: AppState,
        {
            id,
            value,
        }: {
            id: string;
            value: any;
        },
    ) => {
        const view = state.views[id];
        if (!view) return;
        const updatedViewOptions = { ...view.viewOptions, ...value };
        const updatedView = { ...view, viewOptions: updatedViewOptions };
        Vue.set(state.views, id, Object.freeze(updatedView));
    },
    isLoaded: (state: AppState, isLoaded: boolean) => {
        state.isLoaded = isLoaded;
    },
};
export const actions = {
    async initialize(this: Context, { commit, rootGetters }: any) {
        if (!this.$workers.database) return;
        if (!rootGetters['vault/active']) return;
        const data =
            ((await this.$workers.database.Views.list(
                rootGetters['vault/active'].id,
            )) as IView[]) ?? [];
        const defaultViews = [...this.$entities.view.defaultViews()];
        commit('initialize', [...defaultViews, ...data]);
    },
    clear(this: Context, { commit }: any) {
        commit('clear', [...this.$entities.view.defaultViews()]);
    },
    async list(this: Context, { commit, rootGetters }: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;
        commit('isLoaded', false);

        const data = await this.$workers.database.list<IView[]>(
            rootGetters['vault/active'].id,
            'views',
            undefined,
            null,
        );
        const deserializedData = data.map(d => deserializeDates(d));
        commit('updateBatch', deserializedData);

        const paginationId: string | null =
            deserializedData?.[deserializedData.length - 1]?.id ?? null;
        const vaultId = rootGetters['vault/active'].id;

        this.$workers.database?.Views.listWithPagination(
            vaultId,
            paginationId,
            data => {
                if (!data) {
                    commit('isLoaded', true);
                    return;
                }
                const deserializedData = data.map((d: any) =>
                    deserializeDates(d),
                );
                commit('updateBatch', deserializedData);
            },
        );
    },
    async refresh(this: Context, { dispatch, commit }: any) {
        commit('clear', [...this.$entities.view.defaultViews()]);
        await dispatch('list');
    },
    async update(
        this: Context,
        { commit, getters, rootGetters }: any,
        view: IView,
    ) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;

        const vaultId = rootGetters['vault/active'].id;
        const storedView = getters.byId(view.id);
        await this.$serviceRegistry.invoke<IView>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                vaultId,
                table: 'views',
                entity: { ...storedView, ...view },
                callerContext: 'store/view.ts update',
            },
        );
        commit('update', view);
    },
    updateBatch(this: Context, { commit, rootGetters }: any, data: IView[]) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        commit('updateBatch', data);
        const vaultId = activeVault.id;
        this.$workers.database?.Views.saveBulk(vaultId, data);
    },
    async delete(
        this: Context,
        { commit, getters, rootGetters, dispatch }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        try {
            try {
                await this.$workers.database.Views.delete<IView>(
                    rootGetters['vault/active'].id,
                    { id },
                );
                commit('delete', id);
                // @ts-ignore
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    },
    indexedDBUpdate(this: Context, { commit }: any, views: IView | IView[]) {
        views = isArray(views) ? views : [views];
        // first update content
        for (const view of views) {
            commit('update', view);
        }
    },
    async indexedDBDelete(
        this: Context,
        { commit }: any,
        ids: string | string[],
    ) {
        ids = isArray(ids) ? ids : [ids];
        for (const id of ids) {
            await this.$tabs.closeTabsByEntityId(id);
            commit('delete', id);
        }
    },
};
