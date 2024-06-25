import { v4 } from 'uuid';
import merge from 'lodash/merge';
import { formatDistance } from 'date-fns';
import defaultsDeep from 'lodash/defaultsDeep';
import { EntityController } from '~/plugins/entities/controller';
import { IntegrationType, ServiceKey, TabType } from '~/constants';
import {
    GithubCommitCheck,
    GithubCommitChecksResponse,
    GithubCommitStatusesResponse,
    GithubEventTypes,
    GithubIntegration,
    GithubIntegrationAction,
    GithubIntegrationDataType,
    GithubIssue,
    GithubIssueState,
    GithubLoadingState,
    GithubOrganization,
    GithubPullRequest,
    GithubRepository,
    GithubStateReason,
    GithubTeam,
    GithubTimelineEvent,
    GithubUser,
} from '~/components/github/github';
import { IDocument } from '~/components/document/model';
import { IntegrationAuthStatus } from '~/workers/integrations/base';
import { Tab } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export const GITHUB_REPOSITORY_REGEX =
    /https?:\/\/github\.com\/([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)/g;
export const GITHUB_ISSUE_REGEX =
    /^https?:\/\/github\.com\/([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)\/issues\/([0-9]+)$/g;
export const GITHUB_PR_REGEX =
    /^https?:\/\/github\.com\/([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)\/pull\/([0-9]+)$/g;

export const isGithubIssue = (item: GithubIssue | GithubPullRequest) => {
    return !isGithubPullRequest(item);
};

export const isGithubPullRequest = (item: GithubIssue | GithubPullRequest) => {
    return 'pull_request' in item && !!item.pull_request;
};

export const isIssueOrPullRequestClosed = (
    item: GithubIssue | GithubPullRequest,
) => {
    return item.state === GithubIssueState.CLOSED;
};

export const isIssueOrPullRequestOpen = (
    item: GithubIssue | GithubPullRequest,
) => {
    return item.state === GithubIssueState.OPEN;
};

export const isPullRequestMerged = (item: GithubPullRequest) => {
    if (item.merged === undefined) {
        return !!item.pull_request?.merged_at;
    }

    return item.merged;
};

export const isIssueOrPullRequestCreatedByUser = (
    item: GithubIssue | GithubPullRequest,
    user: GithubUser,
) => {
    return item.user.id === user.id;
};

export const isIssueOrPullRequestAssignedToUser = (
    item: GithubIssue | GithubPullRequest,
    user: GithubUser,
) => {
    return item.assignees?.some(assignee => assignee.id === user.id);
};

export const isIssueOrPullRequestMentioningUser = (
    item: GithubIssue | GithubPullRequest,
    user: GithubUser,
) => {
    return item.body?.includes(`@${user.login}`) || item.isMention;
};

export const isPullRequestReviewRequestedFromUser = (
    item: GithubPullRequest,
    user: GithubUser,
) => {
    return item.requested_reviewers?.some(reviewer => reviewer.id === user.id);
};

export const isGithubEntity = (
    entityOrId: GithubIssue | GithubPullRequest | string,
) => {
    const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;

    return (
        id.startsWith(GithubIntegrationDataType.ISSUE) ||
        id.startsWith(GithubIntegrationDataType.PR)
    );
};

function EnsureIntegration(defaultValue: any = null) {
    return function (target: any, key: string) {
        const originalMethod = target[key];
        target[key] = function (...args: any[]) {
            const integration = this.getIntegration();
            if (!integration) return defaultValue;
            return originalMethod.apply(this, args);
        };
    };
}

export const getRepositoryName = (
    entityOrId: GithubIssue | GithubPullRequest | string,
): string => {
    if (typeof entityOrId === 'string') {
        const id = entityOrId;
        const parts = id.split('/');
        return `${parts[1]}/${parts[2]}`;
    }

    if (entityOrId.repository_url) {
        const parts = entityOrId.repository_url.split('/');
        return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    }

    if (entityOrId.repository) {
        if (entityOrId.repository.name && entityOrId.repository.owner) {
            return `${entityOrId.repository.owner.login}/${entityOrId.repository.name}`;
        }
        if (entityOrId.repository.full_name) {
            return entityOrId.repository.full_name;
        }
    }

    if ((entityOrId as GithubPullRequest).base?.repo?.full_name) {
        return (entityOrId as GithubPullRequest).base.repo.full_name;
    }

    if ((entityOrId as GithubPullRequest).head?.repo?.full_name) {
        return (entityOrId as GithubPullRequest).head!.repo!.full_name;
    }

    const id = entityOrId.id;
    const parts = id.split('/');
    return `${parts[1]}/${parts[2]}`;
};

export class GithubController extends EntityController<any> {
    private implementedEvents: GithubEventTypes[] = [
        GithubEventTypes.COMMENTED,
        GithubEventTypes.COMMITED,
        GithubEventTypes.REVIEWED,
        GithubEventTypes.ASSIGNED,
        GithubEventTypes.CLOSED,
        GithubEventTypes.LABELED,
        GithubEventTypes.CROSS_REFERENCED,
    ];

    get myself(): GithubUser | null {
        const integration = this.getIntegration();
        return integration?.data?.account ?? null;
    }

    openModal(
        entityOrId: string | GithubIssue | GithubPullRequest,
        trackingSource?: TrackingActionSource,
    ) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        const entity = this.getById(id);

        if (!entity) return;

        if (this.context.$utils.isMobile) return;
        const isPull = isGithubPullRequest(entity);

        if (trackingSource) {
            const action = isPull
                ? TrackingAction.OPEN_GITHUB_PULL_REQUEST_DETAIL
                : TrackingAction.OPEN_GITHUB_ISSUE_DETAIL;

            this.context.$tracking.trackEventV2(TrackingType.GITHUB, {
                action,
                source: trackingSource,
            });
        }

        if (isPull) {
            return this.context.$vfm.show({
                component: () =>
                    import('@/components/github/GithubPullRequestModal.vue'),
                bind: {
                    id: entity.id,
                },
            });
        } else {
            return this.context.$vfm.show({
                component: () =>
                    import('@/components/github/GithubIssueModal.vue'),
                bind: {
                    id: entity.id,
                },
            });
        }
    }

    getBacklinks(id: string) {
        const pages = this.context.$entities.page.list();
        return pages.filter((page: IDocument) => {
            const postprocessingMap =
                this.context.$entities.page.getPostprocessingMap(page.id);
            return postprocessingMap.githubLinks?.includes(id);
        });
    }

    getTeams(): GithubTeam[] {
        return this.context.store.getters['integrationData/byType'](
            GithubIntegrationDataType.TEAM,
        );
    }

    isInReview(pullRequest: GithubPullRequest) {
        const user = this.getUser();
        if (!user) return false;

        if (isPullRequestReviewRequestedFromUser(pullRequest, user)) {
            return true;
        }

        const requestedTeams = pullRequest.requested_teams || [];
        if (!requestedTeams.length) return false;

        const teams = this.getTeams();
        if (!teams.length) return false;

        const teamSlugs = teams.map(team => team.slug);
        return requestedTeams.some(team => teamSlugs.includes(team.slug));
    }

    resolveId(id: string): {
        type: GithubIntegrationDataType;
        id: string;
        repository: string;
    } | null {
        if (!id) return null;

        if (`${id}`.startsWith(GithubIntegrationDataType.REPOSITORY)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, owner, name] = id.split('/');
            return {
                type: GithubIntegrationDataType.REPOSITORY,
                repository: `${owner}/${name}`,
                id: `${owner}/${name}`,
            };
        }

        if (`${id}`.startsWith(GithubIntegrationDataType.ISSUE)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, owner, name, __, issue] = id.split('/');
            return {
                type: GithubIntegrationDataType.ISSUE,
                repository: `${owner}/${name}`,
                id: issue,
            };
        }

        if (`${id}`.startsWith(GithubIntegrationDataType.PR)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, owner, name, __, pr] = id.split('/');
            return {
                type: GithubIntegrationDataType.PR,
                repository: `${owner}/${name}`,
                id: pr,
            };
        }

        return null;
    }

    getRepositoryId(repo: string) {
        return [GithubIntegrationDataType.REPOSITORY, repo].join('/');
    }

    @EnsureIntegration(false)
    isAuthorized() {
        return (
            this.getIntegration()!.authStatus !==
            IntegrationAuthStatus.UNAUTHORIZED
        );
    }

    getIssueId(repo: string, id: string | number) {
        return [GithubIntegrationDataType.ISSUE, repo, 'issues', id].join('/');
    }

    getPullRequestId(repo: string, id: string | number) {
        return [GithubIntegrationDataType.PR, repo, 'pulls', id].join('/');
    }

    getIssue(repo: string, id: string | number): GithubIssue | null {
        const issueId = this.getIssueId(repo, id);
        return this.getById(issueId) as GithubIssue;
    }

    getPullRequest(
        repo: string,
        id: string | number,
    ): GithubPullRequest | null {
        const issueId = this.getPullRequestId(repo, id);
        return this.getById(issueId) as GithubPullRequest;
    }

    // called when I re-authorize
    fullRefresh() {
        const config = this.getIntegration();

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.INITIALIZE,
            {
                config,
            },
        );
    }

    refresh() {
        const config = this.getIntegration();

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.EXECUTE,
            {
                config,
            },
        );
    }

    loadingOrganizations() {
        const integration = this.getIntegration();

        return integration?.loading?.organizations !== GithubLoadingState.DONE;
    }

    loadingTeams() {
        const integration = this.getIntegration();

        return integration?.loading?.teams !== GithubLoadingState.DONE;
    }

    loadingRepositories() {
        const integration = this.getIntegration();

        return integration?.loading.repositories !== GithubLoadingState.DONE;
    }

    getIntegration(): GithubIntegration | null {
        const integrations = this.context.store.getters['integration/byType'](
            IntegrationType.GITHUB,
        );

        if (!integrations.length) return null;

        if (!integrations[0].loading) {
            integrations[0].loading = {
                organizations: GithubLoadingState.NOT_STARTED,
                teams: GithubLoadingState.NOT_STARTED,
                repositories: GithubLoadingState.NOT_STARTED,
            };
        }
        return integrations[0];
    }

    async closeGithubTab() {
        const githubTabs = this.context.store.getters['tabs/list'].filter(
            (tab: Tab) => tab.type === TabType.GITHUB_APP,
        );

        for (const tab of githubTabs) {
            const groupId = this.context.store.getters['tabs/groupByTabId'](
                tab.id,
            );

            await this.context.$tabs.closeTab(tab, groupId);
        }
    }

    @EnsureIntegration()
    openGithubTab() {
        const tab = this.context.$tabs.createNewTabObject(
            TabType.GITHUB_APP,
            TabType.GITHUB_APP,
        );
        this.context.$tabs.openTab(tab);
    }

    connectWithAccessToken(token: string) {
        const vaultId = this.context.store.getters['vault/activeVaultId'];
        if (!vaultId) return;

        return this.createIntegration({
            accessToken: token,
            vaultId,
            redirect: true,
        });
    }

    async reauthorize(options: {
        accessToken: string;
        vaultId: string;
        baseUrl?: string;
        redirect?: boolean;
    }) {
        // store existing integration into variable
        const oldIntegration = this.getIntegration();

        if (!oldIntegration) return;

        // if not old, create?

        // try to fetch user using new creadentials

        const account = await this.fetchUser(
            options.accessToken,
            options.baseUrl,
        );

        if (!account) {
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/ErrorNotification.vue'),
                bind: {
                    displayText: 'Error connecting account',
                },
            });
            return;
        }

        if (oldIntegration.data.account.id === account.id) {
            try {
                const newIntegration = {
                    ...oldIntegration,
                    data: {
                        ...oldIntegration.data,
                        credentials: options.accessToken,
                        account,
                    },
                    authStatus: IntegrationAuthStatus.AUTHORIZED,
                    lastRunTimestamp: 0,
                };

                await this.context.store.dispatch(
                    'integration/save',
                    newIntegration,
                );

                await this.context.$vfm.hideAll();
                if (options.redirect) {
                    this.openGithubTab();
                }

                this.fullRefresh();

                this.context.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText: 'Github account connected',
                    },
                });
            } catch (e) {}
        } else {
            await this.delete(false);
            await this.createIntegration(options);
        }
    }

    async fetchUser(accessToken: string, baseUrl?: string) {
        const response = await this.context.$serviceRegistry.invoke<{
            data: GithubUser | null;
        }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
            url: 'GET /user',
            accessToken,
            baseUrl: baseUrl ? `${baseUrl}/api/v3` : undefined,
            callerContext: 'entities/github.ts fetchUser',
        });

        if (!response || !response.data) return null;

        return response.data;
    }

    async createIntegration(options: {
        accessToken: string;
        vaultId: string;
        baseUrl?: string;
        redirect?: boolean;
    }) {
        // check if integration already exists, if yes re-authorize
        const integration = this.getIntegration();

        if (integration) {
            return this.reauthorize(options);
        }

        const baseUrl = options.baseUrl;

        const user = await this.fetchUser(options.accessToken, baseUrl);

        if (!user) {
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/ErrorNotification.vue'),
                bind: {
                    displayText: 'Error connecting account',
                },
            });
            return;
        }

        try {
            const integration: GithubIntegration = {
                id: v4(),
                type: IntegrationType.GITHUB,
                data: {
                    credentials: options.accessToken,
                    repositories: [],
                    baseUrl: baseUrl ? `${baseUrl}/api/v3` : undefined,
                    account: user,
                },
                authStatus: IntegrationAuthStatus.AUTHORIZED,
                vaultId: options.vaultId,
                loading: {
                    organizations: GithubLoadingState.NOT_STARTED,
                    teams: GithubLoadingState.NOT_STARTED,
                    repositories: GithubLoadingState.NOT_STARTED,
                },
            };

            await this.context.store.dispatch('integration/save', integration);

            this.loadUserOrganizations();
            this.loadUserRepositories();
            this.loadUserTeams();

            this.openRepositorySelector(true);

            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Github account connected',
                },
            });

            this.context.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.CREATE,
            });
        } catch (e) {
            console.log(e);
        }
    }

    @EnsureIntegration()
    async delete(confirm = true) {
        const integration = this.getIntegration();

        if (!confirm) {
            await this.closeGithubTab();
            return this.context.store.dispatch(
                'integration/delete',
                integration,
            );
        }

        await this.context.$vfm.show({
            component: () =>
                import(
                    '~/components/modal/SettingsModal/GitHub/DeleteGithubIntegration.vue'
                ),
            on: {
                remove: () => {
                    this.closeGithubTab();
                    this.context.store.dispatch(
                        'integration/delete',
                        integration,
                    );

                    this.context.$vfm.hide('delete-github-integration');

                    this.context.$tracking.trackEventV2(TrackingType.GITHUB, {
                        action: TrackingAction.DELETE,
                    });
                },
            },
        });
    }

    getPullRequests(): GithubPullRequest[] {
        return this.context.store.getters['integrationData/byType'](
            GithubIntegrationDataType.PR,
        );
    }

    getIssues(): GithubIssue[] {
        return this.context.store.getters['integrationData/byType'](
            GithubIntegrationDataType.ISSUE,
        );
    }

    getRepositories(): GithubRepository[] {
        return this.context.store.getters['integrationData/byType'](
            GithubIntegrationDataType.REPOSITORY,
        );
    }

    getUser(): GithubUser | null {
        const data = this.context.store.getters['integration/byType'](
            IntegrationType.GITHUB,
        ).map((integration: GithubIntegration) => integration.data.account);

        if (data.length) return data[0];
        return null;
    }

    fetchEntityById(id: string) {
        const resolvedId = this.resolveId(id);
        if (!resolvedId) return null;

        if (resolvedId.type === GithubIntegrationDataType.ISSUE) {
            return this.fetchIssue(resolvedId.repository, resolvedId.id);
        }

        if (resolvedId.type === GithubIntegrationDataType.PR) {
            this.fetchIssue(resolvedId.repository, resolvedId.id);
            return this.fetchPullRequest(resolvedId.repository, resolvedId.id);
        }

        return null;
    }

    @EnsureIntegration()
    fetchIssue(
        repository: string,
        issueId: string,
    ): Promise<null | GithubIssue> | null {
        const integration = this.getIntegration();

        return this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.FETCH_ISSUE,
            {
                config: integration,
                repository,
                issueId,
                callerContext: 'entities/github.ts fetchIssue',
            },
        );
    }

    @EnsureIntegration()
    fetchPullRequest(
        repository: string,
        pullRequestId: string,
    ): Promise<null | GithubPullRequest> | null {
        const integration = this.getIntegration();

        return this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.FETCH_PR,
            {
                config: integration,
                repository,
                pullRequestId,
                callerContext: 'entities/github.ts fetchPullRequest',
            },
        );
    }

    @EnsureIntegration([])
    async fetchCommitChecks(
        repository: string,
        commitId: string,
        entityId?: string,
    ): Promise<GithubCommitCheck[]> {
        const integration = this.getIntegration();
        const checks =
            await this.context.$serviceRegistry.invoke<GithubCommitChecksResponse>(
                ServiceKey.INTEGRATIONS,
                GithubIntegrationAction.FETCH_COMMIT_CHECKS,
                {
                    config: integration,
                    repository,
                    commitId,
                    entityId,
                    callerContext: 'entities/github.ts fetchCommitChecks',
                },
            );

        if (!checks) return [];

        return checks.check_runs;
    }

    @EnsureIntegration([])
    async fetchCommitStatuses(
        repository: string,
        commitId: string,
        entityId?: string,
    ): Promise<GithubCommitStatusesResponse[]> {
        const integration = this.getIntegration();

        const statuses = await this.context.$serviceRegistry.invoke<
            GithubCommitStatusesResponse[]
        >(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.FETCH_COMMIT_STATUSES,
            {
                config: integration,
                repository,
                commitId,
                entityId,
                callerContext: 'entities/github.ts fetchCommitStatuses',
            },
        );

        if (!statuses) return [];

        return statuses;
    }

    @EnsureIntegration([])
    async fetchTimeline(
        repository: string,
        pullRequestId: string,
        entityId?: string,
    ): Promise<GithubTimelineEvent[]> {
        const integration = this.getIntegration();

        if (entityId) {
            this.updateAcreomMeta(entityId, {
                loadingTimeline: true,
            });
        }

        const timeline = await this.context.$serviceRegistry.invoke<
            GithubTimelineEvent[]
        >(ServiceKey.INTEGRATIONS, GithubIntegrationAction.FETCH_TIMELINE, {
            config: integration,
            repository,
            pullRequestId,
            entityId,
            callerContext: 'entities/github.ts fetchTimeline',
        });

        if (!timeline) return [];

        return timeline.filter(event =>
            this.implementedEvents.includes(event.event),
        );
    }

    getRepositoryById(id: string): GithubRepository | null {
        return this.context.store.getters['integrationData/byId'](id) || null;
    }

    getById(id: string): GithubIssue | GithubPullRequest | null {
        return this.context.store.getters['integrationData/byId'](id) || null;
    }

    getRepositoryName(entity: GithubIssue | GithubPullRequest) {
        return getRepositoryName(entity);
    }

    @EnsureIntegration()
    openRepositoryInBrowser(entity: GithubIssue | GithubPullRequest) {
        let url = entity.repository?.html_url;
        if (!url) {
            const repository = this.getRepositoryName(entity);
            const integration = this.getIntegration();
            if (!integration) return;
            const baseUrl =
                integration.data?.baseUrl?.replace('/api/v3', '') ||
                'https://github.com';
            url = `${baseUrl}/${repository}`;
        }
        this.context.$utils.navigation.openExternalLink(url);
    }

    openInBrowser(entity: GithubIssue | GithubPullRequest) {
        const url = entity.html_url;

        this.context.$utils.navigation.openExternalLink(url);
    }

    getFormattedStatus(
        entity: GithubIssue | GithubPullRequest,
        timed: boolean = false,
    ) {
        if (isGithubPullRequest(entity)) {
            return this.getFormattedStatusPullRequest(
                entity as GithubPullRequest,
                timed,
            );
        }

        return this.getFormattedStatusIssue(entity as GithubIssue, timed);
    }

    getFormattedStatusIssue(entity: GithubIssue, timed: boolean = false) {
        if (isIssueOrPullRequestOpen(entity)) {
            if (timed) {
                const date = new Date(entity.created_at);
                return `Opened ${formatDistance(date, new Date(), {
                    addSuffix: true,
                })}`;
            }
            return 'Open';
        } else if (
            isIssueOrPullRequestClosed(entity) &&
            entity.state_reason === GithubStateReason.COMPLETED
        ) {
            // eslint-disable-next-line no-empty
            if (timed) {
            }
            return 'Closed';
        } else if (
            isIssueOrPullRequestClosed(entity) &&
            entity.state_reason === GithubStateReason.NOT_PLANNED
        ) {
            // eslint-disable-next-line no-empty
            if (timed) {
            }
            return 'Closed';
        }

        if (timed) {
            const date = new Date(entity.created_at);
            return `Opened ${formatDistance(date, new Date(), {
                addSuffix: true,
            })}`;
        }

        return 'Open';
    }

    getFormattedStatusPullRequest(
        entity: GithubPullRequest,
        timed: boolean = false,
    ) {
        if (isIssueOrPullRequestOpen(entity) && !entity.draft) {
            if (entity.requested_reviewers?.length > 0) {
                // TODO: check timeline and get timestamp if possible
                return 'Review requested';
            }

            if (entity.review_comments > 0) {
                return 'In Review';
            }

            if (timed) {
                const date = new Date(entity.created_at);
                return `Opened ${formatDistance(date, new Date(), {
                    addSuffix: true,
                })}`;
            }
            return 'Open';
        } else if (isIssueOrPullRequestOpen(entity) && entity.draft) {
            // eslint-disable-next-line no-empty
            if (timed) {
            }
            return 'Draft';
        } else if (
            isIssueOrPullRequestClosed(entity) &&
            isPullRequestMerged(entity)
        ) {
            // eslint-disable-next-line no-empty
            if (timed) {
            }
            return 'Merged';
        } else if (
            isIssueOrPullRequestClosed(entity) &&
            !isPullRequestMerged(entity)
        ) {
            // eslint-disable-next-line no-empty
            if (timed) {
            }
            return 'Closed';
        }

        return 'Closed';
    }

    getClip(id: string) {
        const page = this.context.$entities.page.findByClipId(id);
        return page?.archived ? null : page;
    }

    async createPageFromEntity(
        entityOrId: string | GithubIssue | GithubPullRequest,
    ) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        const entity = this.getById(id);
        if (!entity) return;

        const page = await this.context.$entities.page.create({
            title: `#${entity.number} ${entity.title}`,
            clip: id,
        });

        this.context.$tracking.trackEvent('document', {
            action: id ? 'add-clip' : 'remove-clip',
            type: id?.split('/')[0] ?? 'remove',
            entity_id: page.id,
        });

        const tab = this.context.$tabs.createNewTabObject(
            page.id,
            TabType.DOCUMENT,
        );
        await this.context.$tabs.openTab(tab);
        return id;
    }

    isGithubEntity(entityOrId: string | GithubIssue | GithubPullRequest) {
        return isGithubEntity(entityOrId);
    }

    updateAcreomMeta(
        entityOrId: string | GithubIssue | GithubPullRequest,
        acreomMeta: Record<string, any>,
    ) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;

        const entity = this.getById(id);
        if (!entity) return;
        const existingAcreomMeta = entity.acreomMeta || {};
        const newAcreomMeta = merge(existingAcreomMeta, acreomMeta);

        this.context.store.dispatch('integrationData/update', {
            id,
            acreomMeta: newAcreomMeta,
        });
    }

    connectEnterprise(baseUrl: string, accessToken: string) {
        this.createIntegration({
            accessToken,
            vaultId: this.context.store.getters['vault/activeVaultId'],
            redirect: true,
            baseUrl,
        });
    }

    @EnsureIntegration()
    async postComment(entity: GithubPullRequest | GithubIssue, body: string) {
        const integration = this.getIntegration();
        const repository = this.getRepositoryName(entity);
        const number = `${entity.number}`;

        if (!repository || !number) return;

        const comment = await this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.POST_COMMENT,
            {
                config: integration,
                repository,
                number,
                body,
                callerContext: 'entities/github.ts postComment',
            },
        );

        await this.fetchTimeline(repository, number, entity.id);

        return comment;
    }

    async clearNotifications() {
        const entities = [
            ...this.getIssues(),
            ...this.getPullRequests(),
        ].filter(entity => entity.acreomMeta?.notification);

        await Promise.all(
            entities.map(entity =>
                this.updateAcreomMeta(entity, {
                    notification: false,
                }),
            ),
        );
    }

    openSettings(source?: TrackingActionSource) {
        this.context.$utils.navigation.openSettings(
            'github-integration',
            source,
        );
    }

    parseUrl(url: string) {
        const issueMatch = new RegExp(GITHUB_ISSUE_REGEX).exec(url);
        if (issueMatch) {
            return this.getIssueId(issueMatch[1], issueMatch[2]);
        }

        const prMatch = new RegExp(GITHUB_PR_REGEX).exec(url);

        if (prMatch) {
            return this.getPullRequestId(prMatch[1], prMatch[2]);
        }

        const repositoryMatch = new RegExp(GITHUB_REPOSITORY_REGEX).exec(url);
        if (repositoryMatch) {
            return this.getRepositoryId(repositoryMatch[1]);
        }

        return null;
    }

    @EnsureIntegration()
    loadUserRepositories() {
        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.LOAD_REPOSITORIES,
            {
                config: this.getIntegration(),
            },
        );
    }

    @EnsureIntegration()
    loadUserTeams() {
        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.LOAD_TEAMS,
            {
                config: this.getIntegration(),
            },
        );
    }

    @EnsureIntegration()
    loadUserOrganizations() {
        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.LOAD_ORGANIZATIONS,
            {
                config: this.getIntegration(),
            },
        );
    }

    openRepositorySelector(initialSync: boolean = false) {
        this.context.$vfm.show({
            component: () =>
                import(
                    '@/components/github/GithubRepositorySelectorModal/GithubRepositorySelectorModal.vue'
                ),
            bind: {
                initialSync,
            },
        });
    }

    getOrganizations(): GithubOrganization[] {
        return this.context.store.getters['integrationData/byType'](
            GithubIntegrationDataType.ORGANIZATION,
        );
    }

    @EnsureIntegration()
    setSyncedRepositories(
        repositories: string[],
        initialSync: boolean = false,
    ) {
        const integration = this.getIntegration();

        if (!integration) return;

        this.context.store.dispatch('integration/save', {
            ...integration,
            data: { ...integration.data, repositories },
        });

        if (initialSync) {
            this.context.$vfm.hideAll();
            this.openGithubTab();
        }
    }
}
