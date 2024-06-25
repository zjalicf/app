<template>
    <div class="task-notification" @mouseover="resetTimeout">
        <div class="task-notification__header">
            <div class="task-notification__header__title">
                {{ text }}
            </div>

            <div class="task-notification__header__close">
                <button @click="closeNotification">
                    <InterfaceDelete1 class="icon" size="8" />
                </button>
            </div>
        </div>
        <div
            v-if="
                action !== TaskActions.DELETE &&
                action !== TaskActions.DELETE_MULTIPLE
            "
            class="task-notification__footer"
        >
            <button v-if="action === TaskActions.CONVERT" @click="callCallback">
                Add
            </button>
            <button v-else @click="showTask">Show Task</button>
            <div v-if="shortcutKeybind" class="task-notification__shortcut">
                <TooltipKeys
                    :keybind="
                        $shortcutsManager.keybinds[shortcutKeybind].keybind
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
import { TabType, TaskActions } from '~/constants';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceTimeClockCircleAlternate from '~/components/streamline/InterfaceTimeClockCircleAlternate.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import { ITask } from '~/components/task/model';
import { formatRelativeToDate } from '~/helpers';
import NotificationMixin from '~/components/notifications/NotificationMixin.vue';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';

@Component({
    name: 'TaskNotification',
    computed: {
        TaskActions() {
            return TaskActions;
        },
    },
    components: {
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
    task!: ITask;

    @Prop({ default: null })
    markId!: string | null;

    @Prop({ default: null })
    page!: string | null;

    @Prop({ default: null })
    shortcutKeybind!: SHORTCUTS_ALIASES | null;

    timeout: any = null;

    get text() {
        switch (this.action) {
            case TaskActions.CREATE:
                return 'Task has been created';
            case TaskActions.SCHEDULE:
                return `Task scheduled for ${formatRelativeToDate(
                    this.task,
                    startOfDay(new Date()),
                    false,
                    this.$store.getters['appSettings/dateTimeOptions'],
                )}`;
            case TaskActions.DELETE:
                return 'Task deleted';
            case TaskActions.DELETE_MULTIPLE:
                return 'Tasks deleted';
            case TaskActions.CONVERT:
                return 'Convert to task';
            default:
                return '';
        }
    }

    async callCallback() {
        await this.callback();
        this.$emit('close', this.markId);
    }

    showTask() {
        this.$entities.task.showInContext(this.task);
    }

    closeNotification() {
        this.$emit('close', this.markId);
    }
}
</script>
<style lang="scss" scoped>
.task-notification {
    @include frostedGlassBackground;
    padding: 10px 10px 10px 14px;
    width: 250px;
    border-radius: 12px;
    cursor: default;
    user-select: none;
    position: relative;

    &:not(:last-of-type) {
        margin-bottom: 10px;
    }

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
            color: var(--notification-header-color);
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

                .doc-icon {
                    margin-right: 4px;
                }

                p {
                    @include ellipsis;
                }
            }
        }
    }
}
</style>
