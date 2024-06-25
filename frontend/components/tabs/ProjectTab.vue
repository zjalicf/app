<template>
    <div class="project page" @mousedown="$emit('focus-tab')">
        <div class="project__content">
            <PageList :pages="pages" :drag="isDragEnabled" />
            <ProjectEmptyState v-if="showEmptyState && !hasGrouping" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Provide } from 'vue-property-decorator';
import TabMixin from '~/components/tabs/TabMixin.vue';
import PageList from '~/components/page-list/PageList.vue';

import { GroupingOptions, PageListType, SortingOptions } from '~/constants';
import { PageListSymbols } from '~/constants/symbols';
import { IDocument } from '~/components/document/model';
import ProjectEmptyState from '~/components/project/ProjectEmptyState.vue';
@Component({
    name: 'ProjectTab',
    components: {
        ProjectEmptyState,
        PageList,
    },
})
export default class ProjectTab extends TabMixin<any> {
    @Provide(PageListSymbols.TYPE)
    pageListType = PageListType.PROJECT;

    get isDragEnabled() {
        return (
            this.groupBy === GroupingOptions.PAGE_STATUS ||
            (this.groupBy === GroupingOptions.NONE &&
                this.sortBy === SortingOptions.MANUAL)
        );
    }

    get pages() {
        return this.$entities.project
            .getProjectPages(this.entityId)
            .map((page: IDocument) => ({
                ...page,
                ...this.$entities.page.getPostprocessingMap(page.id),
            }));
    }

    get showEmptyState() {
        return this.pages.length === 0;
    }

    get groupBy() {
        return (
            this.$entities.project.getProjectViewOptions(this.entityId)
                .groupBy ?? GroupingOptions.NONE
        );
    }

    get sortBy() {
        return (
            this.$entities.project.getProjectViewOptions(this.entityId)
                .sortBy ?? SortingOptions.UPDATED_AT
        );
    }

    get hasGrouping() {
        return this.groupBy !== GroupingOptions.NONE;
    }
}
</script>

<style scoped lang="scss">
.project {
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
