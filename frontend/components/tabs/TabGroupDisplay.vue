<template>
    <div
        ref="tabGroup"
        class="tab-group"
        :style="{ '--min-tab-width': minTabWidth }"
        :class="{
            'tab-group__active': hasGroups || hasTabs,
        }"
    >
        <div ref="tabBody" class="tab-group__body">
            <div v-if="hasGroups || hasTabs" class="tab-group__body__header">
                <TabGroupHeader
                    :id="group.id"
                    :active="active"
                    :group-count="sortedGroupIds.length"
                    @header:dragover="setHighlight('')"
                />
            </div>
            <transition name="fade-long">
                <div
                    v-if="dragging"
                    class="tab-group--body-wrapper"
                    @mouseleave="handleMouseLeave"
                >
                    <div class="tab-group--body-wrapper--body">
                        <div
                            class="
                                tab-group--body-wrapper--body--functional-wrapper
                            "
                        >
                            <div
                                class="
                                    tab-group--body-wrapper--body--functional-wrapper--drops
                                "
                            >
                                <div
                                    v-if="canSplit"
                                    class="
                                        tab-group--body-wrapper--body--functional-wrapper--drops--drop
                                    "
                                    @dragover="setHighlight('left')"
                                    @mouseover="handleMouseEnter('left')"
                                    @mouseup="onDropFromSidebar($event, 'left')"
                                >
                                    <draggable
                                        v-model="leftDrop"
                                        v-bind="leftDragOptions"
                                        class="drop"
                                    >
                                    </draggable>
                                </div>
                                <div
                                    class="
                                        tab-group--body-wrapper--body--functional-wrapper--drops--drop
                                    "
                                    @dragover="setHighlight('center')"
                                    @mouseover="handleMouseEnter('center')"
                                    @mouseup="
                                        onDropFromSidebar($event, 'center')
                                    "
                                >
                                    <draggable
                                        v-if="canSplit"
                                        v-model="centerDrop"
                                        v-bind="centerDragOptions"
                                        class="drop"
                                    >
                                    </draggable>
                                </div>
                                <div
                                    v-if="canSplit"
                                    class="
                                        tab-group--body-wrapper--body--functional-wrapper--drops--drop
                                    "
                                    @dragover="setHighlight('right')"
                                    @mouseover="handleMouseEnter('right')"
                                    @mouseup="
                                        onDropFromSidebar($event, 'right')
                                    "
                                >
                                    <draggable
                                        v-model="rightDrop"
                                        v-bind="rightDragOptions"
                                        class="drop"
                                    >
                                    </draggable>
                                </div>
                            </div>
                        </div>
                        <div
                            class="
                                tab-group--body-wrapper--body--display-wrapper
                            "
                        >
                            <div
                                class="
                                    tab-group--body-wrapper--body--display-wrapper--overlays
                                "
                            >
                                <div
                                    class="highlight-center"
                                    :class="{
                                        dragging,
                                        show: highlight === 'center',
                                    }"
                                >
                                    <div></div>
                                </div>
                                <div
                                    class="highlight-left"
                                    :class="{
                                        dragging,
                                        show: highlight === 'left',
                                    }"
                                >
                                    <div></div>
                                </div>

                                <div
                                    class="highlight-right"
                                    :class="{
                                        dragging,
                                        show: highlight === 'right',
                                    }"
                                >
                                    <div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <component
                :is="tabComponent"
                v-if="activeTabId"
                :id="activeTabId"
                :key="activeTabId"
                :entity-id="activeTabEntityId"
                :group-id="group.id"
                :width="groupWidth"
                :type="activeTabType"
                @data-update="$tabs.updateTabData(activeTabId, $event)"
                @focus-tab="focusTab"
            />
            <div
                v-if="hasGroups && !isLast"
                ref="dragHandle"
                class="tab-group__resize-handle"
                @mousedown="handleMouseDown"
            ></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import scrollIntoView from 'scroll-into-view';
import Tab from '~/components/tabs/Tab.vue';
import { TabType } from '~/constants';
import MyDayTab from '~/components/tabs/MyDayTab.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import NewTab from '~/components/tabs/NewTab.vue';
import { throttle } from '~/helpers';
import TabGroupHeader from '~/components/tabs/TabGroupHeader.vue';
import { MIN_TAB_WIDTH } from '~/plugins/tabs/tabs';
import JiraAppTab from '~/components/tabs/JiraAppTab.vue';
import EntityTab from '~/components/tabs/EntityTab.vue';
import ViewTab from '~/components/tabs/ViewTab.vue';
import GithubAppTab from '~/components/tabs/GithubAppTab.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import ProjectTab from '~/components/tabs/ProjectTab.vue';
import LinearAppTab from '~/components/tabs/LinearAppTab.vue';

@Component({
    name: 'TabGroupDisplay',
    components: {
        TabGroupHeader,
        InterfaceAdd1,
        Tab,
        draggable: () => import('vuedraggable'),
    },
})
export default class TabGroupDisplay extends Vue {
    @Prop({
        required: true,
    })
    id!: string;

    $refs!: {
        tabGroup: HTMLElement;
        tabBody: HTMLDivElement;
        dragHandle: any;
    };

    rightDrop = [];
    centerDrop = [];
    leftDrop = [];
    highlight: string = '';
    minTabWidth = `${MIN_TAB_WIDTH}px`;
    tabWidth: number = 0;
    tabGroupResizeObserver: any = null;
    throttledByFps = throttle(requestAnimationFrame);
    groupWidth = 0;
    observer: any = null;
    activeTabId = '';
    activeTabEntityId = '';
    activeTabType = '';

    get group() {
        return this.$store.getters['tabs/groupByIdWithoutTabs'](this.id);
    }

    get groupTabs() {
        return this.$store.getters['tabs/groupTabs'](this.id);
    }

    get active() {
        return this.id === this.$utils.navigation.activeGroupId;
    }

    get hasGroups() {
        return this.sortedGroupIds.length > 1;
    }

    get hasTabs() {
        return this.groupTabs.length > 1;
    }

    get tabComponent() {
        switch (this.activeTabType) {
            case TabType.DOCUMENT:
                return EntityTab;
            case TabType.MY_DAY:
                return MyDayTab;
            case TabType.JIRA_APP:
                return JiraAppTab;
            case TabType.GITHUB_APP:
                return GithubAppTab;
            case TabType.VIEW:
                return ViewTab;
            case TabType.PROJECT:
                return ProjectTab;
            case TabType.LINEAR_APP:
                return LinearAppTab;
            default:
                return NewTab;
        }
    }

    get canSplit() {
        return (
            this.hasTabs || this.draggingInfo.originGroup?.id !== this.group.id
        );
    }

    get groupWithTabs() {
        return {
            ...this.group,
            tabs: this.groupTabs,
        };
    }

    get sortedGroupIds() {
        return this.$store.getters['tabs/sortedGroupsIds'];
    }

    get isLast() {
        const groups = this.sortedGroupIds;
        return groups.indexOf(this.id) === groups.length - 1;
    }

    get leftDragOptions() {
        return {
            animation: 200,
            group: { name: 'left', pull: false, put: ['bar'] },
            disabled: false,
            ghostClass: 'ghost',
        };
    }

    get centerDragOptions() {
        return {
            animation: 200,
            group: { name: 'center', pull: false, put: ['bar'] },
            disabled: false,
            ghostClass: 'ghost',
        };
    }

    get rightDragOptions() {
        return {
            animation: 200,
            group: { name: 'right', pull: false, put: ['bar'] },
            disabled: false,
            ghostClass: 'ghost',
        };
    }

    get draggingSidebar() {
        return (
            (this.$store.getters['sidebar/draggedItem'] &&
                this.$store.getters['sidebar/draggedItem'].type ===
                    'document' &&
                this.$store.getters['sidebar/draggedItem']) ||
            this.$store.getters['sidebar/draggedPinItem'] ||
            this.$store.getters['sidebar/draggedMenuItem']
        );
    }

    get dragging() {
        return this.draggingInfo.isDragging || this.draggingSidebar;
    }

    get draggingInfo() {
        return this.$store.getters['tabs/draggingInfo'];
    }

    @Watch('active')
    onActiveChange(isActive: boolean) {
        if (isActive) {
            scrollIntoView(this.$refs.tabGroup, {
                time: 250,
            });
        }
    }

    @Watch('group')
    handleGroupIdChange() {
        this.handleActiveTabChange(this.group.activeTab);
    }

    @Watch('group.activeTab')
    handleActiveTabChange(val: string) {
        if (val === this.activeTabId) return;
        this.activeTabId = val;

        const activeTab = this.$store.getters['tabs/byId'](this.activeTabId);

        this.activeTabEntityId = activeTab.entityId;
        this.activeTabType = activeTab.type;
    }

    @Watch('leftDrop')
    async onDropLeft(newValue: any) {
        if (!newValue.length) return;
        const { id, entityId, type } = newValue[0];
        if (!id) return;
        const tab = this.$store.getters['tabs/byId'](id);

        await this.$tabs.splitLeft(
            tab,
            this.groupWithTabs,
            this.draggingInfo.originGroup,
        );
        this.leftDrop = [];
        this.setHighlight('');
    }

    @Watch('centerDrop')
    async onDropCenter(newValue: any) {
        if (!newValue.length) return;
        const { id, entityId, type } = newValue[0];
        if (!id) return;
        const tab = this.$store.getters['tabs/byId'](id);
        await this.$tabs.splitCenter(
            tab,
            this.groupWithTabs,
            this.draggingInfo.originGroup,
        );
        this.centerDrop = [];
        this.setHighlight('');

        const sourceMeta = this.$tracking.resolveSourceFromTab(tab);
        this.$tracking.trackEventV2(TrackingType.TABS, {
            action: TrackingAction.OPEN_IN_NEW_TAB,
            source: TrackingActionSource.DRAG_AND_DROP,
            // @ts-ignore
            sourceMeta,
        });
    }

    @Watch('rightDrop')
    async onDropRight(newValue: any) {
        if (!newValue.length) return;
        const { id, entityId, type } = newValue[0];
        if (!id) return;
        const tab = this.$store.getters['tabs/byId'](id);
        await this.$tabs.splitRight(
            tab,
            this.groupWithTabs,
            this.draggingInfo.originGroup,
        );
        this.rightDrop = [];
        this.setHighlight('');

        const sourceMeta = this.$tracking.resolveSourceFromTab(tab);
        this.$tracking.trackEventV2(TrackingType.TABS, {
            action: TrackingAction.SPLIT,
            source: TrackingActionSource.DRAG_AND_DROP,
            // @ts-ignore
            sourceMeta,
        });
    }

    setHighlight(side: string) {
        if (this.highlight === side) return;
        this.highlight = side;
        this.$nuxt.$emit('tabgroup:highlight-set', this.group.id);
    }

    focusTab() {
        const activeTab = this.$store.getters['tabs/byId'](this.activeTabId);
        this.$tabs._activateTab(activeTab, this.id);
    }

    async onDropFromSidebar(event: MouseEvent, side: string) {
        if (!this.draggingSidebar) return;
        const item = this.draggingSidebar;
        // match sidebar type for doc to tab type
        const type = item.type === 'document' ? TabType.DOCUMENT : item.type;
        this.setHighlight('');
        const tab = this.$tabs.createNewTabObject(item.id, type);
        this.$store.dispatch('tabs/createNewTab', tab);
        if (side === 'left') {
            await this.$tabs.splitLeft(tab, this.groupWithTabs);
            const sourceMeta = this.$tracking.resolveSourceFromTab(tab as any);
            this.$tracking.trackEventV2(TrackingType.TABS, {
                action: TrackingAction.SPLIT,
                source: TrackingActionSource.DRAG_AND_DROP,
                // @ts-ignore
                sourceMeta,
            });
            return;
        }

        if (side === 'right') {
            await this.$tabs.splitRight(tab, this.groupWithTabs);
            const sourceMeta = this.$tracking.resolveSourceFromTab(tab as any);
            this.$tracking.trackEventV2(TrackingType.TABS, {
                action: TrackingAction.SPLIT,
                source: TrackingActionSource.DRAG_AND_DROP,
                // @ts-ignore
                sourceMeta,
            });
            return;
        }

        if (side === 'center') {
            await this.$tabs.splitCenter(tab, this.groupWithTabs);
        }
    }

    handleMouseEnter(side: string) {
        if (!this.draggingSidebar) return;
        this.setHighlight(side);
    }

    handleMouseLeave(e: MouseEvent) {
        this.setHighlight('');
    }

    handleMouseDown(event: MouseEvent) {
        this.$emit('drag:mousedown', event);
    }

    resizeListener() {
        this.throttledByFps(() => {
            if (!this.$refs.tabGroup) return;
            this.groupWidth = this.$refs.tabGroup.offsetWidth;
            this.$nuxt.$emit('tab-resize');
        });
    }

    beforeDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    mounted() {
        this.activeTabId = this.group.activeTab ?? null;
        const activeTab =
            this.$store.getters['tabs/byId'](this.activeTabId) ?? null;
        this.activeTabEntityId = activeTab?.entityId ?? null;
        this.activeTabType = activeTab?.type ?? null;

        this.$nuxt.$on('tabgroup:highlight-set', (id: string) => {
            if (id === this.group?.id) return;
            this.setHighlight('');
        });

        this.resizeListener();
        this.observer = new ResizeObserver(this.resizeListener);

        if (this.$refs.tabGroup) {
            this.observer.observe(this.$refs.tabGroup);
        }
    }
}
</script>
<style lang="scss">
.fade-long {
    opacity: 1;
}

.fade-long-enter {
    opacity: 0;
}

.fade-long-enter-active {
    transition: opacity 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-long-leave-active {
    transition: opacity 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-long-leave-to {
    opacity: 0;
}
</style>
<style lang="scss">
.drop > div.ghost {
    display: none !important;
}
</style>
<style lang="scss" scoped>
.drop {
    width: 100%;
    height: 100%;
}

.highlight-left {
    position: absolute;
    width: 50%;
    height: 100%;
    left: 0;
    top: 0;
    padding: 10px;

    & > div {
        border-radius: 9px;
        width: 100%;
        height: 100%;
    }

    &.dragging.show > div {
        background: var(--tab-drag-highlight-bg-color);
        opacity: 0.9;
        border: 1px solid var(--tab-drag-highlight-border-color);
        border-radius: 9px;
    }
}

.highlight-center {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    padding: 10px;

    & > div {
        border-radius: 9px;
        width: 100%;
        height: 100%;
    }

    &.dragging.show > div {
        background: var(--tab-drag-highlight-bg-color);
        opacity: 0.9;
        border: 1px solid var(--tab-drag-highlight-border-color);
    }
}

.highlight-right {
    position: absolute;
    width: 50%;
    height: 100%;
    right: 0;
    top: 0;
    padding: 10px;

    & > div {
        border-radius: 9px;
        width: 100%;
        height: 100%;
    }

    &.dragging.show > div {
        background: var(--tab-drag-highlight-bg-color);
        opacity: 0.9;
        border: 1px solid var(--tab-drag-highlight-border-color);
    }
}

.tab-group {
    position: relative;
    box-sizing: border-box;
    flex: 1 0 0;
    width: 0;
    min-width: var(--min-tab-width);
    box-shadow: var(--tab-box-shadow);
    border-radius: 12px;

    &__resize-handle {
        position: absolute;
        height: calc(100% - 40px);
        width: 12px;
        background: transparent;
        transform: translateX(75%);
        z-index: 1;
        right: 0;
        top: 40px;
        cursor: col-resize;
    }

    :deep(.vue-virtual-collection) {
        @include scrollbar(3px, 9px);
    }

    &__active {
        :deep(.vue-virtual-collection) {
            @include scrollbar(36px, 9px);
        }
    }

    &__wrapper {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    &__body {
        padding: 0 6px;
        background: var(--tab-bg-color);
        border-radius: 12px;
        position: relative;

        :deep(.tab-content-gutter) {
            padding-top: 55px;
        }

        .tabs-content__single & {
            :deep(.tab-content-gutter) {
                padding-top: 21px;
            }
        }

        &__header {
            border-radius: 12px;
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 3;
            background: var(--tab-header-bg-color);
            backdrop-filter: blur(12px);
            padding: 6px 6px 0 6px;
        }
    }

    &--body-wrapper {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        border-radius: 0 0 8px 8px;

        .tab-group__active & {
            top: 34px;
            height: calc(100% - 34px);
        }

        &--body {
            position: relative;
            width: 100%;
            height: 100%;

            &--functional-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                z-index: 3;

                width: 100%;
                height: 100%;

                &--drops {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: space-between;

                    &--drop {
                        width: 100%;
                        height: 100%;
                        padding: 10px;
                    }
                }
            }

            &--display-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 1;

                &--overlays {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    padding: 10px;
                }
            }
        }
    }
}
</style>
