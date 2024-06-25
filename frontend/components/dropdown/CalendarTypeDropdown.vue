<template>
    <div class="calendar-type-dropdown">
        <button
            v-for="option in calednarOptions"
            :key="option.id"
            class="calendar-type-dropdown--option"
            @click="handleChangeType(option.id)"
        >
            {{ option.label }}
            <InterfaceValidationCheck
                v-if="calendarType === option.id"
                class="icon"
                size="14"
            />
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';

@Component({
    name: 'CalendarTypeDropdown',
    components: { InterfaceValidationCheck },
})
export default class CalendarTypeDropdown extends Vue {
    @Prop()
    calendarType!: string;

    calednarOptions: any = [
        {
            id: 'day',
            label: '1 Day',
        },
        {
            id: '4day',
            label: '4 Days',
        },
        {
            id: 'week',
            label: '7 Days',
        },
        {
            id: 'month',
            label: 'Month',
        },
    ];

    handleChangeType(value: string) {
        this.$emit('close');
        this.$emit('changeType', value);
    }
}
</script>
<style lang="scss" scoped>
.calendar-type-dropdown {
    @include contextMenu;
    @include frostedGlassBackground;

    &--option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
}
</style>
