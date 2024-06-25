import { add } from 'date-fns';
import { format } from 'date-fns-tz';
import {
    BaseIntegration,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { WorkerContext } from '~/@types/app';
import {
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import { LinearIntegrationConfig } from '~/@types/integrations';
import { LinearIntegration } from '~/workers/integrations/linear/controller';
import { IVault } from '~/plugins/storage-service/cloud/vaults';

export class LinearIntegrationProcessor extends BaseIntegration<LinearIntegrationConfig> {
    private context: WorkerContext;
    runInterval = 3 * 60 * 1000;
    name = IntegrationType.LINEAR;

    constructor(ctx: WorkerContext) {
        super();
        this.context = ctx;
    }

    shouldRun(integration: IntegrationConfig<LinearIntegrationConfig>) {
        const now = Date.now();
        const lastRun = integration.lastRunTimestamp ?? 0;
        const diff = now - lastRun;
        return diff >= this.runInterval;
    }

    async execute(integration: IntegrationConfig<LinearIntegrationConfig>) {
        await this.fetchUpdates(integration);
    }

    async fetchUpdates(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        const teams = linearIntegration.prepareTeams(integration);
        const lastSyncTimestamp = integration.lastRunTimestamp ?? 0;
        const lastRunTimestamp = Date.now();

        try {
            for (const team of teams) {
                await this.loadTeamMetadata(
                    integration,
                    team,
                    lastSyncTimestamp,
                );
            }
        } catch (e) {
            console.log(e);
        }

        try {
            await linearIntegration.fetchIssueUpdates(
                integration,
                teams,
                lastSyncTimestamp,
            );

            await linearIntegration.saveIntegration({
                id: integration.id,
                vaultId: integration.vaultId,
                lastRunTimestamp,
            });
        } catch (e) {
            console.log(e);
        }
    }

    getIssuesPreview(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        view: any,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        return linearIntegration.getIssuesPreview(integration, view);
    }

    async prepareTeamsData(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamIds: string[],
    ) {
        for (const teamId of teamIds) {
            try {
                await this.loadTeamMetadata(integration, teamId);
            } catch (e) {
                console.log(e);
            }
        }
    }

    async loadTeamMetadata(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        timestamp: number = 0,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        const teamFilter: Record<string, any> = {
            team: {
                id: {
                    eq: teamId,
                },
            },
        };
        if (timestamp > 0) {
            const timestampDate = new Date(timestamp);
            const date = add(timestampDate, {
                minutes: timestampDate.getTimezoneOffset(),
            });
            teamFilter.updatedAt = {
                gte: format(date, 'yyyy-MM-dd HH:mm:ss.SSS', {
                    timeZone: 'UTC',
                }),
            };
        }
        const userFilter = {
            ...teamFilter,
        };
        delete userFilter.team;

        try {
            await Promise.all([
                linearIntegration.getPaginatedUsers(
                    integration,
                    teamId,
                    userFilter,
                ),
                linearIntegration.getPaginatedStates(
                    integration,
                    teamId,
                    teamFilter,
                ),
                linearIntegration.getPaginatedProjects(
                    integration,
                    teamId,
                    teamFilter,
                ),
                linearIntegration.getPaginatedLabels(integration, teamFilter),
                linearIntegration.getPaginatedLabels(integration, {
                    ...userFilter,
                    team: {
                        null: true,
                    },
                }),
                linearIntegration.getPaginatedCycles(
                    integration,
                    teamId,
                    teamFilter,
                ),
            ]);
        } catch (e) {
            console.log(e);
        }
    }

    async loadViewsIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        views: any[],
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        for (const view of views) {
            try {
                await linearIntegration.loadViewIssues(integration, view);
            } catch (e) {
                console.log(e);
            }
        }
    }

    async getIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
        identifier: string,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        const issue = await linearIntegration.getIssue(
            integration,
            issueId,
            identifier,
        );
        const output = [issue];
        if (issue.parent) {
            const parentId = issue.parent.split('/').pop()!;
            const parent = await linearIntegration.getIssue(
                integration,
                parentId,
            );
            output.push(parent);
        }
        const { issues } = await linearIntegration.getIssues(
            integration,
            undefined,
            {
                parent: {
                    id: {
                        eq: issue.id.split('/').pop()!,
                    },
                },
            },
        );
        if (issues?.length) {
            const transformed = linearIntegration.transformIssues(
                integration,
                integration.data.organization.id,
                issues,
            );
            issue.children = transformed.map(({ id }) => id);
            output.push(...transformed);
        }
        await linearIntegration.saveIntegrationData(
            integration.vaultId,
            output,
        );
        return issue;
    }

    async loadViewIssues(
        vaultId: string,
        integrationId: string,
        viewId: string,
        additionalFilters: Record<string, any> = {},
    ) {
        const integration = await this.getIntegration(
            { id: vaultId } as any,
            integrationId,
        );
        const view = integration.data.views.find(
            (view: any) => view.id === viewId,
        );
        if (!view) return;
        const linearIntegration = new LinearIntegration(this.context);
        await linearIntegration.loadViewIssues(
            integration,
            view,
            additionalFilters,
        );
    }

    async manualExecute(config: IntegrationConfig<LinearIntegrationConfig>) {
        return this.execute(config);
    }

    async initializeIntegration(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ): Promise<void> {
        const linearIntegration = new LinearIntegration(this.context);
        const [myself, organization] = await Promise.all([
            linearIntegration.getMyself(integration),
            linearIntegration.getOrganization(integration),
        ]);

        integration.data.myself = myself;
        integration.data.organization = organization;
        await linearIntegration.saveIntegration(integration);
        await linearIntegration.loadAllTeams(integration);
        linearIntegration.loadAllPriorities(integration);
    }

    searchIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        query: string,
        filter: any = {},
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        return linearIntegration.searchIssues(integration, query, filter);
    }

    async getCommentsAndHistory(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        return linearIntegration.getCommentsAndHistory(integration, issueId);
    }

    updateIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
        payload: any,
    ) {
        const linearIntegration = new LinearIntegration(this.context);
        return linearIntegration.updateIssue(integration, issueId, payload);
    }

    getIntegration(vault: IVault, id: string): Promise<IntegrationConfig<any>> {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.RETRIEVE,
            {
                table: 'integrations',
                vaultId: vault.id,
                id,

                payload: {
                    vaultId: vault.id,
                    id,
                },
                callerContext:
                    'integrations/linear/processor.ts/getIntegration',
            },
        );
    }
}
