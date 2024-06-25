import { panePlugin } from './Plugin';

declare module '@nuxt/types' {
    interface Context {
        $pane: {
            show: (options: any) => Promise<void>;
            hide: () => Promise<void>;
            hideAll: () => Promise<void>;
            calcFitHeight: any;
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $pane: {
            show: (options: any) => Promise<void>;
            hide: () => Promise<void>;
            hideAll: () => Promise<void>;
            calcFitHeight: any;
        };
    }
}

export * from './Plugin';

export default panePlugin;
