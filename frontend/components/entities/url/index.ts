import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';

registerEntityComponents('url', {
    controls: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/url/URLClip.vue'),
});
