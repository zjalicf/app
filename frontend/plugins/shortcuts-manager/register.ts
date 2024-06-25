import { Context } from '@nuxt/types';
import { registerShortcuts as registerHeaderShortcuts } from './header';
import { registerShortcuts as registerSidebarShortcuts } from './sidebar';
import { ShortcutsManager } from './manager';

export const registerShortcuts = (
    shortcutsManager: ShortcutsManager,
    ctx: Context,
) => {
    registerHeaderShortcuts(shortcutsManager, ctx);
    registerSidebarShortcuts(shortcutsManager, ctx);
};
