<template>
    <div class="folder-context-menu">
        <div v-if="!renameMode">
            <button class="empty-link" tabindex="-1" @click="newDocument">
                <InterfaceAdd1 class="icon" size="14" />
                New Page
            </button>
            <button
                class="folder-context-menu--button"
                tabindex="-1"
                @click="newFolder"
            >
                <InterfaceFolderAdd class="icon" size="14" />
                New Folder
            </button>
            <button
                tabindex="-1"
                data-e2e="folder-context-menu-rename"
                @click="renameMode = true"
            >
                <InterfaceEditPencil class="icon" size="14" />
                Rename
            </button>
            <button v-if="!isLocalVault" tabindex="-1" @click="shareFolder">
                <InterfaceShare class="icon" size="14" />
                Share
            </button>
            <button v-if="folderFilepath" tabindex="-1" @click="openInFinder">
                <InterfaceLinkSquare class="icon" size="14" />
                Show in
                {{ $config.os === 'mac' ? 'finder' : 'file explorer' }}
            </button>
            <button tabindex="-1" @click="archiveFolder">
                <InterfaceContentArchive class="icon" size="14" />
                Archive
            </button>
            <button class="danger" tabindex="-1" @click="deleteFolder">
                <InterfaceDeleteBin1 class="icon" size="14" />
                Delete
            </button>
        </div>
        <ProjectEditor
            v-else
            :project="folder"
            :renaming="true"
            @close="handleProjectSelectorClose"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceShare from '~/components/streamline/InterfaceShare.vue';
import ProjectEditor from '~/components/context-menu/ProjectEditor.vue';
import { TabType } from '~/constants';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';

@Component({
    name: 'FolderContextMenu',
    components: {
        InterfaceContentArchive,
        InterfaceAdd1,
        InterfaceShare,
        InterfaceDeleteBin1,
        ProjectEditor,
        InterfaceFolderAdd,
        InterfaceEditPencil,
        InterfaceLinkSquare,
    },
})
export default class FolderContextMenu extends Vue {
    @Prop()
    id!: string;

    @Prop({
        default: false,
    })
    rename!: boolean;

    renameMode: boolean = false;
    get folder() {
        return this.$entities.folder.byId(this.id);
    }

    get isLocalVault() {
        return this.$entities.vault.isLocal;
    }

    get folderFilepath() {
        if (!this.folder) return null;
        return this.folder.filepath;
    }

    async newDocument() {
        this.$emit('close');
        const id = await this.$utils.page.newPage({ projectId: this.id });
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.$tabs.openTab(tab);
        this.$emit('close');

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
    }

    handleProjectSelectorClose() {
        this.$emit('close');
        this.renameMode = false;
    }

    shareFolder() {
        this.$emit('close');
        this.$vfm.show({
            component: () => import('@/components/modal/ShareFolderModal.vue'),
            bind: {
                folder: this.folder,
            },
        });
    }

    async newFolder() {
        this.$emit('close');
        const id = await this.$entities.folder.newFolder({
            sharingUuid: this.folder?.sharingUuid ? v4() : null,
            parentId: this.folder?.id ?? null,
        });
        this.$tracking.trackEventV2(TrackingType.FOLDER, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
    }

    openInFinder() {
        this.$emit('close');
        if (!isElectron() || !this.folder || !this.folder.filepath) return;
        (window as SafeElectronWindow).electron.showItemInFolder(
            this.folder.filepath,
        );
    }

    async archiveFolder() {
        this.$emit('close');
        if (!this.folder) return;
        await this.$entities.folder.archiveFolder(this.folder.id);
    }

    async deleteFolder() {
        this.$emit('close');
        if (!this.folder) return;
        await this.$entities.folder.deleteFolder(this.folder.id);
    }

    mounted() {
        if (!this.folder) return;
        const folder = this.$entities.folder.byId(this.folder.id);
        if (!folder) return;
        if (
            (folder.status && ['new', 'creating'].includes(folder.status)) ||
            this.rename
        ) {
            this.renameMode = true;
        }
    }

    beforeDestroy() {
        this.renameMode = false;
    }
}
</script>

<style lang="scss" scoped>
.folder-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
