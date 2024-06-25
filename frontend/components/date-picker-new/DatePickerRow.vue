<template>
    <div class="date-picker-row">
        <button class="date-picker-row__trigger" @click="onTriggerClicked">
            {{ triggerText }}
            <span
                class="date-picker-row__trigger__date"
                :class="{ open, empty: !datePicked }"
            >
                {{ formattedDate }}
            </span>
        </button>
        <DayCalendar
            v-if="open"
            class="date-picker-row__calendar"
            proxy-id="date-picker-row"
            :value="datePicked"
            :highlight-today="true"
            :range-restriction-from="rangeRestrictionFrom"
            :six-weeks="true"
            :hide-offset-dates="false"
            :center-to-selected-value="false"
            :focus-date="focusDate"
            @change="onDateChanged"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import DayCalendar from '~/components/date-picker-new/DayCalendar.vue';

@Component({
    name: 'DatePickerRow',
    components: {
        DayCalendar,
    },
})
export default class DatePickerRow extends Vue {
    @Prop({ default: 'Date' })
    triggerText!: string;

    @Prop({ default: 'Select Date' })
    selectText!: string;

    @Prop({ default: null })
    datePicked!: Date | null;

    @Prop({ default: false })
    openDefault!: boolean;

    @Prop({ default: null })
    rangeRestrictionFrom!: Date | null;

    @Prop({ default: null })
    focusDate!: Date | null;

    open: boolean = false;

    get formattedDate() {
        return this.datePicked
            ? format(this.datePicked, 'd MMM yyyy')
            : this.selectText;
    }

    onTriggerClicked() {
        if (this.open) return;
        this.open = true;
        this.$nuxt.$emit('date-picker-row-open', this.triggerText);
    }

    onRowTriggered(name: string) {
        if (name !== this.triggerText) {
            this.open = false;
        }
    }

    onDateChanged(value: Date) {
        this.$emit('change', value);
    }

    beforeDestroy() {
        this.$nuxt.$off('date-picker-row-open', this.onRowTriggered);
    }

    mounted() {
        this.open = this.openDefault;
        this.$nuxt.$on('date-picker-row-open', this.onRowTriggered);
    }
}
</script>
<style lang="scss" scoped>
.date-picker-row {
    @include font14-500;
    overflow: hidden;
    position: relative;

    &:not(:first-of-type) {
        padding-top: 6px;
        margin-top: 6px;
        border-top: 1px solid $blueGrey500-32;
    }
    &__trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 3px;

        &__date {
            padding: 5px 10px;
            border-radius: 6px;
            background: $blueGrey500-16;

            &.open {
                padding: 3px 8px;
                border: 2px solid var(--accent-color);
                background: rgba(var(--accent-color-triplet), 0.2);
            }

            &.empty:not(.open) {
                background: none;
            }
        }
    }

    &__calendar {
        margin-top: 7px;
    }
}
</style>
