<template>
    <div class="sidebar-menu__wrapper">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[500, 20]"
            :touch="false"
            :offset="`0, 0`"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="sidebar-menu">
            <button
                class="sidebar-menu--new-page has-tippy"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.NEW_DOCUMENT,
                    )
                "
                data-e2e="new-page"
                @click="newPage"
            >
                <InterfaceAdd1 class="icon add-icon" size="12" />
                New Page
            </button>
            <div class="sidebar-menu--wrapper">
                <button
                    ref="newEntityButton"
                    name="newFolderTrigger"
                    class="sidebar-menu__trigger has-tippy"
                    :class="{ active: newContainerActive }"
                    :data-tippy-content="
                        $utils.tooltip.createTooltip('New Folder or View')
                    "
                    tabindex="-1"
                    data-e2e="new-folder"
                    @click="showNewEntityDropdown"
                >
                    <InterfaceFolderAdd size="14" class="icon" />
                </button>
                <button
                    ref="helpMenuButton"
                    class="sidebar-menu__trigger has-tippy"
                    tabindex="-1"
                    :data-tippy-content="
                        $utils.tooltip.createTooltip('Show Help Menu')
                    "
                    :class="{ active: helpMenuActive }"
                    @click="openHelpDropdown"
                >
                    <span v-if="updateAvailable" class="notification"></span>
                    <InterfaceContentBookOpen size="14" class="icon" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import InterfaceContentBookOpen from '~/components/streamline/InterfaceContentBookOpen.vue';
import { TabType } from '~/constants';
import HelpDropdown from '~/components/dropdown/HelpDropdown.vue';
import NewEntityDropdown from '~/components/sidebar/SidebarTree/NewEntityDropdown.vue';
import CButton from '~/components/CButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '@/helpers/decorators';

@Component({
    name: 'SidebarFooter',
    components: {
        CButton,
        InterfaceFolderAdd,
        InterfaceAdd1,
        InterfaceContentBookOpen,
    },
})
export default class SidebarFooter extends Vue {
    helpMenuActive: boolean = false;
    newContainerActive: boolean = false;
    $refs!: {
        helpMenuButton: HTMLButtonElement;
        newEntityButton: HTMLButtonElement;
    };

    @TrackEvent(TrackingType.SIDEBAR, {
        action: TrackingAction.OPEN_HELP_MENU,
    })
    openHelpDropdown() {
        this.helpMenuActive = true;
        this.$dropdown.show({
            component: HelpDropdown,
            parent: this.$refs.helpMenuButton,
            popperOptions: {
                placement: 'top-end',
            },
            onClose: () => {
                this.helpMenuActive = false;
            },
        });
    }

    async newPage() {
        const id = await this.$utils.page.newPage();
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.$tabs.openTab(tab);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SIDEBAR_FOOTER,
            entityId: id,
        });
    }

    get updateAvailable() {
        return this.$store.getters['autoUpdater/updateAvailable'];
    }

    showNewEntityDropdown() {
        this.newContainerActive = true;
        this.$dropdown.show({
            component: NewEntityDropdown,
            parent: this.$refs.newEntityButton,
            popperOptions: {
                placement: 'top-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [20, 6],
                        },
                    },
                ],
            },
            onClose: () => {
                this.newContainerActive = false;
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.sidebar-menu {
    padding: 10px 6px 10px 10px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    border-top: 1px solid var(--sidebar-footer-border-color);

    &--wrapper {
        display: flex;
        align-items: center;
    }

    &--new-page {
        @include font11-500;
        font-weight: 600;
        padding: 8px 13px;
        display: flex;
        align-items: center;
        border-radius: 10px;

        background: var(--c-button-primary-bg-color);
        color: var(--c-button-primary-text-color);

        &:hover {
            background: var(--c-button-primary-bg-color__hover);
        }

        .add-icon {
            margin-right: 8px;
        }
    }

    &__trigger {
        outline: none;
        padding: 7px;
        border-radius: 6px;
        color: var(--app-bg-icon-color);
        position: relative;

        .icon {
            margin: 0;
        }

        &:hover,
        &.active {
            background: var(--app-bg-icon-bg-color__hover);
            color: var(--app-bg-icon-color__hover);
        }

        .notification {
            position: absolute;
            top: 1px;
            right: 1px;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--accent-color);
        }
    }
}
</style>
