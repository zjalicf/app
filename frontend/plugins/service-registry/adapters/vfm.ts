import { Context } from '@nuxt/types';
import { ServiceKey } from '~/constants';

interface VfmAdapterInterface {
    emit(
        serviceKey: ServiceKey.VFM,
        key: 'show',
        payload: {
            component: string;
            bind: {
                [key: string]: any;
            };
        },
        transferable?: any[],
    ): void;
}

declare module '~/@types/app' {
    interface WorkerContext extends VfmAdapterInterface {}
}

export class VfmAdapter {
    context!: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    execute(
        operation: 'show',
        payload: {
            component: string;
            bind: {
                [key: string]: any;
            };
        },
    ) {
        if (operation === 'show') {
            if (!window.$nuxt || !window.$nuxt.$vfm) {
                window.onNuxtReady(() => {
                    window.$nuxt.$vfm?.show({
                        component: () =>
                            import(`@/components/modal/${payload.component}`),
                        bind: payload.bind ? payload.bind : {},
                    });
                });
                return;
            }

            window.$nuxt.$vfm.show({
                component: () =>
                    import(`@/components/modal/${payload.component}`),
                bind: payload.bind ? payload.bind : {},
            });
        }
    }
}
