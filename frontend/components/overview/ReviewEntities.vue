<template>
    <div class="review-entities">
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
        <div v-for="(entity, index) of reviewEntities" :key="entity.id">
            <ReviewPage
                v-if="entity.type === 'page'"
                :ref="`review-${type}-${index}`"
                :document="entity.data"
                :review-panel="type === 'review'"
                :focused="focusIndex === index"
                :relative-date="overviewDate"
            />
            <Task
                v-else
                :ref="`review-${type}-${index}`"
                :task="entity.data"
                :delay="true"
                :review-panel="type === 'review'"
                :agenda="type === 'agenda'"
                :focused="focusIndex === index"
                :relative-date="overviewDate"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Task from '@/components/task/Task.vue';
import ReviewPage from '~/components/overview/ReviewPage.vue';
import { ITask } from '~/components/task/model';
import { IDocument } from '~/components/document/model';

@Component({
    name: 'ReviewEntities',
    components: {
        ReviewPage,
        Task,
    },
})
export default class ReviewEntities extends Vue {
    $refs!: {
        [key: string]: any;
    };

    focusIndex = -1;

    @Prop({ default: 'review' })
    type!: 'review' | 'agenda';

    @Prop({ default: () => new Date() })
    overviewDate!: Date;

    @Prop({ default: () => new Date() })
    now!: Date;

    @Prop({ default: false })
    active!: boolean;

    @Watch('reviewEntities.length')
    onTasksLengthHandler(newValue: number) {
        if (this.focusIndex >= newValue - 1) {
            this.focusIndex = newValue - 1;
            return;
        }
        if (this.focusIndex < 0 && this.active) {
            this.focusIndex = 0;
        }
    }

    @Watch('active')
    onActiveHandler(value: boolean) {
        if (value) {
            this.$shortcutsManager.enableNamespace('review-panel');
            this.registerShortcuts();
            if (this.type === 'agenda') {
                this.focusIndex = this.reviewEntities.length - 1;
                this.scroll();
                return;
            }
            this.focusIndex = 0;
        }
        if (!value) {
            this.focusIndex = -1;
            this.$shortcutsManager.disableNamespace('review-panel');
            this.removeShortcuts();
        }
    }

    get reviewEntities() {
        return [...this.reviewPages, ...this.tasks].map(entity => ({
            type: this.isTask(entity) ? 'task' : 'page',
            data: entity,
            id: entity.id,
        }));
    }

    isTask(
        entity:
            | Partial<ITask>
            | (Partial<IDocument> & { recurrentId?: string }),
    ) {
        return (
            !!this.$store.getters['tasks/byId'](entity.id) ||
            (entity.recurrentId &&
                !!this.$store.getters['tasks/byId'](entity.recurrentId))
        );
    }

    isRecurrentTask(
        entity:
            | Partial<ITask>
            | (Partial<IDocument> & { recurrentId?: string }),
    ) {
        return !!entity.recurrentId;
    }

    get reviewPages() {
        return this.type === 'agenda'
            ? this.$store.getters[`document/agenda`](this.overviewDate)
            : this.$store.getters[`document/review`](this.now);
    }

    get tasks() {
        return this.type === 'agenda'
            ? this.$store.getters[`tasks/agenda`](this.overviewDate)
            : this.$store.getters[`tasks/review`](this.now);
    }

    getRef(): Task | ReviewPage | null {
        if (!this.$refs[`review-${this.type}-${this.focusIndex}`]) return null;
        return this.$refs[`review-${this.type}-${this.focusIndex}`][0];
    }

    scroll() {
        let scrollAmt = 0;
        const task = this.getRef();
        if (task) {
            // @ts-ignore
            scrollAmt = task.$el.offsetTop;
        }
        this.$emit('scroll', scrollAmt);
    }

    hideScheduleDropdown() {
        this.$dropdown.hide('task-date-picker');
    }

    incrementFocusIndex() {
        if (!this.active) return;
        this.hideScheduleDropdown();
        this.focusIndex++;
        if (this.focusIndex >= this.reviewEntities.length) {
            if (this.type === 'agenda') {
                this.$emit('last-item');
                return;
            } else {
                this.focusIndex = 0;
            }
        }
        this.scroll();
    }

    decrementFocusIndex() {
        if (!this.active) return;
        this.hideScheduleDropdown();
        if (this.type === 'agenda' && this.focusIndex <= 0) return;
        this.focusIndex--;
        if (this.type !== 'agenda' && this.focusIndex < 0) {
            this.focusIndex = this.reviewEntities.length - 1;
        }
        this.scroll();
    }

    moveToToday() {
        this.hideScheduleDropdown();
        if (!this.isRecurrentTask(this.reviewEntities[this.focusIndex].data)) {
            this.getRef()?.setToday();
        }
    }

    setTomorrow() {
        this.hideScheduleDropdown();
        if (!this.isRecurrentTask(this.reviewEntities[this.focusIndex].data)) {
            this.getRef()?.setTomorrow();
        }
    }

    setNextWeek() {
        this.hideScheduleDropdown();
        if (!this.isRecurrentTask(this.reviewEntities[this.focusIndex].data)) {
            this.getRef()?.setNextWeek();
        }
    }

    deleteTask() {
        this.hideScheduleDropdown();
        if (this.isTask(this.reviewEntities[this.focusIndex].data)) {
            // @ts-ignore
            this.getRef()?.deleteTask();
        }
    }

    completeTask() {
        this.hideScheduleDropdown();
        if (this.isTask(this.reviewEntities[this.focusIndex].data)) {
            // @ts-ignore
            this.getRef()?.onCheckboxClick();
        }
    }

    showDetail() {
        this.hideScheduleDropdown();
        // @ts-ignore
        this.getRef()?.showInContext();
    }

    clearDate() {
        this.hideScheduleDropdown();
        if (
            this.isTask(this.reviewEntities[this.focusIndex].data) ||
            this.isRecurrentTask(this.reviewEntities[this.focusIndex].data)
        )
            return;

        // @ts-ignore
        this.getRef()?.clearDate();
    }

    registerShortcuts() {
        const availableShortcuts = this.$shortcutsManager.availableShortcuts;
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.REVIEW_PANEL_DOWN,
            () => this.incrementFocusIndex(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.REVIEW_PANEL_UP,
            () => this.decrementFocusIndex(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_TODAY,
            () => this.moveToToday(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_TOMORROW,
            () => this.setTomorrow(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_START_OF_NEXT_WEEK,
            () => this.setNextWeek(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_DELETE,
            () => this.deleteTask(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_COMPLETE,
            () => this.completeTask(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_ACTIONS_DETAIL,
            () => this.showDetail(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.TASKS_ACTIONS_NAVIGATE,
            () => this.showDetail(),
        );
        this.$shortcutsManager.registerShortcut(
            availableShortcuts.PAGE_CLEAR_DATE,
            () => this.clearDate(),
        );
    }

    removeShortcuts() {
        const availableShortcuts = this.$shortcutsManager.availableShortcuts;
        this.$shortcutsManager.removeShortcut(
            availableShortcuts.REVIEW_PANEL_UP,
            availableShortcuts.REVIEW_PANEL_DOWN,
            availableShortcuts.TASKS_TODAY,
            availableShortcuts.TASKS_TOMORROW,
            availableShortcuts.TASKS_START_OF_NEXT_WEEK,
            availableShortcuts.TASKS_DELETE,
            availableShortcuts.TASKS_COMPLETE,
            availableShortcuts.TASKS_ACTIONS_DETAIL,
            availableShortcuts.TASKS_ACTIONS_NAVIGATE,
            availableShortcuts.PAGE_CLEAR_DATE,
        );
    }
}
</script>
<style lang="scss" scoped>
.review-entities {
    :deep {
        .task-content-render {
            @include font14-500;
        }
    }
}
</style>
