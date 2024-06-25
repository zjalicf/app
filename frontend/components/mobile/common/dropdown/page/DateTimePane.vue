<template>
    <div class="datetime-pane">
        <div class="datetime-pane__header">
            <InterfaceCalendar class="icon" size="16" /> Date
        </div>
        <div class="datetime-pane__row">
            <button class="datetime-pane__row__column" @click="chooseDate">
                <span class="datetime-pane__row__column__title"
                    >Select a Date</span
                >
                <span class="datetime-pane__row__column__value">
                    {{ formattedDate }}
                </span>
            </button>
        </div>
        <div class="datetime-pane__row">
            <button
                class="datetime-pane__row__column clear danger"
                @click="clearTime"
            >
                Clear Date
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DatePicker } from '@capacitor-community/date-picker';
import type { DatePickerTheme } from '@capacitor-community/date-picker';
import { format, parse, parseISO } from 'date-fns';
import { createTaskDateObject, formatRelativeToDate } from '~/helpers';
import { DateFormat, TimeFormat } from '~/helpers/date';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';

const selectedTheme: DatePickerTheme = 'dark';

@Component({
    name: 'DateTimePane',
    components: {
        InterfaceCalendar,
    },
})
export default class DateTimePane extends Vue {
    @Prop({ required: true })
    data!: any;

    get formattedDate() {
        return (
            formatRelativeToDate(
                this.data,
                new Date(),
                false,
                this.$store.getters['appSettings/dateTimeOptions'],
            ) || 'Set date'
        );
    }

    timeFormat() {
        const tFormat =
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat;

        return tFormat === TimeFormat.HOUR_24 ? 'H:mm' : 'h:mmaa';
    }

    dateFormat() {
        const dFormat =
            this.$store.getters['appSettings/dateTimeOptions'].dateFormat;

        return dFormat === DateFormat.EU ? 'd/M/yyyy' : 'M/d/yyyy';
    }

    get is24h() {
        const tFormat =
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat;

        return tFormat === TimeFormat.HOUR_24;
    }

    clearTime() {
        this.$emit('clear');
    }

    async chooseDate() {
        const date = await DatePicker.present({
            mode: 'date',
            theme: selectedTheme,
            ios: {
                format: this.dateFormat(),
                style: 'inline',
            },
            is24h: this.is24h,
        });
        if (!date.value) return;
        let value: string;
        if (this.$config.os === 'android') {
            value = format(parseISO(date.value), this.dateFormat());
        }

        if (this.$config.os === 'ios') {
            value = date.value;
        }
        const selectedDate = createTaskDateObject(
            parse(value!, this.dateFormat(), new Date()),
            null,
        );
        this.$emit('done', selectedDate);
    }

    mounted() {
        if (!this.data.start) {
            this.chooseDate();
        }
    }
}
</script>
<style lang="scss" scoped>
.datetime-pane {
    padding: 4px 24px 30px;
    user-select: none;

    &__header {
        display: flex;
        gap: 14px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        letter-spacing: -0.24px;
        color: $blueGrey400;

        .icon {
            color: $blueGrey500;
        }
    }

    &__row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        color: $white;

        &__column {
            @include paneButtons;

            &__value {
                color: $blueGrey400;
            }

            width: 100%;
            background: $blueGrey900;
            border-radius: 12px;
            padding: 16px;

            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>
