<template>
    <div class="sidebar-context-menu">
        <button class="empty-link" @click="newDocument">
            <InterfaceAdd1 class="icon" size="14" />
            New Page
        </button>
        <button @click="newFolder">
            <InterfaceFolderAdd class="icon" size="14" />
            New Folder
        </button>
        <button @click="newProject">
            <InterfaceDashboardLayoutSquare class="icon" size="14" />
            New Project
        </button>
        <button @click="newView">
            <InterfaceAlignLayers1 class="icon" size="14" />
            New View
        </button>
        <slot name="sidebar-options" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TabType } from '~/constants';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import InterfaceAlignLayers1 from '~/components/streamline/InterfaceAlignLayers1.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'SidebarContextMenu',
    components: {
        InterfaceAlignLayers1,
        InterfaceSettingCog,
        DropdownButton,
        InterfaceDashboardLayoutSquare,
        InterfaceAdd1,
        InterfaceFolderAdd,
    },
})
export default class SidebarContextMenu extends Vue {
    async newDocument() {
        this.$emit('close');
        const id = await this.$utils.page.newPage();
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        await this.$tabs.openTab(tab);
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
    }

    async newFolder() {
        this.$emit('close');
        const id = await this.$entities.folder.newFolder();
        this.$tracking.trackEventV2(TrackingType.FOLDER, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
    }

    async newProject() {
        this.$emit('close');
        const id = await this.$entities.project.newProject();
        const tab = this.$tabs.createNewTabObject(id, TabType.PROJECT, {
            editingProject: true,
        });
        await this.$tabs.openTab(tab);
        this.$tracking.trackEventV2(TrackingType.PROJECT, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
    }

    async newView() {
        this.$emit('close');
        const id = await this.$entities.view.newView();
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_CONTEXT_MENU,
            entityId: id,
        });
        const tab = this.$tabs.createNewTabObject(id, TabType.VIEW);
        await this.$tabs.openTab(tab);
    }
}
</script>

<style lang="scss" scoped>
.sidebar-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
