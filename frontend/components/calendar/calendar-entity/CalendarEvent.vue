<template>
    <div
        :id="event.id"
        :ref="event.id"
        class="calendar-event"
        :style="{
            'background-color': getEventColorSolid(event, 0.333333333),
            'border-left': `6px solid ${getEventColorOpacity(
                event,
                ['needsAction', 'declined'].includes(
                    getEventResponseStatus(event),
                )
                    ? 1
                    : 0.7,
            )} !important`,
            color: getEventColorOpacity(event, 1),
        }"
        :class="[
            {
                past: eventInPast(event),
            },
            getEventResponseStatus(event),
        ]"
    >
        <strong
            :title="`${event.name || event.summary}` || 'Untitled'"
            :style="{ '-webkit-line-clamp': getLineClamp(event) }"
            :class="{
                nowrap: getFormattedTime(event).type === 'start',
            }"
            >{{ event.name || event.summary || 'Untitled'
            }}<span v-if="getFormattedTime(event).type === 'start'"
                >, {{ getFormattedTime(event).text }}</span
            ></strong
        >
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import { isAfter } from 'date-fns';
import CalendarEntityMixin from '~/components/calendar/calendar-entity/CalendarEntityMixin.vue';
import { IEvent } from '~/@types';

@Component({
    name: 'CalendarEvent',
})
export default class CalendarEvent extends CalendarEntityMixin {
    getEventResponseStatus(event: IEvent) {
        return this.$utils.calendar.getEventResponseStatus(event);
    }

    getEventColorSolid(event: IEvent, alpha: number) {
        return this.$utils.calendar.getEventColorSolid(event, alpha);
    }

    getEventColorOpacity(event: IEvent, opacity: number) {
        return this.$utils.calendar.getEventColorOpacity(event, opacity);
    }

    eventInPast(event: any) {
        return isAfter(this.now, this.$utils.calendar.endDate(event));
    }
}
</script>
<style lang="scss" scoped>
.calendar-event {
    user-select: none;
}
</style>
