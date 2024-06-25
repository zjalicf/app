import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';

registerEntityComponents('my_day', {
    panel: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/my-day/MyDayPanel.vue'),
});
