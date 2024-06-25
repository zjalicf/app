<template>
    <transition name="fade-move">
        <div v-if="items.length > 0" class="inline-task-suggestions">
            <span class="inline-task-suggestions__title">SUGGESTED TIME</span>
            <div class="inline-task-suggestions__items">
                <button
                    v-for="(item, index) in items"
                    :key="index"
                    class="item"
                    :class="{ active: index === selectedIndex }"
                    @click="selectItem(index)"
                    @mouseover="selectIndex(index)"
                >
                    <InterfaceCalendar class="icon" />
                    {{ item.label }}
                </button>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';

@Component({
    name: 'TaskDateSuggestions',
    components: { InterfaceCalendar },
})
export default class TaskDateSuggestion extends Vue {
    @Prop()
    suggestion!: any;

    show: boolean = false;
    hidden: boolean = false;

    mounted() {
        this.show = true;
        this.$nuxt.$on(`suggestion-${this.suggestion.id}:select`, () => {
            this.command(this.suggestion);
        });
        this.$nuxt.$on(`suggestion-${this.suggestion.id}:close`, () => {
            this.onClose();
        });
    }

    get items(): any[] {
        return [this.suggestion] as any;
    }

    @Prop()
    command!: (commandData: any) => void;

    @Prop()
    onClose!: () => void;

    selectedIndex: number = 0;

    @Watch('items')
    onItemsChanged() {
        this.selectedIndex = 0;
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
                (this.selectedIndex + this.items.length - 1) %
                    this.items.length,
            );
            return true;
        }
        if (event.key === 'ArrowDown') {
            if (this.hidden || !this.items.length) return false;
            this.selectIndex((this.selectedIndex + 1) % this.items.length);
            return true;
        }
        if (event.key === 'Enter') {
            if (this.hidden || !this.items.length) return false;
            if (this.items.length) {
                this.selectItem(this.selectedIndex);
                return true;
            }
            return true;
        }
        return false;
    }

    selectIndex(index: number) {
        this.selectedIndex = index;
    }

    selectItem(index: number) {
        const item = this.items[index];
        if (item) {
            this.command(item);
        }
    }
}
</script>

<style lang="scss" scoped>
.inline-task-suggestions {
    @include frostedGlassBackground;
    @include contextMenu(206px);
    z-index: 100;

    &__title {
        @include font10-700;
        padding: 4px 12px;
    }

    &__items {
        margin-top: 4px;
    }
}
</style>
