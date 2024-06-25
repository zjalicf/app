<template>
    <node-view-wrapper
        :id="attrs.id"
        ref="wrapper"
        as="div"
        class="task-item-content"
        :class="{
            'cursor-over': dateDropdownOpen,
            mobile: $utils.isMobile,
            'read-only': !editor.isEditable,
        }"
    >
        <div class="task-item-content__check" contenteditable="false">
            <InterfaceArrowsSynchronize v-if="isRecurrent" />
            <TaskCheckbox
                v-else
                :checked="isCompleted"
                @checked="onCompleted(!attrs.completed)"
            />
        </div>
        <div ref="taskWrapper">
            <node-view-content
                :id="attrs.id"
                ref="task"
                style="
                    width: fit-content;
                    max-width: 100%;
                    overflow-wrap: break-word;
                "
                as="p"
                class="task-item-content__content"
                :contenteditable="editor.isEditable"
            />
        </div>
        <div
            ref="date"
            class="task-item-content__date"
            contenteditable="false"
            :class="{
                wrapped: shouldWrapDate,
                'has-date': hasDate,
                hidden: !hasContent || !editor.isEditable,
            }"
        >
            <button
                v-if="hasDate"
                :ref="`task-date-${attrs.id}`"
                contenteditable="false"
                class="task-item-content__date--is-set"
                :class="{
                    open: dateDropdownOpen,
                    'read-only': !editor.isEditable,
                }"
                @mousedown.prevent.stop="
                    $utils.isMobile ? showDateDropdown() : null
                "
                @click.prevent.stop="
                    $utils.isMobile ? null : showDateDropdown()
                "
            >
                <span>{{ formattedDate }}</span>
            </button>
            <button
                v-else-if="!$utils.isMobile"
                :ref="`task-date-${attrs.id}`"
                contenteditable="false"
                :class="{ open: dateDropdownOpen }"
                @click.prevent.stop="showDateDropdown"
            >
                <InterfaceCalendar class="icon" />
            </button>
        </div>
    </node-view-wrapper>
</template>
<script lang="ts">
import {
    NodeViewContent,
    nodeViewProps,
    NodeViewProps,
    NodeViewWrapper,
    VueRenderer,
} from '@tiptap/vue-2';

import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import {
    createPopper,
    Instance as PopperInstance,
    VirtualElement,
} from '@popperjs/core';
import scrollIntoView from 'scroll-into-view';
import { add, startOfDay } from 'date-fns';
import TaskDateSuggestion from '~/components/editor/extensions/task-item/TaskDateSuggestion.vue';
import { formatRelativeToDate } from '~/helpers';
import TaskCheckbox from '~/components/editor/extensions/task-item/TaskCheckbox.vue';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import InterfaceSettingMenuVertical from '~/components/streamline/InterfaceSettingMenuVertical.vue';
import { ITask } from '~/components/task/model';
import TaskDatePickerDropdown from '~/components/task/TaskDatePickerDropdown.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceTimeClockCircle from '~/components/streamline/InterfaceTimeClockCircle.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import MobileTaskDatePicker from '~/components/mobile/common/dropdown/MobileTaskDatePicker.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

let scroll: any = null;

const createPopup = (
    parent: VirtualElement,
    component: HTMLElement,
    width: number,
) => {
    return createPopper(parent, component, {
        placement: 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [width, 20],
                },
            },
        ],
    });
};

@Component({
    name: 'TaskItemComponent',
    components: {
        InterfaceArrowsSynchronize,
        InterfaceTimeClockCircle,
        InterfaceCalendar,
        InterfaceSettingMenuVertical,
        InterfaceSettingMenuHorizontal,
        TaskCheckbox,
        NodeViewWrapper,
        NodeViewContent,
    },
    props: nodeViewProps,
})
export default class TaskItemComponent extends Vue {
    node!: NodeViewProps['node'];
    editor!: NodeViewProps['editor'];
    extension!: NodeViewProps['extension'];
    updateAttributes!: NodeViewProps['updateAttributes'];
    getPos!: NodeViewProps['getPos'];
    popperVirtualParent: VirtualElement | null = null;
    popper: PopperInstance | null = null;
    popperComponent: VueRenderer | null = null;
    dateDropdownOpen: boolean = false;
    hasContent: boolean = false;

    shouldWrapDate: boolean = false;
    taskElement!: HTMLElement | null;
    taskHTML: string = '<span></span>';
    selected: boolean = false;

    $refs!: {
        task: any;
        date: HTMLElement;
        wrapper: HTMLElement;
        content: any;
        dummy: any;
        taskWrapper: HTMLDivElement;
    };

    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Inject({
        from: TabSymbols.UPDATE_TAB_DATA,
        default: () => {},
    })
    updateTabData!: (data: Record<string, any>) => void;

    get sourceMeta(): TrackingActionSourceMeta | null {
        const tab = this.$store.getters['tabs/byId'](this.tabId);

        if (!tab) return null;

        return tab.type === TabType.MY_DAY
            ? TrackingActionSourceMeta.MY_DAY
            : TrackingActionSourceMeta.PAGE;
    }

    @Watch('node.content', { immediate: true })
    async handleNodeContentChange(val: any) {
        this.hasContent = this.taskHasContent(val.content);
        await this.$nextTick();
        this.taskElement = this.$refs.taskWrapper;
        await this.$nextTick();
        if (!this.taskElement) return;
        this.taskHTML = this.taskElement.innerHTML;
        this.recalculateDatePlacement();
    }

    get classList() {
        return this.$el?.classList;
    }

    taskHasContent(content: any[]) {
        return (
            content.length > 0 &&
            content.some(node => {
                return node.type.name !== 'text' || node.text.trim().length > 0;
            })
        );
    }

    @Watch('classList', { immediate: true, deep: true })
    handleClassListChange() {
        if (!this.classList) return;
        this.selected = this.classList.contains('has-focus');
    }

    @Watch('attrs.suggestion')
    handleSuggestion() {
        const selectionFrom = this.editor.state.selection.$from;
        if (selectionFrom.parent.attrs.id !== this.attrs.id) {
            this.destroyPopper();
            return;
        }
        if (!this.attrs.suggestion) {
            this.destroyPopper();
            return;
        }
        if (!this.popper) {
            this.createPopper();
            return;
        }
        this.updatePopper();
    }

    get attrs() {
        return this.node.attrs;
    }

    get formattedAttrs(): Partial<ITask> {
        return {
            ...this.attrs,
            start: this.$entities.task.parseStoredDate(this.attrs.start),
            end: this.$entities.task.parseStoredDate(this.attrs.end),
        };
    }

    get isRecurrent() {
        return !!this.attrs.rrule;
    }

    get isCompleted() {
        return this.attrs.completed;
    }

    get tabType() {
        const id = this.tabId as string;
        if (!id) return 'Unknown';
        if (!id) return 'Unknown';
        const tab = this.$entities.tab.byId(id);
        if (!tab) {
            return 'Unknown';
        }
        return tab.type;
    }

    get hasDate() {
        return (
            !!this.$entities.task.parseStoredDate(this.attrs.start) ||
            (!!this.$entities.task.parseStoredDate(this.attrs.start) &&
                !!this.$entities.task.parseStoredDate(this.attrs.end))
        );
    }

    get formattedDate() {
        return formatRelativeToDate(
            this.formattedAttrs as ITask,
            new Date(),
            false,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    onCompleted(value: boolean) {
        if (!this.editor.isEditable) return;
        if (value === this.attrs.completed) return;
        this.updateEditorAttributes({
            completed: value,
        });
        this.$entities.task.updateTask({
            id: this.attrs.id,
            completed: value,
        });

        if (value) {
            this.$tracking.trackEventV2(TrackingType.TASK, {
                action: TrackingAction.COMPLETE,
                source: TrackingActionSource.EDITOR,
                sourceMeta: this.sourceMeta,
            });
        }
    }

    destroyPopper() {
        if (!this.popper) return;
        const parent = document.getElementById('popper-container');
        if (!parent) return;
        parent.removeChild(this.popperComponent!.element);
        this.popper.destroy();
        this.popper = null;
        this.popperVirtualParent = null;
        this.popperComponent = null;
    }

    updatePopper() {
        this.popperVirtualParent!.getBoundingClientRect = this.cursorCoords();
        this.popper!.update();
        this.popperComponent?.updateProps({
            suggestion: {
                ...this.attrs.suggestion,
                label: formatRelativeToDate(this.attrs.suggestion, new Date()),
            },
        });
    }

    createPopper() {
        this.popperVirtualParent = {
            getBoundingClientRect: this.cursorCoords(),
        };
        this.popperComponent = new VueRenderer(TaskDateSuggestion, {
            propsData: {
                suggestion: {
                    ...this.attrs.suggestion,
                    label: formatRelativeToDate(
                        this.attrs.suggestion,
                        new Date(),
                    ),
                },
                command: (commandData: any) => {
                    this.$tracking.trackEvent('task', {
                        action: 'accept-suggestion',
                    });

                    this.editor.commands.command(({ tr }) => {
                        const pos = this.getPos();
                        tr.setNodeMarkup(pos, null, {
                            ...this.attrs,
                            start: commandData.start
                                ? this.$entities.task.parseDateToAttribute(
                                      commandData.start,
                                  )
                                : null,
                            end: commandData.end
                                ? this.$entities.task.parseDateToAttribute(
                                      commandData.end,
                                  )
                                : null,
                            rrule: commandData.rrule ?? null,
                            suggestion: null,
                        });
                        return true;
                    });
                    // @ts-ignore
                    this.editor.commands.acceptSuggestion(commandData.id);
                },
                onClose: () => {
                    this.destroyPopper();
                },
            },
        });
        const parent = document.getElementById('popper-container');
        if (!parent) return;
        parent.appendChild(this.popperComponent.element);
        this.popper = createPopup(
            this.popperVirtualParent,
            this.popperComponent.element as HTMLElement,
            0,
        );
    }

    currentCoords = {
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    } as DOMRect;

    cursorCoords(width = 0, height = 0) {
        return (): DOMRect => {
            const pos = this.editor.state.selection.$from.pos;
            const coords = this.editor.view.coordsAtPos(pos);
            if (Object.values(coords).every(value => value === 0)) {
                return this.currentCoords as DOMRect;
            }
            this.currentCoords = {
                width,
                height,
                ...coords,
            } as any;
            return this.currentCoords as DOMRect;
        };
    }

    updateEditorAttributes(attrs: Record<string, any>) {
        this.updateAttributes({
            ...this.attrs,
            ...attrs,
        });
    }

    showDateDropdown() {
        if (this.$utils.isMobile) {
            this.showMobileDateDropdown();
            return;
        }
        this.dateDropdownOpen = true;
        // this is not reactive. Right now it works, because we close the picker after selecting a date
        // BUT, if we didn't do that, it wouldn't update the task.
        // If we ever come here again, we should just pass formattedAttrs to the functions
        const task = this.formattedAttrs;
        const isFromPage =
            this.$store.getters['document/taskMap'][this.attrs.id];

        const data = {
            taskData: {
                id: this.attrs.id,
                draft: true,
                timed: true,
            },
        };

        this.updateTabData(data);

        this.$dropdown.show({
            name: 'task-date-picker',
            component: TaskDatePickerDropdown,
            // @ts-ignore
            parent: this.$refs[`task-date-${this.attrs.id}`],
            retainFocus: true,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 0],
                        },
                    },
                ],
            },
            bind: {
                taskId: task.id,
                allowClear: true,
            },
            on: {
                today: () => {
                    if (!isFromPage) this.$dropdown.hideAll();
                    const dateTimeObj = this.$entities.task.setToDate(
                        task,
                        new Date(),
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setToday(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_TODAY,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                tomorrow: () => {
                    if (!isFromPage) this.$dropdown.hideAll();
                    const dateTimeObj = this.$entities.task.setToDate(
                        task,
                        add(new Date(), { days: 1 }),
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setTomorrow(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_TOMORROW,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                'next-week': () => {
                    if (!isFromPage) this.$dropdown.hideAll();
                    const dateTimeObj =
                        this.$entities.task.setDateToNextWeek(task);
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setNextWeek(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_NEXT_WEEK,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                select: (date: Date) => {
                    if (!isFromPage) this.$dropdown.hideAll();
                    const dateTimeObj = this.$entities.task.setToDate(
                        task,
                        date,
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setDate(task, date, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_DATE,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                'pick-time': ({ start, end }: { start: Date; end: Date }) => {
                    const dateTimeObj =
                        this.$entities.task.createDateTimeObject(task, {
                            start,
                            end,
                        });
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end,
                        ),
                    });
                    this.$entities.task.setTime(
                        task,
                        {
                            start,
                            end,
                        },
                        { origin: 'editor', tabType: this.tabType },
                    );

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.SET_TIME,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                'clear-time': () => {
                    const dateTimeObj = this.$entities.task.clearDateTime(task);
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end,
                        ),
                    });
                    this.$entities.task.clearTime(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });

                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.CLEAR_TIME,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });
                },
                recurrence: (rrule: string | null) => {
                    this.updateEditorAttributes({
                        rrule,
                    });
                    this.$entities.task.setRecurrence(task, rrule);

                    if (rrule) {
                        this.$tracking.trackEventV2(TrackingType.TASK, {
                            action: TrackingAction.SET_RECURRENCE,
                            source: TrackingActionSource.EDITOR,
                            sourceMeta: this.sourceMeta,
                        });
                    }
                },
                clear: () => {
                    this.$tracking.trackEventV2(TrackingType.TASK, {
                        action: TrackingAction.CLEAR_DATE,
                        source: TrackingActionSource.EDITOR,
                        sourceMeta: this.sourceMeta,
                    });

                    this.updateEditorAttributes({
                        rrule: null,
                        start: null,
                        end: null,
                    });
                    this.$entities.task.clearDate(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
            },
            onClose: () => {
                this.updateTabData({ taskData: {} });
                this.dateDropdownOpen = false;
                this.editor.commands.focus();
            },
        });
    }

    async showMobileDateDropdown() {
        this.editor?.commands.blur();
        await this.$utils.mobile.closeKeyboard();
        await this.$pane.show({
            component: MobileTaskDatePicker,
            bind: {
                taskId: this.formattedAttrs.id,
            },
            type: 'fullscreen',
            options: {
                initialBreak: 'top',
                showDraggable: false,
                buttonDestroy: true,
                fastSwipeClose: true,
            },
            on: {
                today: () => {
                    const task = this.formattedAttrs;
                    const dateTimeObj = this.$entities.task.setToDate(
                        task,
                        new Date(),
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setToday(task, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                tomorrow: () => {
                    const dateTimeObj = this.$entities.task.setToDate(
                        this.formattedAttrs,
                        startOfDay(add(new Date(), { days: 1 })),
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setTomorrow(this.formattedAttrs, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                'next-week': () => {
                    const dateTimeObj = this.$entities.task.setDateToNextWeek(
                        this.formattedAttrs,
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setNextWeek(this.formattedAttrs, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                select: (date: Date) => {
                    const task = this.formattedAttrs;
                    const dateTimeObj = this.$entities.task.setToDate(
                        task,
                        date,
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start!,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end!,
                        ),
                    });
                    this.$entities.task.setDate(task, date, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                'pick-time': ({
                    start,
                    end,
                }: {
                    start: Date;
                    end: Date | null;
                }) => {
                    const dateTimeObj =
                        this.$entities.task.createDateTimeObject(
                            this.formattedAttrs,
                            {
                                start,
                                end,
                            },
                        );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end,
                        ),
                    });
                    this.$entities.task.setTime(
                        this.formattedAttrs,
                        {
                            start,
                            end,
                        },
                        { origin: 'editor', tabType: this.tabType },
                    );
                },
                'clear-time': () => {
                    const dateTimeObj = this.$entities.task.clearDateTime(
                        this.formattedAttrs,
                    );
                    this.updateEditorAttributes({
                        start: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.start,
                        ),
                        end: this.$entities.task.parseDateToAttribute(
                            dateTimeObj.end,
                        ),
                    });
                    this.$entities.task.clearTime(this.formattedAttrs, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                recurrence: (rrule: string | null) => {
                    this.updateEditorAttributes({
                        rrule,
                    });
                    this.$entities.task.setRecurrence(
                        this.formattedAttrs,
                        rrule,
                    );
                },
                clear: () => {
                    this.updateEditorAttributes({
                        rrule: null,
                        start: null,
                        end: null,
                    });
                    this.$entities.task.clearDate(this.formattedAttrs, {
                        origin: 'editor',
                        tabType: this.tabType,
                    });
                },
                close: () => {
                    this.$pane.hide();
                },
            },
        });
    }

    registerFocusHandler() {
        this.$nuxt.$on(`focus-task:${this.attrs.id}`, () => {
            if (scroll) {
                scroll();
                scroll = null;
            }
            scroll = scrollIntoView(
                this.$refs.task?.$el,
                {
                    time: 100,
                },
                () => {
                    // focus node editor
                    this.editor.commands.focusEnd(this.attrs.id);
                },
            );
        });
    }

    async recalculateDatePlacement() {
        await this.$nextTick();
        const taskContent = this.taskElement;
        const dateElement = this.$refs?.date;
        const hidden = this.$refs?.task?.$el;

        if (!taskContent || !dateElement || !hidden || !hidden.firstChild) {
            return;
        }
        this.taskElement!.style.height = ''.concat(
            `${hidden.scrollHeight}`,
            'px',
        );
        const containerRect = taskContent.getBoundingClientRect();

        const editorWidth = this.editor.view.dom.offsetWidth - 6;
        const elementWidth = dateElement.offsetWidth + 32;
        const lineHeight = 26;

        let lastHiddenChild = hidden.lastChild as HTMLElement;
        while (lastHiddenChild && lastHiddenChild.hasChildNodes()) {
            lastHiddenChild = lastHiddenChild.lastChild as HTMLElement;
        }

        const getLastCharRect = () => {
            try {
                return lastHiddenChild.getBoundingClientRect();
            } catch {
                const text = lastHiddenChild.textContent;
                const range = document.createRange();
                range.setStart(lastHiddenChild, text?.length ?? 0);
                range.setEnd(lastHiddenChild, text?.length ?? 0);
                return range.getBoundingClientRect();
            }
        };

        const lastCharRect = getLastCharRect();

        this.shouldWrapDate =
            Math.ceil(lastCharRect.left - containerRect.left) >=
            editorWidth - elementWidth;

        if (this.shouldWrapDate) {
            taskContent.style.height = ''.concat(
                `${hidden.scrollHeight + lineHeight}`,
                'px',
            );
        }

        const left = this.shouldWrapDate
            ? 0
            : lastCharRect.left - containerRect.left;

        const top = this.shouldWrapDate
            ? lastCharRect.top - containerRect.top + lineHeight
            : lastCharRect.top - containerRect.top;

        dateElement.style.top = `${top}px`;
        dateElement.style.left = `${left}px`;
    }

    delayedRecalculate() {
        this.$nextTick(() => this.recalculateDatePlacement());
    }

    registerResizeHandler() {
        this.$nuxt.$on('tab-resize', this.delayedRecalculate);
    }

    unregisterResizeHandler() {
        this.$nuxt.$off('tab-resize', this.delayedRecalculate);
    }

    registerMobileListeners() {
        this.$nuxt.$on(
            `task-mobile-dropdown-${this.attrs.id}`,
            this.showMobileDateDropdown,
        );
    }

    unregisterMobileListeners() {
        this.$nuxt.$off(
            `task-mobile-dropdown-${this.attrs.id}`,
            this.showMobileDateDropdown,
        );
    }

    beforeDestroy() {
        this.$nuxt.$off(`focus-task:${this.attrs.id}`);
        this.unregisterResizeHandler();
        this.unregisterMobileListeners();
        this.destroyPopper();
    }

    mounted() {
        this.registerFocusHandler();
        if (this.$utils.isMobile) {
            this.registerMobileListeners();
            return;
        }
        this.registerResizeHandler();
    }
}
</script>

<style scoped lang="scss">
.task-item-content {
    display: grid;
    align-items: baseline;
    width: 100%;
    position: relative;
    grid-template-columns: 26px 1fr max-content;
    padding-left: 2px;

    &:not(.mobile) {
        &.cursor-over:not(.read-only),
        &:hover:not(.read-only) {
            background: var(--task-bg-color__hover);
            border-radius: 8px;

            .task-item-content__date {
                visibility: visible;
            }
        }
    }

    &__hidden {
        @include font-body;
        left: 26px;
        position: absolute;
        min-width: 4px;
        resize: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
        line-height: 26px;
        visibility: hidden;
    }

    &__content {
        width: 100%;
        min-width: 4px;
        padding-left: 0;

        :deep(.ProseMirror) {
            a {
                color: red;
                word-break: break-all !important;
            }
        }
    }

    &__check {
        margin-left: 4px;
        transform: translateY(2px);
    }

    &__date {
        visibility: hidden;

        &.hidden {
            visibility: hidden;
        }

        &--is-set {
            visibility: visible;
            padding: 5px 6px !important;
        }

        position: absolute;
        white-space: nowrap;
        color: var(--accent-color);
        cursor: default;
        line-height: 16px;
        align-items: center;
        transform: translateX(32px) translateY(-3px);

        &.wrapped {
            transform: translateX(22px) translateY(-3px);
        }

        .icon {
            color: var(--task-icon-color);
        }

        button {
            padding: 6px;
            border-radius: 6px;

            &:hover:not(.read-only) {
                background: var(--task-bg-color__hover);
            }
            &.open {
                background: var(--task-bg-color__focused);
            }
        }
    }

    &__mobile-date {
        white-space: nowrap;
        color: var(--task-icon-color);
        border-radius: 50%;

        line-height: 16px;
        align-items: center;
        padding: 6px;
        background: var(--task-bg-color__focused);

        &.has-date {
            color: var(--accent-color);
        }
    }
}
</style>
