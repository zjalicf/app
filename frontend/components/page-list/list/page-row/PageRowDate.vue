<template>
    <button
        ref="pageRowDateDropdownAnchor"
        :class="{ open }"
        class="page-row-date has-tippy"
        :data-tippy-content="`<div class='tooltip'>${dateTooltip}</div>`"
        @click.prevent.stop="showDateDropdown"
    >
        <span><InterfaceCalendar size="12" /> {{ pageDateString }}</span>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { sub } from 'date-fns';
import { extractDate, formatRelativeToDate } from '~/helpers';
import PageDatePickerDropdown from '~/components/document/PageDatePickerDropdown.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'PageRowDate',
    components: { InterfaceCalendar },
})
export default class PageRowDate extends Vue {
    @Prop({
        required: true,
    })
    pageId!: string;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    $refs!: {
        pageRowDateDropdownAnchor: HTMLButtonElement;
    };

    open = false;

    get dateTooltip() {
        return `Scheduled for ${this.pageDateString}`;
    }

    get page() {
        return this.$store.getters['document/byId'](this.pageId);
    }

    get pageDateString() {
        if (!this.page) return 'No Date';
        return (
            formatRelativeToDate(
                this.page,
                sub(extractDate(this.page.start), { months: 1 }),
                false,
                this.$store.getters['appSettings/dateTimeOptions'],
            ) || 'No Date'
        );
    }

    showDateDropdown() {
        this.open = true;
        this.$dropdown.show({
            name: 'date-picker',
            parent: this.$refs.pageRowDateDropdownAnchor,
            component: PageDatePickerDropdown,
            animate: true,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                ],
            },
            bind: {
                pageId: this.pageId,
                source: this.source,
            },
            on: {},
            onClose: () => {
                this.open = false;
                this.$emit('close');
            },
        });
    }
}
</script>
<style scoped lang="scss">
.page-row-date {
    @include font12-400;
    letter-spacing: -0.124px;
    border-radius: 31px;
    border: 1px solid var(--document-row-tasks-count-border-color);
    padding: 2px 8px;
    text-align: center;
    color: var(--document-row-tasks-count-text-color);
    white-space: nowrap;

    &:hover,
    &.open {
        background: var(--document-row-tasks-count-background-color__hover);
    }

    span {
        display: flex;
        align-items: center;
        gap: 6px;
    }
}
</style>
