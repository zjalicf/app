<template>
    <div class="cm-pages-dropdown">
        <button
            v-if="rrule !== null"
            class="cm-pages-dropdown--button"
            @click="$emit('update', null)"
        >
            <div></div>
            <div class="cm-pages-dropdown--left">
                <p class="cm-pages-dropdown--text">No repeat</p>
            </div>
        </button>
        <button
            v-for="option in options"
            :key="option.rrule"
            class="cm-pages-dropdown--button"
            @click="$emit('update', option.rrule)"
        >
            <CheckIcon
                v-if="option.rrule === rrule"
                class="right-icon"
                size="16"
            />
            <div v-else></div>
            <div class="cm-pages-dropdown--left">
                <p class="cm-pages-dropdown--text" v-html="option.text"></p>
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/solid';
import { format } from 'date-fns';
import { extractDate } from '~/helpers';

@Component({
    name: 'PagesOptionsDropdown',
    components: {
        CheckIcon,
    },
})
export default class PagesOptionsDropdown extends Vue {
    @Prop()
    start!: any;

    @Prop()
    rrule!: any;

    get options() {
        return [
            { rrule: 'RRULE:FREQ=DAILY', text: 'Every day' },
            {
                rrule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
                text: 'Every weekday <span>Mon - Fri</span>',
            },
            {
                rrule: `RRULE:FREQ=WEEKLY;BYDAY=${this.dayRrule}`,
                text: `Every week <span>on ${this.dayName}</span>`,
            },
            {
                rrule: `RRULE:FREQ=WEEKLY;BYDAY=${this.dayRrule};INTERVAL=2`,
                text: `Every 2 weeks <span>on ${this.dayName}</span>`,
            },
            {
                rrule: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${this.dayOfMonthRrule}`,
                text: `Every month <span>on the ${this.dayOfMonth}</span>`,
            },
            {
                rrule: `RRULE:FREQ=MONTHLY;BYWEEKDAY=${this.dayNumberRrule}${this.dayRrule}`,
                text: `Every month <span>on the ${this.dayNumber} ${this.dayName}</span>`,
            },
            {
                rrule: `RRULE:FREQ=YEARLY;BYMONTH=${this.monthRrule};BYMONTHDAY=${this.dayOfMonthRrule}`,
                text: `Every year <span>on ${this.fullDate}</span>`,
            },
        ];
    }

    get date() {
        const date = extractDate(this.start);

        if (!date) return new Date();

        return date;
    }

    get dayName() {
        return format(this.date, 'EEE');
    }

    get dayNumber() {
        const n = this.dayNumberRrule;

        switch (n) {
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
            default:
                return `${n}th`;
        }
    }

    get dayNumberRrule() {
        return Math.ceil(this.date.getDate() / 7);
    }

    get dayOfMonth() {
        return format(this.date, 'do');
    }

    get dayOfMonthRrule() {
        return format(this.date, 'd');
    }

    get fullDate() {
        return format(this.date, 'MMM d');
    }

    get monthRrule() {
        return format(this.date, 'M');
    }

    get dayRrule() {
        return format(this.date, 'EEEEEE').toUpperCase();
    }
}
</script>
<style lang="scss" scoped>
.cm-pages-dropdown {
    @include frostedGlassBackground;
    @include font12-500;
    width: 230px;
    color: var(--dropdown-context-labels-text-color);
    border-radius: 8px;
    outline: none;
    max-height: 250px;
    padding: 5px 4px;

    &--left {
        @include ellipsis;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;

        .doc-icon {
            margin-right: 8px;
        }
    }

    &--text {
        @include ellipsis;
        width: 100%;
        text-align: left;

        :deep(span) {
            color: var(--dropdown-context-labels-subtext-color);
        }
    }

    .right-icon {
        color: var(--dropdown-context-labels-icon-color);
        flex-shrink: 0;
    }

    &--button {
        padding: 5px 8px;
        color: var(--dropdown-context-labels-button-color);
        width: 100%;
        justify-content: space-between;
        align-items: center;
        display: grid;
        grid-template-columns: 22px 1fr;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--dropdown-context-labels-button-color__hover);
        }
    }
}
</style>
