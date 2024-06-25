import { Component, AsyncComponent } from 'vue';
import { contextMenuPlugin } from './Plugin';

type ContextMenuOptions = {
    component: Component | AsyncComponent;
    bind?: Record<string, any>;
    on?: Record<string, any>;
    onClose?: () => void;
};

declare module '@nuxt/types' {
    interface Context {
        $contextMenu: {
            show: (
                event: MouseEvent,
                options: ContextMenuOptions,
            ) => Promise<void>;
            contextMenu: any | null;
            hide: () => void;
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $contextMenu: {
            show: (
                event: MouseEvent,
                options: ContextMenuOptions,
            ) => Promise<void>;
            contextMenu: any | null;
            hide: () => void;
        };
    }
}

export * from './Plugin';

export default contextMenuPlugin;
