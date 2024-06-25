<template>
    <div v-click-outside="closeDropdown" class="c-select">
        <div v-if="open" class="backdrop" @click.stop="closeDropdown"></div>
        <div
            v-if="readOnlyDisable"
            class="c-select--selected"
            :class="{ open }"
            @click="openDropdown"
        >
            <slot :open="open" :close="closeDropdown" />
        </div>
        <div
            v-else
            class="c-select--selected"
            :class="{ open }"
            @click="openDropdown"
        >
            <slot :open="open" :close="closeDropdown" />
        </div>
        <transition name="fade-move">
            <div
                v-if="open"
                class="c-select--menu"
                :class="[position, colorScheme, width]"
            >
                <slot :close="closeDropdown" name="dropdown" />
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ClickOutside from 'vue-click-outside';

@Component({
    directives: {
        ClickOutside,
    },
})
export default class CDropDownSimple extends Vue {
    @Prop()
    options!: any[];

    @Prop()
    value!: any;

    @Prop({
        default: 'left',
    })
    position!: 'left' | 'right' | 'middle' | 'top';

    @Prop({
        default: null,
    })
    colorScheme!: string | null;

    @Prop({
        default: '',
    })
    width!: string;

    @Prop({ default: false })
    readOnlyDisable!: boolean;

    open: boolean = false;

    openDropdown() {
        if (!this.open) {
            this.open = true;
            this.$emit('open');
        } else {
            this.open = false;
            this.$emit('close');
        }
        window.addEventListener('keydown', this.listenForEsc);
    }

    closeDropdown() {
        if (!this.open) return;
        this.open = false;
        this.$emit('close');
    }

    listenForEsc(event: any) {
        if (event.key === 'Escape') {
            this.closeDropdown();
            window.removeEventListener('keydown', this.listenForEsc);
        }
    }
}
</script>

<style scoped lang="scss">
.c-select {
    position: relative;

    .backdrop {
        position: fixed;
        width: 100vw;
        height: var(--viewport-height);
        top: 0;
        left: 0;
    }

    &--selected {
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 13px;
        line-height: 20px;
        color: var(--c-dropdown-simple-selected-text-color);

        &:hover,
        &.open {
            background: var(--c-dropdown-simple-selected-bg-color__hover);
            color: var(--c-dropdown-simple-selected-text-color__hover);
        }

        .icon {
            margin-right: 8px;
        }
    }

    &--menu {
        @include frostedGlassBackground;
        z-index: 10;
        position: absolute;
        border-radius: 8px;
        padding: 8px;
        top: 100%;
        transform-origin: top left;

        &.top {
            left: 0;
            bottom: 100%;
            top: initial;
            transform-origin: bottom left;
        }

        &.left {
            left: 0;
            transform-origin: top right;
        }

        &.right {
            right: 0;
            transform-origin: top left;
        }

        &.bottom {
            bottom: 100%;
            top: auto;
            top: initial;
        }

        &.darker {
            background: var(--c-dropdown-simple-menu-bg-color__darker);
        }

        &.wide {
            width: 216px;
        }

        &.narrow {
            width: 134px;
        }
    }
}
</style>
