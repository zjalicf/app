<template>
    <div class="filter-by-label filter">
        Filter by Label
        <ASelect
            :items="labels"
            :value="selectedLabels"
            :multi="true"
            :show-arrow="false"
            :search="true"
            :width="134"
            :clear="true"
            search-placeholder="Filter labels"
            placeholder="Select labels"
            @change="handleLabelChange"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TagIcon } from '@vue-hero-icons/solid';
import ASelect from '~/components/ASelect.vue';
import { ILabel } from '~/@types';

@Component({
    name: 'PageFilterByLabel',
    components: { ASelect, TagIcon },
})
export default class PageFilterByLabel extends Vue {
    @Prop()
    tabId!: string;

    dropdownOpen: boolean = false;

    get labels() {
        return this.$store.getters['label/list'].map((label: ILabel) => ({
            id: label,
            label,
        }));
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get selectedLabels() {
        return this.tabData.filters.filterByLabels ?? [];
    }

    handleLabelChange(newSelection: string[]) {
        this.update({ filterByLabels: newSelection });
    }

    update(
        folderOptions: Partial<{
            filterByLabels: string[];
        }>,
    ) {
        this.$emit('update', folderOptions);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.filter-by-label {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);

    &--default {
        padding: 5px 12px;
        background: var(--dropdown-controls-select-bg-color);
        width: 134px;
        justify-content: flex-start;
        display: flex;
        align-items: center;
        border-radius: 6px;
        outline: none;
        color: var(--dropdown-controls-select-text);

        &:hover,
        &.active {
            background: var(--dropdown-controls-select-bg-color__hover);
            color: var(--dropdown-controls-select-text-color__hover);
        }

        p {
            @include ellipsis;
        }
    }
}
</style>
