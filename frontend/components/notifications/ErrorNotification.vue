<template>
    <div class="error-notification" @mouseover="resetTimeout">
        <div class="error-notification__header">
            <div class="error-notification__header__title">
                <InterfaceDeleteCircle class="icon" size="14" /> {{ text }}
            </div>
            <div class="error-notification__header__close">
                <button @click="closeNotification">
                    <InterfaceDelete1 class="icon" size="8" />
                </button>
            </div>
        </div>
        <div class="error-notification__footer">
            <button
                v-if="action === NotificationActions.REDIRECT"
                @click="callCallback"
            >
                {{ actionText ?? 'Show' }}
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceTimeClockCircleAlternate from '~/components/streamline/InterfaceTimeClockCircleAlternate.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import NotificationMixin from '~/components/notifications/NotificationMixin.vue';
import { NotificationActions } from '~/constants';

@Component({
    name: 'ErrorNotification',
    computed: {
        NotificationActions() {
            return NotificationActions;
        },
    },
    components: {
        InterfaceDeleteBin1,
        InterfaceTimeClockCircleAlternate,
        DocumentIcon,
        InterfaceDeleteCircle,
        InterfaceDelete1,
        InterfaceValidationCheckCircle,
        InterfaceValidationCheck,
    },
})
export default class ErrorNotification extends NotificationMixin {
    @Prop({
        required: true,
    })
    displayText!: string;

    @Prop({
        default: null,
    })
    actionText!: string;

    get text() {
        return this.displayText;
    }

    callCallback() {
        this.callback();
        this.$emit('close');
    }

    closeNotification() {
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.error-notification {
    @include frostedGlassBackground;
    padding: 10px 10px 10px 14px;
    margin-bottom: 10px;
    width: 350px;
    border-radius: 12px;
    cursor: default;
    user-select: none;
    position: relative;

    &__header {
        display: grid;
        grid-template-columns: 1fr 16px;
        align-items: center;

        &__icon {
            padding-top: 4px;

            .danger {
                color: var(--danger-color);
            }
        }

        &__title {
            @include font12-500;
            display: flex;
            align-items: flex-start;
            width: 100%;
            padding-left: 4px;
            color: var(--notification-header-color);

            .icon {
                margin-right: 8px;
                margin-left: -4px;
                flex-shrink: 0;
                color: var(--danger-color);
            }
        }

        &__close {
            button {
                position: absolute;
                top: 4px;
                right: 4px;
                padding: 8px;
                color: var(--notification-button-text-color);

                &:hover {
                    color: var(--notification-button-text-color__hover);
                }
            }
        }
    }

    &__footer {
        button {
            @include font12-500;
            color: var(--accent-color);
            padding: 2px 4px;
            border-radius: 6px;
            text-align: start;
            display: flex;
            align-items: center;

            &:hover {
                @include frostedGlassButtonAlternate;
            }

            span {
                margin-left: 4px;
                display: flex;
                align-items: center;

                .doc-icon {
                    margin-right: 4px;
                }
            }
        }
    }
}
</style>
