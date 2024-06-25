<template>
    <div class="view page" @mousedown="$emit('focus-tab')">
        <div class="view__content">
            <div v-if="editing">
                <ViewEditHeader :count="pages.length" />
            </div>
            <PageList
                :pages="pages"
                :drag="isDragEnabled"
                :empty-filter-state="showFiltersEmptyState"
            />
            <ViewEmptyState v-if="showEmptyState && !hasGrouping" />
            <ViewEmptyFilters
                v-if="showFiltersEmptyState"
                @clear-filter="clearFilter"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Provide } from 'vue-property-decorator';
import TabMixin from '~/components/tabs/TabMixin.vue';
import PageList from '~/components/page-list/PageList.vue';
import ViewEditHeader from '~/components/view/ViewEditHeader.vue';
import ViewEmptyState from '~/components/view/ViewEmptyState.vue';
import ViewEmptyFilters from '~/components/view/ViewEmptyFilters.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
} from '~/@types/tracking';
import { GroupingOptions, PageListType, ViewType } from '~/constants';
import { PageListSymbols } from '~/constants/symbols';

@Component({
    name: 'ViewTab',
    components: {
        ViewEmptyFilters,
        ViewEmptyState,
        ViewEditHeader,
        PageList,
    },
})
export default class ViewTab extends TabMixin<any> {
    @Provide(PageListSymbols.TYPE)
    pageListType = PageListType.VIEW;

    get view() {
        return this.$entities.view.getViewById(this.entityId);
    }

    get editing() {
        if (!this.view) return false;
        return this.view.editing;
    }

    get isDragEnabled() {
        if (!this.view) return false;
        const draggableViews = [
            ViewType.ACTIVE,
            ViewType.ALL_PAGES,
            ViewType.CUSTOM,
        ];
        const draggableGroupBy = [GroupingOptions.PAGE_STATUS];
        return (
            draggableViews.includes(this.view.type) &&
            draggableGroupBy.includes(this.groupBy)
        );
    }

    updateGroupData(data: Partial<any>) {
        const groupDataProperties = ['filterDefinition'];
        const groupData = groupDataProperties.reduce((acc: any, key: any) => {
            if (key in data) {
                acc[key] = data[key];
            }
            return acc;
        }, {} as any);
        if (!Object.keys(groupData).length) return;
        this.$tabs.updateGroupData(this.groupId, this.entityId, groupData);
    }

    get viewDefinition() {
        if (this.tabData.temporaryViewDefinition) {
            return [
                {
                    combine: 'and',
                    definition: this.tabData.temporaryViewDefinition,
                },
            ];
        }
        return this.$entities.view.getViewDefinition(this.entityId);
    }

    get pages() {
        const pages = this.$entities.view.getPagesByDefinition(
            this.viewDefinition,
        );

        if (this.tabData.filterDefinition) {
            return this.$entities.view.filterPagesByDefinition(
                pages,
                this.tabData.filterDefinition,
            );
        }
        return pages;
    }

    get hasInteractiveFilters() {
        return this.interactiveFilters && this.interactiveFilters.length > 0;
    }

    get interactiveFilters() {
        const hiddenFilters = ['dailyDoc'];
        return this.tabData.filterDefinition.filter(
            (filter: any) => !hiddenFilters.includes(filter.property),
        );
    }

    get showFiltersEmptyState() {
        return this.pages.length === 0 && this.hasInteractiveFilters;
    }

    get showEmptyState() {
        return this.pages.length === 0 && !this.hasInteractiveFilters;
    }

    get groupBy() {
        return this.view?.viewOptions?.groupBy ?? GroupingOptions.NONE;
    }

    get hasGrouping() {
        return this.groupBy !== GroupingOptions.NONE;
    }

    clearFilter() {
        const hiddenFilters = ['dailyDoc'];
        const filters = this.tabData.filterDefinition.filter((filter: any) =>
            hiddenFilters.includes(filter.property),
        );

        this.updateTabData({
            filterDefinition: filters,
        });

        const type = this.$tracking.resolveTypeFromView(this.entityId);
        if (type) {
            this.$tracking.trackEventV2(type, {
                action: TrackingAction.CLEAR_FILTER,
                source: TrackingActionSource.EMPTY_STATE,
                sourceMeta: TrackingActionSourceMeta.ALL,
            });
        }
    }
}
</script>

<style scoped lang="scss">
.view {
    width: 100%;

    &__content {
        position: relative;
        height: $desktopContentHeight;

        &__empty-filters {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
