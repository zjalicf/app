<template>
    <div class="day-calendar" @mousedown.stop.prevent>
        <div class="day-calendar__header">
            {{ getMonthName(month) }} {{ year }}
            <div class="day-calendar__header__controls">
                <button @click="decrementMonth">
                    <AcreomChevronLeft size="10" class="icon" />
                </button>
                <button class="today" @click="jumpToToday">
                    <InterfaceGeometricCircle size="8" class="icon" />
                </button>
                <button @click="incrementMonth">
                    <AcreomChevronRight size="10" class="icon" />
                </button>
            </div>
        </div>
        <div class="day-calendar__body">
            <div class="day-calendar__day-names">
                <span
                    v-for="(dayName, dayKey) in dayNamesAdjusted"
                    :key="dayKey + 1"
                >
                    {{ dayName }}
                </span>
            </div>
            <div
                v-for="(week, i) in days(month, year)"
                :key="i"
                class="day-calendar__week"
            >
                <button
                    v-for="(d, idx) in week.days"
                    :key="idx"
                    class="day-calendar__day"
                    :disabled="dateDisabled(d.value)"
                    :class="{
                        selected: isSelected(d.value),
                        'has-content': d.current && dayHasContent(d.value),
                        'not-this-month': !d.current,
                        'is-past': isPast(d.value),
                        'today-highlight': shouldHighlightToday(d.value),
                    }"
                    @click="selectDay(d)"
                >
                    {{ d.text }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    addDays,
    getMonth,
    startOfWeek,
    isEqual,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    getYear,
    format,
    startOfDay,
    isPast,
    isSameDay,
    isBefore,
    isAfter,
} from 'date-fns';
import AcreomChevronLeft from '~/components/icons/AcreomChevronLeft.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import InterfaceGeometricCircle from '~/components/streamline/InterfaceGeometricCircle.vue';

@Component({
    name: 'DayCalendar',
    methods: { isEqual },
    components: {
        InterfaceGeometricCircle,
        AcreomChevronRight,
        AcreomChevronLeft,
    },
})
export default class DayCalendar extends Vue {
    @Prop({ default: null })
    value!: Date | null;

    @Prop({ required: true })
    proxyId!: string;

    @Prop({ default: false })
    highlightDaysWithContent!: boolean;

    @Prop({ default: false })
    highlightToday!: boolean;

    @Prop({ default: null })
    rangeRestrictionFrom!: Date | null;

    @Prop({ default: null })
    rangeRestrictionTo!: Date | null;

    @Prop({ default: false })
    sixWeeks!: boolean | 'prepend' | 'center' | 'fair' | 'append';

    @Prop({ default: true })
    hideOffsetDates!: boolean;

    @Prop({ default: true })
    centerToSelectedValue!: boolean;

    @Prop({ default: null })
    focusDate!: Date | null;

    day: number | null = null;
    month: number | null = null;
    year: number | null = null;

    dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    get dayNamesAdjusted() {
        const arrayRotate = (arr: string[], count: number) => {
            const len = arr.length;
            arr.push(...arr.splice(0, ((-count % len) + len) % len));
            return arr;
        };
        return arrayRotate(
            [...this.dayNames],
            -this.$store.getters['appSettings/calendarOptions'].weekdayStart,
        );
    }

    get myDaysWithContent() {
        return this.$store.getters['document/dailyDocsWithContent'];
    }

    dateDisabled(date: Date) {
        return (
            (this.rangeRestrictionFrom &&
                isBefore(date, this.rangeRestrictionFrom)) ||
            (this.rangeRestrictionTo && isAfter(date, this.rangeRestrictionTo))
        );
    }

    isPast(day: Date) {
        return isPast(day);
    }

    dayHasContent(d: Date) {
        const dayFormatted = format(d, 'yyyy-MM-dd');
        return (
            this.highlightDaysWithContent &&
            this.myDaysWithContent.includes(dayFormatted)
        );
    }

    shouldHighlightToday(d: Date) {
        return this.highlightToday && isSameDay(d, new Date());
    }

    isSelected(day: Date) {
        return isEqual(startOfDay(day), startOfDay(this.value));
    }

    selectDay(day: any) {
        if (day.text === '') return;
        this.$emit('change', day.value);
    }

    decrementMonth() {
        if (this.month === 0) {
            this.month = 11;
            this.year = (this.year as number) - 1;
            return;
        }
        this.month = (this.month as number) - 1;
    }

    incrementMonth() {
        if (this.month === 11) {
            this.month = 0;
            this.year = (this.year as number) + 1;
            return;
        }
        this.month = (this.month as number) + 1;
    }

    jumpToToday() {
        if (this.centerToSelectedValue && this.value) {
            this.month = getMonth(this.value);
            this.year = getYear(this.value);
            return;
        }
        this.month = getMonth(new Date());
        this.year = getYear(new Date());
    }

    jumpToDate(date: Date) {
        this.month = getMonth(date);
        this.year = getYear(date);
    }

    initializeLocalValues(value: Date | null) {
        this.day = value ? format(value, 'd') : null;
        this.month = getMonth(value || new Date());
        this.year = getYear(value || new Date());
    }

    getMonthName(value: number) {
        const date = new Date();
        date.setMonth(value);
        return format(new Date(date), 'MMM');
    }

    get days() {
        return this.getCalendarDays;
    }

    resetDateTime(value: Date): Date {
        let dateParse = value;
        dateParse = setHours(dateParse, 0);
        dateParse = setMinutes(dateParse, 0);
        dateParse = setSeconds(dateParse, 0);
        dateParse = setMilliseconds(dateParse, 0);
        return dateParse;
    }

    isDateEqual(date: Date, dateToCompare: Date): boolean {
        if (!date || !dateToCompare) {
            return false;
        }
        return isEqual(
            this.resetDateTime(date),
            this.resetDateTime(dateToCompare),
        );
    }

    addDaysToWeek(date: Date, month: number, weeks: any[], lastDate: Date) {
        const days = this.getWeekDays(date, month);
        weeks.push({ days });
        if (
            !weeks[weeks.length - 1].days.some((day: any) =>
                this.isDateEqual(
                    this.resetDateTime(day.value),
                    this.resetDateTime(lastDate),
                ),
            )
        ) {
            const nextDate = addDays(date, 7);
            this.addDaysToWeek(nextDate, month, weeks, lastDate);
        }
    }

    getDate(value?: any) {
        return value ? new Date(value) : new Date();
    }

    getSixWeeksMode(firstWeekday: number, gapToEnd: number) {
        switch (this.sixWeeks === true ? 'append' : this.sixWeeks) {
            case 'prepend':
                return [true, false];
            case 'center':
                return [firstWeekday === 0, true];
            case 'fair':
                return [firstWeekday === 0 || gapToEnd > firstWeekday, true];
            case 'append':
                return [false, false];
            default:
                return [false, false];
        }
    }

    getWeekDays(startDay: Date, month: number): any[] {
        const startDate = this.getDate(startDay);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const next = addDays(startDate, i);
            const isNext = getMonth(next) !== month;
            dates.push({
                text: this.hideOffsetDates && isNext ? '' : next.getDate(),
                value: next,
                current: !isNext,
                classData: {},
            });
        }
        return dates;
    }

    getCalendarDays(month: number, year: number) {
        const weeks: { days: any[] }[] = [];
        const firstDate = new Date(year, month);
        const lastDate = new Date(year, month + 1, 0);
        const weekStartsOn =
            this.$store.getters['appSettings/calendarOptions'].weekdayStart; // between 0 and 6
        const firstDateInCalendar = startOfWeek(firstDate, { weekStartsOn });

        this.addDaysToWeek(firstDateInCalendar, month, weeks, lastDate);
        if (this.sixWeeks && weeks.length < 6) {
            const diff = 6 - weeks.length;

            const firstWeekday = (firstDate.getDay() + 7 - weekStartsOn) % 7;
            const lastWeekday = (lastDate.getDay() + 7 - weekStartsOn) % 7;
            const gapToEnd = 6 - lastWeekday;
            const [requiresLeadingWeek, doesAlternate] = this.getSixWeeksMode(
                firstWeekday,
                gapToEnd,
            );

            for (let i = 1; i <= diff; i++) {
                const addLeadingWeek = doesAlternate
                    ? !!(i % 2) === requiresLeadingWeek
                    : requiresLeadingWeek;
                if (addLeadingWeek) {
                    const first = weeks[0].days[0];
                    const days = this.getWeekDays(
                        addDays(first.value, -7),
                        getMonth(firstDate),
                    );
                    weeks.unshift({ days });
                } else {
                    const lastWeek = weeks[weeks.length - 1];
                    const last = lastWeek.days[lastWeek.days.length - 1];
                    const days = this.getWeekDays(
                        addDays(last.value, 1),
                        getMonth(firstDate),
                    );
                    weeks.push({ days });
                }
            }
        }
        return weeks;
    }

    beforeMount() {
        this.initializeLocalValues(this.value);
        this.$nuxt.$on(
            `day-picker:update-${this.proxyId}`,
            (value: Date | null) => {
                this.initializeLocalValues(value);
            },
        );
        if (this.focusDate) {
            this.jumpToDate(this.focusDate);
        }
    }

    beforeDestroy() {
        this.$nuxt.$off(`day-picker:update-${this.proxyId}`);
    }
}
</script>

<style scoped lang="scss">
.day-calendar {
    user-select: none;
    cursor: default;

    &__header {
        @include font14-500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        color: var(--calendar-picker-header-color);
        padding: 0 3px;

        &__controls {
            button {
                padding: 6px;
                border-radius: 4px;

                &.today {
                    padding: 7px;
                }

                &:hover {
                    background: var(--calendar-border-color);
                    color: var(--calendar-day-label-text-color__hover);
                }
            }
        }
    }

    &__day-names {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));

        span {
            @include font12-400;
            color: var(--calendar-picker-past-day-color);
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    &__week {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    &__day {
        @include font12-600;
        padding: 4px 13px;
        border-radius: 6px;
        margin: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
            color: var(--calendar-picker-past-day-color);
        }

        &:not(:disabled) {
            &.has-content {
                padding: 3px 12px;
                border: 1px solid var(--calendar-border-color);
            }

            &:hover {
                background: var(--calendar-border-color);
            }

            &.selected {
                background: var(--calendar-picker-selected-background);
                color: var(--calendar-picker-selected-color);

                &.today-highlight {
                    background: var(--accent-color);

                    &:hover {
                        background: var(--accent-color);
                    }
                }

                &:hover {
                    background: var(
                        --calendar-picker-selected-background__hover
                    );
                }
            }

            &.not-this-month:not(.selected) {
                color: var(--calendar-picker-past-day-color);
            }

            &.today-highlight:not(.selected) {
                color: var(--accent-color);
            }
        }
    }
}
</style>
