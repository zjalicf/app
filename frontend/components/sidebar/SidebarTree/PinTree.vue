<template>
    <div class="sidebar-group" :style="{ '--depth': level }">
        <div
            v-for="(item, index) in treeItems"
            :key="item.id"
            class="sidebar-item"
        >
            <div
                v-show="showBefore(item.id, index)"
                class="sidebar-item__cursor sidebar-item__cursor--before"
                :class="{ root: level === 1 }"
                @mouseup="handleDropBefore(index, item.id)"
            >
                <div class="sidebar-item__cursor__line"></div>
            </div>
            <TreeItem
                :id="item.id"
                :name="item.name"
                :icon="item.icon"
                :status="item.status"
                :is-expanded="false"
                :is-dragging="isDraggingItem(item.id)"
                :is-folder="false"
                :order="item.order"
                :is-selected="isSelected(item.id)"
                :level="1"
                :clip="item.clip"
                @tree-item:dragstart="handleDragStart(item, index, $event)"
            />
            <div
                v-show="showAfter(item.id, index)"
                class="sidebar-item__cursor sidebar-item__cursor--after"
                :class="{ root: level === 1 }"
                @mouseup="handleDropAfter(index, item.id)"
            >
                <div class="sidebar-item__cursor__line"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import isEqual from 'lodash/isEqual';
import TreeItem from './TreeItem.vue';
import { SidebarItem } from '~/@types';

@Component({
    name: 'PinTree',
    components: {
        TreeItem,
    },
})
export default class PinTree extends Vue {
    treeItems: SidebarItem[] = [];

    @Prop({ default: null })
    parentId!: string;

    @Prop({ default: 1 })
    level!: number;

    @Prop({ default: false })
    expanded!: boolean;

    @Prop({ default: () => [] })
    path!: string[];

    $refs!: {} & Record<string, PinTree>;

    showAfter(id: string, index: number) {
        return (
            this.isDragging &&
            !this.isDraggingItem(id) &&
            !this.isDraggedItemAfter(index) &&
            !this.isInPath(this.$store.getters['sidebar/draggedPinItem']?.id)
        );
    }

    showBefore(id: string, index: number) {
        return (
            this.isDragging &&
            !this.isDraggingItem(id) &&
            !this.isDraggedItemBefore(index) &&
            !this.isInPath(this.$store.getters['sidebar/draggedPinItem']?.id)
        );
    }

    @Watch('items')
    handleItemsChange(newValue: SidebarItem[], oldValue: SidebarItem[]) {
        if (isEqual(oldValue, newValue)) {
            return false;
        }

        this.treeItems = newValue;
    }

    get items(): SidebarItem[] {
        return this.$store.getters['document/pinned'];
    }

    get isDragging() {
        return !!this.$store.getters['sidebar/draggedPinItem'];
    }

    get activeProject() {
        return this.$utils.navigation.activeTabEntityId;
    }

    get isDraggedItemBefore() {
        return (index: number) => {
            if (index - 1 < 0) return false;
            return (
                this.$store.getters['sidebar/draggedPinItem']?.id ===
                this.treeItems.at(index - 1)?.id
            );
        };
    }

    get isDraggedItemAfter() {
        return (index: number) => {
            if (index + 1 >= this.treeItems.length) return false;

            return (
                this.$store.getters['sidebar/draggedPinItem']?.id ===
                this.treeItems.at(index + 1)?.id
            );
        };
    }

    get isDraggingItem() {
        return (id: string) =>
            this.$store.getters['sidebar/draggedPinItem']?.id === id;
    }

    isSelected(id: string) {
        return id === this.activeProject;
    }

    handleDropBefore(index: number, selfId: string) {
        const draggedEntity = this.$store.getters['sidebar/draggedPinItem'];
        if (
            !draggedEntity ||
            selfId === draggedEntity.id ||
            this.isInPath(draggedEntity.id)
        )
            return;

        let before = this.treeItems.at(index - 1) ?? { order: 0 };
        const after = this.treeItems.at(index) ?? { order: before.order + 500 };

        if (index - 1 < 0) {
            before = { order: after.order - 500 };
        }

        const newOrder = this.calculateOrder(before.order, after.order);
        this.updateEntity(draggedEntity, newOrder);
    }

    handleDropAfter(index: number, selfId: string) {
        const draggedEntity = this.$store.getters['sidebar/draggedPinItem'];
        if (
            !draggedEntity ||
            selfId === draggedEntity.id ||
            this.isInPath(draggedEntity.id)
        )
            return;

        const before = this.treeItems.at(index) ?? { order: 0 };
        let after = this.treeItems.at(index + 1) ?? {
            order: before.order + 500,
        };
        if (index + 1 >= this.treeItems.length) {
            after = { order: before.order + 500 };
        }

        const newOrder = this.calculateOrder(before.order, after.order);
        this.updateEntity(draggedEntity, newOrder);
    }

    isInPath(id: string) {
        return this.path.includes(id);
    }

    updateEntity(entity: any, order: number) {
        if (entity.type === 'document') {
            this.$store.dispatch('document/update', {
                id: entity.id,
                pinOrder: order,
            });
        }
    }

    calculateOrder(before: number, after: number): number {
        const variation = 0.2;
        const base = 0.5 - variation / 2;
        const rangeModifier = base + Math.random() * variation;
        return before + rangeModifier * (after - before);
    }

    getRefKey(item: any): string {
        return item.id.replace('-', 'g');
    }

    handleDragStart(item: any, index: number, extraData: any) {
        this.$store.commit('sidebar/draggedPinItem', {
            ...item,
            index,
            level: this.level,
            ...extraData,
        });
        this.$nuxt.$emit('sidebar:dragstart', {
            pageX: extraData.pageX,
            pageY: extraData.pageY,
        });
    }

    mounted() {
        this.treeItems = this.items;
    }
}
</script>

<style lang="scss" scoped>
.sidebar {
    &-group {
        &__dragging {
            opacity: 0.3;
        }
    }

    &-item {
        position: relative;

        &__cursor {
            position: absolute;
            right: 0;
            z-index: var(--depth);
            width: calc(100% - calc((var(--depth) - 1) * 26px) - 21px);
            padding: 4px 0;

            &.root {
                width: 100%;
            }

            &:hover {
                .sidebar-item__cursor__line {
                    background: var(--accent-color);
                }
            }

            &__line {
                border-radius: 1px;
                height: 2px;
            }

            &--before {
                top: -6px;
            }

            &--after {
                bottom: -6px;
            }
        }
    }
}
</style>
