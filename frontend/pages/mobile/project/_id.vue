<template>
    <div class="mobile-project page">
        <MobileProjectHeader :project="project" />
        <MobilePageListWrapper
            :pages="pages"
            :display-options="projectDisplayOptions"
            :page-list-type="projectType"
            :level="level"
            :tracking-type="trackingType"
        />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MobilePageListWrapper from '~/components/mobile/common/page-list/MobilePageListWrapper.vue';
import MobileViewHeader from '~/components/mobile/common/headers/MobileViewHeader.vue';
import MobileProjectHeader from '~/components/mobile/common/headers/MobileProjectHeader.vue';
import { IFolder } from '~/@types';
import { GroupingOptions, SortingOptions } from '~/constants';
import { Tab } from '~/@types/app';

@Component({
    name: 'mobile-view',
    layout: 'mobile',
    computed: {},
    components: {
        MobileProjectHeader,
        MobileViewHeader,
        MobilePageListWrapper,
    },
    asyncData({ route, $entities }) {
        const project = $entities.project.byId(route.params.id);
        return { project };
    },
})
export default class View extends Vue {
    project!: IFolder;

    get trackingType() {
        if (!this.project) return null;
        return this.$tracking._resolveProjectSource({
            entityId: this.project.id,
        } as Tab);
    }

    get level() {
        if (!this.$route.query.level) return null;
        return +this.$route.query.level + 1;
    }

    get pages() {
        if (!this.project?.id) return [];
        return this.$entities.project.getProjectPages(this.project.id);
    }

    get projectDisplayOptions() {
        if (!this.project?.id)
            return {
                sortBy: SortingOptions.MANUAL,
                groupBy: GroupingOptions.PAGE_STATUS,
                sortDirection: 'desc',
                collapsed: {},
                showTasks: false,
                hideCompletedTasks: false,
                selectedDisplayProperties: ['icon', 'tasks', 'date', 'updated'],
            };
        return this.$entities.project.getProjectViewOptions(this.project.id);
    }

    get projectType() {
        if (!this.project) return null;
        return this.project.type;
    }
}
</script>
<style lang="scss" scoped>
.mobile-project {
    background: var(--app-mobile-bg-color);
    width: 100%;
    height: $pageHeight;
}
</style>
