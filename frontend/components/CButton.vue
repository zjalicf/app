<template>
    <button
        class="c-button"
        :class="[
            active ? 'active' : null,
            type,
            size,
            loading ? 'loading' : null,
        ]"
        :disabled="disabled"
        :tabindex="tabindex"
        @click="$emit('click', $event)"
    >
        <LoadingIcon v-if="loading" size="14" class="loading-icon" />
        <slot />
    </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    components: { LoadingIcon },
})
export default class VButton extends Vue {
    @Prop()
    href!: string;

    @Prop()
    disabled!: boolean;

    @Prop({
        default: 'primary',
    })
    type!: string;

    @Prop({
        default: 0,
    })
    tabindex!: number;

    @Prop({
        default: '',
    })
    size!: string;

    @Prop({
        default: false,
    })
    active!: boolean;

    @Prop({
        default: '',
    })
    link!: boolean;

    @Prop({
        default: false,
    })
    loading!: boolean;
}
</script>

<style lang="scss" scoped>
.c-button {
    @include font12-500;
    padding: 6px 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    outline: none;
    position: relative;

    .loading-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    &:disabled {
        opacity: 0.4;
    }

    &:focus {
        outline: none;
    }

    &.primary {
        background: var(--c-button-primary-bg-color);
        color: var(--c-button-primary-text-color);
        box-shadow: 0px 1px 2px var(--c-button-box-shadow);

        &.loading {
            color: rgba(0, 0, 0, 0);
        }

        .loading-icon {
            color: var(--c-button-primary-text-color);
        }

        &:not(:disabled):hover {
            background: var(--c-button-primary-bg-color__hover);
        }
    }

    &.tertiary {
        padding: 6px 12px 6px 6px;
        color: var(--c-button-tertiary-text-color);
        line-height: 18px;

        &.loading {
            color: rgba(0, 0, 0, 0);
        }

        .loading-icon {
            color: var(--c-button-tertiary-text-color);
        }

        svg {
            margin-right: 4px;
        }

        &.small {
            font-size: 11px;
            padding: 5px 6px 3px 7px;

            svg {
                margin-right: 4px;
            }
        }

        &:not(:disabled):hover {
            outline: none;
            background: var(--c-button-tertiary-bg-color);
            color: var(--c-button-tertiary-text-color__hover);

            svg {
                fill: var(--c-button-tertiary-text-color__hover);
            }
        }
    }

    &.secondary {
        background: var(--c-button-secondary-bg-color);
        color: var(--c-button-secondary-text-color);
        box-shadow: 0px 1px 2px var(--c-button-box-shadow);

        &.loading {
            color: rgba(0, 0, 0, 0);
        }

        .loading-icon {
            color: var(--c-button-secondary-text-color);
        }

        &:not(:disabled):hover {
            background: var(--c-button-secondary-bg-color__hover);
        }
    }

    &.text {
        padding: 6px;

        &:not(:disabled):hover {
            background: var(--c-button-text-bg-color__hover);
            color: var(--c-button-text-text-color__hover);
        }

        &.active {
            background: var(--c-button-text-bg-color__hover);
            color: var(--c-button-text-text-color__hover);
        }
    }

    svg {
        margin-right: 10px;
    }

    &.full-width {
        width: 100%;
        text-align: center;
        justify-content: center;
    }

    &.danger {
        background: var(--c-button-danger-bg-color);
        color: var(--c-button-danger-text-color);
        box-shadow: 0px 1px 2px var(--c-button-box-shadow);

        &:not(:disabled):hover {
            background: var(--c-button-danger-bg-color__hover);
            color: var(--c-button-danger-text-color__hover);
        }
    }
}
</style>
