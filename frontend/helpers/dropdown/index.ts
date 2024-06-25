import { dropdownPlugin } from './Plugin';
import { Options, VirtualElement } from '@popperjs/core';
import { Component, AsyncComponent } from 'vue';

type DropdownOptions = {
    parent: HTMLElement | VirtualElement;
    component: Component | AsyncComponent;
    name?: string;
    backdrop?: boolean;
    retainFocus?: boolean;
    animate?: boolean;
    preventBackdrop?: boolean;
    popperOptions?: Partial<Options>;
    bind?: Record<string, any>;
    on?: Record<string, any>;
    onClose?: () => void;
};

declare module '@nuxt/types' {
    interface Context {
        $dropdown: {
            show: (options: DropdownOptions) => void;
            hideAll: () => void;
            hide: (name: string) => void;
            dropdownList: DropdownOptions[];
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $dropdown: {
            show: (options: DropdownOptions) => void;
            hideAll: () => void;
            hide: (name: string) => void;
            dropdownList: DropdownOptions[];
        };
    }
}

export * from './Plugin';

export default dropdownPlugin;
