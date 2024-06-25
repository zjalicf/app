import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';

registerEntityComponents('document', {
    title: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/TitleEditorWrapper.vue'),
    editorPlaceholder: () => {
        return () => 'Type / for commands';
    },
    panel: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/PagePanel.vue'),
    extendedProperties: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/PageExtendedProperties.vue'),
});
