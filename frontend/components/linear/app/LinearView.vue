<template>
    <div class="linear-view">
        <div class="linear-view__content">
            <tippy
                :content="getRefText"
                :delay="[300, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                target=".has-tippy"
            />
            <IntegrationViewEditor
                v-if="editMode"
                class="linear-view__content__editor"
                :view-id="tabData.editingView.id"
                @cancel="cancelEditView"
            />
            <IntegrationHeader
                v-else
                class="linear-view__content__header tab-content-gutter"
                :views="integrationViews"
                :active-tab="activeTab"
                @edit="editView"
                @delete="deleteView"
                @reload="reloadView"
                @duplicate="duplicateView"
                @select="selectView"
                @new="createNewView"
            >
                <template #icon><LinearIcon size="17" /></template>
                <template #title>Linear</template>
                <template #controls>
                    <LinearControls
                        :view-id="activeTab"
                        :search="true"
                        :reloading="reloading"
                        @search="updateSearch"
                        @update="handleControlsUpdate"
                        @edit="editView"
                        @delete="deleteView"
                        @reload="reloadView"
                        @duplicate="duplicateView"
                    />
                </template>
            </IntegrationHeader>
            <LinearIssuesList
                :view-id="activeTab"
                @loading-start="updateTabData({ loading: true })"
                @loading-end="updateTabData({ loading: false })"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Inject, InjectReactive, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import LinearVirtualList from '~/components/linear/app/LinearVirtualList.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import LinearEditViewHeader from '~/components/linear/app/LinearEditViewHeader.vue';
import LinearIssuesList from '~/components/linear/app/LinearIssuesList.vue';
import IntegrationHeader, {
    IntegrationView,
} from '~/components/integrations/views/IntegrationHeader.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';
import IntegrationViewEditor from '~/components/integrations/views/IntegrationViewEditor.vue';
import LinearControls from '~/components/linear/app/LinearControls.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'LinearView',
    components: {
        LinearControls,
        IntegrationViewEditor,
        LinearIcon,
        IntegrationHeader,
        LinearIssuesList,
        LinearEditViewHeader,
        InterfaceSearch,
        LoadingIcon,
        LinearVirtualList,
    },
})
export default class LinearView extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @InjectReactive(TabSymbols.TAB_DATA)
    tabData!: any;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: any;

    reloading = false;

    get integration() {
        return this.$entities.linear.getIntegration();
    }

    get teamId() {
        return this.$entities.linear.parseId(this.tabData.team?.id).id;
    }

    get defaultView(): IntegrationView {
        return this.integrationViews.find((view: any) => view.default)!;
    }

    get activeTab() {
        if (!this.activeView) {
            return this.defaultView.id;
        }
        return this.tabData.activeTab ?? this.defaultView.id;
    }

    get editingActiveTab() {
        return this.tabData.editingView?.id === this.activeTab;
    }

    get integrationViews() {
        return this.$entities.linear.getIntegrationViews();
    }

    get activeView() {
        return this.integrationViews?.find(
            (view: any) => view?.id === this.tabData.activeTab,
        );
    }

    get editMode() {
        return !!this.tabData.editingView;
    }

    async reloadView(viewId: string) {
        this.reloading = true;
        const view = this.$entities.linear.getViewDefinition(viewId);
        try {
            await this.$entities.linear.refreshView(view);
        } catch (e) {
            console.log(e);
        }
        this.reloading = false;
    }

    duplicateView() {
        alert('NOT IMPLEMNTED');
    }

    updateSearch(searchTerm: string) {
        this.updateTabData({ searchTerm });
    }

    handleControlsUpdate(data: any) {
        this.$entities.linear.updateView(this.activeTab, data);
    }

    deleteView(id: string) {
        const views = this.$entities.linear.getIntegrationViews();
        const viewIndex = views.findIndex((view: any) => view.id === id);
        const nextView = views?.[viewIndex - 1] ?? { id: 'my_issues' };
        this.updateTabData({
            activeTab: nextView?.id,
        });
        setTimeout(() => {
            this.$entities.linear.deleteView(id);
        }, 100);
        this.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.DELETE_VIEW,
            sourceMeta: id,
        });
    }

    editView(viewId: string) {
        const view = this.$entities.linear.getViewDefinition(viewId);
        this.updateTabData({
            editingView: view,
        });
    }

    cancelEditView() {
        this.updateTabData({
            editingView: null,
        });
    }

    selectView(viewId: string) {
        const payload = {
            activeTab: viewId,
        } as any;
        if (this.editingActiveTab) {
            payload.editingView = null;
        }
        this.updateTabData(payload);
        this.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.SELECT_VIEW,
            sourceMeta: viewId,
        });
    }

    async createNewView() {
        const view = await this.$entities.linear.createNewView();
        await this.$nextTick();
        this.updateTabData({
            editingView: view,
        });
        this.selectView(view?.id);
        this.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.CREATE_VIEW,
            sourceMeta: view?.id ?? 'unknown',
        });
    }

    getRefText(reference: any) {
        return reference.getAttribute('data-tippy-content') ?? '';
    }
}
</script>

<style lang="scss" scoped>
.linear-view {
    width: 100%;
    height: 100%;

    &__content {
        position: relative;
        width: 100%;
        height: 100%;

        &__header {
            position: absolute;
            width: 100%;
            top: 0;
            z-index: 1;
        }

        &__editor {
            position: absolute;
            width: 100%;
            top: 0;
            z-index: 1;
        }
    }
}
</style>
