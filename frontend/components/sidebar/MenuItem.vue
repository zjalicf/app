<template>
    <div :class="[dragging ? 'dragging' : null]" class="menu-item">
        <div class="menu-item__top">
            <div class="menu-item__icon">
                <div
                    class="menu-item__icon__front"
                    :style="{
                        'background-color': color,
                        padding: color ? '5px' : '0px',
                    }"
                >
                    <slot name="icon" />
                </div>
                <div class="menu-item__icon__small">
                    <slot name="small-icon" />
                </div>
                <div
                    class="menu-item__icon__backdrop"
                    :class="{ 'menu-item__icon__backdrop--emoji': !color }"
                    :style="{ color: color }"
                >
                    <slot name="icon" />
                </div>
            </div>
            <div class="title">
                <slot name="data" />
            </div>
        </div>
        <div class="name">
            <slot name="title" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MenuItem extends Vue {
    @Prop({
        default: false,
    })
    dragging!: boolean;

    @Prop({
        default: '#626F83',
    })
    color!: string;
}
</script>

<style lang="scss" scoped>
.menu-item {
    @include font12-500;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;

    padding: 8px 12px 3px;
    border-radius: 12px;
    user-select: none;
    color: var(--sidebar-text-color);

    width: 100%;
    height: 100%;

    background: var(--sidebar-bg-color);

    overflow: hidden;

    &.is-dragging:not(.droppable) {
        opacity: 0.5;
    }

    &.highlight {
        color: var(--sidebar-text-color__active);
        background: var(--sidebar-bg-color__active);

        .menu-item__icon {
            color: var(--sidebar-menu-icon-color);
        }

        .menu-item__icon__backdrop {
            display: block;
            filter: blur(10px) brightness(var(--sidebar-menu-brightness))
                saturate(1.2);

            &--emoji {
                filter: blur(10px) brightness(var(--sidebar-menu-brightness))
                    saturate(0.5);
            }
        }

        &.focused {
            background: var(--sidebar-bg-color__active__hover);
        }
    }

    &:hover:not(.is-dragging),
    &:hover.droppable {
        color: var(--sidebar-text-color__hover);
        background: var(--sidebar-bg-color__hover);

        .menu-item__icon {
            color: var(--sidebar-menu-icon-color);
        }

        &.highlight {
            background: var(--sidebar-bg-color__active__hover);
        }
    }

    &__top {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__icon {
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;

        &__front {
            flex-shrink: 0;
            color: var(--sidebar-menu-icon-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            z-index: 1;
        }

        &__small {
            -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
            backdrop-filter: blur(12px); /* Chrome and Opera */
            flex-shrink: 0;
            color: var(--sidebar-menu-small-icon-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            z-index: 1;
            padding: 3px;
            background: var(--sidebar-menu-small-icon-bg-color);
            bottom: -4px;
            right: -4px;

            &:empty {
                display: none;
            }
        }

        &__backdrop {
            position: absolute;
            z-index: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(4);
            display: none;
        }
    }

    .name {
        @include ellipsis;
        max-width: 100%;
        position: relative;
    }

    .title {
        position: relative;

        button {
            padding: 5px;
            transform: translate(5px, -5px);

            .dismiss-icon {
                color: var(--sidebar-app-placeholder-dismiss-color);
            }

            &:hover {
                .dismiss-icon {
                    color: var(--sidebar-app-placeholder-dismiss-color__hover);
                }
            }
        }
    }
}
</style>
