import type { ConnectionStatus } from '@capacitor/network';
import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

declare module '@nuxt/types' {
    interface Context {
        $checkOnlineStatus: () => Promise<ConnectionStatus>;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $checkOnlineStatus: () => Promise<ConnectionStatus>;
    }
}
const servicesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    const processStatus = (status: ConnectionStatus) => {
        if (status.connected) {
            ctx.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                { event: 'network:online' },
            );
        } else {
            ctx.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                { event: 'network:offline' },
            );
        }
    };

    const checkOnlineStatus = async () => {
        const { Network } = await import('@capacitor/network');
        const status = await Network.getStatus();
        processStatus(status);
        return status;
    };

    ctx.$serviceRegistry.waitForEssentialServices().then(async () => {
        const { Network } = await import('@capacitor/network');
        Network.addListener('networkStatusChange', (status: any) => {
            processStatus(status);
        });
        await checkOnlineStatus();
    });

    inject('checkOnlineStatus', checkOnlineStatus);
    ctx.$checkOnlineStatus = checkOnlineStatus;
};

export default servicesPlugin;
