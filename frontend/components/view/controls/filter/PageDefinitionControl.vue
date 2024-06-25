<template>
    <div class="page-definition-control filter">
        {{ name }}
        <ASelect
            :items="items"
            :value="temporarySelectedItems"
            :multi="multiselect"
            :show-arrow="false"
            :search="true"
            :width="134"
            :clear="true"
            check-placement="end"
            :search-placeholder="searchPlaceholder || name"
            :placeholder="placeholder || name"
            @change="update"
            @close="$emit('close', temporarySelectedItems)"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TagIcon } from '@vue-hero-icons/solid';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'PageDefinitionControl',
    components: { ASelect, TagIcon },
})
export default class PageDefinitionControl extends Vue {
    @Prop()
    searchPlaceholder!: string;

    @Prop()
    placeholder!: string;

    @Prop({ required: true })
    name!: string;

    @Prop()
    items!: {
        id: string;
        label: string;
        icon?: any;
    }[];

    @Prop()
    selectedItems!: null | string | string[];

    @Prop({ default: false })
    multiselect!: boolean;

    temporarySelectedItems: any = this.multiselect ? [] : null;

    @Watch('selectedItems', { immediate: true })
    onSelectedItemsChange(newVal: string | string[]) {
        this.temporarySelectedItems = newVal;
    }

    update(value: string | string[]) {
        this.temporarySelectedItems = value;
        this.$emit('update', value);
    }
}
</script>
<style lang="scss" scoped>
.page-definition-control {
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
