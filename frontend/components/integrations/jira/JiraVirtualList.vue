<template>
    <div ref="jiraListContent" class="jira-list" @mousemove="handleMouseMove">
        <VirtualCollection
            v-if="flatJiraListData.length > 0"
            ref="virtualCollection"
            :cell-size-and-position-getter="cellSizeAndPositionGetterList"
            :collection="flatJiraListData"
            :width="listWidth"
            :height="retrieveHeight"
            :header-slot-height="0"
            class="jira-list--wrapper tab-content-gutter"
            :scroll-to-bottom-range="retrieveHeight"
        >
            <div slot="cell" :ref="`vts${props.data.id}`" slot-scope="props">
                <div
                    v-if="props.data.placeholder"
                    class="jira-list--placeholder"
                />
                <JiraNotificationBanner
                    v-else-if="props.data.banner"
                    :count="props.data.count"
                    @dismiss="$emit('dismiss-notifications')"
                />
                <JiraPageHeader
                    v-else-if="props.data.pageHeader"
                    ref="pageHeader"
                    :issues="props.data.issues"
                    :search-open="searchOpen"
                    @search="$emit('search', $event)"
                    @refresh="$emit('refresh')"
                />
                <JiraSectionHeader
                    v-else-if="props.data.isHeader"
                    :jira-group="props.data"
                    :focused="props.data.id === selectedId"
                    @collapse="$emit('collapse', $event)"
                    @focusmouse.native="handleMouseEnter(props.data)"
                />
                <JiraIssue
                    v-else
                    :ref="props.data.id"
                    :issue="props.data"
                    :minimal="isNarrowView"
                    :focused="props.data.id === selectedId"
                    @focusmouse.native="handleMouseEnter(props.data)"
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
import { throttle } from '~/helpers';
import JiraPageHeader from '~/components/integrations/jira/JiraPageHeader.vue';
import JiraSectionHeader from '~/components/integrations/jira/JiraSectionHeader.vue';
import JiraIssue from '~/components/integrations/jira/issue/JiraIssue.vue';
import { VirtualJiraHeight } from '~/components/integrations/jira/constants';
import { TabSymbols } from '~/constants/symbols';
import { PANEL_DETACH_WIDTH } from '~/constants';
import JiraNotificationBanner from '~/components/integrations/jira/JiraNotificationBanner.vue';
import { JiraIntegrationDataType } from '~/constants/jira';

const throttledByFps = throttle(requestAnimationFrame);
let jiraListResizeObserver: any = null;
@Component({
    name: 'JiraVirtualList',
    components: {
        JiraNotificationBanner,
        JiraIssue,
        JiraSectionHeader,
        JiraPageHeader,
    },
})
export default class JiraVirtualList extends Vue {
    @Prop({ default: () => [] })
    flatJiraList!: any[];

    @Prop({
        default: false,
    })
    collapsible!: boolean;

    @Prop({
        default: false,
    })
    collapsed!: boolean;

    @InjectReactive(TabSymbols.TAB_WIDTH)
    tabWidth!: number;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    width: number = 0;
    listWidth: number = 0;
    height: number = 0;
    $refs!: {
        jiraListContent: HTMLElement;
        virtualCollection: HTMLElement;
        pageHeader: JiraPageHeader;
    } & Record<string, HTMLElement> & { [key: string]: JiraIssue };

    get isNarrowView() {
        return this.tabWidth < PANEL_DETACH_WIDTH;
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get searchOpen() {
        return this.tabData.searchOpen;
    }

    private selectionIndex = 2;
    lastMousePos: any = { x: null, y: null, usingMouse: false };

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

    isInViewport() {
        const item = this.flatJiraListData[this.selectionIndex].data;
        const scrollOffset =
            this.$refs.jiraListContent.firstElementChild!.scrollTop;
        const elementHeight = this.$refs.jiraListContent.scrollHeight;
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
        const item = this.flatJiraListData[this.selectionIndex].data;
        if (!item) return;
        const elementHeight = this.$refs.jiraListContent.scrollHeight;
        if (this.selectionIndex < 4) {
            this.scrollTo(0, 'instant');
            return;
        }

        if (this.selectionIndex > this.flatJiraListData.length - 3) {
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
        this.$refs.jiraListContent?.firstElementChild?.scrollTo({
            top,
            behavior,
        });
    }

    selectedId = '';
    columnSize = 1;

    getNextViableIndex(index: number, bias: number, group: boolean = false) {
        let validIndex = index;
        const currentIdExists = this.flatJiraListData.some(
            ({ data }) => data?.id === this.selectedId,
        );
        const isValidIndex = (i: number) => {
            return i >= 1 && i < this.flatJiraListData.length;
        };
        if (index === this.flatJiraListData.length) {
            return this.flatJiraListData.length - 1;
        }
        if (
            !currentIdExists &&
            isValidIndex(index) &&
            this.flatJiraListData[validIndex].data.isSelectable
        ) {
            return index;
        }
        if (validIndex >= this.flatJiraListData.length) {
            validIndex = this.flatJiraListData.length - 1;
            if (this.flatJiraListData[validIndex].data.isSelectable)
                return validIndex;
        }

        const currentGroup = this.flatJiraListData[validIndex].data.groupId;

        while (isValidIndex(validIndex)) {
            validIndex += bias;
            if (!isValidIndex(validIndex)) break;
            const entity = this.flatJiraListData[validIndex].data;
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
                    -this.columnSize,
                    group,
                );
                offset = 0;
                break;
            case 'ArrowDown':
                this.selectionIndex = this.getNextViableIndex(
                    this.selectionIndex,
                    this.columnSize,
                    group,
                );
                offset = 1;
                break;
        }
        const data = this.flatJiraListData[this.selectionIndex]?.data;
        if (!data) return;
        this.selectedId = data.id;
        this.scroll(offset);
    }

    @Watch('flatJiraListData.length')
    findNewSelectionIndex() {
        if (!this.selectedId) {
            this.selectionIndex = this.getNextViableIndex(2, 1);
            return;
        }
        const newIndex = this.flatJiraListData.findIndex(
            ({ data }) => data.id === this.selectedId,
        );

        if (newIndex < 0) {
            this.selectionIndex = this.getNextViableIndex(
                this.selectionIndex,
                this.selectionIndex >= this.flatJiraListData.length ? -1 : 1,
            );
            if (!this.flatJiraListData[this.selectionIndex]?.data) return;
            this.selectedId =
                this.flatJiraListData[this.selectionIndex].data.id;
            return;
        }

        this.selectionIndex = newIndex;
    }

    get flatJiraListData(): any[] {
        let data = this.flatJiraList;
        if (this.collapsible) {
            const collapsed = this.$store.getters['panel/collapsed'];
            data = data.filter(item => {
                return item.isHeader || !collapsed[item.groupId];
            });
        }
        return data.map((data: any, index: number) => {
            data.index = index;
            return { data };
        });
    }

    get retrieveHeight() {
        return Math.max(this.height, 0);
    }

    cellSizeAndPositionGetterList(item: any, index: number) {
        const itemHeight =
            this.$config.platform === 'mobile'
                ? VirtualJiraHeight.ITEM_MOBILE
                : VirtualJiraHeight.ITEM_DESKTOP;
        const width =
            this.$config.platform === 'mobile' ? this.width : this.width;
        const gutter = this.$config.platform === 'mobile' ? 0 : 40;
        return {
            width: width - gutter,
            height: item.data.height ?? itemHeight,
            x: 0,
            y: item.data.y ?? index * itemHeight,
            style: {
                'z-index': item.data.pageHeader
                    ? this.flatJiraList.length - index
                    : 0,
            },
        };
    }

    resizeListener() {
        if (!this.$refs.jiraListContent) return;
        throttledByFps(() => {
            this.width = this.$refs.jiraListContent.offsetWidth;
            this.listWidth = this.$refs.jiraListContent.offsetWidth;
            this.height = this.$refs.jiraListContent.offsetHeight;
        });
    }

    removeShortcuts() {
        const availableShortcuts = this.$shortcutsManager.availableShortcuts;
        this.$shortcutsManager.removeShortcut(
            this.$shortcutsManager.availableShortcuts.OPEN_JIRA_SEARCH,
        );
        this.$shortcutsManager.removeShortcut(availableShortcuts.JIRA_UP);
        this.$shortcutsManager.removeShortcut(availableShortcuts.JIRA_DOWN);
    }

    registerShortcuts() {
        const availableShortcuts = this.$shortcutsManager.availableShortcuts;
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.OPEN_JIRA_SEARCH,
            () => {
                this.$refs.jiraListContent?.firstElementChild?.scrollTo({
                    top: 0,
                });
                const searchOpen = this.$store.getters['tabs/byId'](this.tabId)
                    ?.data?.searchOpen;
                if (
                    searchOpen &&
                    this.$refs.pageHeader?.$refs.jiraSearch?.searchOpen
                ) {
                    this.$refs.pageHeader?.$refs.jiraSearch?.focus();
                    return;
                }
                this.$store.dispatch('tabs/updateTabData', {
                    tabId: this.tabId,
                    data: {
                        searchOpen: !searchOpen,
                    },
                });
            },
        );

        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_UP,
            () => {
                this.$refs.pageHeader?.blurSearchWithoutClose();
                this.handleArrows('ArrowUp');
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_DOWN,
            () => {
                this.$refs.pageHeader?.blurSearchWithoutClose();
                this.handleArrows('ArrowDown');
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_COLLAPSE,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (!entity.isHeader) return;
                this.$emit('collapse', entity.id);
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_LABELS,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (entity.type !== JiraIntegrationDataType.ISSUE) return;

                this.$refs?.[entity.id]?.openLabelsDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_STATUS,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (entity.type !== JiraIntegrationDataType.ISSUE) return;
                this.$refs?.[entity.id]?.openStatusDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_ASSIGNEE,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (entity.type !== JiraIntegrationDataType.ISSUE) return;
                this.$refs?.[entity.id]?.openAssigneeDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_PRIORITY,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (entity.type !== JiraIntegrationDataType.ISSUE) return;
                this.$refs?.[entity.id]?.openPriorityDropdown();
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_PREVIEW,
            () => {
                const entity = this.flatJiraListData[this.selectionIndex]?.data;
                if (!entity || entity.id !== this.selectedId) {
                    return;
                }

                if (entity.type === JiraIntegrationDataType.ISSUE) {
                    this.$refs?.[entity.id]?.openIssueModal();
                    return;
                }
                this.$nuxt.$emit(`${this.tabId}-issue-preview`);
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_CREATE_PAGE,
            () => {
                this.$nuxt.$emit(`${this.tabId}-issue-page`);
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_GROUP_UP,
            () => {
                this.$refs.pageHeader?.blurSearchWithoutClose();
                this.handleArrows('ArrowUp', true);
            },
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.JIRA_GROUP_DOWN,
            () => {
                this.$refs.pageHeader?.blurSearchWithoutClose();
                this.handleArrows('ArrowDown', true);
            },
        );
    }

    get selectionIndexIsCorrect() {
        const item = this.flatJiraList.find(
            item => item.id === this.selectedId,
        );
        return this.selectionIndex === item?.index;
    }

    @Watch('selectionIndexIsCorrect')
    onSelectionIndexWrong(newVal: any) {
        if (!newVal) {
            this.selectionIndex = this.flatJiraList.find(
                item => item.id === this.selectedId,
            )?.index;
        }
    }

    beforeDestroy() {
        if (jiraListResizeObserver) {
            jiraListResizeObserver.disconnect();
        }
        this.removeShortcuts();
    }

    mounted() {
        this.removeShortcuts();
        this.$shortcutsManager.enableNamespace('editor-inactive');
        this.registerShortcuts();
        this.resizeListener();
        jiraListResizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.jiraListContent) {
            jiraListResizeObserver.observe(this.$refs.jiraListContent);
        }
    }
}
</script>
<style lang="scss" scoped>
.offset-left {
    padding-left: 34px;
}

.jira-list {
    height: 100%;
    width: 100%;
    overflow: hidden;

    :deep(.cell-container) {
        //padding-right: 10px;
        &:has(> .cell) {
            z-index: 1;
        }
    }

    &--placeholder {
        padding-top: 14px;
        //padding-right: 10px;
    }

    &.collapsed {
        padding-bottom: 10px;
    }

    &--wrapper {
        @include scrollbar;
        overflow-x: hidden;
        position: relative;
        padding: 0 20px;

        .mobile & {
            padding: 0;
        }

        &--todo {
            &--dragarea {
                padding-bottom: 25px;
            }
        }

        &--transition-group {
            position: relative;
        }

        :deep(.vue-virtual-collection-container) {
            margin: 0 auto;
        }
    }
}
</style>
