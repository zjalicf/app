<template>
    <div>
        <ASelect
            :items="items"
            :value="selectedValue"
            :styled="true"
            :multi="false"
            :clear="false"
            :width="130"
            check-placement="start"
            @change="handleOptionClick($event)"
        />
        <button
            class="page-list-sort-by__dropdown__order"
            @click="changeOrderingDirection"
        >
            <InterfaceEditSortAscending
                v-if="orderAscending"
                class="has-tippy"
                data-tippy-content="<div class='tooltip'>Ascending</div>"
                size="14"
            />
            <InterfaceEditSortDescending
                v-if="!orderAscending"
                class="has-tippy"
                data-tippy-content="<div class='tooltip'>Descending</div>"
                size="14"
            />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import ASelect from '~/components/ASelect.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';
import { capitalize } from '~/helpers/util';
import {
    LinearSortDirectionOptions,
    LinearSortingOptions,
} from '~/components/linear/constants';
import InterfaceEditSortAscending from '~/components/icons/InterfaceEditSortAscending.vue';
import InterfaceEditSortDescending from '~/components/icons/InterfaceEditSortDescending.vue';

@Component({
    name: 'LinearSortByControls',
    components: {
        InterfaceEditSortDescending,
        InterfaceEditSortAscending,
        ASelect,
        ADropDown,
    },
})
export default class LinearSortByControls extends Vue {
    @Prop({ required: true })
    viewId!: string;

    sortByOptions = Object.values(LinearSortingOptions);

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get orderAscending() {
        return (
            this.viewDefinition.sortDirection ===
            LinearSortDirectionOptions.ASCENDING
        );
    }

    changeOrderingDirection() {
        this.$emit('update', {
            sortDirection: this.orderAscending
                ? LinearSortDirectionOptions.DESCENDING
                : LinearSortDirectionOptions.ASCENDING,
        });
    }

    get selectedValue() {
        return this.viewDefinition.sortBy;
    }

    get items() {
        return this.sortByOptions.map((option: any) => ({
            id: option,
            label: capitalize(option),
        })) as any[];
    }

    handleOptionClick(id: string) {
        this.$emit('update', {
            sortBy: id,
        });
    }
}
</script>
<style lang="scss" scoped>
div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;

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

        padding: 7px;
    }
}
</style>
