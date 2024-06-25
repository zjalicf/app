<template>
    <div v-if="task" class="page-list-task">
        <Task
            :task="task"
            :focused="focused"
            :show-date="true"
            :source="source"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Task from '~/components/task/Task.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'PageListTaskComponent',
    components: {
        Task,
    },
})
export default class PageListTaskComponent extends Vue {
    @Prop()
    taskId!: any;

    @Prop({ default: false })
    focused!: boolean;

    @Prop({ default: null })
    source!: TrackingActionSource | null;

    get task() {
        return this.$store.getters['tasks/byId'](this.taskId);
    }
}
</script>

<style scoped lang="scss">
.page-list-task {
    padding-left: 32px;

    :deep(.task-outer) {
        padding: 0;

        .task {
            padding: 1px 0;

            &--content {
                align-items: center;

                &--text--inner {
                    @include font12-500;
                }
            }
        }
    }
}
</style>
