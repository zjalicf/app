<template>
    <div
        ref="tabsContent"
        class="tabs-content"
        :class="{
            'tabs-content__resizing': isDragging,
            'tabs-content__single': isSingleTab,
        }"
    >
        <TabGroupDisplay
            v-for="(groupId, index) in tabGroupsIds"
            :id="groupId"
            :ref="`tabGroup-${groupId}`"
            :key="groupId"
            class="group"
            :style="getTabStyle(index)"
            @drag:mousedown="handleMouseDown(index, $event)"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TabGroupHeader from '~/components/tabs/TabGroupHeader.vue';
import SidebarControls from '~/components/header/app-header/SidebarControls.vue';
import TabGroupDisplay from '~/components/tabs/TabGroupDisplay.vue';
import { MIN_TAB_WIDTH } from '~/plugins/tabs/tabs';
import { TabGroup } from '~/@types/app';
import { throttle } from '~/helpers';

const throttledByFps = throttle(requestAnimationFrame);

@Component({
    name: 'TabsContent',
    components: {
        TabGroupDisplay,
        SidebarControls,
        TabGroupHeader,
    },
})
export default class TabsContent extends Vue {
    tabWidths: number[] = [];
    tabWidthsOriginal: number[] = [];
    initialX: number | null = null;
    offsetX: number | null = null;
    mouseOut: boolean = false;
    draggedTabIndex: number | null = null;
    leftIndex: number = -1;
    startRight: number = -1;
    startLeft: number = -1;
    rightIndex: number = -1;
    prevX: number = 0;
    lastValidOffset: any = null;

    $refs!: {
        tabsContent: HTMLDivElement;
    } & Record<string, Vue>;

    get tabGroups() {
        return this.tabGroupsIds.map((groupId: string) =>
            this.$store.getters['tabs/groupById'](groupId),
        );
    }

    get tabGroupsIds() {
        return this.$store.getters['tabs/sortedGroupsIds'];
    }

    get activeGroupId() {
        return this.$store.getters['tabs/activeTabGroupId'];
    }

    get isDragging() {
        return !!this.tabWidths.length;
    }

    get isSingleTab() {
        return this.$store.getters['tabs/singleTabOpen'];
    }

    get allWidths() {
        return this.tabGroupsIds.map((groupId: string) =>
            this.$store.getters['tabs/groupWidth'](groupId),
        );
    }

    get getTabStyle() {
        // 'flex-grow': group.width

        return (index: number) => {
            if (!this.tabWidths.length) {
                return {
                    flex: `${
                        this.allWidths[index] || 100 / this.tabGroupsIds.length
                    } 0 0`,
                };
            }

            return {
                width: `${this.tabWidths[index]}px`,
                flex: '0 0 auto',
            };
        };
    }

    loadInitialWidths() {
        this.tabWidths = this.tabGroupsIds.map((id: string) => {
            // @ts-ignore
            return (this.$refs[`tabGroup-${id}`][0].$el as HTMLDivElement)
                .offsetWidth;
        });

        this.tabWidthsOriginal = [...this.tabWidths];
    }

    removeEventListeners() {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.initialX = null;
        this.offsetX = null;
        this.draggedTabIndex = null;
        this.tabWidths = [];
        this.tabWidthsOriginal = [];
        this.leftIndex = -1;
        this.rightIndex = -1;
        this.startLeft = -1;
        this.startRight = -1;
        this.prevX = 0;
        this.lastValidOffset = null;
    }

    registerEventListeners() {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseDown(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.registerEventListeners();
        this.initialX = event.pageX;
        this.prevX = event.pageX;
        this.offsetX = 0;
        this.leftIndex = index;
        this.startLeft = index;
        this.startRight = index + 1;
        this.rightIndex = index + 1;
        this.lastValidOffset = null;
        this.loadInitialWidths();
    }

    handleMouseUp() {
        const total = this.tabWidths.reduce((acc: number, val: number) => {
            return acc + val;
        }, 0);

        const tabWidths = [...this.tabWidths];

        this.tabGroups.forEach(({ id }: TabGroup, index: number) => {
            return this.$tabs.setTabGroupWidth(
                id,
                Math.round((tabWidths[index] / total) * 1000000) / 10000,
            );
        });

        this.removeEventListeners();
    }

    handleMouseMove(event: MouseEvent) {
        if (this.mouseOut || this.initialX === null) return;
        const moveHandler = () => {
            if (
                this.leftIndex === -1 ||
                this.rightIndex === -1 ||
                this.rightIndex > this.tabWidths.length - 1
            )
                return;

            const movedBy = event.pageX - this.prevX;
            if (this.lastValidOffset) {
                const { offset, side } = this.lastValidOffset;
                const mod = side === 'left' ? -1 : 1;
                const isReverseMove = movedBy * mod < 0;
                const didMoveEnough = (event.pageX - offset) * mod < 0;
                if (!isReverseMove || !didMoveEnough) {
                    this.prevX = event.pageX;
                    return;
                }
                this.lastValidOffset = null;
            }

            const left = this.leftIndex;
            const right = this.rightIndex;

            this.resizeTabs(movedBy, left, right);
            this.prevX = event.pageX;
        };

        throttledByFps(moveHandler);
    }

    resizeTabs(offset: number, left: number, right: number) {
        const moveDirection = offset > 0 ? 'right' : 'left';
        const availableMoveToRight = this.tabWidths
            .slice(this.rightIndex, this.tabWidths.length)
            .reduce((acc, width) => {
                return acc + (width - MIN_TAB_WIDTH);
            }, 0);
        const availableMoveToLeft =
            this.tabWidths.slice(0, this.leftIndex + 1).reduce((acc, width) => {
                return acc + (width - MIN_TAB_WIDTH);
            }, 0) * -1;

        if (moveDirection === 'right' && offset > availableMoveToRight) {
            this.setLastValidOffset(
                this.prevX + availableMoveToRight,
                moveDirection,
            );
            offset = Math.max(availableMoveToRight, 0);
        }
        if (moveDirection === 'left' && offset < availableMoveToLeft) {
            this.setLastValidOffset(
                this.prevX + availableMoveToLeft,
                moveDirection,
            );
            offset = Math.min(0, availableMoveToLeft);
        }

        if (offset === 0) return;
        this.resizeToSide(offset, left, 'left');
        this.resizeToSide(offset, right, 'right');
    }

    resizeToSide(offset: number, index: number, side: 'left' | 'right'): void {
        if (index === -1 || index === this.tabWidths.length) {
            return;
        }
        if (side === 'left' && index > this.startLeft) return;
        if (side === 'right' && index < this.startRight) return;

        const mod = side === 'left' ? 1 : -1;
        const oldWidth = this.tabWidths[index];
        const newWidth = oldWidth + offset * mod;
        const isNotStart =
            side === 'right' ? index > this.startRight : index < this.startLeft;

        if (oldWidth === MIN_TAB_WIDTH && newWidth < MIN_TAB_WIDTH) {
            return this.resizeToSide(offset, index + mod * -1, side);
        }

        if (
            oldWidth === this.tabWidthsOriginal[index] &&
            newWidth > this.tabWidthsOriginal[index] &&
            isNotStart
        ) {
            return this.resizeToSide(offset, index + mod, side);
        }

        if (oldWidth > MIN_TAB_WIDTH && newWidth <= MIN_TAB_WIDTH) {
            const newOffset = offset - (oldWidth - MIN_TAB_WIDTH) * mod * -1;
            this.tabWidths.splice(index, 1, MIN_TAB_WIDTH);
            return this.resizeToSide(newOffset, index + mod * -1, side);
        }

        if (
            oldWidth < this.tabWidthsOriginal[index] &&
            newWidth >= this.tabWidthsOriginal[index] &&
            isNotStart
        ) {
            const newOffset =
                offset - (this.tabWidthsOriginal[index] - oldWidth) * mod;
            this.tabWidths.splice(index, 1, this.tabWidthsOriginal[index]);
            return this.resizeToSide(newOffset, index + mod, side);
        }

        this.tabWidths.splice(index, 1, newWidth);
        this.setResizeIndex(side, index);
    }

    setResizeIndex(side: string, index: number) {
        if (side === 'left') {
            this.leftIndex = index;
        }
        if (side === 'right') {
            this.rightIndex = index;
        }
    }

    setLastValidOffset(offset: number, side: string) {
        if (this.lastValidOffset) return;

        this.lastValidOffset = {
            offset,
            side,
        };
    }

    beforeDestroy() {
        this.removeEventListeners();
    }
}
</script>

<style lang="scss" scoped>
.tabs-content {
    @include scrollbar;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 7px;
    padding: 8px;
    margin-top: -8px;

    &__resizing {
        overflow-x: hidden;
    }
}
</style>
