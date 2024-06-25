<template>
    <div class="mobile-task-review">
        <div class="mobile-task-review--heading">Overdue</div>
        <div v-if="pages.length" class="mobile-task-review--content">
            <MobileReviewPage
                v-for="page in pages"
                :key="page.id"
                :document="page"
            />
        </div>
        <div v-if="tasks.length" class="mobile-task-review--content">
            <Task
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :delay="true"
                :quick-actions="false"
                :mobile-quick-actions="true"
                :review-panel="true"
                :source="TrackingActionSource.MOBILE_OVERDUE"
            />
        </div>
        <div
            v-if="!tasks.length && !pages.length"
            class="mobile-task-review--empty"
        >
            <InterfaceTimeRewindAlt class="icon" size="70" />
            Nothing is overdue. Great job!
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Task from '~/components/task/Task.vue';
import InterfaceTimeRewindAlt from '~/components/icons/InterfaceTimeRewindAlt.vue';
import MobileReviewPage from '~/components/mobile/common/my-day/MobileReviewPage.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'MobileTaskReview',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        MobileReviewPage,
        Task,
        InterfaceTimeRewindAlt,
    },
})
export default class MobileTaskReview extends Vue {
    @Watch('tasks')
    onTasksChange(tasks: any) {
        if (tasks.length) return;
        this.$pane.hide();
    }

    get now() {
        return new Date();
    }

    get tasks() {
        return this.$store.getters['tasks/review'](this.now);
    }

    get pages() {
        return this.$store.getters['document/review'](this.now);
    }
}
</script>
<style lang="scss" scoped>
:deep(#rewind-arrow) {
    transform-origin: center;
}

.mobile-task-review {
    color: $white;

    &--heading {
        padding: 12px 0;
        color: $white;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
    }

    &--content {
        &:last-of-type {
            margin-bottom: 20px;
        }
    }

    &--empty {
        @include font14-600;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        color: var(--task-review-empty-text-color);
        height: 250px;

        .icon {
            color: var(--task-review-empty-icon-color);
            margin-bottom: 15px;
        }
    }
}
</style>
