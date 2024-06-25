<template>
    <div v-show="!hidden && items.length">
        <transition name="fade-move">
            <div
                v-if="(items.length > 0 || query.length > 0) && show"
                class="items"
                :class="{ mobile: isMobile }"
            >
                <button
                    v-for="(item, index) in labels"
                    :key="index"
                    class="item"
                    :class="{ active: index === selectedIndex }"
                    @click.prevent.stop="selectItem(index)"
                    @mouseover="selectIndex(index)"
                >
                    {{ item }}
                </button>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { ILabel } from '~/@types';

@Component({
    name: 'LabelSuggestions',
})
export default class LabelSuggestions extends Vue {
    show: boolean = false;
    hidden: boolean = false;
    selectedIndex: number = 0;

    @Prop()
    items!: ILabel[];

    @Prop()
    query!: string;

    @Prop()
    command!: (commandData: any) => void;

    @Watch('items')
    onItemsChanged() {
        this.selectedIndex = 0;
    }

    get labels(): (ILabel & { new: boolean })[] {
        return [...this.items] as any;
    }

    get isMobile() {
        return window.$nuxt.$utils.isMobile;
    }

    onHide() {
        this.hidden = true;
    }

    onShow() {
        this.hidden = false;
    }

    onKeyDown({ event }: any) {
        if (event.key === 'ArrowUp') {
            if (this.hidden || !this.items.length) return false;
            this.selectIndex(
                (this.selectedIndex + this.labels.length - 1) %
                    this.labels.length,
            );
            return true;
        }
        if (event.key === 'ArrowDown') {
            if (this.hidden || !this.items.length) return false;
            this.selectIndex((this.selectedIndex + 1) % this.labels.length);
            return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
            if (this.hidden || !this.items.length) return false;
            if (this.items.length) {
                this.selectItem(this.selectedIndex);
                return true;
            }
            if (this.query.length) {
                this.command({ id: v4(), name: this.query });
            }
            return true;
        }
        return false;
    }

    selectIndex(index: number) {
        this.selectedIndex = index;
    }

    selectItem(index: number) {
        const item = this.labels[index];
        if (item) {
            this.command(item);
        }
    }

    mounted() {
        this.show = true;
    }
}
</script>

<style lang="scss" scoped>
.items {
    @include frostedGlassBackground;
    @include contextMenu(168px);

    &.mobile {
        @include contextMenu(280px);

        button {
            padding: 10px 10px 10px 15px;
        }
    }
}
</style>
