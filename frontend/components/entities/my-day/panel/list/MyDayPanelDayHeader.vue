<template>
    <button
        class="my-day-panel-day-header"
        :class="{
            past: day.isPast,
            future: day.isFuture,
        }"
        @click="$emit('open-day', day.date)"
    >
        <div
            class="my-day-panel-day-header__day-number"
            :class="{
                'has-content': day.hasContent,
                selected: day.isSelected,
                'today-highlight': day.isToday,
                'is-past': day.hasContent,
            }"
        >
            {{ formattedDay(day.date) }}
        </div>
        <div class="my-day-panel-day-header__day">
            <div class="my-day-panel-day-header__day__wrapper">
                {{ formattedDate(day.date) }}
                <span
                    v-if="day.tasks.total"
                    class="my-day-panel-day-header__day__tasks"
                    >{{ day.tasks.completed }}/{{ day.tasks.total }} Tasks</span
                >
                <AcreomChevronRight class="redirect-icon" />
            </div>
        </div>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import TaskListProgress from '~/components/task/TaskListProgress.vue';

@Component({
    name: 'MyDayPanelDayHeader',
    components: { TaskListProgress, AcreomChevronRight, InterfaceFavoriteStar },
})
export default class MyDayPanelDayHeader extends Vue {
    @Prop({ required: true })
    day!: {
        date: Date;
        id: string;
        isSelected: boolean;
        isPast: boolean;
        isFuture: boolean;
        isToday: boolean;
        hasContent: boolean;
        tasks: {
            completed: number;
            total: number;
        };
    };

    formattedDate(date: Date) {
        return format(date, 'EEEE, MMM yyyy');
    }

    formattedDay(date: Date) {
        return format(date, 'd');
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-day-header {
    user-select: none;
    cursor: default;
    margin: 12px 0 4px;
    width: 100%;
    display: grid;
    grid-template-columns: 28px 1fr 14px;
    align-items: center;
    gap: 13px;

    &.past {
        color: var(--calendar-picker-past-day-color);
    }

    .redirect-icon {
        visibility: hidden;
    }

    &:hover {
        .my-day-panel-day-header__day-number:not(.selected) {
            background: var(--calendar-border-color);
            color: var(--calendar-day-label-text-color__hover) !important;
        }

        .redirect-icon {
            visibility: visible;
        }
    }

    &__day-number {
        font-size: 11.08px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px; /* 162.455% */
        letter-spacing: 0.332px;
        padding: 5px;
        border-radius: 5px;
        text-align: center;

        &.has-content:not(.selected) {
            border: 1px solid var(--calendar-border-color);
            padding: 4px;
        }

        &.selected {
            background: var(--calendar-picker-selected-background);
            color: var(--calendar-picker-selected-color);
        }

        &.is-past:not(.selected) {
            color: var(--calendar-picker-past-day-color);
        }

        &.today-highlight:not(.selected) {
            color: var(--accent-color);
        }
    }

    &__day {
        @include font14-600;
        display: flex;
        align-items: center;

        &__wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 6px;
            padding: 2px 4px;
        }

        &__tasks {
            font-size: 11.08px;
            font-style: normal;
            font-weight: 500;
            line-height: 18px; /* 162.455% */
            letter-spacing: 0.332px;

            color: var(--calendar-picker-past-day-color);
        }
    }
}
</style>
