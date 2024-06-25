<template>
    <div class="filter-by-folder filter">
        Filter by Folder
        <ASelect
            :items="folders"
            :value="selectedFolders"
            :multi="false"
            :show-arrow="false"
            :search="true"
            :width="134"
            :clear="true"
            check-placement="end"
            search-placeholder="Filter folders"
            placeholder="Select folders"
            @change="handleFolderChange"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TagIcon } from '@vue-hero-icons/solid';
import ASelect from '~/components/ASelect.vue';
import { IFolder } from '~/@types';

@Component({
    name: 'PageFilterByFolder',
    components: { ASelect, TagIcon },
})
export default class PageFilterByFolder extends Vue {
    @Prop()
    tabId!: string;

    get folders() {
        return this.$entities.folder.getFolders().map((folder: IFolder) => ({
            id: folder.id,
            label: folder.name,
        }));
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get selectedFolders() {
        return this.tabData.filters.filterByFolder;
    }

    handleFolderChange(newSelection: string) {
        this.update({ filterByFolder: newSelection });
    }

    update(
        folderOptions: Partial<{
            filterByFolder: string | null;
        }>,
    ) {
        this.$emit('update', folderOptions);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.filter-by-folder {
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
