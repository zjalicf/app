<template>
    <div class="page-project">
        <ASelect
            ref="projectSelect"
            :items="projects"
            :value="selectedProject"
            :dropdown-width="255"
            max-width="250"
            :search="true"
            :clear="false"
            :show-arrow="false"
            :allow-new="false"
            :multi="false"
            :show-null-value-options="selectedProject"
            search-placeholder="Project"
            check-placement="end"
            placeholder="Select Project"
            placement="bottom-start"
            @change="handleProjectChange"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceDeleteSquare from '~/components/streamline/InterfaceDeleteSquare.vue';
import { IFolder, IProject } from '~/@types';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
@Component({
    name: 'PageProjectComponent',
    components: { InterfaceDelete1, ASelect },
})
export default class PageProjectComponent extends Vue {
    @Prop({ default: null })
    entityId!: string;

    $refs!: {
        projectSelect: any;
    };

    get projects() {
        const projects: { id: string | null; label: string; icon: any }[] =
            this.$entities.project.getProjects().map((project: IFolder) => ({
                id: project.id,
                label: project.name,
                icon: {
                    icon: ProjectIcon,
                    bind: { id: project.id },
                } as any,
            }));
        if (this.selectedProject) {
            projects.push({
                id: null,
                label: 'No Project',
                icon: {
                    icon: InterfaceDeleteSquare,
                    color: '#949DAD',
                },
            });
        }
        return projects;
    }

    get selectedProject() {
        if (
            !this.page ||
            !this.page.projectId ||
            !this.$entities.project.byId(this.page.projectId)
        ) {
            return null;
        }
        return this.page.projectId;
    }

    get page() {
        return this.$entities.page.byId(this.entityId);
    }

    handleProjectChange(project: string | null) {
        if (!this.page) return;
        this.$store.dispatch('document/update', {
            id: this.page.id,
            projectId: project,
            archived: false,
        });
    }
}
</script>
<style lang="scss" scoped>
.page-project {
    border-radius: 6px;
}
</style>
