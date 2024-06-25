<template>
    <div
        class="task-outer"
        :class="{
            complete: task.completed,
            'in-review': reviewPanel || agenda,
            focused,
            'is-mobile': mobile,
        }"
        :data-task-id="task.id"
        :data-e2e="`task-${task.text}`"
    >
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :offset="`0, 0`"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div
            :class="{
                'mobile-actions-enabled': mobileQuickActions,
                'is-mobile': mobile,
            }"
            class="task"
            @mousedown="handleMouseDown"
            @click="handleOnClick"
        >
            <div
                class="task--content"
                :class="{ 'task--content__mobile': mobile }"
            >
                <div
                    class="task--content--checkbox has-tippy"
                    :data-tippy-content="
                        $shortcutsManager.getShortcutTooltipString(
                            $shortcutsManager.availableShortcuts.TASKS_COMPLETE,
                        )
                    "
                    tabindex="-1"
                    @click.stop.prevent="onCheckboxClick"
                >
                    <button
                        tabindex="-1"
                        class="checkbox"
                        @click.stop.prevent="onCheckboxClick"
                    >
                        <div ref="check"></div>
                    </button>
                </div>
                <div class="task--content--text">
                    <div
                        class="task--content--text--wrapper"
                        :class="{
                            'has-page': selectedPage,
                        }"
                    >
                        <div
                            class="task--content--text--inner has-tippy"
                            :data-tippy-content="`<div class='tooltip task-tooltip'>${$entities.task.getSanitizedTaskText(
                                task.text,
                            )}</div>`"
                            @click="clickLink"
                        >
                            {{ $entities.task.getSanitizedTaskText(task.text) }}
                        </div>
                        <div
                            v-if="showDate && extractDate(task.start)"
                            class="task--content--text--date has-tippy"
                        >
                            {{ formattedDateText }}
                        </div>

                        <button
                            v-if="(reviewPanel || agenda) && selectedPage"
                            class="task--content--text--page"
                            @click.prevent.stop="showInContext"
                        >
                            <DocumentIcon
                                :document="fullSelectedPage"
                                class="icon"
                            />
                            <p>
                                {{ pageTitle }}
                            </p>
                        </button>
                    </div>
                </div>
                <div class="task--actions">
                    <button
                        v-if="formattedDateText && !showDate"
                        :ref="`task-schedule-${task.id}`"
                        :data-e2e="`task-schedule-${task.text}`"
                        class="task--actions--date date has-tippy"
                        :class="{
                            open: scheduleDropdownOpen,
                            recurrent: isRecurrent,
                        }"
                        :data-tippy-content="
                            isRecurrent
                                ? `<div class='tooltip'>Edit Task</div>`
                                : `<div class='tooltip'>Reschedule Task</div>`
                        "
                        @click="showScheduleDropdown"
                    >
                        <div class="task--actions--date--wrapper">
                            <InterfaceArrowsSynchronize
                                v-if="task.recurrentId"
                                class="icon"
                                size="12"
                            />
                            <span v-if="reviewPanel">{{ timeDelta }}</span>
                            <span v-else>{{ formattedDateText }}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    Component,
    Inject,
    Prop,
    Provide,
    Vue,
    Watch,
} from 'vue-property-decorator';
import { formatDistanceStrict, isToday, startOfDay } from 'date-fns';
import { extractDate, formatRelativeToDate, getTaskTimes } from '~/helpers';
// @ts-ignore TODO
import checkInAnimationDark from '@/assets/check-dark-16px-reverse.json';
import checkInAnimationLight from '@/assets/check-light-16px-reverse.json';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import { ThemeOptions } from '~/helpers/date';
import TaskDatePickerDropdown from '~/components/task/TaskDatePickerDropdown.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import { TabSymbols } from '~/constants/symbols';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    methods: { extractDate },
    components: {
        DocumentIcon,
        InterfaceArrowsSynchronize,
    },
})
export default class Task extends Vue {
    animation: any;
    $refs!: {
        optionsButton: HTMLButtonElement;
        check: HTMLElement;
        [key: string]: any;
    };

    timeout: any;

    @Prop()
    task!: any;

    @Prop({
        default: false,
    })
    timeOnly!: boolean;

    @Prop({
        default: false,
    })
    delay!: boolean;

    @Prop({
        default: false,
    })
    agenda!: boolean;

    @Prop({
        default: false,
    })
    focused!: boolean;

    @Prop({ default: false })
    mobileQuickActions!: boolean;

    @Provide()
    editing: boolean = false;

    @Prop({ default: false })
    reviewPanel!: boolean;

    @Prop({ default: false })
    showDate!: boolean;

    @Prop({ default: null })
    source!: TrackingActionSource | null;

    @Inject({
        from: TabSymbols.UPDATE_TAB_DATA,
        default: () => {},
    })
    updateTabData!: (data: Record<string, any>) => void;

    scheduleDropdownOpen: boolean = false;

    get labels() {
        return this.task.labels || [];
    }

    get mobile() {
        return this.$utils.isMobile;
    }

    get timeDelta() {
        const now = startOfDay(new Date());

        const taskStart = startOfDay(
            this.task!.start.date ?? this.task!.start.dateTime,
        );

        if (!taskStart) return '';

        if (isToday(taskStart)) {
            return 'today';
        }

        return `${formatDistanceStrict(taskStart, now, { unit: 'day' })} ago`;
    }

    get selectedPage() {
        if (this.task.recurrentId) {
            const parentTask = this.$store.getters[
                'tasks/recurringParentByRecurringId'
            ](this.task.recurrentId);

            return this.$store.getters['document/taskMap'][parentTask.id];
        }

        const isMyDayTask = this.$store.getters['document/dailyDocsByTaskId'](
            this.task.id,
        );
        if (isMyDayTask.length) {
            return isMyDayTask[0].id;
        }
        return this.$store.getters['document/taskMap'][this.task.id];
    }

    get fullSelectedPage() {
        return this.$store.getters['document/byId'](this.selectedPage);
    }

    get pageTitle() {
        if (this.fullSelectedPage.dailyDoc) {
            return 'My Day';
        }
        return this.fullSelectedPage.title ?? 'Untitled';
    }

    get trackingSource(): TrackingActionSource | undefined {
        let source;
        if (this.source) {
            source = this.source;
        } else if (this.reviewPanel) {
            source = TrackingActionSource.OVERDUE;
        } else if (this.agenda) {
            source = TrackingActionSource.AGENDA;
        }

        return source;
    }

    showInContext() {
        this.$entities.task.showInContext(this.task, this.trackingSource);
    }

    clickLink(event: MouseEvent) {
        // @ts-ignore
        if (event.target?.tagName === 'A') {
            event.stopPropagation();
        }
    }

    handleMouseDown(e: MouseEvent) {
        if (this.$utils.isMobile) {
            e.preventDefault();
        }
    }

    get isRecurrent() {
        return !!this.task.recurrentId;
    }

    handleOnClick() {
        this.$dropdown.hideAll();
        this.showInContext();
    }

    get formattedDateText() {
        if (!this.task) return null;
        const now = new Date();
        if (this.timeOnly) {
            return getTaskTimes(
                this.task,
                this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
            );
        }
        if (this.task.recurrentId) {
            const parent = this.$store.getters[
                'tasks/recurringParentByRecurringId'
            ](this.task.recurrentId);
            return formatRelativeToDate(
                parent,
                now,
                true,
                this.$store.getters['appSettings/dateTimeOptions'],
            );
        }
        return formatRelativeToDate(
            this.task,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    async onCheckboxClick() {
        const status = !this.task.completed;
        await this.$entities.task.onCompletedToggle(this.task, this.delay);
        if (status) {
            this.$tracking.trackEventV2(TrackingType.TASK, {
                action: TrackingAction.COMPLETE,
                source: this.trackingSource,
            });
        }
    }

    @Watch('task.completed')
    handleLocalCompleted(newValue: boolean, oldValue: boolean) {
        if (!!newValue === !!oldValue) return;
        if (!newValue) {
            this.animation.playSegments([30, 0], true);
        } else {
            this.animation.playSegments([0, 30], true);
        }
    }

    setToday() {
        if (!this.task) return;
        this.$tracking.trackEventV2(TrackingType.TASK, {
            action: TrackingAction.SET_TODAY,
            source: this.trackingSource,
        });

        this.$entities.task.setToday(this.task, {
            origin: this.reviewPanel
                ? 'review'
                : this.agenda
                ? 'agenda'
                : 'unknown',
        });
    }

    setTomorrow() {
        if (!this.task) return;

        this.$tracking.trackEventV2(TrackingType.TASK, {
            action: TrackingAction.SET_TOMORROW,
            source: this.trackingSource,
        });

        this.$entities.task.setTomorrow(this.task, {
            origin: this.reviewPanel
                ? 'review'
                : this.agenda
                ? 'agenda'
                : 'unknown',
        });
    }

    setNextWeek() {
        if (!this.task) return;

        this.$tracking.trackEventV2(TrackingType.TASK, {
            action: TrackingAction.SET_NEXT_WEEK,
            source: this.trackingSource,
        });

        this.$entities.task.setNextWeek(this.task, {
            origin: this.reviewPanel
                ? 'review'
                : this.agenda
                ? 'agenda'
                : 'unknown',
            agenda: this.agenda,
        });
    }

    showScheduleDropdown(event: MouseEvent) {
        if (this.$utils.isMobile) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        if (this.isRecurrent) {
            this.$entities.task.openRecurrentParent(this.task);
            return;
        }
        this.scheduleDropdownOpen = true;

        if (this.agenda) {
            const data = {
                taskData: {
                    id: this.task.id,
                    draft: true,
                    timed: true,
                },
            };
            this.updateTabData(data);
        }
        this.$dropdown.show({
            name: 'task-date-picker',
            component: TaskDatePickerDropdown,
            parent: this.$refs[`task-schedule-${this.task.id}`],
            retainFocus: true,
            bind: {
                taskId: this.task.id,
                agenda: this.agenda,
                allowClear: this.task.start,
                allowTimePick: !this.reviewPanel,
            },
            on: {
                today: () => this.setToday(),
                tomorrow: () => this.setTomorrow(),
                'next-week': () => this.setNextWeek(),
                select: (date: Date) => {
                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_DATE,
                        source: this.trackingSource,
                    });

                    this.$entities.task.setDate(this.task, date, {
                        origin: this.reviewPanel
                            ? 'review'
                            : this.agenda
                            ? 'agenda'
                            : 'unknown',
                    });
                },
                'pick-time': ({ start, end }: { start: Date; end: Date }) => {
                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_TIME,
                        source: this.trackingSource,
                    });

                    this.$entities.task.setTime(
                        this.task,
                        {
                            start,
                            end,
                        },
                        {
                            origin: this.reviewPanel
                                ? 'review'
                                : this.agenda
                                ? 'agenda'
                                : 'unknown',
                        },
                    );
                },
                'clear-time': () => {
                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.CLEAR_TIME,
                        source: this.trackingSource,
                    });

                    this.$entities.task.clearTime(this.task, {
                        origin: this.reviewPanel
                            ? 'review'
                            : this.agenda
                            ? 'agenda'
                            : 'unknown',
                    });
                },
                clear: () => {
                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.CLEAR_DATE,
                        source: this.trackingSource,
                    });
                    this.$entities.task.clearDate(this.task, {
                        origin: this.reviewPanel
                            ? 'review'
                            : this.agenda
                            ? 'agenda'
                            : 'unknown',
                    });
                },
            },
            onClose: () => {
                if (this.agenda) {
                    this.updateTabData({ taskData: {} });
                }
                this.scheduleDropdownOpen = false;
            },
        });
    }

    async mounted() {
        if (!this.task) return;
        this.editing = this.task.editing as boolean;
        const { default: lottie } = await import('lottie-web');

        this.animation = lottie.loadAnimation({
            // @ts-ignore
            container: this.$refs.check,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData:
                this.$store.getters['appSettings/theme'] === ThemeOptions.DARK
                    ? checkInAnimationDark
                    : checkInAnimationLight,
        });

        if (this.task.completed) {
            this.animation.goToAndStop(30, true);
        }
    }
}
</script>

<style lang="scss" scoped>
.checkbox {
    outline: none !important;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.focused .task {
    background: var(--task-bg-color__focused);
    box-shadow: inset 0px 0px 0px 2px var(--task-box-shadow-color__focused);
}

.context-highlight .task {
    background: var(--task-bg-color_context-menu);
}

.task-outer {
    padding: 8px 8px 0;
    user-select: none;
    -webkit-user-select: none;

    :deep(.task-content-render) {
        @include editorStyling;
    }

    &.is-mobile {
        .task--content--text {
            @include font-body;
        }
    }

    &.in-review {
        .task {
            padding: 0;

            &--content {
                display: grid;
                grid-template-columns: 26px 1fr min-content;
                align-items: center;

                &--checkbox {
                    width: 100%;
                    height: 100%;
                }

                &--text {
                    &--wrapper {
                        display: grid;
                        grid-template-columns: fit-content(100%);

                        &.has-page {
                            grid-template-columns: fit-content(100%) minmax(
                                    94px,
                                    max-content
                                );
                        }
                    }

                    &--inner {
                        @include ellipsis;

                        :deep(.text-label) {
                            color: var(--accent-color);
                        }
                    }

                    &--page {
                        p {
                            @include ellipsis;
                        }

                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: 8px;
                        margin-left: 6px;
                        color: var(--task-page-color);
                        padding: 0 6px;
                        border-radius: 6px;

                        .icon {
                            flex-shrink: 0;
                            color: var(--task-icon-color);
                        }
                    }
                }
            }

            &--actions {
                &--date {
                    padding: 5px 6px 5px 0;
                }
            }
        }
    }

    &.in-review.is-mobile {
        padding: 0px 8px 0 0px;

        .task {
            &--content {
                display: grid;
                grid-template-columns: 38px 1fr min-content;

                &--checkbox {
                    max-width: 38px;
                    height: 38px;
                }

                &--text {
                    &--wrapper {
                        display: flex;
                    }
                }
            }
        }
    }

    &.complete .task .task--content .task--content--text {
        color: var(--task-text-color__completed);

        .task--content--text {
            &--date {
                color: var(--task-text-color__completed);
            }
        }
    }

    .task {
        padding: 3px 6px 3px 3px;
        border-radius: 6px;
        position: relative;
        gap: 6px;
        user-select: none;
        -webkit-user-select: none;

        &:hover {
            background: var(--task-bg-color__focused);
        }

        &.is-mobile {
            padding: 6px 4px;
            margin-bottom: 1px;
        }

        &.mobile-actions-enabled {
            display: flex;
            justify-content: space-between;

            .task--content {
                overflow: hidden;
            }
        }

        &:not(:last-of-type) {
            margin-bottom: 4px;
        }

        &--actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            &--date {
                &:hover,
                &.open {
                    .task--actions--date--wrapper {
                        background: var(--task-bg-color__focused);
                    }
                }

                &--wrapper {
                    white-space: nowrap;
                    color: var(--accent-color);
                    margin-left: 4px;
                    display: flex;
                    align-items: center;
                    border-radius: 6px;
                    padding: 0 6px 1px;

                    .icon {
                        margin-right: 6px;
                        color: var(--task-icon-color);
                    }
                }
            }
        }

        &--content {
            display: flex;
            align-items: stretch;

            &__mobile {
                width: 100%;
            }

            &--checkbox {
                max-width: 26px;
                width: 100%;
                flex-shrink: 0;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 2px;
            }

            &--text {
                @include animateBackgroundColor;
                @include font14-500;
                outline: none;
                color: var(--editor-text-color);
                width: 100%;
                cursor: default;
                min-width: 0;

                &--wrapper {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    overflow-x: hidden;
                }

                &--date {
                    @include animateBackgroundColor;
                    @include font12-500;

                    white-space: nowrap;
                    color: var(--accent-color);
                    margin-left: 4px;

                    display: flex;
                    align-items: center;

                    .icon {
                        margin-left: 6px;
                        color: var(--task-icon-color);
                    }
                }

                span {
                    white-space: nowrap;
                }

                &--inner {
                    @include ellipsis;
                    max-height: 24px;

                    :deep(.text-label) {
                        color: var(--accent-color);
                    }
                }
            }
        }
    }
}
</style>
