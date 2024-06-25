import { GetterTree, MutationTree } from 'vuex';
import { Vue } from 'vue-property-decorator';
import { Context } from '@nuxt/types';

type AppState = {
    labels: string[];
    labelToEntities: Record<string, { tasks: string[]; pages: string[] }>;
};

type LabelUpdate = {
    id: string;
    labels: string[];
    type: 'tasks' | 'pages';
};

export const state: () => AppState = () => ({
    labels: [],
    labelToEntities: {},
});

export const getters: GetterTree<AppState, any> = {
    list: state => state.labels,
    labelsMap: state => state.labelToEntities,
    exists: state => (label: string) => !!state.labelToEntities[label],
};
export const mutations: MutationTree<AppState> = {
    update: (state, { id, labels, type }: LabelUpdate) => {
        for (const label of labels) {
            const labelMap = state.labelToEntities[label] ?? null;
            if (!labelMap) {
                Vue.set(
                    state.labelToEntities,
                    label,
                    Object.freeze({
                        tasks: [],
                        pages: [],
                        [type]: [id],
                    }),
                );
                Vue.set(state.labels, state.labels.length, label);
                continue;
            }

            const index = state.labels.indexOf(label);

            Vue.set(
                state.labels,
                index > -1 ? index : state.labels.length,
                label,
            );
            Vue.set(
                state.labelToEntities,
                label,
                Object.freeze({
                    ...labelMap,
                    [type]: [...labelMap[type], id],
                }),
            );
        }
    },
    updateBatch: (
        state,
        { entities, type }: { type: string; entities: LabelUpdate[] },
    ) => {
        const newLabels = [...state.labels];

        const labelToEntities = { ...state.labelToEntities };
        for (const { id, labels } of entities) {
            for (const label of labels) {
                const labelMap = labelToEntities[label] ?? null;
                if (!labelMap) {
                    labelToEntities[label] = Object.freeze({
                        tasks: [],
                        pages: [],
                        [type]: [id],
                    });
                    newLabels.push(label);
                    continue;
                }

                labelToEntities[label] = Object.freeze({
                    ...labelMap,
                    [type]: [...(labelMap as any)[type], id],
                });
            }
        }
        state.labels = newLabels;
        state.labelToEntities = labelToEntities;
    },
    delete: (state, { id, labels, type }: LabelUpdate) => {
        for (const label of labels) {
            const labelMap = state.labelToEntities[label] ?? null;
            if (!labelMap) {
                continue;
            }
            const index = state.labels.indexOf(label);
            const remainingIds = labelMap[type].filter((e: string) => e !== id);
            const newMap = {
                ...labelMap,
                [type]: remainingIds,
            };
            if (newMap.tasks.length + newMap.pages.length === 0) {
                Vue.delete(state.labels, index);
                Vue.delete(state.labelToEntities, label);
                continue;
            }

            Vue.set(state.labelToEntities, label, Object.freeze(newMap));
            Vue.set(state.labels, index, label);
        }
    },
    deleteBatch: (
        state,
        {
            type,
            entities,
        }: { type: 'tasks' | 'pages'; entities: LabelUpdate[] },
    ) => {
        const newLabels = [...state.labels];
        const labelToEntities = { ...state.labelToEntities } as any;

        const labelsToDelete = new Set<string>();
        for (const { id, labels } of entities) {
            for (const label of labels) {
                const labelMap = labelToEntities[label] ?? null;
                if (!labelMap) {
                    continue;
                }
                const remainingIds = labelMap[type]?.filter(
                    (e: string) => e !== id,
                );
                const newMap = {
                    ...labelMap,
                    [type]: remainingIds,
                };
                if (newMap.tasks.length + newMap.pages.length === 0) {
                    labelsToDelete.add(label);
                    delete labelToEntities[label];
                } else {
                    labelToEntities[label] = Object.freeze(newMap);
                }
            }
        }
        state.labels = newLabels.filter(e => !labelsToDelete.has(e));
        state.labelToEntities = labelToEntities;
    },
    clear(state) {
        state.labels = [];
        state.labelToEntities = {};
    },
};

export const actions = {
    refresh(this: Context, { commit }: any) {},
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    updateLabelsMap(
        this: Context,
        { commit }: any,
        {
            id,
            labels,
            type,
        }: { id: string; labels: string[]; type: 'tasks' | 'pages' },
    ) {
        commit('update', { id, labels, type });
    },
    updateLabelsMapBatch(
        this: Context,
        { commit }: any,
        {
            toProcess,
            type,
        }: {
            toProcess: { id: string; labels: string[] }[];
            type: 'tasks' | 'pages';
        },
    ) {
        commit('updateBatch', {
            entities: toProcess,
            type,
        });
    },

    removeLabelsMap(
        this: Context,
        { commit }: any,
        {
            id,
            labels,
            type,
        }: { id: string; labels: string[]; type: 'tasks' | 'pages' },
    ) {
        commit('delete', { id, labels, type });
    },
    removeLabelsMapBatch(
        this: Context,
        { commit }: any,
        {
            toProcess,
            type,
        }: {
            toProcess: { id: string; labels: string[] }[];
            type: 'tasks' | 'pages';
        },
    ) {
        commit('deleteBatch', {
            entities: toProcess,
            type,
        });
    },
};
