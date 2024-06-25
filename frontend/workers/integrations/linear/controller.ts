import { v4 } from 'uuid';
import type { Organization, User } from '@linear/sdk';
import { format } from 'date-fns-tz';
import { add } from 'date-fns';
import { IssueUpdateInput } from '@linear/sdk/dist/_generated_documents';
import { IntegrationConfig } from '~/workers/integrations/base';
import { LinearIntegrationConfig } from '~/@types/integrations';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import {
    LinearIntegrationActions,
    LinearIntegrationDataType,
} from '~/constants/linear';
import { JiraIntegrationConfig } from '~/workers/integrations/jira/controller';
import { constructFiltersFromView } from '~/workers/integrations/linear/filters';
import { filterLinearIssuesByView } from '~/workers/integrations/linear/helpers';

export class LinearIntegration {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    public saveIntegration(
        integration: Partial<IntegrationConfig<LinearIntegrationConfig>>,
    ) {
        return this.context.invoke<IntegrationConfig<LinearIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: integration.vaultId,
                    entity: integration,
                    meta: {
                        clientId: '*',
                        postprocess: false,
                    },
                },
            },
        );
    }

    public saveIntegrationData(vaultId: string, data: any[]) {
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            },
        );
    }

    getExistingIssues(vaultId: string, ids: string[]) {
        return this.context.invoke<any[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_IDS,
            {
                table: 'integrationData',
                vaultId,
                payload: {
                    vaultId,
                    ids,
                },
            },
        );
    }

    prepareTeams(integration: IntegrationConfig<LinearIntegrationConfig>) {
        const teams = integration.data.teams ?? [];
        return teams.map(team => team.split('/').pop()!);
    }

    createId(
        type: LinearIntegrationDataType,
        organizationId: string,
        id: string,
        teamId?: string,
    ) {
        const ids = [type, organizationId];
        if (teamId) {
            ids.push(teamId);
        }
        ids.push(id);
        return ids.join('/');
    }

    parseId(id: string): {
        teamId: string;
        organizationId: string;
        type: string;
        id: string;
    } {
        const [type, organizationId, ...rest] = id.split('/');
        const teamId = rest.length > 1 ? rest[0] : '';
        return {
            teamId,
            organizationId,
            type,
            id: rest[rest.length - 1],
        };
    }

    getMyself(integration: IntegrationConfig<LinearIntegrationConfig>) {
        return this.context.invoke<User>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_MYSELF,
            { integration },
        );
    }

    getOrganization(integration: IntegrationConfig<LinearIntegrationConfig>) {
        return this.context.invoke<Organization>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_ORGANIZATION,
            { integration },
        );
    }

    async loadAllPriorities(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const { priorities } = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_PRIORITIES,
            { integration },
        );
        const orgId = integration.data.organization.id;
        const transformed = priorities.map((priority: any) => ({
            ...priority,
            integrationType: integration.type,
            integrationId: integration.id,
            id: this.createId(
                LinearIntegrationDataType.PRIORITY,
                orgId,
                priority.id,
            ),
        }));
        return this.saveIntegrationData(integration.vaultId, transformed);
    }

    async loadAllTeams(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const filters: Record<string, any> = {};

        if (integration.lastRunTimestamp) {
            const timestampDate = new Date(integration.lastRunTimestamp);
            const date = add(timestampDate, {
                minutes: timestampDate.getTimezoneOffset(),
            });
            filters.updatedAt = {
                gte: format(date, 'yyyy-MM-dd HH:mm:ss.SSS', {
                    timeZone: 'UTC',
                }),
            };
        }
        const teams = await this.getPaginatedTeams(integration, filters);
        await this.saveIntegrationData(integration.vaultId, teams);
    }

    async getPaginatedTeams(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filters: any,
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        const output = [];
        do {
            const { teams, after } = await this.getTeams(
                integration,
                nextPageId!,
                filters,
            );
            const transformed = teams.map((team: any) => ({
                ...team,
                integrationType: integration.type,
                integrationId: integration.id,
                id: this.createId(
                    LinearIntegrationDataType.TEAM,
                    orgId,
                    team.id,
                ),
            }));
            output.push(transformed);
            nextPageId = after;
        } while (nextPageId);
        return output.flat();
    }

    async getTeams(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string,
        filter: any,
    ) {
        const { teams, after: newAfter } = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_TEAMS,
            {
                integration,
                first: 100,
                after,
                filter,
            },
        );

        return { teams, after: newAfter };
    }

    async getPaginatedStates(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        filter: any,
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { states, after } = await this.getStates(
                integration,
                nextPageId,
                filter,
            );
            const transformed = states.map((state: any) => ({
                ...state,
                integrationType: integration.type,
                integrationId: integration.id,
                progress: 0,
                id: this.createId(
                    LinearIntegrationDataType.STATE,
                    orgId,
                    state.id,
                    teamId,
                ),
            }));
            const started = transformed.filter(
                ({ type }: any) => type === 'started',
            );
            started.sort((a: any, b: any) => a.position - b.position);
            started.forEach((state: any, index: number) => {
                state.progress = (index + 1) / (started.length + 1);
            });
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    async getStates(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string | undefined,
        filter: any,
    ) {
        const { states, after: newAfter } = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_STATES,
            {
                integration,
                first: 100,
                after,
                filter,
            },
        );
        return {
            states,
            after: newAfter,
        };
    }

    async getPaginatedProjects(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        filter: any,
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { projects, after } = await this.getProjects(
                integration,
                nextPageId,
                teamId,
                filter,
            );
            const transformed = projects.map((project: any) => ({
                ...project,
                integrationType: integration.type,
                integrationId: integration.id,
                id: this.createId(
                    LinearIntegrationDataType.PROJECT,
                    orgId,
                    project.id,
                    teamId,
                ),
            }));
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    async getProjects(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string | undefined,
        teamId: string,
        filter: any,
    ) {
        const { projects, after: newAfter } = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_PROJECTS,
            {
                integration,
                first: 100,
                after,
                filter,
                teamId,
            },
        );
        return {
            projects,
            after: newAfter,
        };
    }

    async getPaginatedLabels(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filter: any,
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { labels, after } = await this.getLabels(
                integration,
                nextPageId!,
                filter,
            );
            const transformed = labels.map((label: any) => ({
                ...label,
                integrationType: integration.type,
                integrationId: integration.id,
                id: this.createId(
                    LinearIntegrationDataType.LABEL,
                    orgId,
                    label.id,
                ),
                team: label.team
                    ? this.createId(
                          LinearIntegrationDataType.TEAM,
                          orgId,
                          label.team,
                      )
                    : null,
            }));
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    async getLabels(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string,
        filter: any,
    ) {
        const { labels, after: newAfter } = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_LABELS,
            {
                integration,
                first: 100,
                after,
                filter,
            },
        );
        return {
            labels,
            after: newAfter,
        };
    }

    async getPaginatedUsers(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        filters: any = {},
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { users, after } = await this.getUsers(
                integration,
                nextPageId!,
                teamId,
                filters,
            );
            const transformed = users.map((user: any) => ({
                ...user,
                integrationType: integration.type,
                integrationId: integration.id,
                id: this.createId(
                    LinearIntegrationDataType.USER,
                    orgId,
                    user.id,
                    teamId,
                ),
            }));
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    getUsers(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string,
        teamId: string,
        filter: any,
    ) {
        return this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_USERS,
            { integration, first: 100, after, teamId, filter },
        );
    }

    async getPaginatedCycles(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        filter: any,
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { cycles, after } = await this.getCycles(
                integration,
                nextPageId!,
                filter,
            );
            const transformed = cycles.map((cycle: any) => ({
                ...cycle,
                integrationType: integration.type,
                integrationId: integration.id,
                id: this.createId(
                    LinearIntegrationDataType.CYCLE,
                    orgId,
                    cycle.id,
                    teamId,
                ),
            }));
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    getCycles(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string,
        filter: any,
    ) {
        return this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_CYCLES,
            { integration, first: 100, after, filter },
        );
    }

    async loadViewIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        view: any,
        additionalFilters: Record<string, any> = {},
    ) {
        const filters = constructFiltersFromView(integration, view);
        try {
            await this.getPaginatedIssues(integration, {
                ...filters,
                ...additionalFilters,
            });
        } catch (err) {
            console.log(err);
        }
    }

    async getIssuesPreview(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        view: Record<string, any> = {},
    ) {
        const filters = constructFiltersFromView(integration, view);
        const orgId = integration.data.organization.id;
        const { issues } = await this.getIssues(
            integration,
            undefined,
            filters,
        );
        return this.transformIssues(integration, orgId, issues);
    }

    async fetchIssueUpdates(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamIds: string[],
        timestamp: number,
    ) {
        const rawDate = new Date(timestamp);
        const date = add(rawDate, { minutes: rawDate.getTimezoneOffset() });
        const filters = {
            team: {
                id: {
                    in: teamIds,
                },
            },
            updatedAt: {
                gte: format(date, 'yyyy-MM-dd HH:mm:ss.SSS', {
                    timeZone: 'UTC',
                }),
            },
        };
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { issues, after } = await this.getIssues(
                integration,
                nextPageId,
                filters,
            );
            if (!issues.length) return;
            const transformed = this.transformIssues(
                integration,
                orgId,
                issues,
            );
            const existingIssues = await this.getExistingIssues(
                integration.vaultId,
                transformed.map(issue => issue.id),
            );
            const matchingIssues = this.matchIssues(
                transformed,
                existingIssues ?? [],
                integration.data.views,
            );
            await this.saveIntegrationData(integration.vaultId, matchingIssues);
            nextPageId = after;
        } while (nextPageId);
    }

    matchIssues(issues: any[], existingIssues: any[], views: any[]): any[] {
        const output = [];
        output.push(
            issues.filter(issue =>
                existingIssues.some(validIssue => validIssue.id === issue.id),
            ),
        );
        let uncertainIssues = issues.filter(
            issue =>
                !existingIssues.some(validIssue => validIssue.id === issue.id),
        );
        for (const view of views) {
            const validIssues = filterLinearIssuesByView(uncertainIssues, view);
            if (validIssues.length === 0) continue;
            output.push(validIssues);
            uncertainIssues = uncertainIssues.filter(
                issue =>
                    !validIssues.some(validIssue => validIssue.id === issue.id),
            );
        }
        return output.flat();
    }

    async getPaginatedIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filters: Record<string, any> = {},
    ) {
        let nextPageId: string | undefined;
        const orgId = integration.data.organization.id;
        do {
            const { issues, after } = await this.getIssues(
                integration,
                nextPageId,
                filters,
            );
            const transformed = this.transformIssues(
                integration,
                orgId,
                issues,
            );
            await this.saveIntegrationData(integration.vaultId, transformed);
            nextPageId = after;
        } while (nextPageId);
    }

    getIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        after: string | undefined,
        filter: Record<string, any> = {},
    ) {
        return this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_ISSUES,
            { integration, first: 100, filter, after },
        );
    }

    async getIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
        identifier?: string,
    ) {
        const orgId = integration.data.organization.id;
        const issue = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_ISSUE,
            { integration, issueId, identifier },
        );

        const transformed = this.transformIssues(integration, orgId, [issue]);
        return transformed.pop()!;
    }

    updateIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
        payload: IssueUpdateInput,
    ) {
        const allowedUpdates = [
            'assigneeId',
            'priority',
            'stateId',
            'labelIds',
            'projectId',
        ];
        const filteredPayload = (
            Object.keys(payload) as (keyof IssueUpdateInput)[]
        ).reduce(
            (acc: IssueUpdateInput, key: keyof IssueUpdateInput) =>
                allowedUpdates.includes(key)
                    ? { ...acc, [key]: payload[key] }
                    : acc,
            {} as IssueUpdateInput,
        );
        return this.context.invoke(
            ServiceKey.CLOUD,
            LinearIntegrationActions.UPDATE_ISSUE,
            {
                integration,
                issueId,
                issue: filteredPayload,
            },
        );
    }

    async getCommentsAndHistory(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
    ) {
        const ids = this.parseId(issueId);
        const response = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.GET_COMMENTS_AND_HISTORY,
            { integration, issueId: ids.id },
        );
        const { comments, history } = response;
        const teamId = ids.teamId;

        await this.saveIntegrationData(integration.vaultId, [
            {
                id: issueId,
                comments: comments.map((comment: any) => ({
                    ...comment,
                    userId: comment.user?.id
                        ? this.createId(
                              LinearIntegrationDataType.USER,
                              integration.data.organization.id,
                              comment.user.id,
                              teamId,
                          )
                        : null,
                    resolvingUserId: comment.resolvingUser?.id
                        ? this.createId(
                              LinearIntegrationDataType.USER,
                              integration.data.organization.id,
                              comment.resolvingUser.id,
                              teamId,
                          )
                        : null,
                })),
                history: history.reduce((acc: any[], historyItem: any) => {
                    const keys = Object.keys(historyItem);

                    if (
                        keys.includes('fromStateId') ||
                        keys.includes('toStateId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromStateId: historyItem.fromStateId,
                            toStateId: historyItem.toStateId,
                        });
                    }
                    if (
                        keys.includes('fromAssigneeId') ||
                        keys.includes('toAssigneeId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromAssigneeId: historyItem.fromAssigneeId,
                            toAssigneeId: historyItem.toAssigneeId,
                        });
                    }
                    if (
                        keys.includes('fromTitle') ||
                        keys.includes('toTitle')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromTitle: historyItem.fromTitle,
                            toTitle: historyItem.toTitle,
                        });
                    }
                    if (
                        keys.includes('fromPriority') ||
                        keys.includes('toPriority')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromPriority: historyItem.fromPriority,
                            toPriority: historyItem.toPriority,
                        });
                    }
                    if (
                        keys.includes('fromProjectId') ||
                        keys.includes('toProjectId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromProjectId: historyItem.fromProjectId,
                            toProjectId: historyItem.toProjectId,
                        });
                    }
                    if (
                        keys.includes('fromTeamId') ||
                        keys.includes('toTeamId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromTeamId: historyItem.fromTeamId,
                            toTeamId: historyItem.toTeamId,
                        });
                    }
                    if (
                        keys.includes('fromDueDate') ||
                        keys.includes('toDueDate')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromDueDate: historyItem.fromDueDate,
                            toDueDate: historyItem.toDueDate,
                        });
                    }
                    if (
                        keys.includes('fromEstimate') ||
                        keys.includes('toEstimate')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromEstimate: historyItem.fromEstimate,
                            toEstimate: historyItem.toEstimate,
                        });
                    }
                    if (
                        keys.includes('fromParentId') ||
                        keys.includes('toParentId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromParentId: historyItem.fromParentId,
                            toParentId: historyItem.toParentId,
                        });
                    }
                    if (
                        keys.includes('fromCycleId') ||
                        keys.includes('toCycleId')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            fromCycleId: historyItem.fromCycleId,
                            toCycleId: historyItem.toCycleId,
                        });
                    }
                    if (
                        keys.includes('removedLabelIds') ||
                        keys.includes('addedLabelIds')
                    ) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            removedLabelIds: historyItem.removedLabelIds,
                            addedLabelIds: historyItem.addedLabelIds,
                        });
                    }
                    if (keys.includes('updatedDescription')) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            updatedDescription: historyItem.updatedDescription,
                        });
                    }
                    if (keys.includes('autoArchived')) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            archivedAt: historyItem.archivedAt,
                            autoArchived: historyItem.autoArchived,
                        });
                    }
                    if (keys.includes('autoClosed')) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            autoClosed: historyItem.autoClosed,
                        });
                    }
                    if (keys.includes('archived')) {
                        acc.push({
                            createdAt: historyItem.createdAt,
                            actorId: historyItem.actorId
                                ? this.createId(
                                      LinearIntegrationDataType.USER,
                                      integration.data.organization.id,
                                      historyItem.actorId,
                                      teamId,
                                  )
                                : null,
                            botActor: historyItem.botActor,
                            archived: historyItem.archived,
                            archivedAt: historyItem.archivedAt,
                        });
                    }

                    return acc;
                }, []),
            },
        ]);
    }

    async searchIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        query: string,
        filter: Record<string, any>,
    ) {
        const issues = await this.context.invoke<any>(
            ServiceKey.CLOUD,
            LinearIntegrationActions.SEARCH_ISSUES,
            { integration, query, filter },
        );
        const orgId = integration.data.organization.id;
        return this.transformIssues(integration, orgId, issues);
    }

    transformIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        organizationId: string,
        issues: any[],
    ) {
        return issues.map((issue: any) => ({
            ...issue,
            integrationType: integration.type,
            integrationId: integration.id,
            assignee: issue.assignee
                ? this.createId(
                      LinearIntegrationDataType.USER,
                      organizationId,
                      issue.assignee,
                      issue.team,
                  )
                : null,
            creator: this.createId(
                LinearIntegrationDataType.USER,
                organizationId,
                issue.creator,
                issue.team,
            ),
            id: this.createId(
                LinearIntegrationDataType.ISSUE,
                organizationId,
                issue.id,
                issue.team,
            ),
            state: this.createId(
                LinearIntegrationDataType.STATE,
                organizationId,
                issue.state,
                issue.team,
            ),
            labels: issue.labels?.map((label: any) =>
                this.createId(
                    LinearIntegrationDataType.LABEL,
                    organizationId,
                    label,
                ),
            ),
            priority: this.createId(
                LinearIntegrationDataType.PRIORITY,
                organizationId,
                issue.priority,
            ),
            team: this.createId(
                LinearIntegrationDataType.TEAM,
                organizationId,
                issue.team,
            ),
            project: issue.project
                ? this.createId(
                      LinearIntegrationDataType.PROJECT,
                      organizationId,
                      issue.project,
                      issue.team,
                  )
                : null,
            parent: issue.parent
                ? this.createId(
                      LinearIntegrationDataType.ISSUE,
                      organizationId,
                      issue.parent,
                      issue.team,
                  )
                : null,
            cycle: issue.cycle
                ? this.createId(
                      LinearIntegrationDataType.CYCLE,
                      organizationId,
                      issue.cycle,
                      issue.team,
                  )
                : null,
        }));
    }
}
