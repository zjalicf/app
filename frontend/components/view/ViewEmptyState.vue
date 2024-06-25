<template>
    <div class="view-empty-state">
        No pages match view settings
        <button
            v-if="!isDefaultView"
            class="view-empty-state__edit"
            @click="editView"
        >
            Edit View
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TabSymbols } from '~/constants/symbols';
import { ViewType } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'ViewEmptyState',
    components: { InterfaceAdd1 },
})
export default class ViewEmptyState extends Vue {
    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    get view() {
        return this.$entities.view.getViewById(this.entityId);
    }

    get isDefaultView() {
        return this.view?.isDefault || this.view?.type !== ViewType.CUSTOM;
    }

    editView() {
        this.$entities.view.editView(this.entityId);
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.OPEN_EDIT_MODE,
            source: TrackingActionSource.EMPTY_STATE,
            entityId: this.entityId,
        });
    }
}
</script>
<style lang="scss" scoped>
.view-empty-state {
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
