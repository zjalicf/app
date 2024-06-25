<template>
    <MobileDropdown>
        <template #title> Schedule a Task </template>
        <template #default>
            <MobileDropdownSection>
                <MobileDropdownButton @click="showCalendarPicker">
                    <p class="title">Select a Date</p>
                    <InterfaceCalendar v-if="!hasDate" size="16" class="icon" />
                    <span v-else :style="{ opacity: 0.5 }">{{
                        formattedDate
                    }}</span>
                </MobileDropdownButton>
            </MobileDropdownSection>
            <MobileDropdownSection>
                <div class="task-date-picker__quick-options">
                    <button
                        class="task-date-picker__quick-options__option"
                        @click="moveToToday"
                    >
                        <InterfaceCalendar class="icon" size="16" />Today
                    </button>
                    <button
                        class="task-date-picker__quick-options__option"
                        @click="moveToTomorrow"
                    >
                        <InterfaceCalendar class="icon" size="16" />Tomorrow
                    </button>
                    <button
                        class="task-date-picker__quick-options__option"
                        @click="moveToMonday"
                    >
                        <InterfaceCalendar class="icon" size="16" />Next Week
                    </button>
                </div>
            </MobileDropdownSection>
            <MobileDropdownSection>
                <MobileDropdownLabel for-element="timeToggle">
                    <p class="title">Add Time</p>
                    <CSwitch
                        id="timeToggle"
                        :value="hasTime"
                        @input="handleHasTimeToggle"
                    />
                </MobileDropdownLabel>
                <MobileDropdownControl v-if="hasTime">
                    <p class="title">Time</p>
                    <button class="value" @click="showStartTimePicker">
                        {{ start }}
                    </button>
                </MobileDropdownControl>
                <MobileDropdownControl v-if="hasTime">
                    <p class="title">End Time</p>
                    <button class="value" @click="showEndTimePicker">
                        {{ end }}
                    </button>
                </MobileDropdownControl>
            </MobileDropdownSection>
            <MobileDropdownSection>
                <MobileDropdownButton
                    v-if="hasDate"
                    ref="recurringButton"
                    @click="openRecurringOptions"
                >
                    <div class="title">Repeats</div>
                    <span>{{ repeat }}</span>
                </MobileDropdownButton>
            </MobileDropdownSection>
            <MobileDropdownSection>
                <MobileDropdownButton class="danger" @click="clear">
                    <p>Clear Date & Time</p>
                </MobileDropdownButton>
            </MobileDropdownSection>
        </template>
    </MobileDropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DatePicker } from '@capacitor-community/date-picker';
import type { DatePickerTheme } from '@capacitor-community/date-picker';
import {
    add,
    format,
    isSameDay,
    parseISO,
    differenceInMinutes,
    endOfDay,
    roundToNearestMinutes,
    setMinutes,
    setHours,
    setSeconds,
    setMilliseconds,
    sub,
    isBefore,
} from 'date-fns';
import { extractDate, formatRelativeToDate } from '~/helpers';
import { DateFormat, getRRuleFormatted, TimeFormat } from '~/helpers/date';
import RecurringDropdownMobile from '~/components/dropdown/RecurringDropdownMobile.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import CSwitch from '~/components/CSwitch.vue';
import MobileDropdown from '~/components/mobile/common/dropdown/MobileDropdown.vue';
import MobileDropdownSection from '~/components/mobile/common/dropdown/MobileDropdownSection.vue';
import MobileDropdownControl from '~/components/mobile/common/dropdown/MobileDropdownControl.vue';
import MobileDropdownButton from '~/components/mobile/common/dropdown/MobileDropdownButton.vue';
import MobileDropdownLabel from '~/components/mobile/common/dropdown/MobileDropdownLabel.vue';

const selectedTheme: DatePickerTheme = 'dark';

@Component({
    name: 'MobileTaskDatePicker',
    components: {
        MobileDropdownLabel,
        MobileDropdownButton,
        MobileDropdownControl,
        MobileDropdownSection,
        MobileDropdown,
        CSwitch,
        InterfaceCalendar,
    },
})
export default class MobileTaskDatePicker extends Vue {
    @Prop({ default: null })
    taskId!: string | null;

    $refs!: {
        recurringButton: any;
    };

    rrule: string | null = null;

    get datepickerFormat() {
        if (this.$config.os === 'android') {
            return "yyyy-MM-dd'T'HH:mm:ss.sss";
        }
        return "yyyy-MM-dd'T'HH:mm:ss.sssZ";
    }

    get entity() {
        return this.taskId
            ? this.$store.getters['tasks/byId'](this.taskId)
            : null;
    }

    get hasDate() {
        return (
            !!this.entity?.start || (!!this.entity?.start && !!this.entity?.end)
        );
    }

    get hasTime() {
        return (
            !!this.entity?.start?.dateTime ||
            (!!this.entity?.start?.dateTime && !!this.entity?.end?.dateTime)
        );
    }

    get formattedDate() {
        return formatRelativeToDate(
            this.entity,
            new Date(),
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    get start() {
        if (!this.hasTime || !extractDate(this.entity.start)) return 'All Day';
        return format(extractDate(this.entity.start), this.timeFormat());
    }

    get end() {
        if (!this.hasTime || !extractDate(this.entity.end)) return 'None';
        return format(extractDate(this.entity.end), this.timeFormat());
    }

    get repeat() {
        if (!this.hasDate || !this.entity.rrule) return 'No Repeat';
        const rruleString = getRRuleFormatted(this.entity.rrule);
        return rruleString[0].toUpperCase() + rruleString.slice(1);
    }

    handleHasTimeToggle() {
        if (this.hasTime) {
            this.$emit('clear-time');
        } else {
            const hasDate = !!this.entity?.start;
            let date = hasDate ? extractDate(this.entity.start) : new Date();
            const nextSlot = roundToNearestMinutes(new Date(), {
                nearestTo: 15,
            });
            date = setHours(date, nextSlot.getHours());
            date = setMinutes(date, nextSlot.getMinutes());
            date = setSeconds(date, nextSlot.getSeconds());
            date = setMilliseconds(date, nextSlot.getMilliseconds());
            this.$emit('pick-time', {
                start: date,
                end: null,
            });
        }
    }

    dateFormat() {
        const dFormat =
            this.$store.getters['appSettings/dateTimeOptions'].dateFormat;

        return dFormat === DateFormat.EU ? 'd/M/yyyy' : 'M/d/yyyy';
    }

    timeFormat() {
        const tFormat =
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat;

        return tFormat === TimeFormat.HOUR_24 ? 'H:mm' : 'h:mmaa';
    }

    clear() {
        this.$emit('close');
        this.$emit('clear');
    }

    moveToToday() {
        this.$emit('today');
    }

    moveToTomorrow() {
        this.$emit('tomorrow');
    }

    moveToMonday() {
        this.$emit('next-week');
    }

    onInput(date: Date) {
        this.$emit('select', date);
    }

    openRecurringOptions() {
        this.$dropdown.show({
            component: RecurringDropdownMobile,
            parent: this.$refs.recurringButton.$el,
            bind: {
                start: this.entity.start,
                rrule: this.rrule,
            },
            on: {
                update: (rrule: string) => {
                    this.$emit('recurrence', rrule);
                    this.$dropdown.hideAll();
                },
            },
            popperOptions: {
                placement: 'bottom-end',
            },
            onClose: () => {},
        });
    }

    async showCalendarPicker() {
        const date = await DatePicker.present({
            mode: 'date',
            theme: selectedTheme,
            ios: {
                style: 'inline',
            },
            android: {},
            is24h:
                this.$store.getters['appSettings/dateTimeOptions']
                    .timeFormat === TimeFormat.HOUR_24,
        });
        if (!date.value) return;
        const value = parseISO(date.value);
        this.onInput(value!);
    }

    async showStartTimePicker() {
        const date = await DatePicker.present({
            mode: 'time',
            theme: selectedTheme,
            ios: {
                style: 'wheels',
            },
            android: {},
            is24h:
                this.$store.getters['appSettings/dateTimeOptions']
                    .timeFormat === TimeFormat.HOUR_24,
        });
        if (!date.value) return;
        const value = parseISO(date.value);
        this.onStartTimePicked(value!);
    }

    async showEndTimePicker() {
        const date = await DatePicker.present({
            mode: 'time',
            theme: selectedTheme,
            ios: {
                style: 'wheels',
            },
            android: {},
            is24h:
                this.$store.getters['appSettings/dateTimeOptions']
                    .timeFormat === TimeFormat.HOUR_24,
        });
        if (!date.value) return;
        const value = parseISO(date.value);
        if (isBefore(value!, extractDate(this.entity.start)!)) {
            this.onStartTimePicked(value!);
        }
        this.onEndTimePicked(value!);
    }

    onStartTimePicked(value: Date | null) {
        if (!value) {
            this.$emit('clear-time');
            return;
        }
        const oldStart = extractDate(this.entity.start) ?? null;
        const oldEnd = extractDate(this.entity.end) ?? null;
        let newEnd = null;
        if (oldStart && oldEnd) {
            const duration = differenceInMinutes(oldEnd, oldStart);
            newEnd = add(value, {
                minutes: duration,
            });
        }
        if (newEnd && !isSameDay(value, newEnd)) {
            newEnd = endOfDay(value);
        }
        this.$emit('pick-time', {
            start: value,
            end: newEnd,
        });
    }

    onEndTimePicked(value: Date | null) {
        this.$emit('pick-time', {
            start: extractDate(this.entity.start),
            end: value,
        });
    }
}
</script>
<style lang="scss" scoped>
.task-date-picker {
    &__quick-options {
        @include scrollbar;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-bottom: 36px;

        overflow-x: overlay;
        -ms-overflow-style: none;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }

        &__option {
            width: min-content;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            justify-items: center;
            gap: 16px;
            color: $white;
            background: $blueGrey500-16;
            padding: 16px 18px;
            border-radius: 12px;
            white-space: nowrap;

            .icon {
                color: $blueGrey500;
                flex-shrink: 0;
            }
        }
    }
}
</style>
