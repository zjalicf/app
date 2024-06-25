<template>
    <div class="project-context-menu">
        <button
            tabindex="-1"
            data-e2e="folder-context-menu-rename"
            @click="onEdit"
        >
            <InterfaceEditPencil class="icon" size="14" />
            Edit Project
        </button>
        <button v-if="project.filepath" tabindex="-1" @click="openInFinder">
            <InterfaceLinkSquare class="icon" size="14" />
            Show in
            {{ $config.os === 'mac' ? 'finder' : 'file explorer' }}
        </button>
        <button tabindex="-1" @click="archiveProject">
            <InterfaceContentArchive class="icon" size="14" />
            Archive
        </button>
        <button class="danger" tabindex="-1" @click="deleteProject">
            <InterfaceDeleteBin1 class="icon" size="14" />
            Delete
        </button>
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import ProjectEditor from '~/components/context-menu/ProjectEditor.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TabType } from '~/constants';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';

@Component({
    name: 'ProjectContextMenu',
    components: {
        InterfaceContentArchive,
        InterfaceAdd1,
        InterfaceDeleteBin1,
        ProjectEditor,
        InterfaceEditPencil,
        InterfaceLinkSquare,
    },
})
export default class ProjectContextMenu extends Vue {
    @Prop({ required: true })
    id!: string;

    @Prop({
        default: false,
    })
    rename!: boolean;

    renameMode: boolean = false;

    get project() {
        return this.$entities.project.byId(this.id);
    }

    onEdit() {
        this.$emit('close');
        const activeTab = this.$tabs.activeTab();
        if (activeTab && activeTab.entityId === this.id) {
            this.$emit('edit');
            return;
        }
        const tab = this.$tabs.createNewTabObject(this.id, TabType.PROJECT, {
            editingProject: true,
        });
        this.$tabs.openTab(tab);
    }

    openInFinder() {
        if (!isElectron() || !this.project?.filepath) return;

        (window as SafeElectronWindow).electron.showItemInFolder(
            this.project.filepath,
        );
        this.$emit('close');
    }

    async deleteProject() {
        if (!this.project) return;
        this.$emit('close');
        await this.$entities.project.deleteProject(this.project.id);
    }

    async archiveProject() {
        if (!this.project) return;
        this.$emit('close');
        await this.$entities.project.archiveProject(this.project.id);
    }

    beforeDestroy() {
        this.renameMode = false;
    }

    mounted() {
        if (!this.project) return;
        if (
            (this.project.status &&
                ['new', 'creating'].includes(this.project.status)) ||
            this.rename
        ) {
            this.renameMode = true;
        }
    }
}
</script>

<style lang="scss" scoped>
.project-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
