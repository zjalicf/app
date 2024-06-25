<template>
    <div
        :id="event.id"
        class="calendar-task"
        :class="{ completed: event.completed }"
        :style="{
            'background-color': getTaskColorOpacity(0.333333333),
            'border-left': `6px solid ${getTaskColorOpacity(0.7)} !important`,
            color: getTaskColorOpacity(1),
        }"
    >
        <span
            ><InterfaceValidationCheck size="10" class="icon" />
            <strong
                :title="`${event.name || event.text}` || 'Untitled'"
                :style="{
                    '-webkit-line-clamp': getLineClamp(event),
                    alignItems: 'flex-start',
                    display:
                        getFormattedTime(event).type === 'start'
                            ? 'flex !important'
                            : 'block',
                }"
                :class="{
                    nowrap: getFormattedTime(event).type === 'start',
                }"
                ><div
                    class="task__content has-tippy"
                    :data-tippy-content="`<div class='tooltip task-tooltip'>${$entities.task.getSanitizedTaskText(
                        event.name || event.text,
                    )}</div>`"
                >
                    {{
                        $entities.task.getSanitizedTaskText(
                            event.name || event.text,
                        )
                    }}
                </div>
                <span v-if="getFormattedTime(event).type === 'start'"
                    >, {{ getFormattedTime(event).text }}</span
                ></strong
            ></span
        >
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import CalendarEntityMixin from '~/components/calendar/calendar-entity/CalendarEntityMixin.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';

@Component({
    name: 'CalendarTask',
    components: { InterfaceValidationCheck },
})
export default class CalendarTask extends CalendarEntityMixin {
    getTaskColorOpacity(opacity: number) {
        return this.$utils.calendar.getTaskColorOpacity(opacity);
    }

    get start() {
        return this.event.start;
    }

    get end() {
        return this.event.end;
    }
}
</script>
<style lang="scss" scoped>
.calendar-task {
    user-select: none;

    span {
        width: 100%;
        display: flex;
        align-items: center;
    }

    &__content {
        @include ellipsis;
    }

    .icon {
        margin-right: 3px;
        flex-shrink: 0;
    }

    &.completed {
        opacity: 0.4;

        div {
            text-decoration: line-through;
        }
    }
}
</style>
