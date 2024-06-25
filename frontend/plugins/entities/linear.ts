import { v4 } from 'uuid';
import { DynamicModalOptions } from 'vue-final-modal';
import { IssueUpdateInput } from '@linear/sdk/dist/_generated_documents';
import { EntityController } from '~/plugins/entities/controller';
import { IntegrationType, PageStatus, ServiceKey, TabType } from '~/constants';
import { IntegrationConfig } from '~/workers/integrations/base';
import { LinearIntegrationConfig } from '~/@types/integrations';
import {
    LinearIntegrationActions,
    LinearIntegrationDataType,
} from '~/constants/linear';
import {
    LinearDisplayPropertiesOptions,
    LinearGroupByOptions,
    LinearSortDirectionOptions,
    LinearSortingOptions,
} from '~/components/linear/constants';
import { Tab } from '~/@types/app';
import { filterLinearIssuesByView } from '~/workers/integrations/linear/helpers';
import { LinearIssue } from '~/components/linear/types';
// @ts-ignore
import { IntegrationView } from '~/components/integrations/views/IntegrationHeader.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export const isLinearEntity = (id: string) => {
    return id.startsWith(LinearIntegrationDataType.ISSUE);
};

export const LINEAR_ISSUE_LINK_REGEXP =
    /https:\/\/linear.app\/.*?\/issue\/(\w{2,4}-\d{1,7})\/?([^/]*)\S*/g;

export const isLinearLink = (link: string) => {
    return link.match(LINEAR_ISSUE_LINK_REGEXP) ?? null;
};

export type LinearViewConfig = {
    id: string;
    name: string;
    filters: any[];
    teamId?: string;
};

export class LinearController extends EntityController<any> {
    storeEntity = 'integrationData';
    dbTable = 'integrationData';

    get linearStates() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.STATE,
        );
    }

    get linearUsers() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.USER,
        );
    }

    get linearProjects() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.PROJECT,
        );
    }

    get linearLabels() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.LABEL,
        );
    }

    get linearPriorities() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.PRIORITY,
        );
    }

    get linearCycles() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.CYCLE,
        );
    }

    get linearIssues() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.ISSUE,
        );
    }

    getIssueById(id: string): LinearIssue | null {
        const issue = this.context.store.getters['integrationData/byId'](id);
        if (!issue) return null;

        return this.deserializeIssue(issue);
    }

    getByIdentifier(identifier: string): LinearIssue | null {
        const issueId =
            this.context.store.getters['integrationData/byKey'](identifier);
        if (!issueId) return null;
        return this.getIssueById(issueId);
    }

    getById(id: string) {
        return this.context.store.getters['integrationData/byId'](id);
    }

    teamStates(teamId: string) {
        return this.linearStates.filter((state: any) =>
            state.id.includes(teamId),
        );
    }

    teamCycles(teamId: string) {
        return this.linearCycles.filter((cycle: any) =>
            cycle.id.includes(teamId),
        );
    }

    teamProjects(teamId: string) {
        return this.linearProjects.filter((project: any) =>
            project.id.includes(teamId),
        );
    }

    teamUsers(teamId: string) {
        return this.linearUsers.filter((user: any) => user.id.includes(teamId));
    }

    teamLabels(teamId: string) {
        return this.linearLabels.filter(
            (label: any) => !label.team || label.team?.endsWith(teamId),
        );
    }

    teamIssues(teamId: string) {
        return this.linearIssues.filter((issue: any) => issue.team === teamId);
    }

    getClip(id: string) {
        const page = this.context.$entities.page.findByClipId(id);
        return page?.archived ? null : page;
    }

    linearStateToPageStatus(state: any) {
        const stateMap = {
            [PageStatus.TODO]: ['unstarted'],
            [PageStatus.IN_PROGRESS]: ['started'],
            [PageStatus.DONE]: ['completed'],
        };
        return Object.entries(stateMap).reduce((acc, [key, value]) => {
            if (value.includes(state.type)) {
                return key as PageStatus;
            }
            return acc as PageStatus | null;
        }, null as PageStatus | null);
    }

    async createPageFromEntity(entity: any) {
        await this.context.$vfm.hideAll();
        const page = await this.context.$entities.page.create({
            pageStatus: this.linearStateToPageStatus(entity.state),
            title: `${entity.identifier} ${entity.title}`,
            clip: entity.id,
        });

        this.context.$tracking.trackEvent('document', {
            action: 'add-clip',
            type: entity.id?.split('/')[0] ?? 'unknown',
            entity_id: page.id,
        });
        const tab = this.context.$tabs.createNewTabObject(
            page.id,
            TabType.DOCUMENT,
        );
        await this.context.$tabs.openTab(tab);
    }

    parseId(id: string) {
        const parts = id?.split('/') ?? [];
        if (parts.length === 3) {
            return {
                type: parts[0],
                organizationId: parts[1],
                id: parts[2],
                teamId: null,
            };
        }
        return {
            type: parts[0],
            organizationId: parts[1],
            teamId: parts[2],
            id: parts[3],
        };
    }

    parseUrl(url: string) {
        const issueMatch = new RegExp(LINEAR_ISSUE_LINK_REGEXP).exec(url);
        if (issueMatch && issueMatch[1]) {
            return issueMatch[1];
        }
        return null;
    }

    getIntegration() {
        const integrations = this.context.store.getters['integration/byType'](
            IntegrationType.LINEAR,
        );

        if (!integrations.length) return null;
        return integrations[0];
    }

    get teams() {
        return this.context.store.getters['integrationData/byType'](
            LinearIntegrationDataType.TEAM,
        );
    }

    async closeAppTab() {
        const tabs = this.context.store.getters['tabs/list'].filter(
            (tab: Tab) => tab.type === TabType.LINEAR_APP,
        );

        for (const tab of tabs) {
            const groupId = this.context.store.getters['tabs/groupByTabId'](
                tab.id,
            );

            await this.context.$tabs.closeTab(tab, groupId);
        }
    }

    async deleteIntegration() {
        const integration = this.getIntegration();
        if (!integration) return;

        await this.closeAppTab();
        await this.context.store.dispatch('integration/delete', integration);

        this.context.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.DELETE,
        });
    }

    deserializeIssues(issues: any[]): any[] {
        const states = this.transformToMap(this.linearStates);
        const users = this.transformToMap(this.linearUsers);
        const projects = this.transformToMap(this.linearProjects);
        const labels = this.transformToMap(this.linearLabels);
        const priorities = this.transformToMap(this.linearPriorities);
        const cycles = this.transformToMap(this.linearCycles);

        return issues.map(issue => {
            return {
                ...issue,
                priority: priorities[issue.priority],
                project: projects[issue.project],
                labels: issue.labels.map((labelId: string) => labels[labelId]),
                state: states[issue.state],
                assignee: users[issue.assignee],
                creator: users[issue.creator],
                cycle: cycles[issue.cycle],
            };
        });
    }

    deserializeIssue(issue: any): any {
        if (!issue) return null;
        const state = this.getById(issue.state);
        const assignee = this.getById(issue.assignee);
        const creator = this.getById(issue.creator);
        const project = this.getById(issue.project);
        const priority = this.getById(issue.priority);
        const cycle = this.getById(issue.cycle);
        const labels = issue.labels.map((labelId: string) =>
            this.getById(labelId),
        );
        return {
            ...issue,
            priority,
            project,
            labels,
            state,
            assignee,
            creator,
            cycle,
        };
    }

    async updateState(entity: any, state: any) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            state: state.id,
        });
        const didUpdate = await this.updateIssue(entity.id, {
            stateId: state.id,
        });
        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update state. Please try again later.',
        );
    }

    async updatePriority(entity: any, priority: any) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            priority: priority.id,
        });
        const didUpdate = await this.updateIssue(entity.id, {
            priority: priority.id,
        });
        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update priority. Please try again later.',
        );
    }

    async updateAssignee(entity: any, assignee: any) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            assignee: assignee.id,
        });
        const didUpdate = await this.updateIssue(entity.id, {
            assigneeId: assignee.id,
        });
        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update assignee. Please try again later.',
        );
    }

    async updateProject(entity: any, project: any) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            project: project.id,
        });
        const didUpdate = await this.updateIssue(entity.id, {
            projectId: project.id,
        });
        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update labels. Please try again later.',
        );
    }

    async updateCycle(entity: any, cycle: any) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            cycle: cycle.id,
        });
        const didUpdate = await this.updateIssue(entity.id, {
            cycleId: cycle.id,
        });
        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update cycle. Please try again later.',
        );
    }

    async updateLabels(entity: any, labels: any[]) {
        this.context.store.commit('integrationData/update', {
            ...this.serializeEntity(entity),
            labels: labels.map(label => label.id),
        });
        const didUpdate = await this.updateIssue(entity.id, {
            labelIds: labels.map(label => label.id),
        });

        if (didUpdate) return;

        this.context.store.commit(
            'integrationData/update',
            this.serializeEntity(entity),
        );
        this.showRevertChangeNotification(
            'Failed to update labels. Please try again later.',
        );
    }

    async updateIssue(issueId: string, payload: IssueUpdateInput) {
        const integration = this.getIntegration();
        const serializedPayload = this.serializeUpdatePayload(payload);
        const result = await this.context.$serviceRegistry.invoke<boolean>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.UPDATE_ISSUE,
            {
                integration,
                issueId: this.parseId(issueId).id,
                payload: serializedPayload,
            },
        );
        return result === true;
    }

    showRevertChangeNotification(message: string) {
        this.context.$utils.showMiscNotification(message);
    }

    showTeamPicker(initial: boolean = false, openTab: boolean = false) {
        this.context.$vfm.show({
            component: () =>
                import('~/components/modal/linear/LinearTeamSelectorModal.vue'),
            bind: {
                initial,
                openTab,
            },
        } as DynamicModalOptions);
    }

    async createIntegration(data: {
        credentials: {
            accessToken: string;
            expiryDate: string;
        };
        vaultId: string;
        redirect: boolean;
    }) {
        const integration = {
            id: v4(),
            vaultId: data.vaultId,
            type: IntegrationType.LINEAR,
            data: {
                id: v4(),
                vaultId: data.vaultId,
                credentials: data.credentials,
                views: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                teams: [],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;
        await this.context.store.dispatch('integration/save', integration);
        await this.initializeIntegration(integration);
        this.showTeamPicker(true);

        this.context.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.CREATE,
        });
    }

    initializeIntegration(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        return this.context.$serviceRegistry.invoke<LinearIntegrationConfig>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.INITIALIZE_INTEGRATION,
            { integration },
        );
    }

    newTabConfig() {
        const defaultView = this.getDefaultView();
        return {
            activeTab: defaultView?.id,
            editingView: null,
            searchTerm: '',
        };
    }

    transformToMap(entities: any[]): Record<string, any> {
        return entities.reduce((acc, entity) => {
            acc[entity.id] = entity;
            return acc;
        }, {} as Record<string, any>);
    }

    serializeEntity(entity: any) {
        return {
            ...entity,
            assignee: entity.assignee?.id ?? null,
            creator: entity.creator?.id ?? null,
            priority: entity.priority?.id ?? null,
            project: entity.project?.id ?? null,
            state: entity.state?.id ?? null,
            labels: entity.labels.map((label: any) => label.id),
        };
    }

    openModal(entityId: string, trackingSource: TrackingActionSource) {
        this.context.$vfm.show({
            component: () =>
                import('~/components/integrations/modal/EntityModal.vue'),
            bind: {
                id: entityId,
            },
        } as DynamicModalOptions);

        this.context.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.OPEN_LINEAR_ISSUE,
            source: trackingSource,
        });
    }

    openSettings(source?: TrackingActionSource) {
        this.context.$utils.navigation.openSettings(
            'linear-integration',
            source,
        );
    }

    fetchIssue(id: string) {
        const integration = this.getIntegration();
        return this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.GET_ISSUE,
            {
                integration,
                issueId: id,
            },
        );
    }

    fetchIssueByIdentifier(identifier: string) {
        const integration = this.getIntegration();
        return this.context.$serviceRegistry.invoke<any>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.GET_ISSUE,
            {
                integration,
                identifier,
            },
        );
    }

    fetchCommentsAndHistory(issueId: string) {
        const integration = this.getIntegration();
        return this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.GET_COMMENTS_AND_HISTORY,
            {
                integration,
                issueId,
            },
        );
    }

    private serializeUpdatePayload(payload: IssueUpdateInput) {
        return (Object.keys(payload) as (keyof IssueUpdateInput)[]).reduce(
            (acc, key) => {
                if (key === 'labelIds') {
                    acc.labelIds =
                        payload.labelIds?.map(
                            (id: string) => this.parseId(id).id!,
                        ) ?? [];
                    return acc;
                }

                const id = payload[key];
                const parsedId = this.parseId(id);
                acc[key] = parsedId.id;
                if (key === 'priority') {
                    acc[key] = Number(parsedId.id);
                }
                return acc;
            },
            {} as IssueUpdateInput,
        );
    }

    getIssuesByDefinition(view: LinearViewConfig) {
        let issues = [];
        if (view.teamId) {
            issues = this.teamIssues(view.teamId);
        } else {
            issues = this.linearIssues;
        }
        return filterLinearIssuesByView(issues, view);
    }

    fetchPreview(view: any) {
        const integration = this.getIntegration();
        return this.context.$serviceRegistry.invoke<any[]>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.GET_VIEW_PREVIEW_ISSUES,
            {
                integration,
                view,
            },
        );
    }

    refreshView(view: any) {
        const integration = this.getIntegration();
        return this.context.$serviceRegistry.invoke<any[]>(
            ServiceKey.INTEGRATIONS,
            LinearIntegrationActions.LOAD_VIEWS_ISSUES,
            {
                integration,
                views: [view],
            },
        );
    }

    getIntegrationViews(): IntegrationView[] {
        const integration = this.getIntegration();
        return integration.data.views ?? [];
    }

    getDefaultView() {
        const views = this.getIntegrationViews();
        return views.find((view: any) => view.default) ?? null;
    }

    deleteView(id: string) {
        const views = this.getIntegrationViews();
        const newViews = views.filter((view: any) => view.id !== id);
        return this.context.store.dispatch('integration/save', {
            ...this.getIntegration(),
            data: { ...this.getIntegration().data, views: newViews },
        });
    }

    getViewDefinition(viewId: string) {
        const integration = this.getIntegration();
        const views = integration.data.views ?? [];
        const view = views.find((view: any) => view.id === viewId);
        return view ?? null;
    }

    updateDefaultView(teams: string[]) {
        const integration = this.getIntegration();
        const views = integration.data.views;
        const currentViews = [...(views ?? [])];
        let defaultDefinition = currentViews.find((view: any) => view.default);
        if (!defaultDefinition) {
            defaultDefinition = this.defaultViewDefinition();
        }
        defaultDefinition = {
            ...defaultDefinition,
            filters: [
                {
                    property: 'assignee',
                    operation: 'in',
                    value: teams.map(team => {
                        const parsedId = this.parseId(team);
                        return [
                            LinearIntegrationDataType.USER,
                            parsedId.organizationId,
                            parsedId.id,
                            integration.data.myself.id,
                        ].join('/');
                    }),
                },
                {
                    property: 'stateType',
                    operation: 'in',
                    value: ['started', 'unstarted', 'backlog', 'triage'],
                },
            ],
        };

        return [
            defaultDefinition,
            ...views.filter((view: any) => !view.default),
        ];
    }

    defaultViewDefinition() {
        return {
            id: v4(),
            name: 'My Issues',
            editing: false,
            default: true,
            filters: [
                {
                    property: 'assignee',
                    operation: 'in',
                    value: [],
                },
                {
                    property: 'stateType',
                    operation: 'nin',
                    value: ['completed', 'cancelled'],
                },
            ],
            displayProperties: [
                LinearDisplayPropertiesOptions.PRIORITY,
                LinearDisplayPropertiesOptions.STATUS,
                LinearDisplayPropertiesOptions.KEY,
                LinearDisplayPropertiesOptions.LABELS,
                LinearDisplayPropertiesOptions.CREATED,
                LinearDisplayPropertiesOptions.ASSIGNEE,
                LinearDisplayPropertiesOptions.PROJECT,
                LinearDisplayPropertiesOptions.CLIP,
            ],
            groupBy: LinearGroupByOptions.PRIORITY,
            sortBy: LinearSortingOptions.CREATED,
            sortDirection: LinearSortDirectionOptions.DESCENDING,
        };
    }

    async createNewView() {
        const integration = this.getIntegration();
        if (!integration) return null;

        const teams = integration.data.teams ?? [];
        const teamId = teams[0];
        if (!teamId) return null;

        const view = {
            id: v4(),
            editing: true,
            name: 'New Filter',
            filters: [
                {
                    property: 'stateType',
                    operation: 'nin',
                    value: ['completed', 'canceled'],
                },
            ],
            displayProperties: [
                LinearDisplayPropertiesOptions.PRIORITY,
                LinearDisplayPropertiesOptions.STATUS,
                LinearDisplayPropertiesOptions.KEY,
                LinearDisplayPropertiesOptions.LABELS,
                LinearDisplayPropertiesOptions.CREATED,
                LinearDisplayPropertiesOptions.ASSIGNEE,
                LinearDisplayPropertiesOptions.PROJECT,
                LinearDisplayPropertiesOptions.CLIP,
            ],
            groupBy: LinearGroupByOptions.NONE,
            sortBy: LinearSortingOptions.CREATED,
            sortDirection: LinearSortDirectionOptions.DESCENDING,
            teamId,
        };

        const views = [...(integration.data.views ?? [])] ?? [];
        views.push(view);
        await this.context.store.dispatch('integration/save', {
            ...integration,
            data: { ...integration.data, views },
        });
        return view;
    }

    updateView(viewId: string, data: any) {
        const integration = this.getIntegration();
        const views = [...(integration.data.views ?? [])];
        const index = views.findIndex((view: any) => view.id === viewId);
        if (index === -1) return;

        views[index] = {
            ...views[index],
            ...data,
        };
        this.context.store.dispatch('integration/save', {
            ...integration,
            data: { ...integration.data, views },
        });
    }
}
