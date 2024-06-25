<template>
    <button class="page-row-tasks has-tippy" :data-tippy-content="taskTooltip">
        <span>{{ completedTasks }} of {{ totalTasks }} tasks</span>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
    name: 'PageRowTasks',
})
export default class PageRowTasks extends Vue {
    @Prop({
        required: true,
    })
    pageId!: string;

    get postprocessingMap() {
        return this.$entities.page.getPostprocessingMap(this.pageId);
    }

    get tasksOnPage() {
        return this.postprocessingMap?.tasks || [];
    }

    get fullTasks() {
        return this.tasksOnPage.map(task =>
            this.$store.getters['tasks/byId'](task),
        );
    }

    get totalTasks() {
        return this.tasksOnPage.length;
    }

    get completedTasks() {
        return this.fullTasks.filter(task => task?.completed).length;
    }

    get taskTooltip() {
        return `<span class='tooltip'>${this.completedTasks} / ${this.totalTasks} Tasks Completed</span>`;
    }
}
</script>
<style scoped lang="scss">
.page-row-tasks {
    @include font12-400;
    letter-spacing: -0.124px;
    border-radius: 31px;
    border: 1px solid var(--document-row-tasks-count-border-color);
    padding: 2px 8px;
    text-align: center;
    color: var(--document-row-tasks-count-text-color);
    white-space: nowrap;

    &__progress {
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-radius: 50%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
