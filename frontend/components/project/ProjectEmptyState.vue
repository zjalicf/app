<template>
    <div class="project-empty-state">There are no pages in {{ name }}.</div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'ProjectEmptyState',
    components: { InterfaceAdd1 },
})
export default class ProjectEmptyState extends Vue {
    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    get project() {
        return this.$entities.folder.byId(this.entityId);
    }

    get name() {
        return this.$entities.folder.getName(this.entityId);
    }
}
</script>
<style lang="scss" scoped>
.project-empty-state {
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

    &__edit {
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
