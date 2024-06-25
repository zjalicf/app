<template>
    <div class="date-picker">
        <button
            ref="datePickerTrigger"
            :disabled="disabled"
            class="date-picker__add"
            :class="{ active: formattedDate !== 'Set date', open }"
            tabindex="-1"
            @click.stop="openDatePickerDropdown"
        >
            <InterfaceCalendar size="14" class="icon" />
            {{ formattedDate }}
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { sub } from 'date-fns';
import { extractDate, formatRelativeToDate } from '@/helpers';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import PageDatePickerDropdown from '~/components/document/PageDatePickerDropdown.vue';
import { ITask } from '~/components/task/model';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    components: {
        InterfaceDelete1,
        InterfaceCalendar,
    },
})
export default class DatePicker extends Vue {
    @Prop({
        default: false,
    })
    disabled!: boolean;

    @Prop({
        default: 'event',
    })
    type!: string;

    @Prop({
        required: true,
    })
    taskData!: ITask;

    open: boolean = false;

    $refs!: {
        datePickerTrigger: HTMLButtonElement;
    };

    get formattedDate() {
        return (
            formatRelativeToDate(
                this.taskData,
                sub(extractDate(this.taskData.start), { months: 1 }),
                false,
                this.$store.getters['appSettings/dateTimeOptions'],
            ) || 'Set date'
        );
    }

    openDatePickerDropdown() {
        this.open = true;
        this.$dropdown.show({
            name: 'date-picker',
            parent: this.$refs.datePickerTrigger,
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
                pageId: this.taskData.id,
                source: TrackingActionSource.PAGE,
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
.date-picker {
    position: relative;
    display: flex;

    &__add {
        outline: none;
        @include font12-500;
        border-radius: 6px;
        color: var(--a-select-text-default-color);
        background: var(--a-select-button-default-bg);
        display: grid;
        grid-template-columns: 16px auto;
        align-items: center;
        padding: 5px 8px;
        gap: 6px;

        .icon {
            color: var(--a-select-icon-default-color);
            margin-left: 1px;
        }

        &:hover,
        &.open {
            background: var(--a-select-button-highlight-bg);

            .icon {
                color: var(--a-select-icon-default-color);
            }
        }

        &.active {
            color: var(--a-select-text-highlight-color);

            .icon {
                color: var(--a-select-icon-default-color);
            }
        }
    }
}
</style>
