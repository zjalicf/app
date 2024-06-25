import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';
import { LinearIntegrationDataType } from '~/constants/linear';

registerEntityComponents(LinearIntegrationDataType.ISSUE, {
    controls: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/linear/LinearClip.vue'),
});
