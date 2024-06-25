<template>
    <button
        class="page-row-project has-tippy"
        :data-tippy-content="projectTooltip"
        @click="goToProject"
    >
        <ProjectIcon :id="project.id" class="icon" size="14" font-size="16" />
        <div class="page-row-project__name">
            {{ $entities.folder.getName(project.id) }}
        </div>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TabType } from '~/constants';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
@Component({
    name: 'PageRowProject',
    components: { ProjectIcon },
})
export default class PageRowProject extends Vue {
    @Prop({
        required: true,
    })
    pageId!: string;

    get page() {
        return this.$store.getters['document/byId'](this.pageId) ?? null;
    }

    get project() {
        if (!this.page) return null;
        return this.$entities.project.byId(this.page.projectId);
    }

    get projectTooltip() {
        return `<span class='tooltip'>Go to ${
            this.project?.name ?? 'Untitled'
        }</span>`;
    }

    goToProject(event: MouseEvent) {
        if (!this.project) return;
        const tab = this.$tabs.createNewTabObject(
            this.project.id,
            TabType.PROJECT,
        );
        this.$tabs.openTabWithEvent(tab, event);
    }
}
</script>
<style scoped lang="scss">
.page-row-project {
    @include font12-400;
    letter-spacing: -0.124px;
    border-radius: 31px;
    border: 1px solid var(--document-row-tasks-count-border-color);
    padding: 2px 8px;
    text-align: center;
    color: var(--document-row-tasks-count-text-color);
    white-space: nowrap;
    display: flex;
    align-items: center;
    overflow: hidden;
    max-width: 170px;
    &:hover {
        background: $blueGrey500-16;
    }

    .icon {
        flex-shrink: 0;
        margin-right: 4px;
    }

    &__name {
        @include ellipsis;
    }
}
</style>
