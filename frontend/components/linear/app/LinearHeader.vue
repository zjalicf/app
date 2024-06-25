<template>
    <div class="linear-header">
        <LinearEditViewHeader
            v-if="isEditing"
            ref="editingHeader"
            :view-id="header.id"
            @delete-view="$emit('delete-view', $event)"
        />
        <div v-else>
            <div class="linear-header__metadata">
                {{ header.issueCount }} Issues
            </div>
            <div class="linear-header__heading">
                <button
                    ref="teamSelect"
                    class="linear-header__heading__team-select"
                    :disabled="header.default"
                    @click="showViewEditor"
                >
                    {{ header?.name || 'New View' }}
                </button>
                <div class="linear-header__heading__controls">
                    <LinearControls
                        :view-id="header.id"
                        :search="true"
                        @update="handleControlsUpdate"
                        @search="$emit('search', $event)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Prop,
    Vue,
} from 'vue-property-decorator';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';
import LinearFilterItem from '~/components/linear/app/LinearFilterItem.vue';
import LinearControls from '~/components/linear/app/LinearControls.vue';
import LinearEditViewHeader from '~/components/linear/app/LinearEditViewHeader.vue';
import InterfaceEditBrush1 from '~/components/streamline/InterfaceEditBrush1.vue';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'LinearHeader',
    components: {
        InterfaceEditBrush1,
        LinearEditViewHeader,
        LinearControls,
        LinearFilterItem,
        AcreomChevronDown,
    },
})
export default class LinearHeader extends Vue {
    @Prop({ required: true })
    header!: any;

    @InjectReactive(TabSymbols.TAB_DATA)
    tabData!: Record<string, any>;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    $refs!: {
        editingHeader: LinearEditViewHeader;
    };

    get editingView() {
        return this.tabData.editingView ?? {};
    }

    get isEditing() {
        return this.editingView.id === this.header.id;
    }

    showViewEditor() {
        const view = this.$entities.linear.getViewDefinition(this.header.id);
        this.updateTabData({
            editingView: view,
        });
    }

    handleControlsUpdate(data: any) {
        this.$entities.linear.updateView(this.header.id, data);
    }
}
</script>
<style lang="scss" scoped>
.linear-header {
    user-select: none;
    padding-top: 14px;

    &__metadata {
        user-select: none;
        color: var(--tab-meta-text-color);
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
        margin-bottom: 7px;
    }

    &__heading {
        &.expanded {
            border-bottom: 1px solid var(--tab-divider-color);
        }

        margin-bottom: 0px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__team-select {
            color: var(--tab-title-text-color);
            font-weight: bold;
            font-size: 26px;
            line-height: 40px;
            user-select: none;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 6px;
            border-radius: 6px;

            &__icon {
                margin-left: 8px;
                // hide icon and only show it on hover
                display: none;
            }

            &:not(:disabled):hover,
            &.active {
                background: var(
                    --jira-page-header-filter-selector-bg-color__hover
                );
            }

            .icon {
                color: var(--jira-page-header-filter-selector-icon-color);
                flex-shrink: 0;
                margin-left: 9px;
            }

            .loading-icon {
                color: var(--jira-page-header-filter-selector-loading-color);
                flex-shrink: 0;
                margin-left: 9px;
            }
        }
    }

    &__filters {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 0;

        border-top: 1px solid var(--page-status-header-border-color);
        border-bottom: 1px solid var(--page-status-header-border-color);
    }
}
</style>
