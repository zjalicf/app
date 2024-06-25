<template>
    <div class="event-calendar">
        <div
            class="event-calendar__color"
            :style="{ backgroundColor: calendarColor }"
        ></div>
        {{ calendar.name }}
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { CalendarSymbols } from '~/constants/symbols';
import { Color } from '~/constants';

@Component({
    name: 'EventCalendar',
})
export default class EventCalendar extends Vue {
    @Inject(CalendarSymbols.CALENDAR)
    calendar!: any;

    get calendarColor() {
        if (!this.calendar) {
            return this.$utils.event.computeColorHex(Color.TURQUOISE);
        }
        if (this.calendar.acreomColorId) {
            return this.$utils.event.computeColorHex(
                this.calendar.acreomColorId,
            );
        }
        return (
            this.calendar.color ||
            this.$utils.event.computeColorHex(Color.TURQUOISE)
        );
    }
}
</script>
<style lang="scss" scoped>
.event-calendar {
    @include font12-500;
    display: flex;
    align-items: center;

    &__color {
        width: 14px;
        height: 14px;
        border-radius: 4px;
        margin-right: 4px;
        display: inline-block;
    }
}
</style>
