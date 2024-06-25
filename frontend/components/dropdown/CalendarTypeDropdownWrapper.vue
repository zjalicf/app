<template>
    <ASelect
        :items="calendarOptions"
        :value="calendarType.id"
        :show-arrow="false"
        @change="onCalendarTypeChange"
    />
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';
import { TabSymbols } from '~/constants/symbols';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'CalendarTypeDropdownWrapper',
    components: { ASelect, AcreomChevronDown },
})
export default class CalendarTypeDropdownWrapper extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    calendarOptions: any = [
        {
            id: 'month',
            label: 'Month',
        },
    ];

    open: boolean = false;

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get type() {
        return this.tabData.calendarType ?? 'month';
    }

    get calendarType() {
        return this.calendarOptions.find((opt: any) => opt.id === this.type);
    }

    onCalendarTypeChange(type: string) {
        this.$emit('close');
        this.$emit('type-change', type);
    }
}
</script>
