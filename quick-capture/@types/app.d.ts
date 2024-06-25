import { Store } from 'vuex';
import { Editor } from '@tiptap/vue-2';
import { StarterKitOptions } from '@tiptap/starter-kit';
import { HighlightOptions } from '@tiptap/extension-highlight';
import { TableOptions } from '@tiptap/extension-table';
import { CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight';
import { NuxtApp } from '@nuxt/types/app';
import { VueFinalModalProperty } from 'vue-final-modal';
import type VueRouter from 'vue-router';
import { OnDeviceService } from '~/workers/database/controller';
import { CloudService } from '~/plugins/storage-service/cloud';
import { AutocompleteOptions } from '~/components/editor/extensions/autocomplete';
import { ImageOptions } from '~/components/editor/extensions/image';
import { ServiceRegistry } from '~/plugins/service-registry/hub';
import { ShortcutsManager } from '~/plugins/shortcuts-manager/manager';
import { EditorUtils } from '~/components/editor/utils';

export type AppContext = {
    $deviceService: OnDeviceService;
    $cloudService: CloudService;
    $config: {
        onLine: boolean;
        platform: 'desktop' | 'mobile' | 'web';
        baseUrl:
            | 'http://localhost:8080'
            | 'https://staging-api.acreom.com'
            | 'https://api.acreom.com';
        os: 'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'web';
        clientId: string;
    };
    emit: (serviceKey: any, key: string, payload: any) => void;
    invoke: <T>(serviceKey: any, key: string, payload: any) => Promise<T>;
    on: (event: string, cb: (payload: any) => void) => void;
    off: (event: string) => void;
};

export type ReverseIndex<T> = {
    id: string;
    filepath: string;
    text?: string;
    index?: string;
    entity: T;
} & Record<string, any>;

export type ReverseIndexObject = Record<
    string,
    Record<string, ReverseIndex<any>[]> | ReverseIndex<any>[]
>;

export type CloudResponse<T> = {
    data: T;
    status: number;
    statusText: string;
};

export type EditorContextConfig = {
    editable: boolean;
    placeholder: string;
    starterKit: Partial<StarterKitOptions>;
    todo: Partial<{
        relativeDate: Date;
        documentId: string;
    }>;
    event: Partial<{
        relativeDate: Date;
    }>;
    highlight: Partial<HighlightOptions>;
    table: Partial<TableOptions>;
    codeblock: Partial<CodeBlockLowlightOptions>;
    uniqueId: Partial<{
        attributeName: string;
        types: string[];
        generateID: () => string;
        filterTransaction: any;
    }>;
    autocomplete: Partial<AutocompleteOptions>;
    image: Partial<ImageOptions>;
    keyboardUtils: Partial<{
        documentId: string;
    }>;
};

export type EditorContext = {
    config: Partial<EditorContextConfig>;
    store: Store<any>;
    cloudService: CloudService;
    serviceRegistry: ServiceRegistry;
    emit: (key: string, val?: any) => any;
    editor: () => Editor | null;
    shortcutsManager: ShortcutsManager;
    nuxt: NuxtApp;
    nextTick: (cb: () => void) => any;
    utils?: EditorUtils;
    vfm: VueFinalModalProperty;
    router: VueRouter;
    onTransaction: Function;
    onSelectionUpdate: Function;
    onCreate: Function;
};
