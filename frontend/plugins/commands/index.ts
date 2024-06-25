import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { CommandsManager } from './commands';

declare module '@nuxt/types' {
    interface Context {
        $commandManager: CommandsManager;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $commandManager: CommandsManager;
    }
}

const commandsPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const commandsManager = new CommandsManager(ctx);

    ctx.$commandManager = commandsManager;
    inject('commandManager', commandsManager);
};

export default commandsPlugin;
