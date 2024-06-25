<template>
    <div>
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[500, 20]"
            :touch="false"
            :offset="`0, 0`"
            boundary="window"
            placement="bottom-start"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="menu-list">
            <button
                class="has-tippy"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.VIEWS_ACTIVATE_1,
                        'My Day',
                    )
                "
                tabindex="-1"
                data-e2e="navigate-my-day"
                @click.stop.prevent="openMyDay($event)"
                @contextmenu.prevent.stop="onContextMenuMyDayHandler"
                @mouseup.middle.stop.prevent="openMyDay($event)"
                @mousedown.exact.left.stop="
                    handleMouseDown($event, TabType.MY_DAY, { name: 'My Day' })
                "
            >
                <MenuItem
                    :class="{
                        highlight:
                            isActiveTab[TabType.MY_DAY] ||
                            highlight === TabType.MY_DAY,
                        'is-dragging': isDragging,
                    }"
                    color="#F5BF50"
                >
                    <template #icon>
                        <InterfaceFavoriteStar class="icon" />
                    </template>
                    <template #title>My Day</template>
                </MenuItem>
            </button>
            <button
                v-for="sidebarEntity of $utils.sidebar.sidebarEntities"
                :key="`view-${sidebarEntity.id}`"
                class="has-tippy"
                :data-tippy-content="
                    $utils.sidebar.indexOfEntity(sidebarEntity.id) < 11
                        ? $shortcutsManager.getShortcutTooltipString(
                              $shortcutsManager.availableShortcuts[
                                  `VIEWS_ACTIVATE_${$utils.sidebar.indexOfEntity(
                                      sidebarEntity.id,
                                  )}`
                              ],
                              $utils.sidebar.getEntityName(sidebarEntity),
                          )
                        : $utils.tooltip.createTooltip(
                              `${$utils.sidebar.getEntityName(sidebarEntity)}`,
                          )
                "
                tabindex="-1"
                data-e2e="navigate-active"
                @click="
                    handleClick(
                        $event,
                        $utils.sidebar.getEntityTabType(sidebarEntity),
                        sidebarEntity.id,
                    )
                "
                @contextmenu.prevent.stop="
                    onContextMenuView($event, sidebarEntity)
                "
                @mouseup.middle.stop.prevent="
                    handleClick(
                        $event,
                        $utils.sidebar.getEntityTabType(sidebarEntity),
                        sidebarEntity.id,
                    )
                "
                @mousedown.exact.left.stop="
                    handleMouseDown(
                        $event,
                        $utils.sidebar.getEntityTabType(sidebarEntity),
                        {
                            name: sidebarEntity.name,
                            viewId: sidebarEntity.id,
                        },
                    )
                "
                @mouseup="
                    sidebarEntity.type === SidebarEntityType.PROJECT
                        ? handleDropInsideProject(sidebarEntity)
                        : null
                "
            >
                <MenuItem
                    :class="{
                        highlight:
                            $utils.sidebar.entityActive(sidebarEntity.id) ||
                            highlight === sidebarEntity.id,
                        'is-dragging': isDragging,
                        droppable:
                            sidebarEntity.type === SidebarEntityType.PROJECT,
                    }"
                    :color="$utils.sidebar.getEntityColor(sidebarEntity)"
                >
                    <template #icon>
                        <component
                            :is="$utils.sidebar.getEntityIcon(sidebarEntity)"
                            v-bind="{
                                id: sidebarEntity.id,
                            }"
                        />
                    </template>
                    <template
                        v-if="$utils.sidebar.showSmallIcon(sidebarEntity)"
                        #small-icon
                    >
                        <InterfaceAlignLayers1 size="8" />
                    </template>
                    <template
                        v-if="$utils.sidebar.showData(sidebarEntity)"
                        #data
                        >{{ $utils.sidebar.sidebarCount(sidebarEntity) }}
                    </template>
                    <template #title
                        >{{ $utils.sidebar.getEntityName(sidebarEntity) }}
                    </template>
                </MenuItem>
            </button>
            <button
                v-for="app in apps"
                :key="`app-${app.id}`"
                class="has-tippy"
                :data-tippy-content="`<div class='tooltip task-tooltip'>${app.name}</div>`"
                tabindex="-1"
                @click="
                    handleClick(
                        $event,
                        app.tabType,
                        app.tabType,
                        app.authStatus,
                    )
                "
                @contextmenu.prevent.stop="handleAppContextMenu(app.id, $event)"
                @mouseup.middle.stop.prevent="
                    handleClick(
                        $event,
                        app.tabType,
                        app.tabType,
                        app.authStatus,
                    )
                "
                @mousedown.exact.left.stop="
                    handleMouseDown($event, app.tabType, { name: app.name })
                "
            >
                <MenuItem
                    :class="{
                        highlight:
                            isActiveTab[app.tabType] || highlight === app.id,
                        'is-dragging': isDragging,
                    }"
                    :color="null"
                >
                    <template #icon>
                        <component
                            :is="app.icon"
                            class="icon integration-icon"
                            :class="[app.name]"
                            size="22"
                        />
                    </template>
                    <template
                        v-if="
                            app.authStatus ===
                            IntegrationAuthStatus.UNAUTHORIZED
                        "
                        #data
                        ><InterfaceAlertWarningTriangle size="12"
                    /></template>
                    <template #title>{{ app.name }}</template>
                </MenuItem>
            </button>
            <button
                v-for="app in appPlaceholders"
                :key="`placeholder-${app.id}`"
                class="has-tippy"
                :data-tippy-content="`<div class='tooltip task-tooltip'>Set up ${app.name} integration</div>`"
                tabindex="-1"
                @click="handleClickPlaceholder(app.settingsTab)"
                @contextmenu.prevent.stop
            >
                <MenuItem
                    :color="null"
                    :class="{
                        'is-dragging': isDragging,
                    }"
                >
                    <template #icon>
                        <component :is="app.icon" class="icon" size="22" />
                    </template>
                    <template #data>
                        <button @click.prevent.stop="dismiss(app)">
                            <InterfaceDelete1 size="8" class="dismiss-icon" />
                        </button>
                    </template>
                    <template #title>{{ app.name }}</template>
                </MenuItem>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import MenuItem from './MenuItem.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import {
    IntegrationType,
    NotificationActions,
    SidebarEntityType,
    TabType,
    ViewType,
} from '~/constants';
import {
    IntegrationAuthStatus,
    IntegrationConfig,
} from '~/workers/integrations/base';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import LinearRoundIcon from '~/components/linear/icons/LinearIconRound.vue';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { Tab } from '~/@types/app';
import InterfaceAlignLayers1 from '~/components/streamline/InterfaceAlignLayers1.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';

@Component({
    name: 'AppNavigation',
    computed: {
        SidebarEntityType() {
            return SidebarEntityType;
        },
        ViewType() {
            return ViewType;
        },
        IntegrationAuthStatus() {
            return IntegrationAuthStatus;
        },
    },
    components: {
        InterfaceAlignLayers1,
        InterfaceAlertWarningTriangle,
        InterfaceDelete1,
        InterfaceContentArchive,
        InterfaceFavoriteStar,
        MenuItem,
    },
})
export default class MenuList extends Vue {
    drag: boolean = false;
    timer: any;
    expanded: boolean = true;
    TabType = TabType;
    isActiveTab = {
        [TabType.MY_DAY]: false,
        [TabType.JIRA_APP]: false,
        [TabType.GITHUB_APP]: false,
        [TabType.LINEAR_APP]: false,
    } as Record<TabType | string, boolean>;

    highlight = '';
    dragTimeout: any = null;

    $refs!: {
        wrapper: HTMLElement;
    };

    get isDragging() {
        return !!this.$store.getters['sidebar/draggedItem'];
    }

    get views() {
        return this.$entities.view.getDisplayedViews();
    }

    get activeTabEntityId() {
        // TODO: not reactive
        return this.$utils.navigation.activeTabEntityId;
    }

    get isActiveLocal() {
        return this.$store.getters['vault/isActiveLocal'];
    }

    get appPlaceholders() {
        if (this.isActiveLocal) {
            return [];
        }

        const dismissed =
            this.$store.getters['appSettings/dismissedIntegrationPlaceholders'];

        const jiraIntegration = this.$entities.jira.getIntegration();
        const githubIntegration = this.$entities.github.getIntegration();
        const linearIntegration = this.$entities.linear.getIntegration();

        const placeholders = [];
        if (!jiraIntegration && !dismissed.includes(IntegrationType.JIRA)) {
            placeholders.push({
                name: 'Jira',
                id: IntegrationType.JIRA,
                icon: JiraIcon,
                settingsTab: 'jira-integration',
            });
        }
        if (!githubIntegration && !dismissed.includes(IntegrationType.GITHUB)) {
            placeholders.push({
                name: 'Github',
                id: IntegrationType.GITHUB,
                icon: GithubIcon,
                settingsTab: 'github-integration',
            });
        }
        if (!linearIntegration && !dismissed.includes(IntegrationType.LINEAR)) {
            placeholders.push({
                name: 'Linear',
                id: IntegrationType.LINEAR,
                icon: LinearRoundIcon,
                settingsTab: 'linear-integration',
            });
        }
        return placeholders;
    }

    get apps() {
        if (!this.$accessControl.hasProAccess) return [];
        const integrations = this.$store.getters['integration/list'].filter(
            ({ type }: any) =>
                ![
                    IntegrationType.ICS_CALENDAR,
                    IntegrationType.GOOGLE_CALENDAR,
                    IntegrationType.APPLE_CALENDAR,
                ].includes(type),
        );
        const integrationsWithProjects = integrations.filter(
            (integration: any) =>
                integration?.data?.projects?.filter(
                    (project: any) => project.syncEnabled,
                ).length,
        );

        const githubIntegrations = integrations.filter(
            (integration: any) => integration.type === IntegrationType.GITHUB,
        );
        const linearIntegrations = integrations.filter(
            (integration: any) => integration.type === IntegrationType.LINEAR,
        );

        const integrationSet = new Set([
            ...integrationsWithProjects.map(
                (i: IntegrationConfig<any>) => i.type,
            ),
            ...githubIntegrations.map((i: IntegrationConfig<any>) => i.type),
            ...linearIntegrations.map((i: IntegrationConfig<any>) => i.type),
        ]);

        const getIcon = (type: string) => {
            switch (type) {
                case IntegrationType.JIRA:
                    return JiraIcon;
                case IntegrationType.GITHUB:
                    return GithubIcon;
                case IntegrationType.LINEAR:
                    return LinearIcon;
            }
        };
        const getTabType = (type: string) => {
            switch (type) {
                case IntegrationType.JIRA:
                    return TabType.JIRA_APP;
                case IntegrationType.GITHUB:
                    return TabType.GITHUB_APP;
                case IntegrationType.LINEAR:
                    return TabType.LINEAR_APP;
            }
        };
        const toTitleCase = (type: string): string => {
            return type[0].toUpperCase() + type.slice(1);
        };
        const data = [...integrationSet.values()]
            .map(v => ({
                name: v === IntegrationType.LINEAR ? 'Linear' : toTitleCase(v),
                id: v,
                icon: getIcon(v),
                tabType: getTabType(v),
                authStatus: integrations.find((i: any) => i.type === v)
                    ?.authStatus,
            }))
            .sort((a, b) => (a.name > b.name ? 1 : -1));

        return data;
    }

    @Watch('activeTabEntityId')
    handleActiveEntityIdChange(next: TabType | string, prev: TabType | string) {
        const keys = Object.keys(this.isActiveTab);
        if (keys.includes(prev)) this.isActiveTab[prev] = false;
        if (keys.includes(next)) this.isActiveTab[next] = true;
    }

    async handleAppContextMenu(app: string, e: any) {
        this.highlight = app;
        if (app === IntegrationType.JIRA) {
            this.$contextMenu.show(e, {
                component: () =>
                    import(
                        '~/components/integrations/jira/JiraAppContextMenu.vue'
                    ) as any,
                onClose: () => {
                    this.highlight = '';
                },
                bind: {
                    invokeFrom: 'sidebar',
                    tab: this.$tabs.createNewTabObject(
                        TabType.JIRA_APP,
                        TabType.JIRA_APP,
                    ),
                },
            });
        }

        if (app === IntegrationType.GITHUB) {
            await this.$contextMenu.show(e, {
                component: () =>
                    import(
                        '~/components/github/GithubTabContextMenu.vue'
                    ) as any,
                onClose: () => {
                    this.highlight = '';
                },
                bind: {
                    invokeFrom: 'sidebar',
                    tab: this.$tabs.createNewTabObject(
                        TabType.GITHUB_APP,
                        TabType.GITHUB_APP,
                    ),
                },
            });
        }

        if (app === IntegrationType.LINEAR) {
            await this.$contextMenu.show(e, {
                component: () =>
                    import(
                        '~/components/linear/context-menu/LinearAppContextMenu.vue'
                    ) as any,
                onClose: () => {
                    this.highlight = '';
                },
                bind: {
                    invokeFrom: 'sidebar',
                    tab: this.$tabs.createNewTabObject(
                        TabType.LINEAR_APP,
                        TabType.LINEAR_APP,
                    ),
                },
            });
        }
    }

    async handleDropInsideProject(sidebarEntity: any) {
        const draggedEntity = this.$store.getters['sidebar/draggedItem'];
        if (!draggedEntity) return;
        const last = this.$store.getters['sidebar/lastByParentId'](
            sidebarEntity.id,
        );
        let newOrder = 500;
        if (last) {
            newOrder = last.order + 500;
        }
        if (draggedEntity.type === 'document') {
            await this.$entities.page.update({
                id: draggedEntity.id,
                order: newOrder,
                projectId: sidebarEntity.id,
            });
        }
        if (draggedEntity.type === 'folder') {
            await this.$entities.folder.update({
                id: draggedEntity.id,
                order: newOrder,
                parentId: sidebarEntity.id,
            });
        }
        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                callback: () => {
                    const tab = this.$tabs.createNewTabObject(
                        sidebarEntity.id,
                        TabType.PROJECT,
                    );
                    this.$tabs.openTab(tab);
                    this.$tracking.trackEventV2(TrackingType.PROJECT, {
                        action: TrackingAction.OPEN,
                        source: TrackingActionSource.NOTIFICATION,
                    });
                },
                action: NotificationActions.REDIRECT,
                displayText: `${
                    draggedEntity.type === 'document' ? 'Page' : 'Pages'
                } moved to Project`,
                actionText: 'Open Project',
            },
        });
    }

    dismiss(app: any) {
        this.$store.dispatch(
            'appSettings/dismissIntegrationPlaceholder',
            app.id,
        );
        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                callback: () => {
                    this.$utils.navigation.openSettings(app.settingsTab);
                },
                action: NotificationActions.REDIRECT,
                displayText: `You can always integrate ${app.name} from settings.`,
                actionText: 'Go to settings',
            },
        });
    }

    handleMouseDown(
        e: MouseEvent,
        type: TabType,
        data: Record<string, string> = {},
    ) {
        this.dragTimeout = setTimeout(() => {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;

            const extraData = {
                offsetX: e.offsetX,
                offsetY: e.offsetY,
                pageX: e.pageX,
                pageY: e.pageY,
            };

            const item = {
                id: data.viewId || type,
                name: data.name,
                type,
                data,
            };

            this.$store.commit('sidebar/draggedMenuItem', {
                ...item,
                ...extraData,
            });

            this.$nuxt.$emit('sidebar:dragstart', {
                pageX: extraData.pageX,
                pageY: extraData.pageY,
            });
        }, 150);
    }

    onContextMenuMyDayHandler(e: MouseEvent) {
        this.highlight = this.TabType.MY_DAY;
        const tab = this.$tabs.createNewTabObject(
            TabType.MY_DAY,
            TabType.MY_DAY,
        );
        this.$contextMenu.show(e, {
            component: () =>
                import('@/components/context-menu/MyDayContextMenu.vue'),
            bind: {
                tab,
                tabId: tab.id,
                invokeFrom: 'sidebar',
            },
            onClose: () => {
                this.highlight = '';
            },
        });
    }

    onContextMenuView(e: MouseEvent, sidebarEntity: any) {
        this.highlight = sidebarEntity.id;
        this.$utils.sidebar.openEntityContextMenu(sidebarEntity, e, () => {
            this.highlight = '';
        });
    }

    openMyDay(event: MouseEvent) {
        clearTimeout(this.dragTimeout);
        this.dragTimeout = null;
        // We are opening into active tab group. If my day is already active, no need to open.
        const activeTab = this.$tabs.activeTab();
        if (activeTab?.type === TabType.MY_DAY) return;
        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            source: TrackingActionSource.SIDEBAR,
            action: TrackingAction.OPEN,
        });
        this.$entities.myDay.open({ event });
    }

    handleClick(
        event: MouseEvent,
        tabType: TabType,
        entityId: string,
        authStatus?: IntegrationAuthStatus,
    ) {
        clearTimeout(this.dragTimeout);
        this.dragTimeout = null;

        if (
            tabType === TabType.JIRA_APP &&
            authStatus === IntegrationAuthStatus.UNAUTHORIZED
        ) {
            this.$entities.jira.openSettings(TrackingActionSource.SIDEBAR);
            return;
        }

        if (
            tabType === TabType.GITHUB_APP &&
            authStatus === IntegrationAuthStatus.UNAUTHORIZED
        ) {
            this.$entities.github.openSettings(TrackingActionSource.SIDEBAR);
            return;
        }

        if (
            tabType === TabType.LINEAR_APP &&
            authStatus === IntegrationAuthStatus.UNAUTHORIZED
        ) {
            this.$entities.linear.openSettings(TrackingActionSource.SIDEBAR);
            return;
        }

        const tab = this.$tabs.createNewTabObject(entityId, tabType);
        const type = this.$tracking.resolveTypeFromTab(tab as Tab);
        if (type) {
            this.$tracking.trackEventV2(type, {
                action: TrackingAction.OPEN,
                source: TrackingActionSource.SIDEBAR,
            });
        }

        this.$tabs.openTabWithEvent(tab, event);
    }

    handleClickPlaceholder(settingsTab: string) {
        clearTimeout(this.dragTimeout);
        this.dragTimeout = null;
        let source;

        if (settingsTab === 'github-integration') {
            source = TrackingActionSource.GITHUB_BENTO_ONBOARDING;
        }

        if (settingsTab === 'jira-integration') {
            source = TrackingActionSource.JIRA_BENTO_ONBOARDING;
        }

        this.$utils.navigation.openSettings(settingsTab, source);
    }

    mounted() {
        const keys = Object.keys(this.isActiveTab);
        if (keys.includes(this.activeTabEntityId))
            this.isActiveTab[this.activeTabEntityId] = true;
    }
}
</script>

<style lang="scss" scoped>
.menu-list {
    padding: 0 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    overflow: hidden;

    .integration-icon {
        color: var(--app-navigation-integration-default-color);

        &.Linear {
            padding: 2px;
        }
    }
}
</style>
