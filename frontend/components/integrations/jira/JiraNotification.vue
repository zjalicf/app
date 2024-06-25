<template>
    <div class="jira-notification" @mouseover="resetTimeout">
        <div class="jira-notification__header">
            <div class="jira-notification__header__title">
                {{ text }}
            </div>

            <div class="jira-notification__header__close">
                <button @click="closeNotification">
                    <InterfaceDelete1 class="icon" size="8" />
                </button>
            </div>
        </div>
        <div class="jira-notification__footer">
            <button @click="redirect">
                Show
                <span
                    ><JiraIcon class="icon" size="14" />
                    <p>{{ entityKey }} {{ entityText }}</p></span
                >
            </button>
            <div v-if="shortcutKeybind" class="jira-notification__shortcut">
                <TooltipKeys
                    :keys="
                        formatKeys(
                            $shortcutsManager.keybinds[shortcutKeybind].keybind,
                        ).split('+')
                    "
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { startOfDay } from 'date-fns';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import { JiraActions, TaskActions } from '~/constants';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceTimeClockCircleAlternate from '~/components/streamline/InterfaceTimeClockCircleAlternate.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import { formatRelativeToDate } from '~/helpers';
import NotificationMixin from '~/components/notifications/NotificationMixin.vue';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraNotification',
    computed: {
        TaskActions() {
            return TaskActions;
        },
    },
    components: {
        JiraIcon,
        TooltipKeys,
        InterfaceDeleteBin1,
        InterfaceTimeClockCircleAlternate,
        DocumentIcon,
        InterfaceDeleteCircle,
        InterfaceDelete1,
        InterfaceValidationCheckCircle,
        InterfaceValidationCheck,
    },
})
export default class TaskNotification extends NotificationMixin {
    @Prop({
        required: true,
    })
    entityId!: string;

    @Prop({ default: null })
    shortcutKeybind!: SHORTCUTS_ALIASES | null;

    @Prop({ default: '' })
    property!: string;

    timeout: any = null;
    entity: any = null;

    get entityText() {
        return this.entity?.text ?? '';
    }

    get entityKey() {
        return this.entity?.key ?? '';
    }

    mounted() {
        this.entity = this.$store.getters['integrationData/byId'](
            this.entityId,
        );
    }

    get text() {
        switch (this.action) {
            case JiraActions.UPDATE:
                return this.property.length > 0
                    ? `${this.property} updated`
                    : 'Issue updated';
            case JiraActions.CLIP:
                return 'Issue linked to Page';
            case JiraActions.UNCLIP:
                return 'Issue unlinked';
            case JiraActions.SCHEDULE:
                return `Issue scheduled for ${formatRelativeToDate(
                    this.entity,
                    startOfDay(new Date()),
                    false,
                    this.$store.getters['appSettings/dateTimeOptions'],
                )}`;
            default:
                return '';
        }
    }

    formatKeys(keys: string) {
        if (this.$config.os === 'mac' && keys.includes('meta')) {
            keys = keys.replace('meta', 'cmd');
        }
        if (this.$config.os !== 'mac' && keys.includes('meta')) {
            keys = keys.replace('meta', 'ctrl');
        }
        return keys[0];
    }

    async callCallback() {
        await this.callback();
    }

    closeNotification() {
        this.$emit('close');
    }

    redirect() {
        this.closeNotification();

        this.$entities.jira.openModal(
            this.entity,
            TrackingActionSource.NOTIFICATION,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-notification {
    @include frostedGlassBackground;
    padding: 10px 10px 10px 14px;
    margin-bottom: 10px;
    width: 250px;
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
            width: 100%;
            padding-left: 4px;
            color: var(--notifications-header-color);
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
        display: flex;
        justify-content: space-between;
        align-items: center;

        button {
            @include font12-500;
            max-width: 100%;
            overflow: hidden;
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
                overflow: hidden;

                .icon {
                    flex-shrink: 0;
                }

                p {
                    @include ellipsis;
                }
            }
        }
    }
}
</style>
