import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';
import { GithubIntegrationDataType } from '~/components/github/github';
import { SortingOptions } from '~/constants';

registerEntityComponents(GithubIntegrationDataType.PR, {
    title: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/TitleEditorWrapper.vue'),
    panel: (context: Context, tabId: string) => {
        const tab = context.store.getters['tabs/byId'](tabId);
        const document = context.store.getters['document/byId'](tab.entityId);
        if (!document) return () => {};

        return () => import('~/components/github/GithubPanel.vue');
    },
    controls: (_context: Context, _tabId: string) => () =>
        import('~/components/github/GithubPageEntityButton.vue'),
    editorPlaceholder: () => {
        return () =>
            'Your private markdown page for notes, subtasks, and context for the linked Github issue or pull request.';
    },
    newTabConfig: (_context: Context, _tabId: string): Record<string, any> => {
        return {
            activeTab: 'recent',
            filterBy: 'all',
            searchOpen: false,
            searchTerm: '',
            displayProperties: [
                'repository',
                'number',
                'links',
                'comments',
                'labels',
                'status',
            ],
            selectedDisplayProperties: [
                'repository',
                'number',
                'links',
                'comments',
                'labels',
                'status',
            ],
            recent: {
                all: false,
                filterBy: 'all',
                sortBy: SortingOptions.UPDATED_AT,
                sortDirection: 'desc',
            },
            pulls: {
                open: false,
                closed: true,
                filterBy: 'created',
                sortBy: SortingOptions.UPDATED_AT,
                sortDirection: 'desc',
            },
            issues: {
                open: false,
                closed: true,
                filterBy: 'created',
                sortBy: SortingOptions.UPDATED_AT,
                sortDirection: 'desc',
            },
            sortBy: SortingOptions.UPDATED_AT,
            sortDirection: 'desc',
        };
    },
});
