import { Context } from '@nuxt/types';

export class ToastAdapter {
    context!: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    execute(operation: string, payload: any) {
        if (operation === 'message') {
            window.$nuxt.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: payload.message,
                },
            });
        }
        if (operation === 'sidebar-update') {
            if (this.context.$config.platform === 'mobile') return;
            if (!window.$nuxt || !window.$nuxt.$emit) {
                window.onNuxtReady(() => {
                    const isModalOpen =
                        window.$nuxt.$vfm.dynamicModals.some(
                            ({ bind }) => bind?.modalName === 'NewSidebarModal',
                        ) ?? false;

                    if (isModalOpen) return;
                    window.$nuxt.$vfm.show({
                        component: () =>
                            import('@/components/modal/NewSidebarModal.vue'),
                        bind: {
                            modalName: 'NewSidebarModal',
                        },
                    });
                });
            }
        }
    }
}
