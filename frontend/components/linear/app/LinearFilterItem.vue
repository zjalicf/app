<template>
    <div class="linear-filter">
        <div
            ref="property"
            :class="{ active: active === 'property' }"
            class="linear-filter__name"
        >
            {{ capitalize(propertyLabelSingular) }}
        </div>
        <div
            ref="operation"
            class="linear-filter__operation"
            :class="{ active: active === 'operation' }"
            @click.prevent.stop="openOperationDropdown"
        >
            {{ operationLabel(localFilter.operation) }}
        </div>
        <div
            ref="values"
            class="linear-filter__values"
            :class="{ active: active === 'value' }"
            @click.prevent.stop="openValuesDropdown"
        >
            <div
                v-if="!localFilter.value || !localFilter.value.length"
                class="linear-filter__values__item--single"
            >
                {{
                    localFilter.property === 'none'
                        ? ''
                        : 'Select ' + propertyLabelPlural
                }}
            </div>
            <div
                v-else-if="singleSelect"
                class="linear-filter__values__item--single"
            >
                <ASelectMedia
                    v-if="filterValueMedia(filterValues)"
                    :value="filterValueMedia(filterValues)"
                />
                {{ filterValues.name }}
            </div>
            <div
                v-else-if="filterValues.length > 2"
                class="linear-filter__values__item--single"
            >
                {{ filterValues.length }} {{ propertyLabelPlural }}
            </div>
            <div v-else class="linear-filter__values__wrapper">
                <div
                    v-for="value in filterValues"
                    :key="value.id"
                    class="linear-filter__values__item"
                >
                    <ASelectMedia
                        v-if="filterValueMedia(value)"
                        :value="filterValueMedia(value)"
                    />
                    {{ value.name }}
                </div>
            </div>
        </div>
        <button
            class="linear-filter__delete"
            @click.prevent.stop="$emit('remove')"
        >
            <XIcon size="14" class="icon" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import { isAfter, isBefore } from 'date-fns';
import { capitalize } from '../../../helpers/util';
import ASelect from '~/components/ASelect.vue';
import InterfaceArrowsCrossOver from '~/components/streamline/InterfaceArrowsCrossOver.vue';
import ASelectMedia from '~/components/ASelectMedia.vue';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';
import EntertainmentControlButtonPlayCircleAlternate from '~/components/streamline/EntertainmentControlButtonPlayCircleAlternate.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import ADropDown from '~/components/ADropDown.vue';
import LinearPriorityIcon from '~/components/linear/icons/LinearPriorityIcon.vue';

@Component({
    name: 'LinearFilterItem',
    methods: { capitalize },
    components: { ASelectMedia, InterfaceArrowsCrossOver, ASelect, XIcon },
})
export default class LinearFilterItem extends Vue {
    @Prop({ required: true })
    viewId!: string;

    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    property!: any;

    @Prop({ required: true })
    operation!: any;

    @Prop({ required: true })
    value!: any;

    @Prop({ default: () => [] })
    filters!: any;

    localFilter: any = {
        property: 'none',
        operation: 'include',
        value: [],
    };

    active: string = 'none';
    $refs!: {
        values: HTMLElement;
        operation: HTMLElement;
        property: HTMLElement;
    };

    get statusType() {
        return [
            {
                id: 'backlog',
                name: 'Backlog',
            },
            {
                id: 'unstarted',
                name: 'Unstarted',
            },
            {
                id: 'started',
                name: 'Started',
            },
            {
                id: 'completed',
                name: 'Completed',
            },
            {
                id: 'canceled',
                name: 'Canceled',
            },
        ];
    }

    openPropertyDropdown() {
        this.active = 'property';
        const items = this.propertyDropdownItems();
        this.$dropdown.show({
            name: 'linear-property-dropdown',
            parent: this.$refs.property,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: ADropDown,
            bind: {
                items,
                value: this.localFilter.property,
                styled: true,
                search: false,
                multi: false,
                clear: false,
                checkPlacement: 'end',
                closeOnUpdate: true,
            },
            on: {
                change: async (property: any) => {
                    if (property === this.localFilter.property) return;
                    this.localFilter.property = property;
                    const item = items.find(item => item.id === property);
                    if (!item) return;
                    this.localFilter = {
                        property,
                        operation: item.operation,
                        value: item.value,
                    };
                    this.emitUpdate();
                    await this.$nextTick();
                    this.openValuesDropdown();
                },
            },
            onClose: () => {
                if (this.localFilter.property === 'none') {
                    this.$emit('remove');
                }
                this.active = 'none';
            },
        });
    }

    openOperationDropdown() {
        this.active = 'operation';
        const items = this.operationDropdownItems().map((item: any) => ({
            ...item,
            label: this.operationLabel(item.id),
        }));
        this.$dropdown.show({
            name: 'linear-operation-dropdown',
            parent: this.$refs.operation,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: ADropDown,
            bind: {
                items,
                value: this.localFilter.operation,
                styled: true,
                search: false,
                multi: false,
                clear: false,
                checkPlacement: 'start',
                closeOnUpdate: true,
            },
            on: {
                change: (value: any) => {
                    if (value === this.localFilter.operation) return;
                    this.localFilter.operation = value;
                    this.emitUpdate();
                },
            },
            onClose: () => {
                this.active = 'none';
            },
        });
    }

    openValuesDropdown() {
        this.active = 'value';
        const items = this.valueDropdownItems();
        this.$dropdown.show({
            name: 'linear-values-dropdown',
            parent: this.$refs.values,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: ADropDown,
            bind: {
                items,
                value: this.localFilter.value,
                styled: true,
                search: items.length > 5,
                searchPlaceholder: `Search ${this.propertyLabelPlural}`,
                placeholder: `Select ${this.propertyLabelPlural}`,
                multi: !this.singleSelect,
                multiselectIcons: true,
                clear: false,
                checkPlacement: 'start',
                closeOnUpdate: true,
            },
            on: {
                change: (value: any) => {
                    if (value === this.localFilter.value) return;
                    this.localFilter.value = value;
                    this.emitUpdate();
                },
            },
            onClose: () => {
                if (
                    this.localFilter.value === undefined ||
                    !this.localFilter.value.length
                ) {
                    this.$emit('remove');
                }
                this.active = 'none';
            },
        });
    }

    propertyDropdownItems() {
        return [
            { id: 'state', label: 'Status', operation: 'in', value: [] },
            { id: 'assignee', label: 'Assignee', operation: 'in', value: [] },
            { id: 'priority', label: 'Priority', operation: 'in', value: [] },
            { id: 'cycle', label: 'Cycle', operation: 'in', value: [] },
            { id: 'project', label: 'Project', operation: 'in', value: [] },
            { id: 'labels', label: 'Labels', operation: 'includes', value: [] },
            {
                id: 'stateType',
                label: 'Status Type',
                operation: 'in',
                value: [],
            },
        ].filter(
            item =>
                !this.filters.find(
                    (filter: any) => filter.property === item.id,
                ),
        );
    }

    operationDropdownItems() {
        if (this.localFilter.property === 'state') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'stateType') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'assignee') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'priority') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'cycle') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'project') {
            return [
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        if (this.localFilter.property === 'labels') {
            return [
                { id: 'include', label: 'include' },
                { id: 'in', label: 'is any of' },
                { id: 'nin', label: 'is not' },
            ];
        }
        return [
            { id: 'eq', label: 'is' },
            { id: 'neq', label: 'is not' },
        ];
    }

    valueDropdownItems() {
        const teamId = this.$entities.linear.parseId(this.teamId).id;
        const items = this.propertyOptions(teamId);

        return items.map((item: any) => ({
            id: item.id,
            label: item.name,
            icon: this.filterValueMedia(item),
        }));
    }

    get nullValuePlaceholder() {
        if (this.localFilter.property === 'assignee') {
            return { id: null, name: 'Unassigned' };
        }
        if (this.localFilter.property === 'project') {
            return { id: null, name: 'No Project' };
        }
        if (this.localFilter.property === 'cycle') {
            return { id: null, name: 'No Cycle' };
        }
        return { id: null, name: 'No value' };
    }

    propertyOptions(teamId: string) {
        if (this.localFilter.property === 'state') {
            return this.$entities.linear.teamStates(teamId);
        }
        if (this.localFilter.property === 'stateType') {
            return this.statusType;
        }
        if (this.localFilter.property === 'assignee') {
            return [
                this.nullValuePlaceholder,
                ...this.$entities.linear.teamUsers(teamId).map((user: any) => {
                    return {
                        id: user.id,
                        name: user.displayName,
                        ...user,
                    };
                }),
            ];
        }
        if (this.localFilter.property === 'priority') {
            return this.$entities.linear.linearPriorities.map(
                (priority: any) => ({
                    id: priority.id,
                    name: priority.label,
                    ...priority,
                }),
            );
        }
        if (this.localFilter.property === 'cycle') {
            const cycles = this.$entities.linear
                .teamCycles(teamId)
                .sort((a: any, b: any) => b.number - a.number)
                .map((cycle: any) => ({
                    ...cycle,
                    id: cycle?.id,
                    name: cycle?.name ?? `Cycle ${cycle?.number}`,
                }));

            const activeCycle = cycles.find((cycle: any) => {
                return (
                    isAfter(new Date(), new Date(cycle.startsAt)) &&
                    isBefore(new Date(), new Date(cycle.endsAt))
                );
            });

            if (!activeCycle) {
                return [this.nullValuePlaceholder, ...cycles];
            }

            return [
                this.nullValuePlaceholder,
                { ...activeCycle, label: activeCycle.label + ' (Active)' },
                ...cycles.filter((cycle: any) => cycle.id !== activeCycle.id),
            ];
        }
        if (this.localFilter.property === 'project') {
            return [
                this.nullValuePlaceholder,
                ...this.$entities.linear.teamProjects(teamId),
            ];
        }
        if (this.localFilter.property === 'labels') {
            return this.$entities.linear.teamLabels(teamId);
        }
        return [];
    }

    filterValueMedia(item: any): any {
        if (this.localFilter.property === 'labels') {
            return {
                icon: LinearLabelIcon,
                bind: {
                    color: item?.color,
                },
            };
        }
        if (this.localFilter.property === 'project') {
            return {
                icon: InterfaceDashboardLayoutSquare,
                size: '12',
            };
        }
        if (this.localFilter.property === 'assignee') {
            return {
                icon: LinearUserIcon,
                size: '16',
                bind: {
                    user: item,
                },
            };
        }
        if (this.localFilter.property === 'priority') {
            return {
                icon: LinearPriorityIcon,
                size: '12',
                bind: {
                    priority: item,
                },
            };
        }

        if (this.localFilter.property === 'cycle') {
            return {
                icon: EntertainmentControlButtonPlayCircleAlternate,
                size: '12',
            };
        }
        if (this.localFilter.property === 'state') {
            return {
                icon: LinearStateIcon,
                bind: {
                    state: item,
                },
            };
        }
        return null;
    }

    operationLabel(operation: string) {
        return (
            {
                include: 'include',
                eq: 'is',
                in:
                    !this.singleSelect && this.localFilter.value?.length < 2
                        ? 'is'
                        : 'is any of',
                neq: 'is not',
                nin: 'is not',
            }[operation] ?? 'is'
        );
    }

    get propertyLabelSingular(): string {
        return (
            (
                {
                    state: 'status',
                    labels: 'label',
                    cycle: 'cycle',
                    project: 'project',
                    assignee: 'assignee',
                    priority: 'priority',
                    stateType: 'status type',
                } as Record<string, string>
            )[this.localFilter.property] ?? 'Select property'
        );
    }

    get propertyLabelPlural() {
        const singular = this.propertyLabelSingular;
        const lastChar = singular.charAt(singular.length - 1);

        if (lastChar === 'y') {
            return singular.slice(0, -1) + 'ies';
        }
        if (lastChar === 's') {
            return singular + 'es';
        }
        return singular + 's';
    }

    get singleSelect() {
        return !Array.isArray(this.localFilter.value);
    }

    get filterValues() {
        if (this.singleSelect) {
            if (this.localFilter.value === null) {
                return this.nullValuePlaceholder;
            }
            const value = this.$entities.linear.getById(this.localFilter.value);
            if (this.localFilter.property === 'cycle') {
                return {
                    ...value,
                    name: value.name ?? `Cycle ${value.number}`,
                };
            }
            return {
                ...value,
                name: value?.displayName ?? value?.name ?? value.label,
            };
        }
        if (this.localFilter.property === 'stateType') {
            return this.statusType.filter(({ id }) =>
                this.localFilter.value.includes(id),
            );
        }
        return (
            this.localFilter.value?.map(
                (value: any) => this.$entities.linear.getById(value) ?? value,
            ) ?? []
        ).map((value: any) => {
            if (value === null) {
                return this.nullValuePlaceholder;
            }
            if (this.localFilter.property === 'cycle') {
                return {
                    ...value,
                    name: value.name ?? `Cycle ${value.number}`,
                };
            }
            return {
                ...value,
                name: value?.displayName ?? value?.name ?? value?.label,
            };
        });
    }

    emitUpdate() {
        this.$emit('change', { ...this.localFilter });
    }

    @Watch('property')
    @Watch('operation')
    @Watch('value')
    handleFilterChange() {
        this.localFilter.property = this.property;
        this.localFilter.operation = this.operation;
        this.localFilter.value = this.value;
    }

    beforeMount() {
        this.handleFilterChange();
    }

    mounted() {
        if (this.localFilter.property !== 'none') return;
        this.openPropertyDropdown();
    }
}
</script>
<style lang="scss" scoped>
.linear-filter {
    display: flex;
    align-items: center;
    width: fit-content;
    height: 26px;
    @include font12-500;
    justify-content: space-between;
    color: var(--dropdown-controls-text-color);
    background: var(--dropdown-controls-select-bg-color);
    border-radius: 6px;

    &__name {
        padding: 4px 8px;
        border-radius: 6px;

        @include font12-500;

        &.active {
            background: var(
                --dropdown-controls-display-properties-bg-color__selected__hover
            );
        }
    }

    &__operation {
        padding: 4px 8px;
        @include font12-500;
        border-radius: 2px;

        &:hover,
        &.active {
            background: var(
                --dropdown-controls-display-properties-bg-color__selected__hover
            );
        }
    }

    &__values {
        padding: 4px 8px;
        line-height: 18px !important;
        border-radius: 2px;
        //background: var(--dropdown-controls-display-properties-bg-color);
        @include font12-500;
        border-right: 1px solid
            var(--dropdown-controls-display-properties-bg-color);

        &:hover,
        &.active {
            background: var(
                --dropdown-controls-display-properties-bg-color__selected__hover
            );
        }

        &__wrapper {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        &__item {
            display: flex;
            align-items: center;

            &--single {
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--dropdown-controls-placeholder-text-color);
            }

            &:not(:last-of-type) {
                padding-right: 8px;
                border-right: 1px solid var(--jira-section-header-border-color);
            }
        }
    }

    &__delete {
        padding: 6px 4px;

        svg {
            color: $blueGrey400;
        }

        &:hover {
            border-bottom-right-radius: 6px;
            border-top-right-radius: 6px;
            svg {
                color: var(--dropdown-controls-text-color);
            }
            background: var(
                --dropdown-controls-display-properties-bg-color__selected__hover
            );
        }
    }
}
</style>
