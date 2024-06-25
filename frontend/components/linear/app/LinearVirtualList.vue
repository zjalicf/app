<template>
    <div
        ref="githubVirtualList"
        class="github-virtual-list"
        @mousemove="handleMouseMove"
    >
        <div v-if="isEmpty" class="empty-state">No results found</div>
        <VirtualCollection
            :cell-size-and-position-getter="cellSizeAndPositionGetterList"
            :collection="flatListData"
            :width="listWidth"
            :height="retrieveHeight"
            :header-slot-height="0"
            :scroll-to-bottom-range="400"
            class="github-virtual-list--collection"
            @scrolled-to-bottom-range="$emit('load:issues')"
        >
            <div slot="cell" slot-scope="props">
                <LinearHeader
                    v-if="props.data.isHeader"
                    ref="pageHeader"
                    :header="props.data"
                    @remove-filter="removeFilter"
                    @update-filter="updateFilter"
                    @update-team="updateTeam"
                    @delete-view="handleDeleteView"
                    @search="$emit('search', $event)"
                />
                <LinearSection
                    v-else-if="props.data.isSection"
                    :section="props.data"
                    :selected="selectedId === props.data.id"
                    @focusmouse.native="handleMouseEnter(props.data)"
                    @click.native.stop.prevent="collapse(props.data.id)"
                />
                <LinearIssue
                    v-else
                    :ref="`issue-${props.data.id}`"
                    :entity="props.data"
                    :meta="metadata"
                    :display-properties="displayProperties"
                    :minimal="isNarrowView"
                    :selected="selectedId === props.data.id"
                    @focusmouse.native="handleMouseEnter(props.data)"
                    @click.native="openModal(props.data.id)"
                />
            </div>
        </VirtualCollection>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Prop,
    Vue,
    Watch,
} from 'vue-property-decorator';
import GithubNotificationBanner from '~/components/github/GithubNotificationBanner.vue';
import GithubPageHeader from '~/components/github/GithubPageHeader.vue';
import GithubSectionHeader from '~/components/github/GithubSectionHeader.vue';
import GithubIssue from '~/components/github/GithubIssue.vue';
import GithubPullRequest from '~/components/github/GithubPullRequest.vue';
import LinearIssue from '~/components/linear/app/LinearIssue.vue';
import { VirtualJiraHeight } from '~/components/integrations/jira/constants';
import { throttle } from '~/helpers';
import LinearSection from '~/components/linear/app/LinearSection.vue';
import LinearHeader from '~/components/linear/app/LinearHeader.vue';
import { TabSymbols } from '~/constants/symbols';
import JiraSectionHeader from '~/components/integrations/jira/JiraSectionHeader.vue';
import { PANEL_DETACH_WIDTH } from '~/constants';
import { TrackingActionSource } from '~/@types/tracking';

const throttledByFps = throttle(requestAnimationFrame);
let resizeObserver: ResizeObserver | null = null;
@Component({
    name: 'LinearVirtualList',
    components: {
        JiraSectionHeader,
        LinearHeader,
        LinearSection,
        GithubPullRequest,
        GithubIssue,
        GithubSectionHeader,
        GithubPageHeader,
        GithubNotificationBanner,
        LinearIssue,
    },
})
export default class LinearVirtualList extends Vue {
    @Prop({ default: () => [] })
    flatList!: any[];

    @Prop({ default: false })
    editingView!: boolean;

    @Prop({ required: true })
    viewId!: string;

    @InjectReactive(TabSymbols.TAB_DATA)
    tabData!: any;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: any) => void;

    @InjectReactive(TabSymbols.TAB_WIDTH)
    tabWidth!: number;

    $refs!: {
        githubVirtualList: HTMLElement;
        virtualCollection: HTMLElement;
        pageHeader: LinearHeader;
    } & Record<string, HTMLElement> & { [key: string]: LinearIssue } & {
            pageHeader: LinearHeader;
        };

    width: number = 0;
    height: number = 0;
    listWidth: number = 0;

    selectionIndex = 2;
    selectedId = '';
    lastMousePos: any = { x: null, y: null, usingMouse: false };

    get isNarrowView() {
        return this.tabWidth < PANEL_DETACH_WIDTH;
    }

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get isLoading() {
        return !!this.tabData.loading;
    }

    get isEmpty() {
        return this.flatListData.length === 0 && !this.isLoading;
    }

    get displayProperties() {
        if (this.isNarrowView) {
            return [
                'key',
                'priority',
                'state',
                'assignee',
                'createdAt',
                'clip',
            ];
        }
        return this.viewDefinition.displayProperties;
    }

    openModal(id: string) {
        this.$entities.linear.openModal(id, TrackingActionSource.LINEAR_TAB);
    }

    openViewEditor() {
        this.$refs?.pageHeader?.showViewEditor();
    }

    async dismissNotifications() {
        await this.$entities.github.clearNotifications();
        this.$emit('updateOptions', { filterBy: 'all' });
    }

    collapse(id: string) {
        const key = [this.viewId, id].join('_');

        const previousState = this.tabData.collapsedGroups?.[key] ?? false;
        this.updateTabData({
            collapsedGroups: {
                ...(this.tabData.collapsedGroups ?? {}),
                [key]: !previousState,
            },
        });
    }

    removeFilter(filter: any) {
        const filters = this.tabData.filters.filter(
            (f: any) => f.property !== filter.property,
        );
        this.updateTabData({ filters });
    }

    updateFilter(filter: any) {
        const filters = this.tabData.filters.map((f: any) =>
            f.property === filter.property ? filter : f,
        );
        this.updateTabData({ filters });
    }

    updateTeam(team: any) {
        const filters = this.tabData.filters.map((filter: any) => {
            const value = filter.value;
            if (Array.isArray(value)) {
                return;
            }
            const item = this.$entities.linear.getById(value);
        });

        this.updateTabData({ team });
    }

    get flatListData() {
        return this.flatList.map((data: any, index: number) => {
            data.index = index;
            return { data };
        });
    }

    async handleDeleteView(id: string) {
        const views = this.$entities.linear.getIntegrationViews();
        const viewIndex = views.findIndex((view: any) => view.id === id);
        const nextView = views?.[viewIndex - 1] ?? { id: 'my_issues' };
        this.updateTabData({
            activeTab: nextView?.id,
        });
        setTimeout(() => {
            this.$entities.linear.deleteView(id);
        }, 100);
    }

    get metadata() {
        const firstIdentifier = this.flatListData.find(
            (item: any) => item?.data?.identifier,
        )?.data?.identifier;
        const lastIdentifier =
            this.flatListData[this.flatListData.length - 1]?.data?.identifier;

        const maxLength = Math.max(
            firstIdentifier?.length ?? 0,
            lastIdentifier?.length ?? 0,
        );

        return {
            identifierWidth: 2 + 8 * maxLength,
        };
    }

    get retrieveHeight() {
        return Math.max(this.height, 0);
    }

    gutter = this.$utils.isMobile ? 0 : 40;
    cellSizeAndPositionGetterList(item: any, index: number) {
        const width = this.width - this.gutter;
        return {
            width,
            height: item.data.height,
            x: 0,
            y: item.data.y,
            style: {
                'z-index': item.data.pageHeader
                    ? this.flatList.length - index
                    : 0,
            },
        };
    }

    resizeListener() {
        if (!this.$refs.githubVirtualList) return;
        throttledByFps(() => {
            this.width = this.$refs.githubVirtualList.offsetWidth;
            this.listWidth = this.$refs.githubVirtualList.offsetWidth;
            this.height = this.$refs.githubVirtualList.offsetHeight;
        });
    }

    getNextViableIndex(index: number, bias: number, group: boolean = false) {
        let validIndex = index;
        const currentIdExists = this.flatListData.some(
            ({ data }) => data?.id === this.selectedId,
        );
        const isValidIndex = (i: number) => {
            return i >= 1 && i < this.flatListData.length;
        };
        if (index === this.flatListData.length) {
            return this.flatListData.length - 1;
        }
        if (
            !currentIdExists &&
            isValidIndex(index) &&
            this.flatListData[validIndex].data.isSelectable
        ) {
            return index;
        }
        if (validIndex >= this.flatListData.length) {
            validIndex = this.flatListData.length - 1;
            if (this.flatListData[validIndex].data.isSelectable)
                return validIndex;
        }

        const currentGroup = this.flatListData[validIndex].data.groupId;

        while (isValidIndex(validIndex)) {
            validIndex += bias;
            if (!isValidIndex(validIndex)) break;
            const entity = this.flatListData[validIndex].data;
            if (
                entity.isSelectable &&
                (!group || (entity.isHeader && currentGroup !== entity.groupId))
            )
                return validIndex;
        }

        if (index < 1) {
            return 1;
        }

        return index;
    }

    handleArrows(move: string, group = false) {
        let offset = 0;
        this.lastMousePos.usingMouse = false;
        switch (move) {
            case 'ArrowUp':
                this.selectionIndex = this.getNextViableIndex(
                    this.selectionIndex,
                    -1,
                    group,
                );
                offset = 0;
                break;
            case 'ArrowDown':
                this.selectionIndex = this.getNextViableIndex(
                    this.selectionIndex,
                    1,
                    group,
                );
                offset = 1;
                break;
        }
        const data = this.flatListData[this.selectionIndex]?.data;
        if (!data) return;
        this.selectedId = data.id;
        this.scroll(offset);
    }

    isInViewport() {
        const item = this.flatListData[this.selectionIndex].data;
        const scrollOffset =
            this.$refs.githubVirtualList.firstElementChild!.scrollTop;
        const elementHeight = this.$refs.githubVirtualList.scrollHeight;
        const itemEnd = item.y + item.height;

        const isInside = (y: number): boolean => {
            return y < elementHeight + scrollOffset && y > scrollOffset;
        };

        return isInside(item.y) && isInside(itemEnd);
    }

    scroll(offset: number) {
        if (this.isInViewport()) {
            return;
        }
        const item = this.flatListData[this.selectionIndex].data;
        if (!item) return;
        const elementHeight = this.$refs.githubVirtualList.scrollHeight;
        if (this.selectionIndex < 4) {
            this.scrollTo(0, 'instant');
            return;
        }

        if (this.selectionIndex > this.flatListData.length - 3) {
            this.scrollTo(item.y + item.height + 40, 'instant');
            return;
        }
        this.scrollTo(
            item.y -
                elementHeight * offset +
                VirtualJiraHeight.ITEM_DESKTOP * offset +
                4,
            'instant',
        );
    }

    scrollTo(top: number, behavior: any) {
        this.$refs.githubVirtualList?.firstElementChild?.scrollTo({
            top,
            behavior,
        });
    }

    handleMouseMove(e: MouseEvent) {
        if (
            this.lastMousePos.x !== e.clientX ||
            this.lastMousePos.y !== e.clientY
        ) {
            this.lastMousePos.x = e.clientX;
            this.lastMousePos.y = e.clientY;
            this.lastMousePos.usingMouse = true;

            const elemUnderMouse = document.elementFromPoint(
                e.clientX,
                e.clientY,
            );

            if (elemUnderMouse) {
                // Trigger mouseenter-like behavior
                const event = new CustomEvent('focusmouse', { bubbles: true });
                elemUnderMouse.dispatchEvent(event);
            }
        }
    }

    handleMouseEnter(props: any) {
        if (this.selectedId === props.id) return;
        this.selectionIndex = props.index;
        this.selectedId = props.id;
    }

    registerKeyboardShortcuts() {
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_UP,
            () => {
                this.handleArrows('ArrowUp');
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_DOWN,
            () => {
                this.handleArrows('ArrowDown');
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_STATE,
            () => {
                this.$refs[
                    `issue-${this.flatListData[this.selectionIndex].data.id}`
                ].openStateDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_ASSIGNEE,
            () => {
                this.$refs[
                    `issue-${this.flatListData[this.selectionIndex].data.id}`
                ].openUserDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_PRIORITY,
            () => {
                this.$refs[
                    `issue-${this.flatListData[this.selectionIndex].data.id}`
                ].openPriorityDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_LABELS,
            () => {
                this.$refs[
                    `issue-${this.flatListData[this.selectionIndex].data.id}`
                ].openLabelsDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            this.$shortcutsManager.availableShortcuts.LINEAR_PROJECT,
            () => {
                this.$refs[
                    `issue-${this.flatListData[this.selectionIndex].data.id}`
                ].openProjectDropdown();
            },
        );
    }

    get selectionIndexIsCorrect() {
        const item = this.flatListData.find(
            item => item.data.id === this.selectedId,
        );
        return this.selectionIndex === item?.data?.index;
    }

    @Watch('selectionIndexIsCorrect')
    onSelectionIndexWrong(newVal: any) {
        if (newVal) return;
        this.selectionIndex = this.flatListData.find(
            item => item.data.id === this.selectedId,
        )?.data.index;
    }

    removeKeyboardShortcuts() {}

    mounted() {
        this.resizeListener();
        this.registerKeyboardShortcuts();
        resizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.githubVirtualList) {
            resizeObserver.observe(this.$refs.githubVirtualList);
        }
    }

    beforeDestroy() {
        this.removeKeyboardShortcuts();
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    }
}
</script>
<style lang="scss" scoped>
.github-virtual-list {
    height: 100%;
    width: 100%;
    overflow: hidden;

    .empty-state {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        @include font12-400;
        user-select: none;
        cursor: default;
        color: var(--page-list-empty-color);
    }

    :deep(.github-virtual-list--collection.vue-virtual-collection) {
        @include scrollbar(141px, 6px);
    }

    .tabs-content__single
        &
        :deep(.github-virtual-list--collection.vue-virtual-collection) {
        @include scrollbar(107px, 6px);
    }

    &--collection {
        height: 100% !important;
        overflow-x: hidden;
        position: relative;
        padding: 0 20px;
    }
}
</style>
