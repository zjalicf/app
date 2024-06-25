import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import { ShortcutsManager } from '~/plugins/shortcuts-manager/manager';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import { SafeElectronWindow } from '~/@types';
import { FolderType, TabType } from '~/constants';
import { TabGroup } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

let timeout: any = null;

export const registerShortcuts = (
    shortcutsManager: ShortcutsManager,
    ctx: Context,
) => {
    shortcutsManager.registerShortcut(
        SHORTCUTS_ALIASES.VIEWS_ACTIVATE_1,
        async () => {
            ctx.$tracking.trackEventV2(TrackingType.MY_DAY, {
                source: TrackingActionSource.SHORTCUT,
                action: TrackingAction.OPEN,
            });
            await ctx.$entities.myDay.open();
        },
    );
    for (let i = 2; i < 11; i++) {
        shortcutsManager.registerShortcut(
            // @ts-ignore
            SHORTCUTS_ALIASES[`VIEWS_ACTIVATE_${i}`],
            () => {
                const view = ctx.$entities.view.getDisplayedViews()[i - 2];
                if (!view) return;

                const type = ctx.$tracking.resolveTypeFromView(view.id);

                if (type) {
                    ctx.$tracking.trackEventV2(type, {
                        action: TrackingAction.OPEN,
                        source: TrackingActionSource.SHORTCUT,
                    });
                }

                const tab = ctx.$tabs.createNewTabObject(view.id, TabType.VIEW);
                ctx.$tabs.openTab(tab);
            },
        );
    }
    if (ctx.$accessControl.hasProAccess) {
        shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.JIRA_APP, () => {
            const activeVaultId = ctx.store.getters['vault/activeVaultId'];
            const jiraIntegrations = ctx.store.getters['integration/byType'](
                'jira',
            )?.filter(
                (integration: any) => integration.vaultId === activeVaultId,
            );
            if (!jiraIntegrations?.length) return;
            const tab = ctx.$tabs.createNewTabObject(
                TabType.JIRA_APP,
                TabType.JIRA_APP,
            );
            ctx.$tabs.openTab(tab);
        });
        shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.GITHUB_APP, () => {
            ctx.$entities.github.openGithubTab();
        });
    }
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_NEW, () => {
        const activeGroup: TabGroup = ctx.store.getters['tabs/activeGroup'];
        const exists = activeGroup.tabs.find(
            ({ type }) => type === TabType.NEW,
        );
        if (exists) {
            ctx.$tabs.activateTab(exists, activeGroup.id);
            window.$nuxt.$emit('open-search', {
                source: TrackingActionSource.NEW_TAB,
            });
            return;
        }

        const tab = ctx.$tabs.createNewTabObject(TabType.NEW, TabType.NEW);
        ctx.$tabs.openTab(tab, undefined, { openInNewTab: true });
        window.$nuxt.$emit('open-search', {
            source: TrackingActionSource.NEW_TAB,
        });
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_CLOSE, () => {
        if (ctx.store.getters['tabs/singleTabOpen']) {
            if (!ctx.$utils.isElectron()) return;
            (window as SafeElectronWindow).electron.close();
            return;
        }

        const activeTab = ctx.$tabs.activeTab();
        if (!activeTab) return;

        ctx.$tabs.closeTab(
            activeTab,
            ctx.app.store!.getters['tabs/activeGroup'].id,
        );
    });
    shortcutsManager.registerShortcut(
        [
            shortcutsManager.availableShortcuts.TABS_ACTIVATE_NEXT_TAB,
            shortcutsManager.availableShortcuts.TABS_ACTIVATE_NEXT_TAB_DEFAULT,
        ],
        () => {
            ctx.$tabs.activateNextTab();
        },
    );
    shortcutsManager.registerShortcut(
        [
            shortcutsManager.availableShortcuts.TABS_ACTIVATE_PREVIUOS_TAB,
            shortcutsManager.availableShortcuts
                .TABS_ACTIVATE_PREVIUOS_TAB_DEFAULT,
        ],
        () => {
            ctx.$tabs.activatePreviousTab();
        },
    );
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_1, () => {
        ctx.$tabs.activateTabIndex(0);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_2, () => {
        ctx.$tabs.activateTabIndex(1);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_3, () => {
        ctx.$tabs.activateTabIndex(2);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_4, () => {
        ctx.$tabs.activateTabIndex(3);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_5, () => {
        ctx.$tabs.activateTabIndex(4);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_6, () => {
        ctx.$tabs.activateTabIndex(5);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_7, () => {
        ctx.$tabs.activateTabIndex(6);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_8, () => {
        ctx.$tabs.activateTabIndex(7);
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.TABS_ACTIVATE_9, () => {
        ctx.$tabs.activateTabIndex(8);
    });
    shortcutsManager.registerShortcut(
        SHORTCUTS_ALIASES.TABS_CYCLE_GROUP,
        () => {
            ctx.$tabs.focusNextGroup();
        },
    );
    shortcutsManager.registerShortcut(
        SHORTCUTS_ALIASES.TABS_CYCLE_GROUP_REVERSE,
        async () => {
            await ctx.$tabs.focusPreviousGroup();
        },
    );
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.BACK, () => {
        ctx.$dropdown.hideAll();
        ctx.$tracking.trackEventV2(TrackingType.HISTORY, {
            action: TrackingAction.BACK,
            source: TrackingActionSource.SHORTCUT,
        });
        ctx.$tabs.historyBackward();
    });
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.FORWARD, () => {
        ctx.$dropdown.hideAll();
        ctx.$tracking.trackEventV2(TrackingType.HISTORY, {
            action: TrackingAction.FORWARD,
            source: TrackingActionSource.SHORTCUT,
        });
        ctx.$tabs.historyForward();
    });
    shortcutsManager.registerShortcut(
        SHORTCUTS_ALIASES.NEW_DOCUMENT,
        async () => {
            // TODO: new page in folder
            const id = await ctx.$utils.page.newPage();
            const tab = ctx.$tabs.createNewTabObject(id, TabType.DOCUMENT);
            ctx.$tabs.openTab(tab);

            ctx.$tracking.trackEventV2(TrackingType.PAGE, {
                action: TrackingAction.CREATE,
                source: TrackingActionSource.SHORTCUT,
                entityId: id,
            });
        },
    );
    shortcutsManager.registerShortcut(SHORTCUTS_ALIASES.NEW_PROJECT, () => {
        const activeFolder = ctx.$entities.folder.getActiveFolder();
        const sharingUuid =
            activeFolder &&
            activeFolder.type === FolderType.FOLDER &&
            activeFolder.sharingUuid
                ? v4()
                : null;
        const parentId =
            activeFolder && activeFolder.type === FolderType.FOLDER
                ? activeFolder.id
                : null;
        ctx.$entities.folder.newFolder({
            sharingUuid,
            parentId,
        });
        ctx.$tracking.trackEventV2(TrackingType.FOLDER, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.SHORTCUT,
        });
    });

    shortcutsManager.registerShortcut(
        SHORTCUTS_ALIASES.TOGGLE_SIDEBAR,
        async () => {
            await ctx.store.dispatch('misc/toggleSidebar');
            const width = ctx.store.getters['misc/viewportWidth'];
            const sidebarOpen = ctx.store.getters['misc/sidebarOpen'];

            if (sidebarOpen) {
                ctx.$tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.OPEN,
                    source: TrackingActionSource.SHORTCUT,
                });
                if (timeout) {
                    return;
                }
                timeout = setTimeout(() => {
                    ctx.$tabs.recalculateAllTabs(width);
                    clearTimeout(timeout);
                    timeout = null;
                }, 200);
            } else {
                ctx.$tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.CLOSE,
                    source: TrackingActionSource.SHORTCUT,
                });
                clearTimeout(timeout);
                timeout = null;
                ctx.$tabs.recalculateAllTabs(window.innerWidth);
            }
        },
    );
};
