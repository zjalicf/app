import { Context } from '@nuxt/types';
import { v4 } from 'uuid';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import defaultsDeep from 'lodash/defaultsDeep';
import {
    AnalyticsAction,
    PanelTypes,
    SearchServiceAction,
    ServiceKey,
    TabType,
    ViewType,
} from '~/constants';
import type { Tab, TabGroup } from '~/@types/app';
import { calculateOrder } from '~/helpers';
import { JiraIntegrationDataType } from '~/constants/jira';
import { GithubIntegrationDataType } from '~/components/github/github';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export const MIN_TAB_WIDTH = 380;

export class Tabs {
    private context: Context;
    private globalActiveTab: string | null;

    constructor(ctx: Context) {
        this.context = ctx;
        this.globalActiveTab = null;
    }

    handleGlobalActiveTab(tabId: string | null) {
        this.globalActiveTab = tabId;
    }

    get globalActiveTabId() {
        return this.globalActiveTab;
    }

    createNewTabObject(
        entityId: string,
        type: TabType,
        tabData: Record<string, any> = {},
    ): Partial<Tab> {
        let data: any = {};
        const id = v4();

        switch (type) {
            case TabType.MY_DAY:
                data.date = new Date();
                data.panelType = PanelTypes.MY_DAY;
                data.panelOpen = false;
                data.taskData = {};
                break;
            case TabType.JIRA_APP:
                data =
                    this.context.$componentsRepository.newTabConfig(
                        JiraIntegrationDataType.ISSUE,
                        id,
                    ) ?? {};
                break;
            case TabType.GITHUB_APP:
                data =
                    this.context.$componentsRepository.newTabConfig(
                        GithubIntegrationDataType.PR,
                        id,
                    ) ?? {};
                break;
            case TabType.LINEAR_APP:
                data = this.context.$entities.linear.newTabConfig();
                break;
            case TabType.VIEW:
                data = {
                    collapsed: {},
                    filterDefinition: (() => {
                        const view =
                            this.context.$entities.view.getViewById(entityId);
                        if (view?.type === ViewType.ALL_PAGES) {
                            return [
                                {
                                    property: 'dailyDoc',
                                    operation: 'isNotSet',
                                },
                            ];
                        }
                        return [];
                    })(),
                };
                break;
            case TabType.PROJECT:
                data = {
                    collapsed: {},
                };
                break;
        }

        return {
            id,
            entityId,
            type,
            defaultData: data,
            data: tabData,
        };
    }

    activeTab(): Tab | null {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        return (
            activeGroup.tabs?.find(
                (tab: Tab) => tab.id === activeGroup.activeTab,
            ) ?? null
        );
    }

    isSingleTabOpen() {
        return this.context.store.getters['tabs/singleTabOpen'];
    }

    activeGroup() {
        return this.context.store.getters['tabs/activeGroup'];
    }

    getOpenTabsOfType(type: TabType) {
        return this.context.store.getters['tabs/list'].filter((tab: Tab) => {
            return tab.type === type;
        });
    }

    isActive(tab: Partial<Tab>, groupId: string) {
        const activeTabGroupId =
            this.context.store.getters['tabs/activeTabGroupId'];
        const group =
            this.context.store.getters['tabs/groupById'](activeTabGroupId);

        return tab.id === group.activeTab && groupId === group.id;
    }

    async splitRight(
        tab: Partial<Tab>,
        targetGroup: TabGroup | null = null,
        originGroup: TabGroup | null = null,
    ) {
        if (!this.context.store.getters['tabs/byId'](tab.id)) {
            await this.context.store.dispatch('tabs/createNewTab', tab);
        }

        const group = await this._split(tab, targetGroup, originGroup, 'right');

        const historyActions = {
            name: 'splitRight',
            shouldCallForward: false,
            tab,
            forward: async () => {
                await this._openTabInNewGroup(
                    tab as Tab,
                    group,
                    targetGroup,
                    originGroup?.id,
                );
            },
            backward: async () => {
                await this.context.store.dispatch('tabs/merge', {
                    tab,
                    source: group,
                    destination: originGroup,
                });
                await this.recalculateAllTabs();
            },
        };

        this.addToHistory(historyActions);

        return group;
    }

    async splitLeft(
        tab: Partial<Tab>,
        targetGroup: TabGroup | null = null,
        originGroup: TabGroup | null = null,
    ) {
        if (!this.context.store.getters['tabs/byId'](tab.id)) {
            await this.context.store.dispatch('tabs/createNewTab', tab);
        }
        const group = await this._split(tab, targetGroup, originGroup, 'left');

        const historyActions = {
            name: 'splitLeft',
            shouldCallForward: false,
            forward: async () => {
                await this._openTabInNewGroup(
                    tab as Tab,
                    group,
                    targetGroup,
                    originGroup?.id,
                );
            },
            backward: async () => {
                await this.context.store.dispatch('tabs/merge', {
                    tab,
                    source: group,
                    destination: originGroup,
                });
                await this.recalculateAllTabs();
            },
        };

        this.addToHistory(historyActions);
    }

    async _split(
        tab: Partial<Tab>,
        targetGroup: TabGroup | null = null,
        originGroup: TabGroup | null = null,
        direction: 'left' | 'right',
    ): Promise<TabGroup> {
        if (!targetGroup) {
            targetGroup = this.context.store.getters['tabs/activeGroup'];
        }

        tab.data = defaultsDeep(tab.data, tab.defaultData);

        const anchorOrder = targetGroup!.order;
        const sourceGroup = this.context.store.getters['tabs/sortedGroups']
            .filter((gr: any) =>
                direction === 'left'
                    ? gr.order < anchorOrder
                    : gr.order > anchorOrder,
            )
            .slice(direction === 'left' ? -1 : 0);

        const order = sourceGroup.length
            ? calculateOrder(anchorOrder, sourceGroup[0].order)
            : anchorOrder + 500 * (direction === 'left' ? -1 : 1);
        const width = Math.floor(targetGroup!.width / 2);

        return await this._openTabInNewGroup(
            tab as Tab,
            { order, width },
            targetGroup,
            originGroup?.id,
        );
    }

    async _openTabInNewGroup(
        tab: Tab,
        group: Partial<TabGroup>,
        targetGroup?: TabGroup | null,
        sourceGroupId?: string,
    ) {
        const sourceGroup =
            this.context.store.getters['tabs/groupById'](sourceGroupId);
        const newGroup = await this.context.store.dispatch(
            'tabs/createNewGroup',
            group,
        );
        await this.context.store.dispatch('tabs/split', {
            source: sourceGroup,
            destination: newGroup,
            tab,
        });

        const promises = [
            this.context.store.dispatch('tabs/clearDraggingInfo'),
        ];

        if (targetGroup) {
            promises.unshift(
                this.setTabGroupWidth(
                    targetGroup.id!,
                    Math.floor(targetGroup.width! / 2),
                ),
            );
        }
        await Promise.all(promises);
        await this.recalculateAllTabs();
        await this.context.store.dispatch('tabs/storeLayout');
        return newGroup;
    }

    async splitCenter(
        tab: Partial<Tab>,
        targetGroup: TabGroup,
        originGroup: TabGroup | null = null,
    ) {
        const isNewTab = this.context.store.getters['tabs/byId'](tab.id);
        if (isNewTab && originGroup?.id !== targetGroup.id) {
            await this.context.store.dispatch('tabs/close', {
                tab,
                groupId: originGroup?.id,
            });
        }
        await this.openTab(tab, targetGroup.id, {
            openInNewTab: true,
            shouldActivate: true,
        });
        await this.context.store.dispatch('tabs/clearDraggingInfo');
        await this.recalculateAllTabs();
        await this.context.store.dispatch('tabs/storeLayout');
    }

    leftSibling(group: TabGroup) {
        const groups = this.context.store.getters['tabs/sortedGroups'];
        const index = groups.indexOf(group);
        return index > 0 ? groups[index - 1] : null;
    }

    rightSibling(group: TabGroup) {
        const groups = this.context.store.getters['tabs/sortedGroups'];
        const index = groups.map((group: TabGroup) => group.id).indexOf(group);
        return index < groups.length - 1 ? groups[index + 1] : null;
    }

    isMiddleClick(event: MouseEvent | KeyboardEvent) {
        if (event instanceof MouseEvent) {
            return event.button === 1;
        } else if (event instanceof KeyboardEvent) {
            return event.keyCode === 2;
        }
        return false;
    }

    async openTabWithEvent(
        tab: Partial<Tab>,
        event: MouseEvent | KeyboardEvent,
        groupId?: string | null,
    ) {
        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            'openTabWithEvent',
        );

        if (event && event.altKey) {
            const sourceMeta = this.context.$tracking.resolveSourceFromTab(
                tab as any,
            );
            this.context.$tracking.trackEventV2(TrackingType.TABS, {
                action: TrackingAction.SPLIT,
                source: TrackingActionSource.CLICK,
                // @ts-ignore
                sourceMeta,
            });
            return this.splitRight({ ...tab, order: 0 });
        }
        const os = this.context.$config.os;
        if (
            event &&
            !event.altKey &&
            (this.isMiddleClick(event) ||
                (os === 'mac' && event.metaKey) ||
                (os !== 'mac' && event.ctrlKey))
        ) {
            const sourceMeta = this.context.$tracking.resolveSourceFromTab(
                tab as any,
            );
            this.context.$tracking.trackEventV2(TrackingType.TABS, {
                action: TrackingAction.OPEN_IN_NEW_TAB,
                source: TrackingActionSource.CLICK,
                // @ts-ignore
                sourceMeta,
            });
            return this.openTab(tab, groupId, { openInNewTab: true });
        }
        return this.openTab(tab, groupId, { openInNewTab: false });
    }

    async openTab(
        tab: Partial<Tab>,
        groupId?: string | null,
        options?: {
            openInNewTab?: boolean;
            shouldActivate?: boolean;
        },
    ) {
        this.context.$dropdown.hideAll();
        this.context.$vfm.hideAll();
        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            'openTab',
        );

        let group = this.context.store.getters['tabs/groupById'](groupId);

        if (!group) {
            groupId = this.context.store.getters['tabs/activeTabGroupId'];
            group = this.context.store.getters['tabs/groupById'](groupId);
        }

        const activeTab = this.context.store.getters['tabs/byId'](
            group.activeTab,
        );
        const entityExists = group.tabs.find((_tab: Tab) => {
            return _tab.entityId === tab.entityId;
        });

        if (tab && tab.type) {
            let type = tab.type as string;
            if (type === TabType.VIEW && tab.entityId) {
                const view = this.context.$entities.view.getViewById(
                    tab.entityId,
                );
                type = `view - ${view?.type || 'Unknown'}`;
            }
            this.context.$serviceRegistry.emit(
                ServiceKey.ANALYTICS,
                AnalyticsAction.TRACK_EVENT,
                {
                    eventType: 'tabs',
                    properties: {
                        action: 'open',
                        type,
                    },
                },
            );
        }

        if (entityExists) {
            if (!isEmpty(tab.data)) {
                await this.context.store.dispatch('tabs/updateTabData', {
                    tabId: entityExists.id,
                    data: tab.data,
                });
            }
            return this.activateTab(entityExists, group.id);
        }

        if (tab.entityId === activeTab?.entityId) {
            const oldTabData = {
                ...(this.context.store.getters['tabs/byId'](activeTab.id)
                    ?.data ?? {}),
            };
            const historyActions = {
                name: 'openTab - same',
                shouldCallForward: true,
                tab,
                forward: () => {
                    this.context.store.dispatch('tabs/updateTabData', {
                        tabId: tab.id,
                        data: tab.data,
                    });
                },
                backward: () => {
                    this.context.store.dispatch('tabs/updateTabData', {
                        tabId: tab.id,
                        data: oldTabData,
                    });
                },
            };
            await historyActions.forward();
            this.addToHistory(historyActions);
            return;
        }

        const historyActions = {
            name: 'openTab',
            shouldCallForward: true,
            tab,
            forward: () => {
                return this._openTab(
                    tab,
                    groupId,
                    options?.openInNewTab,
                    options?.shouldActivate,
                );
            },
            backward: () => {
                if (options?.openInNewTab) {
                    return this._closeTab(tab, groupId!);
                }
                return this._openTab(activeTab, groupId, false);
            },
        };
        await historyActions.forward();
        this.addToHistory(historyActions);
        // window.$nuxt.$emit(`tab:scroll-into-view-${groupId}`, tab.id, groupId);
    }

    private async _openGroup(group: TabGroup) {
        await this.context.store.dispatch('tabs/createGroup', group);
        await this.recalculateAllTabs();
        await this.context.store.dispatch('tabs/storeLayout');
    }

    async closeTabsByFilter(filterFn: (tab: Tab) => boolean) {
        const tabs = this.context.store.getters['tabs/list'];
        const filteredTabs = tabs.filter(filterFn);
        for (const tab of filteredTabs) {
            const groupId = this.context.store.getters['tabs/groupByTabId'](
                tab.id,
            );

            await this._closeTab(tab, groupId);
        }
    }

    closeOtherTabs(tab: Tab) {
        const filterFn = ({ id }: Tab): boolean => {
            return id !== tab.id;
        };
        this.closeTabsByFilter(filterFn);
    }

    async closeTabsByEntityId(entityId: string) {
        if (entityId === 'jira') {
            entityId = TabType.JIRA_APP;
        }
        const filterFn = ({ entityId: _entityId }: Tab): boolean => {
            return entityId === _entityId;
        };
        await this.closeTabsByFilter(filterFn);
    }

    async closeTab(tab: Partial<Tab>, groupId: string) {
        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            'closeTab',
        );

        const group = this.context.store.getters['tabs/groupById'](groupId);
        const tabs = group.tabs;

        let historyActions;
        if (tabs.length === 1) {
            if (this.context.store.getters['tabs/groups'].length === 1) {
                const defaultTab = this.createNewTabObject(v4(), TabType.NEW);
                historyActions = {
                    name: 'closeTab - last tab & last group',
                    shouldCallForward: false,
                    forward: () => this._openTab(defaultTab, groupId),
                    backward: () => {
                        this._openTab(tab, groupId);
                    },
                };
            } else {
                historyActions = {
                    name: 'closeTab - last tab',
                    shouldCallForward: false,
                    forward: () => this._closeTab(tab, groupId),
                    backward: () => {
                        this._openGroup(group);
                    },
                };
            }
        } else {
            historyActions = {
                name: 'closeTab',
                shouldCallForward: false,
                forward: () => this._closeTab(tab, groupId),
                backward: () => this._openTab(tab, groupId, true, true),
            };
        }

        await historyActions.forward();
        this.addToHistory(historyActions);
    }

    public addMoveTabToHistory(
        tab: Tab,
        sourceGroup: TabGroup,
        destinationGroup: TabGroup,
        index: number,
    ) {
        const historyActions = {
            name: 'addMoveTabToHistory',
            shouldCallForward: false,
            forward: async () => {
                if (
                    !this.context.store.getters['tabs/groupById'](
                        destinationGroup.id,
                    )
                ) {
                    await this.context.store.dispatch(
                        'tabs/createNewGroup',
                        destinationGroup,
                    );
                }
                await this.context.store.dispatch('tabs/move', {
                    tab,
                    source: sourceGroup,
                    destination: destinationGroup,
                    index,
                });
            },
            backward: async () => {
                if (
                    !this.context.store.getters['tabs/groupById'](
                        sourceGroup.id,
                    )
                ) {
                    await this.context.store.dispatch(
                        'tabs/createNewGroup',
                        sourceGroup,
                    );
                }
                await this.context.store.dispatch('tabs/move', {
                    tab,
                    source: destinationGroup,
                    destination: sourceGroup,
                    index: 0,
                });
            },
        };
        this.addToHistory(historyActions);
    }

    public getGroup(groupId: string) {
        return this.context.store.getters['tabs/groupById'](groupId);
    }

    public getGroupData(
        groupId: string,
        tab: Partial<Tab>,
    ): TabGroup['groupData'][Tab['entityId']] {
        const storedTab =
            this.context.store.getters['tabs/byId'](tab.id) ?? tab;
        const group = this.getGroup(groupId);
        return group.groupData?.[storedTab.entityId!] ?? {};
    }

    public updateGroupData(
        groupId: string,
        entityId: Tab['entityId'],
        groupData: TabGroup['groupData'][Tab['entityId']],
    ) {
        const group = this.getGroup(groupId);
        return this.context.store.dispatch('tabs/updateGroup', {
            ...group,
            groupData: {
                ...group.groupData,
                [entityId]: {
                    ...(group.groupData?.[entityId] ?? {}),
                    ...groupData,
                },
            },
        });
    }

    public async _openTab(
        tab: Partial<Tab>,
        groupId: string | null = null,
        openInNewTab: boolean = false,
        shouldActivateTab?: boolean,
    ) {
        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            '_openTab',
        );
        let groupDataId = groupId;
        let groupData = {};
        if (!groupDataId) {
            groupDataId =
                this.context.store.getters['tabs/activeGroup']?.id ?? null;
        }
        if (groupDataId) {
            groupData = this.getGroupData(groupDataId, tab);
        }
        tab.data = defaultsDeep(tab.data, groupData, tab.defaultData);

        await this.context.store.dispatch('tabs/openTab', {
            tab,
            groupId,
            openInNewTab,
            shouldActivateTab: isBoolean(shouldActivateTab)
                ? shouldActivateTab
                : tab.type === TabType.NEW && openInNewTab,
        });
        await this.context.store.dispatch('tabs/activateGroup', {
            id: groupId,
        });
        if (tab.type === TabType.DOCUMENT) {
            const vaultId = this.context.store.getters['vault/active'].id;
            const document = this.context.store.getters['document/byId'](
                tab.entityId,
            );
            this.context.$serviceRegistry.emit(
                ServiceKey.SEARCH,
                SearchServiceAction.INDEX_INTERACTION,
                {
                    vaultId,
                    entity: document,
                },
            );
        }
    }

    public async _closeTab(tab: Partial<Tab>, groupId: string) {
        const group = this.context.store.getters['tabs/groupById'](groupId);
        const groupTabs = this.context.store.getters['tabs/groupTabs'](groupId);
        if (!group) return;
        if (groupTabs.length <= 1) {
            const leftSibling = this.leftSibling(group);
            if (leftSibling) {
                await this.setTabGroupWidth(
                    leftSibling.id,
                    leftSibling.width + group.width,
                );
            } else {
                const rightSibling = this.rightSibling(group);
                if (rightSibling) {
                    await this.setTabGroupWidth(
                        rightSibling.id,
                        rightSibling.width + group.width,
                    );
                }
            }
        }
        await this.context.store.dispatch('tabs/close', {
            tab,
            groupId,
        });
        await this.cleanupTab(tab as Tab);
        await this.recalculateAllTabs();
    }

    getTabData(tabId: string) {
        return this.context.store.getters['tabs/byId'](tabId)?.data ?? {};
    }

    updateTabData(tabId: string, data: Partial<Tab['data']>) {
        return this.context.store.dispatch('tabs/updateTabData', {
            tabId,
            data,
        });
    }

    _updateTab(tab: Partial<Tab>, groupId: string) {
        this.context.store.dispatch('tabs/updateTab', { groupId, tab });
    }

    activateNextTab() {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        const activeTabIndex = activeGroup.tabs.indexOf(this.activeTab());
        const nextTabIndex = (activeTabIndex + 1) % activeGroup.tabs.length;
        const nextTab = activeGroup.tabs[nextTabIndex];
        this.activateTab(nextTab, activeGroup.id);
    }

    activatePreviousTab() {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        const activeTabIndex = activeGroup.tabs.indexOf(this.activeTab());
        const previousTabIndex =
            activeTabIndex <= 0
                ? activeGroup.tabs.length - 1
                : activeTabIndex - 1;
        const nextTab = activeGroup.tabs[previousTabIndex];
        this.activateTab(nextTab, activeGroup.id);
    }

    activateTab(tab: Partial<Tab>, groupId: string) {
        if (this.isActive(tab, groupId)) return;

        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            'activateTab',
        );

        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        const activeTab = this.context.store.getters['tabs/activeTab'];

        const historyActions = {
            name: 'activateTab',
            shouldCallForward: true,
            forward: () => this._activateTab(tab, groupId),
            backward: () => this._activateTab(activeTab, activeGroup.id),
        };
        historyActions.forward();
        this.addToHistory(historyActions);
    }

    public _activateTab(tab: Partial<Tab>, groupId: string) {
        if (this.isActive(tab, groupId)) return;

        this.context.$serviceRegistry.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            '_activateTab',
        );

        const tabGroup = this.context.store.getters['tabs/groupById'](groupId);
        if (this.context.store.getters['tabs/activeTabGroupId'] !== groupId) {
            this.context.store.dispatch('tabs/activateGroup', tabGroup);
        }
        this.context.store.dispatch('tabs/activateTab', tab);

        const activeVault = this.context.store.getters['vault/active'];
        if (tab.type !== TabType.DOCUMENT) return;
        const document = this.context.store.getters['document/byId'](
            tab.entityId,
        );

        this.context.$serviceRegistry.emit(
            ServiceKey.SEARCH,
            SearchServiceAction.INDEX_INTERACTION,
            {
                vaultId: activeVault.id,
                entity: document,
            },
        );
    }

    activateTabIndex(targetIndex: number) {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        if (!activeGroup.tabs[targetIndex]) {
            return;
        }
        this.context.store.dispatch(
            'tabs/activateTab',
            activeGroup.tabs[targetIndex],
        );

        const historyActions = {
            name: 'activateTabIndex',
            shouldCallForward: true,
            forward: () => {
                this.context.store.dispatch(
                    'tabs/activateTab',
                    activeGroup.tabs[targetIndex],
                );
            },
        };
        this.addToHistory(historyActions);
    }

    async setTabGroupWidth(groupId: string, width: number) {
        await this.context.store.dispatch('tabs/updateGroup', {
            id: groupId,
            width,
        });
    }

    async recalculateAllTabs(width: number | null = null) {
        return;
        if (!width) {
            width = this.context.store.getters['misc/viewportWidth'];
            if (!this.context.store.getters['misc/sidebarOpen']) {
                const sidebarWidth =
                    this.context.store.getters['misc/sidebarWidth'];
                width = width + sidebarWidth;
            }
        }
        const groups = this.context.store.getters['tabs/groups'];
        const oldWidth = groups.reduce((prev: number, current: TabGroup) => {
            return prev + current.width;
        }, 0);
        await Promise.all(
            groups.map((group: TabGroup) => {
                return this.setTabGroupWidth(
                    group.id,
                    Math.max(
                        MIN_TAB_WIDTH,
                        Math.floor((group.width / oldWidth) * width!),
                    ),
                );
            }),
        );
    }

    focusNextGroup() {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        const groups = this.context.store.getters['tabs/sortedGroups'];
        const activeIndex = groups.findIndex(
            (group: TabGroup) => group.id === activeGroup.id,
        );
        const nextGroupIndex = (activeIndex + 1) % groups.length;

        this._focusGroup(activeGroup, groups[nextGroupIndex]);
        const historyActions = {
            name: 'focusNextGroup',
            shouldCallForward: true,
            forward: () =>
                this._focusGroup(groups[nextGroupIndex], activeGroup),
        };
        this.addToHistory(historyActions);
    }

    focusPreviousGroup() {
        const activeGroup = this.context.store.getters['tabs/activeGroup'];
        const groups = this.context.store.getters['tabs/sortedGroups'];
        const activeIndex = groups.findIndex(
            (group: TabGroup) => group.id === activeGroup.id,
        );
        const previousIndex =
            activeIndex <= 0 ? groups.length - 1 : activeIndex - 1;

        this._focusGroup(activeGroup, groups[previousIndex]);
        const historyActions = {
            name: 'focusPreviousGroup',
            shouldCallForward: true,
            forward: () => this._focusGroup(groups[previousIndex], activeGroup),
        };
        this.addToHistory(historyActions);
    }

    private async _focusGroup(prevGroup: TabGroup, group: TabGroup) {
        window.$nuxt.$emit(
            `tab:focus-out-${prevGroup.id}-${prevGroup.activeTab}`,
        );
        await this.context.store.dispatch('tabs/activateGroup', group);
        window.$nuxt.$emit(`tab:focus-in-${group.id}-${group.activeTab}`);
    }

    async closeGroup(groupId: string) {
        await this.context.store.dispatch('tabs/closeGroup', groupId);
        await this.recalculateAllTabs();
    }

    private cleanupTab(tab: Tab) {
        if (tab.type === TabType.DOCUMENT) {
            this.cleanupNewDocument(tab.entityId);
        }
    }

    private cleanupNewDocument(id: string) {
        const document = this.context.store.getters['document/byId'](id);
        if (!document) return;
        if (document.status === 'new') {
            this.context.store.dispatch('document/deleteLocal', document.id);
        } else if (document.title === '' && document.content === '<p></p>') {
            this.context.store.dispatch('document/deleteLocal', document.id);
        }
    }

    initializeHistory() {
        setTimeout(() => {
            const group = this.context.store.getters['tabs/activeGroup'];
            const tab = this.context.store.getters['tabs/byId'](
                group.activeTab,
            );

            const historyActions = {
                name: 'initializeHistory',
                shouldCallForward: true,
                forward: () => this._openTab(tab, group.id),
            };
            this.addToHistory(historyActions);
        }, 250);
    }

    addToHistory(actions: {
        name?: string;
        shouldCallForward?: boolean;
        forward?: () => void;
        backward?: () => void;
    }) {
        this.context.store.dispatch('tabs/historyAdd', actions);
    }

    historyBackward() {
        this.context.store.dispatch('tabs/historyBackward');
    }

    historyForward() {
        this.context.store.dispatch('tabs/historyForward');
    }

    setTabPanelState(tab: Partial<Tab>, groupId: string) {
        this.context.store.dispatch('tabs/updateTab', { tab, groupId });
    }

    panelOpen(tabId: string) {
        const storedTab = this.context.store.getters['tabs/byId'](tabId);
        return storedTab?.data?.panelOpen ?? false;
    }

    getTabById(tabId: string) {
        return this.context.store.getters['tabs/byId'](tabId);
    }
}
