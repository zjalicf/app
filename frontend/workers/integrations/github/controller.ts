import { v4 } from 'uuid';
import { IUpdateChange } from 'dexie-observable/api';
import defaultsDeep from 'lodash/defaultsDeep';
import { StatusCodes } from 'http-status-codes';
import { WorkerContext } from '~/@types/app';
import {
    IntegrationConfig,
    IntegrationAuthStatus,
} from '~/workers/integrations/base';
import {
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import {
    GithubIntegrationAction,
    GithubIntegrationData,
    GithubIntegrationDataType,
    GithubIssue,
    GithubListRequestOptions,
    GithubLoadingState,
    GithubOrganization,
    GithubPageFetchResponse,
    GithubPullRequest,
    GithubRepository,
    GithubTeam,
    GithubIntegration as GithubIntegrationType,
} from '~/components/github/github';
import {
    getRepositoryName,
    isGithubIssue,
    isGithubPullRequest,
} from '~/plugins/entities/github';

const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
const prevPattern = /(?<=<)([\S]*)(?=>; rel="Prev")/i;
const lastPattern = /(?<=<)([\S]*)(?=>; rel="Last")/i;

export class GithubIntegration {
    private context: WorkerContext;
    private integration: IntegrationConfig<GithubIntegrationData> &
        GithubIntegrationType;

    constructor(
        ctx: WorkerContext,
        integration: IntegrationConfig<GithubIntegrationData> &
            GithubIntegrationType,
    ) {
        this.context = ctx;
        this.integration = integration;
    }

    updateLastSync() {
        const lastRunTimestamp = Date.now();

        this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'integrations',
            payload: {
                vaultId: this.integration.vaultId,
                entity: {
                    id: this.integration.id,
                    lastRunTimestamp,
                },
                meta: {
                    clientId: v4(),
                    postprocess: false,
                },
            },
        });
    }

    updateIntegrationLoading(key: string, state: GithubLoadingState) {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: this.integration.id,
                        loading: {
                            [key]: state,
                        },
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            },
        );
    }

    updateIntegrationStatus(authStatus: IntegrationAuthStatus) {
        this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'integrations',
            payload: {
                vaultId: this.integration.vaultId,
                entity: {
                    id: this.integration.id,
                    authStatus,
                },
                meta: {
                    clientId: v4(),
                    postprocess: false,
                },
            },
        });
    }

    updateIntegration(data: any) {
        this.integration = {
            ...this.integration,
            ...data,
        };

        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: this.integration.id,
                        ...data,
                    },
                    meta: {
                        clientId: '*',
                        postprocess: false,
                    },
                },
                callerContext: 'github/controller.ts/updateIntegration',
            },
        );
    }

    createGithubIssueData(
        issue: GithubIssue,
        isMention?: boolean,
    ): GithubIssue {
        if (isMention) {
            issue.isMention = true;
        }

        return {
            ...issue,
            integrationId: this.integration.id,
            // @ts-ignore
            integrationType: this.integration.type,
            vaultId: this.integration.vaultId,
            type: GithubIntegrationDataType.ISSUE,
            repositoryId: [
                GithubIntegrationDataType.REPOSITORY,
                getRepositoryName(issue),
            ].join('/'),
            id: [
                GithubIntegrationDataType.ISSUE,
                getRepositoryName(issue),
                'issues',
                issue.number,
            ].join('/'),
        };
    }

    createGithubTeamData(team: GithubTeam) {
        return {
            ...team,
            integrationId: this.integration.id,
            // @ts-ignore
            integrationType: this.integration.type,
            vaultId: this.integration.vaultId,
            type: GithubIntegrationDataType.TEAM,
            id: [
                GithubIntegrationDataType.TEAM,
                team.organization.name,
                'teams',
                team.slug,
            ].join('/'),
        };
    }

    createGithubPullRequestData(
        pull: GithubPullRequest,
        isMention?: boolean,
    ): GithubPullRequest {
        if (isMention) {
            pull.isMention = true;
        }

        return {
            ...pull,
            integrationId: this.integration.id,
            // @ts-ignore
            integrationType: this.integration.type,
            vaultId: this.integration.vaultId,
            type: GithubIntegrationDataType.PR,
            repositoryId: [
                GithubIntegrationDataType.REPOSITORY,
                getRepositoryName(pull),
            ].join('/'),
            id: [
                GithubIntegrationDataType.PR,
                getRepositoryName(pull),
                'pulls',
                pull.number,
            ].join('/'),
        };
    }

    createGithubOrganizationData(
        organization: GithubOrganization,
    ): GithubOrganization {
        return {
            ...organization,
            integrationId: this.integration.id,
            // @ts-ignore
            integrationType: this.integration.type,
            type: GithubIntegrationDataType.ORGANIZATION,
            id: [
                GithubIntegrationDataType.ORGANIZATION,
                organization.login,
            ].join('/'),
        };
    }

    createGithubRepositoryData(repository: GithubRepository): GithubRepository {
        return {
            ...repository,
            integrationId: this.integration.id,
            // @ts-ignore
            integrationType: this.integration.type,
            type: GithubIntegrationDataType.REPOSITORY,
            id: [
                GithubIntegrationDataType.REPOSITORY,
                repository.full_name,
            ].join('/'),
        };
    }

    async *getPaginatedData<T>(
        url: string,
        cache: boolean = true,
        initial: boolean = false,
    ) {
        let pagesRemaining = true;
        const updateProgress = this.integration.updateProgress?.[url] ?? {
            maxPage: null,
            minPage: null,
        };

        const firstResponse = await this.fetchUsingURL<T>(url, cache);
        let continueUrl = firstResponse.lastUrl;
        if (!continueUrl) {
            const parsedData = this.parseData<T>(firstResponse.data);
            yield parsedData;
            return;
        }

        if (updateProgress.maxPage) {
            continueUrl = updateProgress.maxPage;
            while (pagesRemaining) {
                const response: GithubPageFetchResponse<T> =
                    await this.fetchUsingURL<T>(continueUrl!, cache);
                const parsedData = this.parseData<T>(response.data);
                yield parsedData;
                updateProgress.maxPage = response?.prevUrl;
                if (initial) {
                    await this.updateIntegration({
                        updateProgress: {
                            ...this.integration.updateProgress,
                            [url]: updateProgress,
                        },
                    });
                }
                continueUrl = response?.nextUrl;
                pagesRemaining = !!continueUrl;
            }
        }
        if (updateProgress.minPage) {
            continueUrl = updateProgress.minPage;
        }

        pagesRemaining = true;
        while (pagesRemaining) {
            const response: GithubPageFetchResponse<T> =
                await this.fetchUsingURL<T>(continueUrl!, cache);
            const parsedData = this.parseData<T>(response.data);
            yield parsedData;
            if (!updateProgress.maxPage) {
                updateProgress.maxPage = continueUrl;
            }
            updateProgress.minPage = response?.nextUrl ?? response?.lastUrl;
            if (initial) {
                await this.updateIntegration({
                    updateProgress: {
                        ...this.integration.updateProgress,
                        [url]: updateProgress,
                    },
                });
            }
            continueUrl = response?.prevUrl;
            pagesRemaining = !!continueUrl;
        }
    }

    async collectAllPaginatedData<T>(
        generator: AsyncGenerator<T[], void>,
    ): Promise<T[]> {
        const data = [];
        for await (const response of generator) {
            data.push(...response);
        }
        return data;
    }

    async fetchUsingURL<T>(
        url: string,
        cache: boolean = true,
    ): Promise<GithubPageFetchResponse<T>> {
        const response = await this.context.invoke<{
            data: T[] | null;
            headers: any;
        }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
            url: `GET ${url}`,
            accessToken: this.integration.data.credentials,
            baseUrl: this.integration.data.baseUrl,
            cache,
            callerContext: 'github/controller.ts/fetchUsingURL',
        });

        this.validateResponse(response);

        const data = this.parseData<T>(response.data);

        const linkHeader = response.headers?.link;
        const prevUrl = linkHeader?.match(prevPattern)?.[0] ?? null;
        const lastUrl = linkHeader?.match(lastPattern)?.[0] ?? null;
        const nextUrl = linkHeader?.match(nextPattern)?.[0] ?? null;

        return {
            data,
            prevUrl,
            lastUrl,
            nextUrl,
        };
    }

    parseData<T>(data: any): T[] {
        // If the data is an array, return that
        if (Array.isArray(data)) {
            return data;
        }

        // Some endpoints respond with 204 No Content instead of empty array
        //   when there is no data. In that case, return an empty array.
        if (!data) {
            return [];
        }

        // Otherwise, the array of items that we want is in an object
        // Delete keys that don't include the array of items
        delete data.incomplete_results;
        delete data.repository_selection;
        delete data.total_count;
        // Pull out the array of items

        const keys = Object.keys(data);

        if (keys.length === 1) {
            const namespaceKey = keys[0];
            data = data[namespaceKey];

            return data;
        }

        return [data];
    }

    async loadUserTeams() {
        await this.updateIntegrationLoading(
            'teams',
            GithubLoadingState.IN_PROGRESS,
        );

        const generator = this.getPaginatedData<GithubTeam>('/user/teams');
        const teams = await this.collectAllPaginatedData(generator);
        const data = teams.map(team => this.createGithubTeamData(team));

        await this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            },
        );

        await this.updateIntegrationLoading('teams', GithubLoadingState.DONE);
    }

    async loadUserOrganizations() {
        await this.updateIntegrationLoading(
            'organizations',
            GithubLoadingState.IN_PROGRESS,
        );

        const generator =
            this.getPaginatedData<GithubOrganization>('/user/orgs');
        const repositories = await this.collectAllPaginatedData(generator);
        const data = repositories.map(org =>
            this.createGithubOrganizationData(org),
        );

        await this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'github/controller.ts/loadUserOrganizations',
            },
        );

        await this.updateIntegrationLoading(
            'organizations',
            GithubLoadingState.DONE,
        );

        return data;
    }

    async loadUserRepositories() {
        await this.updateIntegrationLoading(
            'repositories',
            GithubLoadingState.IN_PROGRESS,
        );

        const generator =
            this.getPaginatedData<GithubRepository>('/user/repos');
        const repositories = await this.collectAllPaginatedData(generator);
        const data = repositories.map(repo =>
            this.createGithubRepositoryData(repo),
        );

        await this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            },
        );

        await this.updateIntegrationLoading(
            'repositories',
            GithubLoadingState.DONE,
        );

        return data;
    }

    async removeRepository(repositoryId: string): Promise<void> {
        await this.context.invoke<GithubRepository[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DELETE_BATCH,
            {
                vaultId: this.integration.vaultId,
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    query: {
                        repositoryId: {
                            eq: repositoryId,
                        },
                    },
                    meta: {
                        clientId: v4(),
                    },
                },
            },
        );
    }

    async loadRepository(
        repositoryId: string,
        options: Partial<GithubListRequestOptions>,
    ) {
        const [repository] = await this.context.invoke<GithubRepository[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_IDS,
            {
                vaultId: this.integration.vaultId,
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    ids: [repositoryId],
                },
            },
        );

        const fullName = repository.full_name;

        const requestOptions = defaultsDeep(options, {
            initialLoad: false,
            isMention: false,
        });
        const queryParams = defaultsDeep(requestOptions.query, {
            state: 'all',
            filter: 'all',
            sort: 'created',
            direction: 'asc',
        });

        const urlSearchParams = Object.keys(queryParams).reduce(
            (acc: URLSearchParams, key: string) => {
                acc.append(key, queryParams[key]);
                return acc;
            },
            new URLSearchParams(),
        );

        const url = `/repos/${fullName}/issues?${urlSearchParams.toString()}`;
        const generator = this.getPaginatedData<
            GithubIssue | GithubPullRequest
        >(url);

        for await (const issues of generator) {
            this.saveEntities(issues, options);
            const pullRequests = issues.filter(issue => {
                return isGithubPullRequest(issue);
            }) as GithubPullRequest[];
            this.syncPulls(pullRequests, options);
        }
    }

    saveEntities(
        entities: (GithubIssue | GithubPullRequest)[],
        options?: { isMention?: boolean; initialLoad?: boolean },
    ) {
        const issuesAndPrs = entities.map(item => {
            if (isGithubIssue(item)) {
                return this.createGithubIssueData(
                    item as GithubIssue,
                    options?.isMention,
                );
            }

            return this.createGithubPullRequestData(
                item as GithubPullRequest,
                options?.isMention,
            );
        });

        this.context.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: issuesAndPrs,
                    meta: {
                        clientId: options?.initialLoad ? 'initial_load' : v4(),
                        postprocess: false,
                    },
                },
            },
        );
    }

    validateResponse(response: any) {
        if (response.status === StatusCodes.UNAUTHORIZED) {
            if (response.message === 'Bad credentials') {
                this.updateIntegrationStatus(
                    IntegrationAuthStatus.UNAUTHORIZED,
                );
            }
        }
    }

    async syncPulls(
        newPulls: GithubPullRequest[],
        options?: { isMention?: boolean; initialLoad?: boolean },
    ) {
        const updates = await Promise.all<GithubPullRequest>(
            newPulls.map(async pull => {
                const url = pull.pull_request.url;

                const response = await this.context.invoke<{
                    data: GithubPullRequest | null;
                    headers: any;
                }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
                    url: `GET ${url}`,
                    accessToken: this.integration.data.credentials,
                    baseUrl: this.integration.data.baseUrl,
                    cache: false,
                    callerContext: 'github/controller.ts/syncPulls',
                });

                this.validateResponse(response);

                if (!response.data)
                    return this.createGithubPullRequestData(pull); // will be missing some stuff

                return this.createGithubPullRequestData(response.data);
            }),
        );

        this.context.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: updates,
                    meta: {
                        clientId: options?.initialLoad ? 'initial_load' : v4(),
                        postprocess: false,
                    },
                },
            },
        );
    }

    async fetchIssue(repository: string, issueId: string) {
        const response = await this.context.invoke<{
            data: GithubIssue | null;
            headers: any;
        }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
            url: `GET /repos/${repository}/issues/${issueId}`,
            accessToken: this.integration.data.credentials,
            baseUrl: this.integration.data.baseUrl,
            callerContext: 'github/controller.ts/fetchIssue',
        });

        this.validateResponse(response);

        if (!response.data) return null;

        const issue = isGithubPullRequest(response.data)
            ? this.createGithubPullRequestData(response.data as any)
            : this.createGithubIssueData(response.data as GithubIssue);

        this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'integrationsData',
            payload: {
                vaultId: this.integration.vaultId,
                entity: issue,
                meta: {
                    clientId: v4(),
                    postprocess: false,
                },
            },
        });

        return issue;
    }

    async fetchPullRequest(repository: string, pullRequestId: string) {
        const response = await this.context.invoke<{
            data: GithubPullRequest | null;
            headers: any;
        }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
            url: `GET /repos/${repository}/pulls/${pullRequestId}`,
            accessToken: this.integration.data.credentials,
            baseUrl: this.integration.data.baseUrl,
            callerContext: 'github/controller.ts/fetchPullRequest',
        });

        this.validateResponse(response);

        if (!response.data) return null;

        const pull = this.createGithubPullRequestData(response.data);

        this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'integrationsData',
            payload: {
                vaultId: this.integration.vaultId,
                entity: pull,
                meta: {
                    clientId: v4(),
                    postprocess: false,
                },
            },
        });

        return pull;
    }

    async fetchCommitChecks(
        repository: string,
        commitId: string,
        entityId?: string,
    ) {
        const generator = this.getPaginatedData<any>(
            `/repos/${repository}/commits/${commitId}/check-runs`,
            false,
        );
        const commitChecks = await this.collectAllPaginatedData(generator);

        if (entityId) {
            this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: entityId,
                        commitChecks,
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            });
        }
        return commitChecks;
    }

    async fetchCommitStatuses(
        repository: string,
        commitId: string,
        entityId?: string,
    ) {
        const generator = this.getPaginatedData<any>(
            `/repos/${repository}/commits/${commitId}/statuses`,
            false,
        );
        const commitStatuses = await this.collectAllPaginatedData(generator);
        if (entityId) {
            this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: entityId,
                        commitStatuses,
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            });
        }

        return commitStatuses;
    }

    async fetchTimeline(
        repository: string,
        pullRequestId: string,
        entityId?: string,
        cache: boolean = false,
    ) {
        const generator = this.getPaginatedData<any>(
            `/repos/${repository}/issues/${pullRequestId}/timeline`,
            cache,
        );
        const timeline = await this.collectAllPaginatedData(generator);

        if (entityId) {
            this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: entityId,
                        timeline,
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            });
        }

        return timeline;
    }

    processRemoteChange(change: IUpdateChange) {
        const notificationWorthyProperties = [
            'requested_reviewers',
            'comments',
        ];

        if (
            Object.keys(change.mods).some(key =>
                notificationWorthyProperties.includes(key),
            )
        ) {
            this.fetchTimeline(
                getRepositoryName(change.obj),
                change.obj.number,
                change.key,
            );

            this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: {
                        id: change.key,
                        acreomMeta: {
                            ...change.obj.acreomMeta,
                            notification: true,
                        },
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
            });
        }
    }

    async postComment(repository: string, number: number, body: string) {
        const response = await this.context.invoke<{
            data: any | null;
        }>(ServiceKey.CLOUD, GithubIntegrationAction.REQUEST, {
            url: `POST /repos/${repository}/issues/${number}/comments`,
            accessToken: this.integration.data.credentials,
            baseUrl: this.integration.data.baseUrl,
            cache: false,
            body,
            callerContext: 'github/controller.ts/postComment',
        });

        this.validateResponse(response);

        return response;
    }
}
