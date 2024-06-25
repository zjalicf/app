<template>
    <div ref="calendarWrapper" class="calendar expanded day">
        <v-calendar
            ref="calendar"
            :interval-height="$utils.calendar.intervalHeight"
            :value="start"
            :start="start"
            type="day"
            :events="eventsArray"
            :event-ripple="false"
            :weekdays="$store.getters['appSettings/calendarWeekDays']"
            :interval-format="intervalTimeFormatter"
            :event-more="showMore"
            @mouseup:event="handleEventClick"
            @change="nowY = getNowY()"
        >
            <template #day-label="{ date }">
                <div
                    class="day-label"
                    :class="{
                        'has-content': myDaysWithContent.includes(date),
                        future: $utils.calendar.isFuture(date),
                        past: $utils.calendar.isPast(date) && today !== date,
                        today: today === date,
                    }"
                >
                    <span
                        >{{ $utils.calendar.monthLabel(date) }}
                        {{ $utils.calendar.firstDayOfMonth(date) }}</span
                    >
                </div>
            </template>
            <template #day-body="{ date }">
                <div
                    ref="currentTimeLine"
                    class="v-current-time"
                    :class="{ first: today === date }"
                    :style="{ top: nowY }"
                ></div>
            </template>
            <template #event="{ event }">
                <CalendarEvent
                    v-if="event.type === 'event'"
                    :event="event"
                    :now="now"
                />
                <CalendarTask
                    v-if="event.type === 'task'"
                    :ref="`calendar-task-${event.id}`"
                    :event="event"
                    :now="now"
                />
                <CalendarPage
                    v-if="event.type === 'page'"
                    :event="event"
                    :now="now"
                />
            </template>
        </v-calendar>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format, isEqual } from 'date-fns';
import CalendarPage from '~/components/calendar/calendar-entity/CalendarPage.vue';
import CalendarTask from '~/components/calendar/calendar-entity/CalendarTask.vue';
import CalendarEvent from '~/components/calendar/calendar-entity/CalendarEvent.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    components: {
        CalendarEvent,
        CalendarTask,
        CalendarPage,
    },
})
export default class Calendar extends Vue {
    @Prop({
        default: format(new Date(), 'yyyy-MM-dd'),
    })
    start!: string;

    @Prop()
    events!: any[];

    $refs!: {
        calendar: HTMLElement;
        calendarWrapper: HTMLDivElement;
        currentTimeLine: HTMLElement;
    } & Record<string, HTMLElement> &
        Record<string, CalendarTask>;

    ready: boolean = false;
    interval: any;
    eventsArray: any[] = [];
    now: Date = new Date();
    showMore: boolean = true;
    nowY: string = '-10px';

    get today(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    get offset() {
        return this.cal ? this.cal.timeToY(this.cal.times.now) : 0;
    }

    get cal(): any {
        return this.ready ? this.$refs.calendar : null;
    }

    get range() {
        return this.$utils.calendar.getRange();
    }

    get myDaysWithContent() {
        return this.$utils.calendar.myDaysWithContent();
    }

    intervalTimeFormatter({ time }: { time: string }) {
        return this.$utils.calendar.intervalTimeFormatter(time);
    }

    getNowY() {
        return this.cal &&
            this.cal.times &&
            this.cal.timeToY &&
            this.cal.times.now
            ? this.cal.timeToY(this.cal.times.now) + 'px'
            : '-10px';
    }

    updateTime() {
        this.interval = setInterval(() => {
            this.now = new Date();
            this.cal?.updateTimes();
            this.nowY = this.getNowY();
        }, 60 * 1000);
    }

    handleEventClick({ event, eventParsed }: any, mouseEvent: MouseEvent) {
        if (mouseEvent.button >= 1) {
            return;
        }

        if (eventParsed.allDay) {
            if (event.type === 'event') {
                this.$utils.calendar.onEventClick(event);
            }
            if (event.type === 'task') {
                this.$entities.task.showInContext(
                    event,
                    TrackingActionSource.MOBILE_TIMELINE,
                );
            }
            if (event.type === 'page') {
                this.$utils.calendar.onPageClick(event, mouseEvent);
            }
            return;
        }

        const times = {
            startTime: new Date(
                `${eventParsed.start.date}T${eventParsed.start.time}:00`,
            ),
            endTime: new Date(
                `${eventParsed.end.date}T${eventParsed.end.time}:00`,
            ),
        };

        if (
            isEqual(times.startTime, eventParsed.input.startTime) &&
            isEqual(times.endTime, eventParsed.input.endTime)
        ) {
            if (event.type === 'event') {
                this.$utils.calendar.onEventClick(event);
            }
            if (event.type === 'task') {
                this.$entities.task.showInContext(
                    event,
                    TrackingActionSource.MOBILE_TIMELINE,
                );
            }
            if (event.type === 'page') {
                this.$utils.calendar.onPageClick(event, mouseEvent);
            }
        }
    }

    beforeDestroy() {
        clearInterval(this.interval);
    }

    scrollCalendarIntoView() {
        // @ts-ignore
        const pane = this.$refs.calendar?.$el?.querySelectorAll(
            '.v-calendar-daily__scroll-area',
        );
        if (!pane || !pane[0]) return;
        pane[0].scrollTop =
            this.offset - this.$utils.calendar.intervalHeight * 2;
    }

    mounted() {
        this.ready = true;
        this.nowY = this.getNowY();
        this.eventsArray = [...this.events];
        this.updateTime();
    }
}
</script>
<style lang="scss" scoped>
.expand-day {
    color: var(--calendar-expand-button-text-color);
    position: absolute;
    left: 32px;
    top: 21px;
    z-index: 1;
    outline: none;
    padding: 4px;
    border-radius: 6px;

    &:hover {
        background: var(--calendar-expand-button-bg-color__hover);
        color: var(--calendar-expand-button-text-color__hover);
    }
}

.calendar {
    position: relative;
    padding-bottom: 10px;
    padding-top: 25px;

    &::v-deep {
        &:not(.expanded) {
            .v-calendar-daily__head {
                max-height: 81px;
                overflow: hidden;
            }
        }
    }

    &.month {
        padding: 0px 0 15px 0;

        @media (max-width: 769px) {
            padding: 0px 5px;
        }
    }
}
</style>
