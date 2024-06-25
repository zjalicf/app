import { Context } from '@nuxt/types';
import { registerEntityComponents } from '~/plugins/components-repository';
import { JiraIntegrationDataType } from '~/constants/jira';
import { IntegrationType, SortingOptions } from '~/constants';

registerEntityComponents(JiraIntegrationDataType.ISSUE, {
    title: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/TitleEditorWrapper.vue'),
    editorPlaceholder: () => {
        return () =>
            'Your private markdown page for notes, subtasks, and context for the linked Jira issue.';
    },
    panel: (context: Context, tabId: string) => {
        const tab = context.store.getters['tabs/byId'](tabId);
        const document = context.store.getters['document/byId'](tab.entityId);
        if (!document) return () => {};
        return () => import('~/components/entities/page/PagePanel.vue');
    },
    controls: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/jira/JiraClip.vue'),
    newTabConfig: (context: Context, _tabId: string): Record<string, any> => {
        const jiraOptions =
            context.store.getters['vaultSettings/integrationsOptions'].jira ??
            {};
        const integrations =
            context.store.getters['integration/byType'](IntegrationType.JIRA) ??
            [];
        let project =
            context.store.getters['vaultSettings/integrationsOptions']?.jira
                ?.project;

        const projects = integrations.reduce((acc: any, integration: any) => {
            const integrationProjects = integration.data?.projects ?? [];
            return [
                ...acc,
                ...integrationProjects.filter(
                    (project: any) => project.syncEnabled,
                ),
            ];
        }, []);
        const selectedProject =
            projects.find((p: any) => p.id === project?.id) ?? null;
        if (!project || !selectedProject || !selectedProject.syncEnabled) {
            project =
                projects.find((project: any) => project.syncEnabled)?.id ??
                null;
        }

        return {
            project,
            selectedDisplayProperties:
                jiraOptions.selectedDisplayProperties ?? [
                    'type',
                    'status',
                    'key',
                    'updated',
                    'assignee',
                ],
            displayAll: true,
            filterByAssignee: [],
            sortBy: jiraOptions.sortBy ?? SortingOptions.KEY,
            orderAscending: jiraOptions.orderAscending ?? false,
            displayProperties: [
                'type',
                'priority',
                'status',
                'key',
                'labels',
                'updated',
                'created',
                'assignee',
            ],
        };
    },
    extendedProperties: (_context: Context, _tabId: string) => () =>
        import('~/components/entities/page/PageExtendedProperties.vue'),
});
