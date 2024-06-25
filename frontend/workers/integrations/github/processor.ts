import { IUpdateChange } from 'dexie-observable/api';
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
import {
    GithubIntegration as GithubIntegrationType,
    GithubIntegrationData,
    GithubPullRequest,
    GithubRepository,
} from '~/components/github/github';
import { isGithubPullRequest } from '~/plugins/entities/github';
import { GithubIntegration } from '~/workers/integrations/github/controller';
import { IEvent } from '~/@types';

type ResumableLoadConfig = {
    state: 'open' | 'closed' | 'all';
    filter: 'all' | 'assigned' | 'created' | 'mentioned' | 'subscribed';
    since: string;
    maxCreatedAt: number | null;
    minCreatedAt: number | null;
};

export class GithubIntegrationProcessor extends BaseIntegration<GithubIntegrationData> {
    private context: WorkerContext;
    runInterval = 7 * 24 * 60 * 60 * 1000;
    name = IntegrationType.GITHUB;

    constructor(ctx: WorkerContext) {
        super();
        this.context = ctx;
    }

    shouldRun(_integration: IntegrationConfig<GithubIntegrationData>): boolean {
        return false;
    }

    async removeRepository(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repoId: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        await githubIntegration.removeRepository(repoId);
    }

    async initialLoadRepository(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repoId: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        const since = new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString();
        await githubIntegration.loadRepository(repoId, {
            query: {
                state: 'open',
                filter: 'all',
            },
            initialLoad: true,
        });

        await githubIntegration.loadRepository(repoId, {
            query: {
                state: 'open',
                filter: 'mentioned',
            },
            initialLoad: true,
            isMention: true,
        });

        await githubIntegration.loadRepository(repoId, {
            query: {
                state: 'closed',
                filter: 'all',
                since,
            },
            initialLoad: true,
        });
    }

    // take repositories you have and
    async initialLoad(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ): Promise<void> {
        if (!integration.updateProgress && integration.lastRunTimestamp) return;
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        await Promise.all([
            githubIntegration.loadUserOrganizations(),
            githubIntegration.loadUserRepositories(),
            githubIntegration.loadUserTeams(),
        ]);

        githubIntegration.updateLastSync();

        const repos = integration.data.repositories;

        for (const repoId of repos) {
            await this.initialLoadRepository(integration, repoId);
        }

        await githubIntegration.loadUserTeams();

        await githubIntegration.updateIntegration({
            updateProgress: undefined,
        });
    }

    async loadRepository(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repoId: string,
        lastRunTimestampISO: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        await githubIntegration.loadRepository(repoId, {
            query: {
                state: 'all',
                filter: 'all',
                since: lastRunTimestampISO,
            },
        });

        await githubIntegration.loadRepository(repoId, {
            query: {
                state: 'all',
                filter: 'mentioned',
                since: lastRunTimestampISO,
            },
            isMention: true,
        });
    }

    // take repositories you have and fetch data from them based on last run timestamp
    async execute(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ): Promise<void> {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        const repos = integration.data.repositories;

        if (!repos.length) return;

        const lastRunTimestampISO = new Date(
            integration.lastRunTimestamp,
        ).toISOString();

        for (const repoId of repos) {
            await this.loadRepository(integration, repoId, lastRunTimestampISO);
        }

        githubIntegration.updateLastSync();
    }

    manualExecute(
        config: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ): Promise<void> {
        return this.execute(config);
    }

    fetchIssue(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        issueId: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.fetchIssue(repository, issueId);
    }

    fetchPullRequest(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        pullRequestId: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.fetchPullRequest(repository, pullRequestId);
    }

    fetchCommitChecks(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        commitId: string,
        entityId?: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.fetchCommitChecks(
            repository,
            commitId,
            entityId,
        );
    }

    fetchCommitStatuses(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        commitId: string,
        entityId?: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.fetchCommitStatuses(
            repository,
            commitId,
            entityId,
        );
    }

    fetchTimeline(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        pullRequestId: string,
        entityId?: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.fetchTimeline(
            repository,
            pullRequestId,
            entityId,
        );
    }

    processRemoteChange(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        change: IUpdateChange,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        githubIntegration.processRemoteChange(change);
    }

    postComment(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
        repository: string,
        number: number,
        body: string,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.postComment(repository, number, body);
    }

    loadUserTeams(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.loadUserTeams();
    }

    loadUserRepositories(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.loadUserRepositories();
    }

    loadUserOrganizations(
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ) {
        const githubIntegration = new GithubIntegration(
            this.context,
            integration,
        );

        return githubIntegration.loadUserOrganizations();
    }
}
