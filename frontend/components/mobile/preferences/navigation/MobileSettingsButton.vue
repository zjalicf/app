<template>
    <button class="mobile-settings-button" :class="{ active }" @click="onClick">
        <slot />
    </button>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'MobileSettingsButton',
})
export default class MobileSettingsButton extends Vue {
    active: boolean = false;
    onClick(event: MouseEvent) {
        this.active = true;
        this.$emit('click', event);
        setTimeout(() => {
            this.active = false;
        }, 150);
    }
}
</script>
<style lang="scss" scoped>
.mobile-settings-button {
    @include animateBackgroundColor;
    user-select: none;
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    width: 100%;
    padding: 6px 16px;

    background: var(--mobile-pane-button-bg-color);
    color: var(--mobile-pane-button-text-color);

    &:not(:last-child) {
        border-bottom: 1px solid var(--mobile-pane-border-color);
    }

    &.center {
        justify-content: center;
    }

    &.active:not(.disabled) {
        background: var(--mobile-pane-button-bg-color__active);
    }

    &.danger {
        color: var(--danger-color) !important;
        justify-content: center;

        .icon {
            color: var(--danger-color) !important;
        }

        &.active:not(.disabled) {
            @include frostedGlassButton;

            .icon {
                color: var(
                    --mobile-pane-button-danger-icon-color__hover
                ) !important;
            }

            color: var(
                --mobile-pane-button-danger-text-color__hover
            ) !important;
            background: var(
                --mobile-pane-button-danger-bg-color__hover
            ) !important;
        }
    }

    &:first-of-type {
        border-top-right-radius: 12px;
        border-top-left-radius: 12px;
    }

    &:last-of-type {
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
    }

    &__title {
        @include ellipsis;
        padding: 10px 0;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        letter-spacing: -0.24px;
        display: flex;
        align-items: center;
    }

    &__value {
        color: $blueGrey400;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__icon {
        color: $blueGrey300;
        flex-shrink: 0;
    }
}
</style>
