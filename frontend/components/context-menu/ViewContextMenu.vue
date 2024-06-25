<template>
    <div class="view-context-menu">
        <DropdownButton
            v-if="isCustomView"
            class="view-context-menu__button"
            @click="editView"
        >
            <div class="view-context-menu__left">
                <InterfaceEditWrite2 class="icon" />
                Edit View
            </div>
            <div class="view-context-menu__right"></div>
        </DropdownButton>
        <DropdownButton
            v-if="isCustomView"
            class="view-context-menu__button danger"
            @click="deleteView"
        >
            <div class="view-context-menu__left">
                <InterfaceDeleteBin1 class="icon" />
                Delete View
            </div>
            <div class="view-context-menu__right"></div>
        </DropdownButton>
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import InterfaceEditLandscapeSetting from '~/components/streamline/InterfaceEditLandscapeSetting.vue';
import InterfaceLayoutTwoColumns from '~/components/streamline/InterfaceLayoutTwoColumns.vue';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceEditWrite2 from '~/components/streamline/InterfaceEditWrite2.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceFavoriteStarAlternate from '~/components/streamline/InterfaceFavoriteStarAlternate.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import { ViewType } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'ViewContextMenu',
    components: {
        InterfaceSettingCog,
        InterfaceFavoriteStarAlternate,
        InterfaceDeleteBin1,
        InterfaceEditWrite2,
        DropdownButton,
        InterfaceLinkSquare,
        InterfaceAlertInformationCircle,
        InterfaceEditLandscapeSetting,
        InterfaceLayoutTwoColumns,
    },
})
export default class ViewContextMenu extends Vue {
    @Prop()
    viewId!: string;

    get isCustomView() {
        return (
            this.$entities.view.getViewById(this.viewId)?.type ===
            ViewType.CUSTOM
        );
    }

    editView() {
        this.$emit('close');
        this.$entities.view.editView(this.viewId);
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.OPEN_EDIT_MODE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: this.viewId,
        });
    }

    deleteView() {
        this.$emit('close');
        this.$entities.view.deleteView(this.viewId);
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.DELETE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: this.viewId,
        });
    }

    openViewSettings() {
        this.$emit('close');
        this.$utils.navigation.openSettings(
            'sidebar',
            TrackingActionSource.VIEW_CONTEXT_MENU,
        );
    }
}
</script>

<style lang="scss" scoped>
.view-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;

    &__left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &__right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        :deep(.tooltip-keys--button) {
            background: none;
            color: var(--context-menu-tooltip-keys-color);
        }
    }

    &__button {
        justify-content: space-between;
    }
}
</style>
