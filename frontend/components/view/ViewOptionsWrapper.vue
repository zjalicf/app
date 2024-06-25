<template>
    <button
        ref="viewOptionsButton"
        class="view-options-wrapper"
        :class="{ active: dropdownVisible }"
        @click="onDropdownHandler"
    >
        <InterfaceSettingMenuHorizontal class="icon" />
    </button>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Prop,
    Vue,
} from 'vue-property-decorator';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import ViewOptionsDropdown from '~/components/view/ViewOptionsDropdown.vue';
import { TabSymbols } from '~/constants/symbols';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'ViewOptionsWrapper',
    components: { InterfaceSettingMenuHorizontal },
})
export default class ViewOptionsWrapper extends Vue {
    @Prop({ required: true })
    viewId!: string;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    dropdownVisible = false;
    $refs!: {
        viewOptionsButton: HTMLButtonElement;
    };

    updateView() {
        this.$entities.view.update({
            id: this.viewId,
            editing: true,
        });
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.OPEN_EDIT_MODE,
            source: TrackingActionSource.CUSTOM_VIEW_DROPDOWN,
            entityId: this.viewId,
        });
    }

    deleteView() {
        this.$entities.view.deleteView(this.viewId);
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.DELETE,
            source: TrackingActionSource.CUSTOM_VIEW_DROPDOWN,
            entityId: this.viewId,
        });
    }

    onDropdownHandler() {
        this.dropdownVisible = true;
        this.$dropdown.show({
            component: ViewOptionsDropdown,
            parent: this.$refs.viewOptionsButton,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            on: {
                edit: () => {
                    this.updateView();
                },
                delete: () => {
                    this.deleteView();
                },
            },
            onClose: () => {
                this.dropdownVisible = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.view-options-wrapper {
    padding: 7px;
    border-radius: 6px;
    color: var(--tab-controls-icon-color);

    &:hover,
    &.active {
        color: var(--tab-controls-icon-color__hover);
        background: var(--tab-controls-bg-color__hover);
    }
}
</style>
