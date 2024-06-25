<template>
    <div class="page-list-sort-by">
        Sort by
        <div class="page-list-sort-by__dropdown">
            <ASelect
                :items="orderOptions"
                :value="sortBy"
                :width="150"
                :dropdown-width="150"
                check-placement="start"
                @change="changeSortingOption"
            />
            <button
                v-if="sortBy !== SortingOptions.MANUAL"
                class="page-list-sort-by__dropdown__order"
                @click="changeOrderingDirection"
            >
                <InterfaceEditSortAscending v-if="orderAscending" size="14" />
                <InterfaceEditSortDescending v-if="!orderAscending" size="14" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';
import InterfaceEditSortAscending from '~/components/icons/InterfaceEditSortAscending.vue';
import InterfaceEditSortDescending from '~/components/icons/InterfaceEditSortDescending.vue';
import { GroupingOptions, PageListType, SortingOptions } from '~/constants';
import ASelect from '~/components/ASelect.vue';
import { PageListSymbols } from '~/constants/symbols';

@Component({
    name: 'PageSortBy',
    computed: {
        SortingOptions() {
            return SortingOptions;
        },
    },
    components: {
        ASelect,
        InterfaceEditSortDescending,
        InterfaceEditSortAscending,
        InterfaceGeometricTriangle,
    },
})
export default class PageSortBy extends Vue {
    $refs!: {
        sortButton: HTMLButtonElement;
    };

    @Prop({})
    viewOptions!: any;

    @Inject(PageListSymbols.TYPE)
    pageListType!: PageListType;

    get orderOptions() {
        const options = [
            {
                id: SortingOptions.UPDATED_AT,
                label: 'Updated At',
            },
            {
                id: SortingOptions.TITLE,
                label: 'Title',
            },
            {
                id: SortingOptions.CREATED_AT,
                label: 'Created At',
            },
        ];

        if (
            this.isGroupByStatus ||
            this.pageListType === PageListType.PROJECT
        ) {
            options.unshift({
                id: SortingOptions.MANUAL,
                label: 'Manual',
            });
        }

        return options;
    }

    get orderAscending() {
        return this.viewOptions.sortDirection === 'asc' ?? false;
    }

    get sortBy() {
        return this.viewOptions.sortBy ?? SortingOptions.UPDATED_AT;
    }

    get isGroupByStatus() {
        const groupBy = this.viewOptions.groupBy ?? GroupingOptions.NONE;
        return groupBy === GroupingOptions.PAGE_STATUS;
    }

    changeOrderingDirection() {
        this.$emit('update', {
            sortDirection: this.orderAscending ? 'desc' : 'asc',
        });
    }

    changeSortingOption(ordering: SortingOptions) {
        this.$emit('update', { sortBy: ordering });
    }
}
</script>
<style lang="scss" scoped>
.page-list-sort-by {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);

    button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--dropdown-controls-select-bg-color);
        border-radius: 6px;
        outline: none;
        color: var(--dropdown-controls-select-text);
        z-index: 11;

        &:hover,
        &.active {
            background: var(--dropdown-controls-select-bg-color__hover);
            color: var(--dropdown-controls-select-text-color__hover);
        }
    }

    &__dropdown {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;

        &__order {
            padding: 7px;
        }
    }
}
</style>
