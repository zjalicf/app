<template>
    <div class="mini-calendar">
        <DayCalendar
            proxy-id="task-date-dropdown"
            :value="highlightDay"
            :highlight-today="true"
            @change="onDateChanged"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DayCalendar from '~/components/date-picker-new/DayCalendar.vue';

@Component({
    name: 'MiniCalendarDropdown',
    components: {
        DayCalendar,
    },
})
export default class MiniCalendarDropdown extends Vue {
    @Prop({ default: null })
    highlightDay!: Date | null;

    onDateChanged(date: Date) {
        this.$emit('close');
        this.$emit('change', date);
    }
}
</script>
<style lang="scss" scoped>
.mini-calendar {
    @include contextMenu(206px);
    @include frostedGlassBackground;
    max-width: 222px;
}
</style>
