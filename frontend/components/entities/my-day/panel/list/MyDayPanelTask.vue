<template>
    <button
        class="my-day-panel-task has-tippy"
        :class="{ overdue: taskInPast, completed }"
        :data-tippy-content="`<div class='tooltip'>Show in Page</div>`"
        @click="$emit('entity-click')"
    >
        <MyDayPanelEntity>
            <template #title>
                <InterfaceValidationCheck class="icon" />
                <div class="my-day-panel-entity__title__text">
                    {{ $entities.task.getSanitizedTaskText(task.text) }}
                    {{ task.draft ? ' (Drafting)' : '' }}
                </div>
                <MailSendReply class="hover-icon" />
            </template>
            <template #time>
                <span
                    :style="{
                        color: $utils.calendar.getTaskColorOpacity(1),
                    }"
                    >{{ formattedTime.text }}
                    {{ duration ? `(${duration})` : '' }}</span
                >
            </template>
            <template v-if="task.upcomingDelta" #upcoming>
                {{ task.upcomingDelta }}
            </template>
        </MyDayPanelEntity>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { isAfter } from 'date-fns';
import Task from '~/components/task/Task.vue';
import MyDayPanelEntity from '~/components/entities/my-day/panel/list/MyDayPanelEntity.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceValidationCheckSquare1 from '~/components/streamline/InterfaceValidationCheckSquare1.vue';
import { ITask } from '~/components/task/model';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import MailSendReply from '~/components/streamline/MailSendReply.vue';

@Component({
    name: 'MyDayPanelTask',
    components: {
        MailSendReply,
        InterfaceValidationCheck,
        InterfaceValidationCheckSquare1,
        InterfaceCalendar,
        MyDayPanelEntity,
        Task,
    },
})
export default class MyDayPanelTask extends Vue {
    @Prop({ required: true })
    task!: Partial<ITask> & {
        startObject: any;
        endObject: any;
        draft: any;
        upcomingDelta: any;
    };

    @Prop({ default: () => new Date() })
    now!: Date;

    get duration() {
        if (!this.task.endObject) return null;
        return this.$utils.event.getEventDuration({
            start: this.task.startObject,
            end: this.task.endObject,
        });
    }

    get formattedTime() {
        return this.$utils.event.getEventFormattedTime(
            {
                start: this.task.startObject,
                end: this.task.endObject,
            },
            false,
        );
    }

    get isDraft() {
        return !!this.task.draft;
    }

    get taskInPast() {
        return isAfter(this.now, this.$utils.calendar.endDate(this.task));
    }

    get completed() {
        return this.task.completed;
    }

    @Watch('isDraft')
    onDraftChangedHandler(newValue: boolean) {
        if (newValue) {
            this.$emit('task:scroll');
        }
    }

    @Watch('start')
    @Watch('end')
    onTimeChangedHandler() {
        if (!this.isDraft) return;
        this.$emit('task:scroll');
    }

    mounted() {
        this.$nextTick(() => {
            if (this.isDraft) {
                this.$emit('task:scroll');
            }
        });
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-task {
    width: 100%;
    padding: 8px 16px;
    margin-bottom: 4px;
    border-radius: 8px;
    background: var(--my-day-panel-entity-background);

    &.completed {
        opacity: 0.4;
    }

    &:hover {
        background: var(--my-day-panel-entity-background__hover);

        .hover-icon {
            display: block;
        }
    }

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
