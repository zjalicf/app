<template>
    <div
        class="page-date-picker"
        :class="{
            'page-date-picker--has-dropdown-styling': !contextMenuInvoke,
        }"
    >
        <DayCalendar
            proxy-id="page-date-dropdown"
            :value="datePicked"
            :highlight-today="true"
            :hide-offset-dates="false"
            :six-weeks="true"
            @change="onDateChanged"
        />
        <hr v-if="datePicked" />
        <button
            v-if="datePicked"
            class="page-date-picker__button"
            data-e2e="page-date-picker-clear"
            @click="onDateChanged(null)"
        >
            <div class="page-date-picker__left">
                <InterfaceDeleteSquare class="icon" size="14" />
                Clear Date
            </div>
            <div class="page-date-picker__right"></div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDeleteSquare from '~/components/streamline/InterfaceDeleteSquare.vue';
import DayCalendar from '~/components/date-picker-new/DayCalendar.vue';
import InterfaceValidationCheckSquare1 from '~/components/streamline/InterfaceValidationCheckSquare1.vue';
import { extractDate } from '~/helpers';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import DatePickerRow from '~/components/date-picker-new/DatePickerRow.vue';
import CButton from '~/components/CButton.vue';

@Component({
    name: 'PageDatePickerDropdown',
    components: {
        CButton,
        DatePickerRow,
        InterfaceValidationCheckSquare1,
        DayCalendar,
        InterfaceDeleteSquare,
    },
})
export default class PageDatePickerDropdown extends Vue {
    @Prop({ default: null })
    pageId!: string | null;

    @Prop({ default: false })
    contextMenuInvoke!: boolean;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    datePicked: Date | null = null;

    get page() {
        return this.$store.getters['document/byId'](this.pageId);
    }

    get selectedDate() {
        return this.page.start;
    }

    onDateChanged(value: Date) {
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: value
                ? TrackingAction.SET_DATE
                : TrackingAction.REMOVE_DATE,
            source: this.source,
            entityId: this.pageId,
        });

        if (!value) {
            this.$emit('close');
            this.updatePage(value);
        }
        this.datePicked = value;
        this.updatePage(value);
    }

    updatePage(date: Date) {
        this.$emit('close');
        this.$utils.page.schedulePage(this.page, date);
    }

    mounted() {
        this.datePicked = extractDate(this.selectedDate);
    }
}
</script>
<style lang="scss" scoped>
.page-date-picker {
    @include contextMenu(206px);
    max-width: 220px;

    &--has-dropdown-styling {
        @include frostedGlassBackground;
    }

    &__left {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .icon.this-day {
            margin-left: 2px;
            margin-right: 14px;
        }
    }

    &__right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: var(--context-menu-tooltip-keys-color);
        gap: 4px;
    }

    &__button {
        justify-content: space-between;
    }
}
</style>
