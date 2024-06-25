<template>
    <div class="my-day-picker">
        <DayCalendar
            :highlight-days-with-content="true"
            proxy-id="my-day"
            :value="value"
            :highlight-today="true"
            @change="onDateChange"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DayCalendar from '~/components/date-picker-new/DayCalendar.vue';

@Component({
    name: 'MyDayPickerDropdown',
    components: { DayCalendar },
})
export default class MyDayPickerDropdown extends Vue {
    @Prop({ default: null })
    value!: Date | null;

    onDateChange(event: any) {
        this.$emit('select', event);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.my-day-picker {
    @include frostedGlassBackground;
    border-radius: 8px;
    padding: 12px 12px 12px 6px;
    max-width: 222px;

    button {
        padding: 8px 16px;
        border-radius: 12px;
        color: var(--tab-controls-icon-color);
        background: var(--tab-controls-bg-color);

        &:hover,
        &.review-open {
            color: var(--tab-controls-icon-color__hover);
            background: var(--tab-controls-bg-color__hover);
        }
    }
}
</style>
