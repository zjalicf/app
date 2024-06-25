import {
    IssuePriorityValue,
    LinearClient,
    LinearClientOptions,
    Team,
} from '@linear/sdk';
import { IssueUpdateInput } from '@linear/sdk/dist/_generated_documents';
import { StatusCodes } from 'http-status-codes';
import { WorkerContext } from '~/@types/app';
import { IUser } from '~/workers/database/indexeddb/types';
import { LinearIntegrationConfig } from '~/@types/integrations';
import { IntegrationConfig } from '~/workers/integrations/base';
import { LinearQueries } from '~/workers/cloud/services/linear/queries';

const filterEmpty = (item: Record<string, any>): Record<string, any> => {
    const newItem: Record<string, any> = {};
    for (const key in item) {
        if (item[key] !== null) {
            newItem[key] = item[key];
        }
    }
    return newItem;
};

export class LinearIntegrationClient {
    private client: LinearClient;
    private context: WorkerContext;

    constructor(context: WorkerContext, config: LinearClientOptions) {
        this.context = context;
        this.client = this.createClient(config);
    }

    static createRequestConfig(
        config: IntegrationConfig<LinearIntegrationConfig>,
        user?: IUser,
    ) {
        return {
            accessToken: config.data.credentials.accessToken,
        };
    }

    private createClient(config: any) {
        return new LinearClient(config);
    }

    getMyself() {
        return this.client.viewer;
    }

    getOrganization() {
        return this.client.organization;
    }

    async getCommentsAndHistory(issueId: string) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetCommentsAndHistory,
            {
                issueId,
                first: 100,
            },
        );

        if (response.status !== StatusCodes.OK) {
            return {
                after: null,
                comments: [],
                history: [],
            };
        }

        const comments = response.data!.issue.comments.nodes;
        const history = response.data!.issue.history.nodes;
        return {
            after: null,
            comments,
            history: history.map((historyItem: any) =>
                filterEmpty(historyItem),
            ),
        };
    }

    async getTeams(first: number, after: string, filter: any) {
        const teams = await this.client.teams({ first, after, filter });
        return {
            after: teams.pageInfo.hasNextPage ? teams.pageInfo.endCursor : null,
            teams: teams.nodes.map((team: Team) => {
                return {
                    id: team.id,
                    name: team.name,
                    createdAt: team.createdAt,
                    updatedAt: team.updatedAt,
                };
            }),
        };
    }

    async getCycles(first: number, after: string, filter: any) {
        const cycles = await this.client.cycles({ first, after, filter });
        return {
            after: cycles.pageInfo.hasNextPage
                ? cycles.pageInfo.endCursor
                : null,
            cycles: cycles.nodes.map(cycle => {
                return {
                    id: cycle.id,
                    name: cycle.name,
                    number: cycle.number,
                    progress: cycle.progress,
                    completedAt: cycle.completedAt,
                    archivedAt: cycle.archivedAt,
                    endsAt: cycle.endsAt,
                    startsAt: cycle.startsAt,
                    createdAt: cycle.createdAt,
                    updatedAt: cycle.updatedAt,
                };
            }),
        };
    }

    async getPriorities() {
        const priorities = await this.client.issuePriorityValues;
        return {
            priorities: priorities.map((priority: IssuePriorityValue) => ({
                id: priority.priority,
                label: priority.label,
            })),
        };
    }

    async getProjects(
        first: number,
        after: string,
        teamId: string,
        filter: any = {},
    ) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetProjects,
            {
                first,
                after,
                teamId,
                filter,
            },
        );
        if (response.status !== StatusCodes.OK) {
            return {
                after: null,
                projects: [],
            };
        }
        const projects = response.data!.team.projects.nodes;
        const pageInfo = response.data!.team.projects.pageInfo;
        return {
            after: pageInfo.hasNextPage ? pageInfo.endCursor : null,
            projects: projects.map((project: any) => ({
                id: project.id,
                name: project.name,
                state: project.state,
                icon: project.icon,
                color: project.color,
                url: project.url,
            })),
        };
    }

    async getStates(first: number, after: string, filter: any = {}) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetStates,
            {
                first,
                after,
                filter,
            },
        );
        if (response.status !== StatusCodes.OK) {
            return {
                after: null,
                states: [],
            };
        }
        const states = response.data!.workflowStates.nodes;
        const pageInfo = response.data!.workflowStates.pageInfo;
        return {
            after: pageInfo.hasNextPage ? pageInfo.endCursor : null,
            states: states.map((state: any) => ({
                id: state.id,
                name: state.name,
                color: state.color,
                position: state.position,
                type: state.type,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt,
            })),
        };
    }

    async getLabels(first: number, after: string, filter: any = {}) {
        const labels = await this.client.issueLabels({
            first,
            after,
            filter,
        });
        const newAfter = labels.pageInfo.hasNextPage
            ? labels.pageInfo.endCursor!
            : null;
        return {
            after: newAfter,
            labels: labels.nodes.map((label: any) => ({
                id: label.id,
                name: label.name,
                color: label.color,
                team: label._team?.id,
            })),
        };
    }

    async updateIssue(issueId: string, input: IssueUpdateInput) {
        try {
            const response = await this.client.updateIssue(issueId, input);
            return response.success;
        } catch {
            return false;
        }
    }

    async getUsers(first: number, after: string, teamId: any, filter: any) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetTeamMembers,
            {
                first,
                after,
                teamId,
                filter,
            },
        );
        if (response.status !== StatusCodes.OK) {
            return {
                after: null,
                users: [],
            };
        }
        const users = response.data!.team.members.nodes;
        const pageInfo = response.data!.team.members.pageInfo;
        return {
            after: pageInfo.hasNextPage ? pageInfo.endCursor : null,
            users: users.map((user: any) => ({
                id: user.id,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })),
        };
    }

    async searchIssues(query: string, filter: any = {}) {
        const response = await this.client.searchIssues(query, {
            filter,
        });
        return response.nodes.map((issue: any) => {
            return {
                assignee: issue._assignee?.id,
                creator: issue._creator?.id,
                description: issue.description,
                id: issue.id,
                identifier: issue.identifier,
                labels: issue.labelIds ?? [],
                priority: issue.priority,
                project: issue._project?.id,
                state: issue._state?.id,
                stateType: issue.state?.type,
                team: issue._team?.id,
                title: issue.title,
                cycle: issue._cycle?.id,
                createdAt: issue.createdAt,
                updatedAt: issue.updatedAt,
                url: issue.url,
                metadata: issue.metadata,
            };
        });
    }

    async getIssue(id: string) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetIssues,
            {
                filter: {
                    id: {
                        eq: id,
                    },
                },
            },
        );
        const issues = response.data!.issues as any;
        const issue = issues.nodes.pop();
        if (!issue) return null;
        return {
            assignee: issue.assignee?.id,
            creator: issue.creator?.id,
            description: issue.descriptionState,
            id: issue.id,
            identifier: issue.identifier,
            key: issue.identifier,
            labels: issue.labelIds ?? [],
            priority: issue.priority,
            project: issue.project?.id,
            state: issue.state?.id,
            stateType: issue.state?.type,
            team: issue.team?.id,
            title: issue.title,
            cycle: issue.cycle?.id,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            url: issue.url,
            parent: issue.parent?.id,
        };
    }

    async getIssueByIdentifier(identifier: string) {
        const issue = await this.client.issue(identifier);
        if (!issue) return null;
        return this.getIssue(issue.id);
    }

    async getIssues(first: number, after: string, filter: any) {
        const response = await this.client.client.rawRequest<any, any>(
            LinearQueries.GetIssues,
            {
                filter,
                first,
                after,
                orderBy: 'createdAt',
            },
        );
        const issues = response.data!.issues as any;
        return {
            after: issues.pageInfo.hasNextPage
                ? issues.pageInfo.endCursor
                : null,
            issues: issues.nodes.map((issue: any) => ({
                assignee: issue.assignee?.id,
                creator: issue.creator?.id,
                description: issue.descriptionState,
                id: issue.id,
                identifier: issue.identifier,
                key: issue.identifier,
                labels: issue.labelIds ?? [],
                priority: issue.priority,
                project: issue.project?.id,
                state: issue.state?.id,
                stateType: issue.state?.type,
                team: issue.team?.id,
                title: issue.title,
                cycle: issue.cycle?.id,
                createdAt: issue.createdAt,
                updatedAt: issue.updatedAt,
                url: issue.url,
                parent: issue.parent?.id,
            })),
        };
    }
}
