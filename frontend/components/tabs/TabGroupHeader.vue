<template>
    <div
        class="tab-group-header"
        @dragover="$emit('header:dragover')"
        @mousewheel="onScroll"
    >
        <draggable
            v-if="groupCount > 1 || tabs.length > 1"
            v-model="tabs"
            class="tab-group-header__header"
            v-bind="barDragOptions"
            :move="onMove"
            @start="dragStart"
            @end="dragEnd"
        >
            <Tab
                v-for="tab in tabs"
                :ref="`tab-${tab.id}`"
                :key="tab.id"
                :tab="tab"
                :active="tab.id === activeTabId"
                :group-id="group.id"
                :group-active="active"
            />
        </draggable>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Tab from '~/components/tabs/Tab.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';

@Component({
    name: 'TabGroupHeader',
    components: {
        InterfaceAdd1,
        Tab,
        draggable: () => import('vuedraggable'),
    },
})
export default class TabGroupHeader extends Vue {
    @Prop({
        required: true,
    })
    id!: string;

    @Prop({
        required: true,
    })
    active!: boolean;

    @Prop({ required: true })
    groupCount!: number;

    get group() {
        return this.$store.getters['tabs/groupByIdWithoutTabs'](this.id);
    }

    highlightedElement: any = null;

    $refs!: {
        [key: string]: any;
        tabs: any;
    };

    onScroll(event: WheelEvent) {
        if (this.$refs.tabs) {
            this.$refs.tabs.$el.scrollLeft = Math.min(
                this.$refs.tabs.$el.scrollLeft + Math.floor(event.deltaY),
                this.$refs.tabs.$el.scrollWidth,
            );
        }
    }

    onMove(evt: any, _ogEvt: any) {
        // if (this.highlightedElement) {
        //     this.highlightedElement.classList.remove('show');
        // }
        // this.highlightedElement = evt.to;
        // this.highlightedElement.classList.add('show');
    }

    get barDragOptions() {
        return {
            animation: 200,
            group: { name: 'bar', pull: true, put: ['bar'] },
            disabled: false,
            ghostClass: 'ghost',
            dragClass: 'dragged-tab',
        };
    }

    dragEnd(evt: any) {
        this.$store.dispatch('tabs/clearDraggingInfo');
    }

    get dragging() {
        return this.draggingInfo.isDragging;
    }

    get draggingInfo() {
        return this.$store.getters['tabs/draggingInfo'];
    }

    get tabs() {
        return this.$store.getters['tabs/groupTabs'](this.id);
    }

    set tabs(tabs: any[]) {
        const { originGroup, draggedTab } = this.draggingInfo;
        this.$store.dispatch('tabs/setDraggingInfo', {
            isDragging: false,
        });

        const isSameGroup =
            originGroup.id === this.group?.id || !this.group?.id;
        const tabInGroup = tabs.some(
            tab =>
                tab.id === draggedTab.id ||
                tab.entityId === draggedTab.entityId,
        );
        const tabIndex = tabs.findIndex(
            tab =>
                tab.id === draggedTab.id ||
                tab.entityId === draggedTab.entityId,
        );
        const previousIndex = originGroup.tabs.findIndex(
            (tab: any) =>
                tab.id === draggedTab.id ||
                tab.entityId === draggedTab.entityId,
        );

        if (isSameGroup && !tabInGroup) {
            return;
        }
        if (isSameGroup) {
            const modifier = previousIndex < tabIndex ? 1 : 0;
            this.$store.commit('tabs/updateTabOrder', {
                tab: draggedTab,
                groupId: this.group?.id,
                index: tabIndex + modifier,
            });
            return;
        }
        this.$store.dispatch('tabs/move', {
            tab: draggedTab,
            source: originGroup,
            destination: this.group,
            index: tabIndex,
        });

        this.$tabs.recalculateAllTabs();
        this.$tabs.addMoveTabToHistory(
            draggedTab,
            originGroup,
            this.group,
            tabIndex,
        );
    }

    get activeTabId() {
        return this.group.activeTab;
    }

    get activeTab() {
        return this.$store.getters['tabs/byId'](this.activeTabId);
    }

    dragStart(event: any) {
        this.$store.dispatch('tabs/setDraggingInfo', {
            isDragging: true,
            draggedTab: this.tabs[event.oldIndex],
            originGroup: { ...this.group, tabs: this.tabs },
        });
    }
}
</script>
<style lang="scss" scoped>
.tab-group-header {
    user-select: none;

    &__header {
        @include scrollbar(0px, 0px, 4px, 2px);
        width: 100%;
        display: flex;
        align-items: center;
        overflow: overlay;
        padding-bottom: 6px;
        border-radius: 8px;
    }
}
</style>
