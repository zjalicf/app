import { Context } from '@nuxt/types';
import {
    SearchIndex,
    SearchServiceAction,
    ServiceKey,
    TabType,
} from '~/constants';

export class CommandsManager {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    private getShortcutCommands(excludeShortcuts: any[]) {
        const keybinds = this.context.$shortcutsManager.keybinds as {
            [key: string]: any;
        };
        return Object.keys(keybinds)
            .filter(
                (item: any) =>
                    keybinds[item].searchable &&
                    !excludeShortcuts.includes(item),
            )
            .reduce(
                (res, key) => Object.assign(res, { [key]: keybinds[key] }),
                {},
            );
    }

    indexCommands() {
        const commands = this.getCommands();
        const searchCommands = Object.keys(commands).map((command: any) => {
            return {
                id: command,
                title: commands[command].displayLabel,
                keybind: commands[command].keybind,
                vaultId: SearchIndex.COMMANDS,
                entityType: SearchIndex.COMMANDS,
            };
        });

        this.context.$serviceRegistry.invoke(
            ServiceKey.SEARCH,
            SearchServiceAction.INITIAL_INDEX,
            {
                index: SearchIndex.COMMANDS,
                entity: searchCommands,
                callerContext: 'commands.ts indexCommands',
            },
        );
        this.indexMyDay();
        this.indexSettings();
    }

    getCommands(excludeShortcuts: any[] = []): Record<string, any> {
        return this.getShortcutCommands(excludeShortcuts);
    }

    indexMyDay() {
        const myDay = [
            {
                id: TabType.MY_DAY,
                title: 'My Day',
                vaultId: SearchIndex.COMMANDS,
                entityType: SearchIndex.MY_DAY,
            },
        ];
        this.context.$serviceRegistry.invoke(
            ServiceKey.SEARCH,
            SearchServiceAction.INITIAL_INDEX,
            {
                index: SearchIndex.MY_DAY,
                entity: myDay,
                callerContext: 'commands.ts indexMyDay',
            },
        );
    }

    indexSettings() {
        const settings = [
            {
                id: 'myAccount',
                title: 'My Account',
            },
            {
                id: 'preferences',
                title: 'Preferences',
            },
            {
                id: 'keybinds',
                title: 'Keybinds',
            },
            {
                id: 'appearance',
                title: 'Appearance',
            },
            {
                id: 'overview',
                title: 'Overview',
            },
            {
                id: 'calendars',
                title: 'Calendars',
            },
            {
                id: 'notifications',
                title: 'Notifications',
            },
            {
                id: 'labels',
                title: 'Labels',
            },
            {
                id: 'templates',
                title: 'Templates',
            },
            {
                id: 'sidebar',
                title: 'Sidebar',
            },
            {
                id: 'github',
                title: 'Github',
            },
            {
                id: 'jira',
                title: 'Jira',
            },
            {
                id: 'assistant',
                title: 'Assistant',
            },
        ];
        const searchSettings = settings.map((settings: any) => {
            return {
                id: settings.id,
                title: settings.title,
                vaultId: SearchIndex.SETTINGS,
                entityType: SearchIndex.SETTINGS,
                prefix: 'Settings > ',
            };
        });
        this.context.$serviceRegistry.invoke(
            ServiceKey.SEARCH,
            SearchServiceAction.INITIAL_INDEX,
            {
                index: SearchIndex.SETTINGS,
                entity: searchSettings,
                callerContext: 'commands.ts indexSettings',
            },
        );
    }
}
