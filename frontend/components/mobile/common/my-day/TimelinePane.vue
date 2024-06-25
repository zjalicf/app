<template>
    <div class="today-timeline">
        <span class="today-timeline--title">{{ title }}</span>
        <Calendar ref="calendar" :events="calendarEvents" :start="getStart" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import { calendarDateRange } from '~/helpers/date';
import Calendar from '~/components/calendar/Calendar.vue';
import { IntegrationType } from '~/constants';

@Component({
    name: 'TimelinePane',
    components: {
        Calendar,
    },
})
export default class TimelinePane extends Vue {
    $refs!: {
        calendar: any;
    };

    get calendarEvents() {
        const range = calendarDateRange(
            this.calendarDate,
            'day',
            this.$store.getters['appSettings/calendarOptions'].weekdayStart,
        );
        const events = this.$store.getters['event/calendarEventList'](
            range,
        ).filter(
            (event: any) =>
                !this.$accessControl.readOnlyAccess ||
                event.integrationType !== IntegrationType.GOOGLE_CALENDAR,
        );
        let tasks = [];
        if (
            this.$store.getters['vaultSettings/tasksInCalendarConfig'].visible
        ) {
            tasks = this.$store.getters['tasks/calendarTaskList'](range);
        }

        let pages = [];
        if (
            this.$store.getters['vaultSettings/pagesInCalendarConfig'].visible
        ) {
            pages = this.$store.getters['document/byRange'](range);
        }
        return [...events, ...tasks, ...pages];
    }

    get getStart() {
        return format(this.calendarDate, 'yyyy-MM-dd');
    }

    get title() {
        return this.$store.getters['dailyDoc/title']
            .split(',')
            .slice(0, 2)
            .join(', ');
    }

    get calendarDate() {
        return this.$store.getters['dailyDoc/calendarDate'];
    }

    mounted() {
        setTimeout(() => {
            this.$refs.calendar.scrollCalendarIntoView();
        }, 150);
    }
}
</script>
<style lang="scss" scoped>
:deep {
    .v-calendar {
        height: calc(
            var(--viewport-height) - var(--ion-safe-area-bottom) -
                var(--ion-safe-area-top) - 36px
        ) !important;

        &-daily {
            background: none !important;

            &:not(.event):not(.v-event):not(.task) {
                border-color: $blueGrey100 !important;
            }

            &__day {
                border-right: 0px !important;

                &-interval {
                    border-top: 1px solid $blueGrey100 !important;
                }
            }

            &_head-day {
                border-right: 0px !important;

                &::after {
                    display: none !important;
                }

                &-label {
                    display: none;
                }

                &.v-present {
                    &::before {
                        display: none !important;
                    }
                }
            }

            &__intervals {
                &-head {
                    border-right: 0px !important;

                    &::after {
                        display: none !important;
                    }
                }

                &-body {
                    border-right: 0px !important;
                }
            }
        }
    }

    .v-event-timed {
        font-weight: 900 !important;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);

        strong {
            padding-left: 3px !important;
            font-weight: 900 !important;
        }
    }
}

.today-timeline {
    position: relative;
    &--title {
        position: absolute;
        top: 0;
        @include font14-600;
        width: 100%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
