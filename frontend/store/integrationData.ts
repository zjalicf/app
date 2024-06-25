import { Vue } from 'vue-property-decorator';
import { Context } from '@nuxt/types';
import { Store } from 'vuex';
import isArray from 'lodash/isArray';
import { sub } from 'date-fns';
import { v4 } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import { extractDate } from '~/helpers';
import { isAllDay, isInRange } from '~/helpers/date';

interface AppState {
    isLoaded: boolean;
    entities: Record<string, any>;
    list: any[];
    listByType: Record<string, any[]>;
    listByIntegrationType: Record<string, any[]>;
    listByKey: Record<string, string>;
    listByIntegration: Record<string, any[]>;
    showAll: boolean;
}

const defaultState = () => ({
    isLoaded: false,
    entities: {},
    list: [],
    listByIntegrationType: {},
    listByType: {},
    listByKey: {},
    listByIntegration: {},
    showAll: false,
});
export const state = (): AppState => defaultState();

export const getters = {
    isLoaded: (state: AppState) => {
        return state.isLoaded;
    },
    byId: (state: AppState) => (id: string) => {
        return state.entities[id];
    },
    byKey: (state: AppState) => (key: string) => {
        return state.listByKey[key] ?? null;
    },
    list: (state: AppState) => {
        return state.list.map(id => state.entities[id]);
    },
    byType: (state: AppState) => (type: string) => {
        return state.listByType[type]?.map(id => state.entities[id]) ?? [];
    },
    byIntegrationId: (state: AppState) => (integrationId: string) => {
        return (
            state.listByIntegration[integrationId]?.map(
                id => state.entities[id],
            ) ?? []
        );
    },
    showAll: (state: AppState) => state.showAll,
    byRange:
        (_state: AppState, getters: any) =>
        (range: { start: Date; end: Date }) => {
            return getters.list
                .filter((entity: any) => {
                    return (
                        entity.start &&
                        extractDate(entity.start) &&
                        isInRange(entity, range)
                    );
                })
                .map((entity: any) => {
                    const calendarEntity = {
                        ...entity,
                        type: 'integration',
                    } as any;
                    calendarEntity.name = `${entity.key} ${entity.text}`;
                    if (calendarEntity.start) {
                        if (
                            entity.start &&
                            entity.end &&
                            new Date(extractDate(entity.start)).getDate() !==
                                new Date(extractDate(entity.end)).getDate()
                        ) {
                            calendarEntity.timed = false;
                        } else {
                            calendarEntity.timed = !isAllDay(entity.start);
                        }

                        calendarEntity.startObject = entity.start
                            ? { ...entity.start }
                            : null;
                        calendarEntity.endObject = entity.end
                            ? { ...entity.end }
                            : null;
                        calendarEntity.start = extractDate(
                            entity.start,
                        ).getTime();

                        calendarEntity.startTime = extractDate(entity.start);

                        if (isAllDay(entity.start) && isAllDay(entity.end)) {
                            const endDate = sub(extractDate(entity.end), {
                                days: 1,
                            });
                            calendarEntity.end = extractDate(entity.end)
                                ? endDate.getTime()
                                : calendarEntity.start;

                            calendarEntity.endTime = extractDate(entity.end)
                                ? endDate
                                : calendarEntity.startTime;
                        } else {
                            calendarEntity.end = extractDate(entity.end)
                                ? extractDate(entity.end).getTime()
                                : calendarEntity.start;

                            calendarEntity.endTime = entity.end
                                ? extractDate(entity.end)
                                : calendarEntity.startTime;
                        }
                    }
                    return calendarEntity;
                });
        },
};

export const mutations = {
    clear: (state: AppState) => {
        state.entities = {};
        state.list = [];
        state.listByIntegration = {};
        state.listByType = {};
    },
    update: (state: AppState, data: any) => {
        // @ts-ignore
        const isNew = !Object.hasOwn(state.entities, data.id);
        Vue.set(state.entities, data.id, Object.freeze(data));
        if (!isNew) return;

        const updateIndex = (indexArray: any[]) => {
            const index = indexArray.indexOf(data.id);
            if (index === -1) {
                Vue.set(indexArray, indexArray.length, data.id);
                return;
            }
            Vue.set(indexArray, index, data.id);
        };

        if (data.key) {
            Vue.set(state.listByKey, data.key, data.id);
        }

        const type = data.id.split('/').shift();

        if (!state.listByIntegrationType[data.integrationType]) {
            Vue.set(state.listByIntegrationType, data.integrationType, []);
        }
        if (!state.listByIntegration[data.integrationId]) {
            Vue.set(state.listByIntegration, data.integrationId, []);
        }

        updateIndex(state.list);
        if (type) {
            if (!state.listByType[type]) {
                Vue.set(state.listByType, type, []);
            }
            updateIndex(state.listByType[type]);
        }
        updateIndex(state.listByIntegrationType[data.integrationType]);
        updateIndex(state.listByIntegration[data.integrationId]);
    },
    batchUpdate: (state: AppState, data: any[]) => {
        const id = v4();
        const entities = { ...state.entities };
        const listByKey = cloneDeep(state.listByKey);
        const listByType = cloneDeep(state.listByType);
        const listByIntegrationType = cloneDeep(state.listByIntegrationType);
        const listByIntegration = cloneDeep(state.listByIntegration);
        const list = [...state.list];
        const updateIndex = (indexArray: any[], entity: any) => {
            const index = indexArray.findIndex(id => id === entity.id);
            if (index === -1) {
                indexArray.push(entity.id);
            }
        };

        for (const entityData of data) {
            let entity = entityData; // 'jira_AUser...'
            if (entities[entity.id]) {
                //
                entity = { ...entities[entity.id], ...entity };
            }
            entities[entity.id] = Object.freeze(entity);
            if (entity.key) {
                listByKey[entity.key] = entity.id;
            }
            const type = entity.id.split('/', 1).shift();

            if (!listByIntegrationType[entity.integrationType]) {
                listByIntegrationType[entity.integrationType] = [];
            }
            if (!listByIntegration[entity.integrationId]) {
                listByIntegration[entity.integrationId] = [];
            }

            updateIndex(list, entity);
            if (type) {
                if (!listByType[type]) {
                    listByType[type] = [];
                }
                updateIndex(listByType[type], entity);
            }
            updateIndex(listByIntegrationType[entity.integrationType], entity);
            updateIndex(listByIntegration[entity.integrationId], entity);
        }
        state.entities = entities;
        state.list = list;
        state.listByKey = listByKey;
        state.listByType = listByType;
        state.listByIntegrationType = listByIntegrationType;
        state.listByIntegration = listByIntegration;
    },
    delete: (state: AppState, id: string) => {
        const type = id.split('/').shift()!;

        const entity = state.entities[id];
        const deleteFromIndex = (indexArray: any[]) => {
            const index = indexArray.indexOf(id);
            Vue.delete(indexArray, index);
        };
        deleteFromIndex(state.list);
        deleteFromIndex(state.listByType[type]);

        if (!entity) {
            deleteFromIndex(
                state.listByIntegrationType[entity.integrationType],
            );
            deleteFromIndex(state.listByIntegration[entity.integrationId]);
            if (entity.key) {
                Vue.delete(state.listByKey, entity.key);
            }
        }

        Vue.delete(state.entities, id);
    },
    toggleShowAll: (state: AppState) => {
        state.showAll = !state.showAll;
    },
    isLoaded: (state: AppState, isLoaded: boolean) => {
        state.isLoaded = isLoaded;
    },
};

export const actions = {
    refresh(this: Context, { dispatch }: any) {
        return dispatch('initialize');
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    async initialize(this: Context, { commit, rootGetters }: any) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        commit('isLoaded', false);

        const data = await this.$workers.database.IntegrationsData.list<any[]>(
            activeVault.id,
            undefined,
            undefined,
            null,
        );
        commit('clear');
        commit('batchUpdate', data);
        const paginationId: string | null = data?.[data.length - 1]?.id ?? null;
        const vaultId = activeVault.id;
        this.$workers.database?.IntegrationsData.listWithPagination(
            vaultId,
            paginationId,
            async data => {
                if (!data) {
                    commit('isLoaded', true);
                    return;
                }
                commit('batchUpdate', data);
            },
        );
    },
    async update(
        this: Context,
        { commit, getters, rootGetters }: any,
        data: any,
    ) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        const entity = getters.byId(data.id);
        const updatePayload = {
            ...(entity ?? {}),
            ...data,
        };
        commit('update', updatePayload);
        await this.$workers.database.IntegrationsData.save(
            activeVault.id,
            updatePayload,
        );
    },
    batchUpdate(this: Context, { commit, rootGetters }: any, data: any[]) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        commit('batchUpdate', data);
        const vaultId = activeVault.id;
        this.$workers.database?.IntegrationsData.saveBulk(vaultId, data);
    },
    async delete(this: Context, { commit, rootGetters }: any, { id }: any) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        commit('delete', id);
        await this.$workers.database.IntegrationsData.delete(activeVault.id, {
            id,
        });
    },

    indexedDBUpdate(this: Context, { commit }: Store<any>, data: any | any[]) {
        data = isArray(data) ? data : [data];
        commit('batchUpdate', data);
    },
    indexedDBDelete(this: Context, { commit }: any, ids: string | string[]) {
        ids = isArray(ids) ? ids : [ids];
        for (const id of ids) {
            commit('delete', id);
        }
    },
};
