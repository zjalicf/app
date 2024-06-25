import { GetterTree, MutationTree } from 'vuex';
import { v4 } from 'uuid';
import { Vue } from 'vue-property-decorator';
import { Context } from '@nuxt/types';
import _ from 'lodash';
import defaultsDeep from 'lodash/defaultsDeep';
import { Tab, TabGroup } from '~/@types/app';
import { TabType } from '~/constants';
// @ts-ignore
import { RootState } from '~/store';

type AppState = {
    draggingInfo: {
        isDragging: boolean;
        draggedTab: Tab | null;
        originGroup: TabGroup | null;
    };
    history: { forward: () => void; backward: () => void }[];
    historyIndex: number;
    activeTabGroupId: string | null;
    activeTabId: string | null;

    tabs: Record<Tab['id'], Tab>;
    groups: Record<TabGroup['id'], TabGroup>;
    tabsInGroup: Record<TabGroup['id'], Tab['id'][]>;
    listGroups: TabGroup['id'][];
    listTabs: Tab['id'][];
};
export const state: () => AppState = () => ({
    draggingInfo: {
        isDragging: false,
        draggedTab: null,
        originGroup: null,
    },

    history: [],
    historyIndex: -1,

    activeTabGroupId: null,
    activeTabId: null,

    tabs: {},
    groups: {},
    tabsInGroup: {},
    listGroups: [],
    listTabs: [],
});

const findGroupByTab = (state: AppState, tabId: string) => {
    return state.listGroups.find(groupId => {
        return state.tabsInGroup[groupId].includes(tabId);
    });
};

export const getters: GetterTree<AppState, RootState> = {
    historyCanMoveForward: state =>
        state.historyIndex < state.history.length - 1,
    historyCanMoveBackward: state => state.historyIndex > 0,
    historyIndex: state => state.historyIndex,
    historyAtIndex: state => (index: number) => state.history[index],

    allTabsInGroups: state =>
        state.listGroups.reduce(
            (acc: Record<TabGroup['id'], Tab[]>, groupId: TabGroup['id']) => {
                acc[groupId] =
                    state.tabsInGroup[groupId]?.map(id => state.tabs[id]) ?? [];
                return acc;
            },
            {} as Record<TabGroup['id'], Tab[]>,
        ),
    tabsInGroup: (_, getters: any) => {
        return (groupId: TabGroup['id']) => getters.sortedTabs(groupId) ?? [];
    },

    sortedTabs: state => (groupId: string) => {
        return state.tabsInGroup[groupId]
            .map(id => state.tabs[id])
            .sort((a, b) => (a.order < b.order ? -1 : 1));
    },
    groups: (state, getters) =>
        state.listGroups
            .map(id => {
                const group = state.groups[id];
                return {
                    ...group,
                    tabs: getters.tabsInGroup(id),
                };
            })
            .filter(group => group.tabs.length > 0),
    sortedGroups: (_, getters) => {
        return [...getters.groups].sort((a, b) => (a.order < b.order ? -1 : 1));
    },
    sortedGroupsIds: state => {
        const groups = state.listGroups.map(id => state.groups[id]);
        return groups
            .sort((a, b) => (a.order < b.order ? -1 : 1))
            .map((group: TabGroup) => group.id);
    },
    groupWidth: state => (groupId: string) => {
        return state.groups[groupId]?.width ?? 0;
    },
    list: state => state.listTabs.map(id => state.tabs[id]),
    byId: state => (id: string) => {
        return state.tabs[id] ?? null;
    },
    groupByIdWithoutTabs: state => (id: string) => {
        return state.groups[id] ?? null;
    },
    groupTabs: state => (groupId: string) => {
        const tabs = state.tabsInGroup[groupId].map(id => state.tabs[id]) ?? [];
        return tabs.sort((a, b) => a.order - b.order);
    },
    groupById: (state, getters) => (id: string | null) => {
        if (!id) return null;
        const group = state.groups[id];
        if (!group) return null;
        return {
            ...group,
            tabs: getters.tabsInGroup(group.id),
        };
    },
    groupByTabId: state => (tabId: string) => {
        return findGroupByTab(state, tabId);
    },
    byGroup: (_: AppState, getters: any) => (tabGroupId: string) => {
        return getters.tabsInGroup(tabGroupId);
    },
    activeTabGroupId: state => {
        return state.activeTabGroupId;
    },
    activeTabId: state => {
        return state.activeTabId;
    },
    activeTab: (state, getters) => {
        return state.tabs[getters.activeGroup.activeTab];
    },
    activeGroup: (state, getters) => {
        if (!state.activeTabGroupId || !state.groups[state.activeTabGroupId]) {
            return getters.groups.reduce((acc: TabGroup, val: TabGroup) => {
                if (val.order < acc.order) {
                    return val;
                }
                return acc;
            }, {});
        }
        return {
            ...state.groups[state.activeTabGroupId],
            tabs: getters.tabsInGroup(state.activeTabGroupId),
        };
    },
    draggingInfo: state => {
        return state.draggingInfo;
    },
    singleTabOpen: (_: AppState, getters) => {
        return getters.list.length === 1 && getters.groups.length === 1;
    },
};
export const mutations: MutationTree<AppState> = {
    clear: (state: AppState) => {
        state.activeTabId = null;

        state.listGroups = [];
        state.listTabs = [];
        state.tabsInGroup = {};
        state.tabs = {};
        state.groups = {};
        state.history = [];
        state.historyIndex = -1;
    },
    setHistoryIndex: (state: AppState, index: number) => {
        state.historyIndex = index;
    },
    addToHistory: (
        state: AppState,
        cb: { forward: () => void; backward: () => void },
    ) => {
        if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(cb);
    },
    setActiveTabId: (state: AppState, tabId: string) => {
        if (state.activeTabId === tabId) return;
        state.activeTabId = tabId;
    },
    setActiveTabGroupId: (state: AppState, tabGroupId: string) => {
        if (state.activeTabGroupId === tabGroupId) return;
        state.activeTabGroupId = tabGroupId;
    },
    replaceActiveTab: (
        state: AppState,
        { tab, groupId }: { tab: Tab; groupId: string },
    ) => {
        const requestedGroupId = groupId || state.activeTabGroupId;
        if (!requestedGroupId) return;

        const group = state.groups[requestedGroupId];
        if (!group) return;

        const oldTabId = group.activeTab;
        tab.order = state.tabs[oldTabId].order;

        let tabIndex = state.tabsInGroup[group.id].findIndex(
            tab => tab === group.activeTab,
        );

        if (tabIndex < 0) {
            tabIndex = state.tabsInGroup[requestedGroupId].length;
        }

        let oldTabIndex = state.listTabs.indexOf(oldTabId);
        if (oldTabIndex < 0) {
            oldTabIndex = state.listTabs.length;
        }
        Vue.set(state.tabs, tab.id, tab);
        Vue.set(state.tabsInGroup[requestedGroupId], tabIndex, tab.id);
        Vue.set(state.groups[requestedGroupId], 'activeTab', tab.id);
        state.activeTabId = tab.id;
        Vue.set(state.listTabs, oldTabIndex, tab.id);
        Vue.delete(state.tabs, oldTabId);
    },

    moveTab: (
        state,
        {
            tab,
            source,
            destination,
        }: { tab: Tab; source: TabGroup; destination: TabGroup },
    ) => {
        const existingEntity = state.tabsInGroup[destination.id]
            .map((id: string) => state.tabs[id])
            .find((t: Tab) => t.entityId === tab.entityId);
        const isActiveTab = source.activeTab === tab.id;

        // already exists in destination group, close in source group
        if (existingEntity) {
            mutations.close(state, { tab, groupId: source.id });
            if (isActiveTab) {
                state.activeTabGroupId = destination.id;
                state.activeTabId = existingEntity.id;
            }
            return;
        }

        const newIndex = state.tabsInGroup[destination.id].includes(tab.id)
            ? state.tabsInGroup[destination.id].indexOf(tab.id)
            : state.tabsInGroup[destination.id].length;
        Vue.set(state.tabsInGroup[destination.id], newIndex, tab.id);

        // was active in previous group, activate in new group
        if (source.activeTab === tab.id) {
            state.groups[destination.id].activeTab = tab.id;
            state.activeTabGroupId = destination.id;
            state.activeTabId = tab.id;
        }

        // does not exist in previous group, do nothing
        const oldIndex = state.tabsInGroup[source.id].indexOf(tab.id);
        if (oldIndex < 0) return;

        // was last tab in previous group, delete group
        if (state.tabsInGroup[source.id].length === 1) {
            mutations.closeGroup(state, source);
            return;
        }

        Vue.delete(state.tabsInGroup[source.id], oldIndex);
        state.groups[source.id].activeTab = state.tabsInGroup[source.id][0];
    },
    createTab: (state, tab) => {
        Vue.set(state.tabs, tab.id, tab);
        Vue.set(state.listTabs, state.listTabs.length, tab.id);
    },
    addTab: (
        state,
        {
            tab,
            groupId,
            shouldActivateTab,
        }: { tab: Tab; groupId: string; shouldActivateTab?: boolean },
    ) => {
        const group = state.groups[groupId];
        if (!group) return;

        const tabIndex = state.tabsInGroup[groupId]?.length ?? 0;
        tab.order = tabIndex * 500;

        Vue.set(state.tabs, tab.id, tab);
        Vue.set(state.listTabs, state.listTabs.length, tab.id);
        Vue.set(state.tabsInGroup[groupId], tabIndex, tab.id);
        if (shouldActivateTab) {
            Vue.set(state.groups[groupId], 'activeTab', tab.id);
        }
    },
    activateTab: (state, tab: Tab) => {
        const groupId = findGroupByTab(state, tab.id);
        if (!groupId) return;

        Vue.set(state.groups[groupId], 'activeTab', tab.id);
        Vue.set(state.listGroups, state.listGroups.indexOf(groupId), groupId);
        state.activeTabGroupId = groupId;
        state.activeTabId = tab.id;
    },
    activateTabInGroup: (
        state,
        { tabId, groupId }: { tabId: string; groupId: string },
    ) => {
        Vue.set(state.groups[groupId], 'activeTab', tabId);
    },
    addGroup: (state, group: TabGroup) => {
        Vue.set(state.groups, group.id, group);
        Vue.set(state.listGroups, state.listGroups.length, group.id);
        Vue.set(state.tabsInGroup, group.id, []);
        return group;
    },
    updateGroup: (state, group: TabGroup) => {
        const groupIndex = state.listGroups.indexOf(group.id);
        if (Array.isArray(group.tabs) && group.tabs.length === 0) {
            mutations.deleteGroup(state, group.id);
            return;
        }

        if (Array.isArray(group.tabs)) {
            Vue.set(
                state.tabsInGroup,
                group.id,
                group.tabs.map(({ id }) => id),
            );
        }
        const existingGroup = state.groups[group.id];
        const activeTabInGroup = state.tabsInGroup[group.id]?.includes(
            existingGroup.activeTab,
        );
        if (!activeTabInGroup) {
            Vue.set(
                state.groups[group.id],
                'activeTab',
                state.tabsInGroup[group.id][0],
            );
        }
        delete (group as any).tabs;
        Vue.set(state.groups, group.id, {
            ...state.groups[group.id],
            ...group,
        });
        Vue.set(
            state.listGroups,
            groupIndex < 0 ? state.listGroups.length : groupIndex,
            group.id,
        );
    },
    close(state, { tab, groupId }: { tab: Tab; groupId: string }) {
        const group = { ...state.groups[groupId] };
        if (!group || !state.tabsInGroup[groupId]) return;
        group.tabs =
            state.tabsInGroup[groupId]?.map(id => state.tabs[id]) ?? [];

        const shouldUpdateActiveTab = group.activeTab === tab.id;
        const oldTabIndex = state.tabsInGroup[groupId]?.findIndex(
            id => id === tab.id,
        );
        const isGloballyActiveTab = tab.id === state.activeTabId;
        const isLastTab = group.tabs.length === 1;
        if (shouldUpdateActiveTab && !isLastTab && oldTabIndex >= 0) {
            const activeTabIndex = oldTabIndex === 0 ? 1 : oldTabIndex - 1;
            Vue.set(
                state.groups[groupId],
                'activeTab',
                group.tabs[activeTabIndex].id,
            );
            if (isGloballyActiveTab) {
                state.activeTabId = group.tabs[activeTabIndex].id;
            }
        }

        Vue.delete(
            state.tabsInGroup[groupId],
            state.tabsInGroup[groupId].indexOf(tab.id),
        );
        Vue.delete(state.listTabs, state.listTabs.indexOf(tab.id));
        Vue.set(state.listGroups, state.listGroups.indexOf(groupId), groupId);

        if (isLastTab) {
            const groups = [...Object.values(state.groups)]
                .sort((a, b) => (a.order < b.order ? -1 : 1))
                .map(group => {
                    return {
                        ...group,
                        tabs:
                            state.tabsInGroup[group.id]?.map(
                                id => state.tabs[id],
                            ) ?? [],
                    };
                });
            const isLastGroup = groups.length === 1;
            if (!isLastGroup) {
                const oldGroupIndex = groups.findIndex(
                    ({ id }) => id === groupId,
                );
                const activeGroupIndex =
                    oldGroupIndex === 0 ? 1 : oldGroupIndex - 1;
                state.activeTabGroupId = groups[activeGroupIndex].id;
                const hasActiveTab = groups[activeGroupIndex].activeTab;
                if (!hasActiveTab) {
                    state.groups[groups[activeGroupIndex].id].activeTab =
                        groups[activeGroupIndex].tabs[0].id;
                }
                state.activeTabId = groups[activeGroupIndex].activeTab;
                Vue.delete(state.tabsInGroup, groupId);
                Vue.delete(state.listGroups, state.listGroups.indexOf(groupId));
                Vue.delete(state.groups, groupId);
            } else {
                mutations.closeGroup(state, groupId);
                state.activeTabGroupId = null;
            }
        }
        Vue.delete(state.tabs, tab.id);
    },
    setDraggingInfo(state: AppState, value: Partial<AppState['draggingInfo']>) {
        state.draggingInfo = { ...state.draggingInfo, ...value };
    },
    updateTab: (
        state: AppState,
        { tab }: { tab: Partial<Tab>; groupId: string },
    ) => {
        if (!tab.id) return;
        const groupId = findGroupByTab(state, tab.id);
        if (!groupId) return;

        const tabIndex = state.tabsInGroup[groupId].findIndex(
            id => id === tab.id,
        );
        if (tabIndex < 0) return;

        Vue.set(state.tabs, tab.id, {
            ...state.tabs[tab.id],
            ...tab,
            data: {
                ...state.tabs[tab.id].data,
                ...(tab.data ?? {}),
            },
        });
        Vue.set(state.listTabs, state.listTabs.indexOf(tab.id), tab.id);
        Vue.set(
            state.tabsInGroup[groupId],
            state.tabsInGroup[groupId].indexOf(tab.id),
            tab.id,
        );
    },
    updateTabData: (state: AppState, { tabId, data }) => {
        if (!state.tabs[tabId]) return;
        let options = state.tabs[tabId].data.options ?? {};
        if ('options' in data) {
            options = {
                ...options,
                ...data.options,
            };
        }
        const merged = {
            ...(state.tabs[tabId]?.data ?? {}),
            ...data,
        };
        merged.options = options;
        Vue.set(state.tabs[tabId], 'data', merged);
        Vue.set(state.listTabs, state.listTabs.indexOf(tabId), tabId);
    },
    closeGroup: (state: AppState, groupId: string) => {
        Vue.delete(state.listGroups, state.listGroups.indexOf(groupId));
        Vue.delete(state.tabsInGroup, groupId);
        Vue.delete(state.groups, groupId);
    },
    deleteGroup: (state: AppState, groupId: string) => {
        const groups = [...Object.values(state.groups)]
            .sort((a, b) => (a.order < b.order ? -1 : 1))
            .map(group => {
                return {
                    ...group,
                    tabs:
                        state.tabsInGroup[group.id]?.map(
                            id => state.tabs[id],
                        ) ?? [],
                };
            });
        const oldGroupIndex = groups.findIndex(({ id }) => id === groupId);
        const activeGroupIndex = oldGroupIndex === 0 ? 1 : oldGroupIndex - 1;
        let group = groups[activeGroupIndex];
        if (!group) {
            group = groups.filter(({ id }) => id !== groupId)[0];
        }
        state.activeTabGroupId = group.id;
        const hasActiveTab = group.activeTab;
        if (!hasActiveTab) {
            group.activeTab = group.tabs[0].id;
        }
        state.activeTabId = group.activeTab;

        mutations.closeGroup(state, groupId);
    },
    createGroup: (state, group: TabGroup) => {
        if (!group.activeTab) {
            group.activeTab = '';
        }
        Vue.set(state.groups, group.id, group);
        Vue.set(state.tabsInGroup, group.id, []);
        Vue.set(state.listGroups, state.listGroups.length, group.id);
    },
    addTabToGroup: (state, payload: { tab: Tab; groupId: string }) => {
        const { tab, groupId } = payload;
        const tabsInGroup = state.tabsInGroup[groupId].map(
            id => state.tabs[id],
        );
        const entityExists = tabsInGroup.find(
            ({ entityId }) => entityId === tab.entityId,
        );

        if (entityExists) {
            state.groups[groupId].activeTab = entityExists.id;
            return;
        }

        Vue.set(
            state.tabsInGroup[groupId],
            state.tabsInGroup[groupId].length,
            tab.id,
        );
        if (!state.groups[groupId].activeTab) {
            state.groups[groupId].activeTab = tab.id;
        }
    },
    removeTabFromGroup: (state, payload: { tab: Tab; groupId: string }) => {
        const { tab, groupId } = payload;
        const group = state.groups[groupId];
        if (group.activeTab === tab.id) {
            const tabs = state.tabsInGroup[groupId].map(id => state.tabs[id]);
            const index = tabs
                .sort((a, b) => (a.order < b.order ? -1 : 1))
                .findIndex(({ id }) => id === tab.id);
            const nextTab = tabs[index - 1] ?? tabs[index + 1];
            if (nextTab) {
                state.groups[groupId].activeTab = nextTab.id;
            } else {
                mutations.deleteGroup(state, groupId);
                return;
            }
        }
        Vue.delete(
            state.tabsInGroup[groupId],
            state.tabsInGroup[groupId].indexOf(tab.id),
        );
    },
    updateTabOrder: (
        state,
        { tab, groupId, index }: { tab: Tab; groupId: string; index: number },
    ) => {
        const tabs = state.tabsInGroup[groupId]
            .map(id => state.tabs[id])
            .sort((a, b) => (a.order < b.order ? -1 : 1));
        const tabAtIndex = tabs[index];
        const previousTab = tabs[index - 1];

        if (!previousTab) {
            let order = tabs.length * 500;
            if (tabAtIndex) {
                order = tabAtIndex.order - 500;
            }
            Vue.set(state.tabs[tab.id], 'order', order);
            Vue.set(
                state.tabsInGroup[groupId],
                state.tabsInGroup[groupId].indexOf(tab.id),
                tab.id,
            );
            return;
        }
        if (!tabAtIndex) {
            const order = previousTab.order + 500;
            Vue.set(state.tabs[tab.id], 'order', order);
            Vue.set(
                state.tabsInGroup[groupId],
                state.tabsInGroup[groupId].indexOf(tab.id),
                tab.id,
            );
            return;
        }

        const newOrder = (tabAtIndex.order + previousTab.order) / 2;
        Vue.set(state.tabs[tab.id], 'order', newOrder);
        Vue.set(
            state.tabsInGroup[groupId],
            state.tabsInGroup[groupId].indexOf(tab.id),
            tab.id,
        );
    },
};

export const actions = {
    createNewGroup({ commit }: any, group: TabGroup) {
        const newGroup: any = {
            ...group,
            id: group.id ?? v4(),
            order: group.order ?? getters.groups.length * 500,
            width: group.width ?? 300,
        };
        commit('createGroup', newGroup);
        return newGroup;
    },
    split(
        { commit, dispatch }: any,
        {
            tab,
            source,
            destination,
        }: { tab: Tab; source?: TabGroup; destination: TabGroup },
    ) {
        commit('addTabToGroup', { tab, groupId: destination.id });
        if (source) {
            commit('removeTabFromGroup', { tab, groupId: source.id });
        }
        dispatch('storeLayout');
    },
    merge({ commit, dispatch }: any, { tab, source, destination }: any) {
        commit('deleteGroup', source.id);
        if (destination?.id) {
            commit('addTabToGroup', { tab, groupId: destination.id });
        }
        dispatch('storeLayout');
    },
    move(
        { commit, getters, dispatch }: any,
        {
            tab,
            source,
            destination,
            index,
        }: { tab: Tab; source: TabGroup; destination: TabGroup; index: number },
    ) {
        const sourceGroup = getters.groupById(source.id);
        const isTabActive = sourceGroup.activeTab === tab.id;

        const entityInGroup = getters
            .tabsInGroup(destination.id)
            .find((_tab: Tab) => _tab.entityId === tab.entityId);

        commit('removeTabFromGroup', { tab, groupId: source.id });
        if (entityInGroup) {
            commit('activateTabInGroup', {
                tabId: entityInGroup.id,
                groupId: destination.id,
            });
            commit('activateTab', entityInGroup);
            return;
        }

        commit('updateTabOrder', { tab, groupId: destination.id, index });
        commit('addTabToGroup', { tab, groupId: destination.id });
        if (isTabActive) {
            commit('activateTab', tab);
        }
        dispatch('storeLayout');
    },
    clear({ commit }: any) {
        commit('clear');
    },
    async openTab(
        { getters, dispatch }: any,
        {
            tab,
            groupId,
            openInNewTab = false,
            shouldActivateTab,
        }: {
            tab: Tab;
            groupId: string;
            openInNewTab: boolean;
            shouldActivateTab?: boolean;
        },
    ) {
        if (!groupId) {
            groupId = getters.activeTabGroupId;
        }
        const groups = getters.groups;
        // if no group, create group, add tab - always new tab
        if (!groups.length) {
            const group: TabGroup = await dispatch('createGroup', {
                order: 0,
            });
            groupId = group.id;
            await dispatch('createTab', {
                tab,
                groupId,
                openInNewTab: true,
                shouldActivateTab: true,
            });
            dispatch('activateGroup', group);
            return;
        }
        // otherwise, check if opening an existing new tab, if so, open
        const tabsInActiveGroup = getters.byGroup(groupId) ?? [];
        const exists = tabsInActiveGroup.find(
            ({ entityId }: Tab) => entityId === tab.entityId,
        );

        if (
            !exists ||
            !(
                tabsInActiveGroup &&
                tabsInActiveGroup.some(
                    ({ entityId }: Tab) => entityId === tab.entityId,
                )
            )
        ) {
            await dispatch('createTab', {
                tab,
                groupId,
                openInNewTab,
                shouldActivateTab,
            });
            return;
        }

        if (
            tabsInActiveGroup &&
            tabsInActiveGroup.some(
                ({ entityId }: Tab) => entityId === tab.entityId,
            )
        ) {
            await dispatch('updateGroup', {
                id: groupId,
                activeTab: exists.id,
            });
        } else {
            await dispatch('activateTab', tab);
        }
    },
    createNewTab({ commit }: any, tab: Tab) {
        commit('createTab', tab);
    },
    createTab(
        { commit, dispatch }: any,
        {
            tab,
            groupId,
            openInNewTab,
            shouldActivateTab,
        }: {
            tab: Tab;
            groupId: string;
            openInNewTab: boolean;
            shouldActivateTab?: boolean;
        },
    ) {
        if (openInNewTab) {
            commit('addTab', {
                tab,
                groupId,
                shouldActivateTab,
            });
            if (shouldActivateTab) {
                commit('activateTab', tab);
            }
        } else {
            commit('replaceActiveTab', {
                tab,
                groupId,
            });
        }

        dispatch('storeLayout');
    },
    createGroup(
        { commit, dispatch, rootGetters }: any,
        payload: {
            id?: string;
            order: number;
            tabs?: Tab[];
            width: number | undefined;
            shouldFocus: boolean;
        },
    ) {
        const { order, width, id } = payload;
        const group: any = {
            id: id ?? v4(),
            order,
            width: width ?? 100,
        };

        commit('addGroup', group);

        if (Array.isArray(payload.tabs)) {
            for (const tab of payload.tabs) {
                commit('addTab', { tab, groupId: group.id });
            }
            if (payload.shouldFocus) {
                commit('setActiveTabId', payload.tabs[0].id);
            }
        }
        if (payload.shouldFocus) {
            commit('setActiveTabGroupId', group.id);
        }
        dispatch('storeLayout');

        return group;
    },
    activateTab({ commit }: any, tab: Tab) {
        commit('activateTab', tab);
    },
    activateGroup({ commit, getters, dispatch }: any, group: TabGroup) {
        const stateGroup = getters.groupById(group.id);
        if (!stateGroup) {
            return;
        }
        commit('setActiveTabGroupId', stateGroup.id);
        commit('setActiveTabId', stateGroup.activeTab);
        dispatch('storeLayout');
    },
    updateGroup({ commit, dispatch }: any, group: TabGroup) {
        commit('updateGroup', group);
        dispatch('storeLayout');
    },
    moveTab(
        { getters, commit, dispatch }: any,
        payload: { tabId: string; source: TabGroup; destination: TabGroup },
    ) {
        const tab = getters.byId(payload.tabId);
        commit('moveTab', { ...payload, tab });
    },
    async close(
        this: Context,
        { commit, dispatch, getters }: any,
        payload: { tab: Tab; groupId: string },
    ) {
        commit('close', payload);
        if (!getters.groups.length) {
            await dispatch('openTab', {
                tab: this.$tabs.createNewTabObject(TabType.NEW, TabType.NEW),
            });
        }
        dispatch('storeLayout');
    },
    setDraggingInfo({ commit }: any, value: Partial<AppState['draggingInfo']>) {
        commit('setDraggingInfo', value);
    },
    clearDraggingInfo({ commit }: any) {
        commit('setDraggingInfo', {
            isDragging: false,
            draggedTab: null,
            originGroup: null,
        });
    },
    storeLayout({ getters, dispatch }: any) {
        const groups = getters.groups;
        dispatch('vaultConfig/updateTabGroups', groups, { root: true });
    },
    async initialize(this: Context, { commit, dispatch }: any, value: any) {
        commit('clear');
        const tabGroups = value.tabGroups
            ?.filter((tabGroup: TabGroup) => !!tabGroup?.tabs?.length)
            .map((group: TabGroup) => ({
                ...group,
                groupData: group.groupData ?? {},
            }));

        if (!tabGroups.length || !tabGroups[0].tabs.length) {
            const tab = this.$tabs.createNewTabObject(
                TabType.MY_DAY,
                TabType.MY_DAY,
            );
            tab.data = defaultsDeep(tab.data, tab.defaultData);

            const group: TabGroup = await dispatch('createGroup', {
                tabs: [],
                order: 0,
                activeTab: tab.id,
            });
            commit('addTab', { tab, groupId: group.id });
            commit('activateTab', tab);
            return;
        }
        let firstTab: Tab | null = null;
        for (const group of tabGroups) {
            if (!group.tabs.length) continue;
            commit('addGroup', group);
            group.tabs.map((_tab: Tab | string, index: number) => {
                if (typeof _tab === 'string') return;
                const tab = {
                    ..._tab,
                    ...this.$tabs.createNewTabObject(
                        _tab.entityId,
                        _tab.type,
                        _tab.data ?? {},
                    ),
                };
                if (!firstTab) firstTab = tab;

                return commit('addTab', {
                    tab,
                    groupId: group.id,
                    shouldActivateTab: index === 0,
                });
            });
        }

        commit('activateTab', firstTab);
        dispatch('storeLayout');
    },
    closeAll({ getters, commit }: any) {
        const groups = getters.groups;
        groups.forEach((group: TabGroup) => {
            group.tabs.forEach((tab: Tab) => {
                commit('close', { tab, groupId: group.id });
            });
        });
    },
    closeMultiple(
        { commit }: any,
        tabs: { tab: Partial<Tab>; groupId: string }[],
    ) {
        for (const tab of tabs) {
            commit('close', tab);
        }
    },
    updateTab(
        { commit }: any,
        payload: { groupId: string; tab: Partial<Tab> },
    ) {
        commit('updateTab', payload);
    },
    closeGroup({ commit }: any, groupId: string) {
        commit('closeGroup', groupId);
    },
    historyAdd(
        { commit, getters }: any,
        navigation: { forward: () => void; backward: () => void },
    ) {
        commit('addToHistory', navigation);
        commit('setHistoryIndex', getters.historyIndex + 1);
    },
    updateTabData({ commit, dispatch }: any, { tabId, data }: any) {
        commit('updateTabData', { tabId, data });
        dispatch('storeLayout');
    },
    async historyBackward({ commit, getters }: any) {
        if (!getters.historyCanMoveBackward) return;
        const currentCallback = getters.historyAtIndex(getters.historyIndex);
        const previousCallback = getters.historyAtIndex(
            getters.historyIndex - 1,
        );
        await currentCallback.backward?.();
        if (previousCallback.shouldCallForward) {
            await previousCallback.forward?.();
        }
        commit('setHistoryIndex', getters.historyIndex - 1);
    },
    async historyForward({ commit, getters }: any) {
        if (!getters.historyCanMoveForward) return;
        const nextCallback = getters.historyAtIndex(getters.historyIndex + 1);
        await nextCallback.forward?.();
        commit('setHistoryIndex', getters.historyIndex + 1);
    },
};
