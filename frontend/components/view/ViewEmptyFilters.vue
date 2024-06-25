<template>
    <div class="view-empty-filters">
        {{ count }} Pages hidden by filters
        <button class="view-empty-filters__clear" @click="clearFilter">
            Clear Filters
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { ViewType } from '~/constants';

@Component({
    name: 'ViewEmptyFilters',
    components: { InterfaceAdd1 },
})
export default class ViewEmptyFilters extends Vue {
    get count() {
        return this.$entities.view.getSidebarCount(
            this.$entities.view.getViewByType(ViewType.ALL_PAGES).id,
        );
    }

    clearFilter() {
        this.$emit('clear-filter');
    }
}
</script>
<style lang="scss" scoped>
.view-empty-filters {
    @include font12-400;
    user-select: none;
    cursor: default;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--page-list-empty-color);
    display: flex;
    align-items: center;
    gap: 8px;

    &__clear {
        color: var(--page-list-empty-add-color);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 6px;
        border: 1px solid var(--page-list-empty-add-color);

        &:hover {
            color: var(--page-list-empty-add-color__hover);
            border: 1px solid var(--page-list-empty-add-color__hover);
        }
    }
}
</style>
