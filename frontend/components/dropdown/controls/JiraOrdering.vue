<template>
    <div class="jira-group-by">
        Sort by
        <div class="jira-group-by--dropdown">
            <ASelect
                :items="orderOptions"
                :value="sortBy"
                :width="150"
                :dropdown-width="150"
                check-placement="start"
                @change="changeSortingOption"
            />
            <button
                class="jira-group-by--dropdown--order"
                @click="changeOrderingDirection"
            >
                <InterfaceEditSortAscending v-if="orderAscending" size="14" />
                <InterfaceEditSortDescending v-if="!orderAscending" size="14" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SortingOptions } from '~/constants';

import InterfaceEditSortDescending from '~/components/icons/InterfaceEditSortDescending.vue';
import InterfaceEditSortAscending from '~/components/icons/InterfaceEditSortAscending.vue';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'JiraOrdering',
    components: {
        ASelect,
        InterfaceEditSortAscending,
        InterfaceEditSortDescending,
    },
})
export default class JiraOrdering extends Vue {
    @Prop({ required: true })
    tabId!: string;

    $refs!: {
        optionsButton: HTMLButtonElement;
    };

    get orderOptions() {
        return [
            {
                id: SortingOptions.KEY,
                label: 'Key',
            },
            {
                id: SortingOptions.TITLE,
                label: 'Title',
            },
            {
                id: SortingOptions.DATE,
                label: 'Updated At',
            },
            {
                id: SortingOptions.CREATED_AT,
                label: 'Created At',
            },
            {
                id: SortingOptions.ASSIGNEE,
                label: 'Assignee',
            },
            {
                id: SortingOptions.PRIORITY,
                label: 'Priority',
            },
        ];
    }

    get orderAscending() {
        return (
            this.$store.getters['tabs/byId'](this.tabId)?.data
                ?.orderAscending ?? true
        );
    }

    get sortBy() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data?.sortBy;
    }

    changeOrderingDirection() {
        this.$emit('update', { orderAscending: !this.orderAscending });
    }

    changeSortingOption(ordering: SortingOptions) {
        this.$emit('update', { sortBy: ordering });
    }
}
</script>
<style lang="scss" scoped>
.jira-group-by {
    @include font12-500;
    margin-bottom: 10px;
    outline: none;
    width: 100%;
    color: var(--dropdown-controls-text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--dropdown-controls-select-bg-color);
        border-radius: 6px;
        outline: none;
        color: var(--dropdown-controls-select-text-color);
        z-index: 11;

        &:hover,
        &.active {
            background: var(--dropdown-controls-select-bg-color__hover);
            color: var(--dropdown-controls-select-text-color__hover);
        }
    }

    &--dropdown {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;

        &--order {
            padding: 7px;
        }
    }
}
</style>
