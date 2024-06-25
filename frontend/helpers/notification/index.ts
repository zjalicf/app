import { notificationPlugin } from './Plugin';

declare module '@nuxt/types' {
    interface Context {
        $notification: {
            show: any;
            close: any;
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $notification: {
            show: any;
            close: any;
        };
    }
}

export * from './Plugin';

export default notificationPlugin;
