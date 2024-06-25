import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RequestConfig, Version3Client } from 'jira.js';
import { Priority, Issue, User, Project } from 'jira.js/out/version3/models';
import { StatusCodes } from 'http-status-codes';
import { IssuesAPI } from './issues';
import {
    IntegrationAuthStatus,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { IUser } from '~/workers/database/indexeddb/types';
import { JiraIntegrationConfig } from '~/workers/integrations/jira/controller';

export type JiraSearchOptions = {
    expand: string[];
    maxResults: number;
    fields: string[];
    startAt: number;
    fieldsByKeys: boolean;
};

export class JiraIntegrationClient {
    private client!: Version3Client;
    private context!: WorkerContext;
    private integration: IntegrationConfig<Record<string, any>>;
    private issueOptions = {
        fields: [
            'summary',
            'description',
            'status',
            'issuetype',
            'created',
            'priority',
            'labels',
            'project',
            'assignee',
            'updated',
            'issuelinks',
            'subtasks',
            'progress',
            'attachment',
            'reporter',
            'parent',
            'watches',
            'customfield_10020',
            'timetracking',
        ],
        expand: ['renderedFields', 'changelog', 'transitions'],
    };

    constructor(
        context: WorkerContext,
        integration: IntegrationConfig<Record<string, any>>,
        axios: AxiosInstance,
        config: any = {},
    ) {
        this.context = context;
        this.integration = integration;
        this.client = this.createClient(axios, config);
    }

    updateAuthStatus(authStatus: IntegrationAuthStatus) {
        this.integration = {
            ...this.integration,
            authStatus,
        };

        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: this.integration,
                    meta: {
                        clientId: '*',
                        postprocess: false,
                    },
                },
                callerContext: 'jira/client.ts/updateAuthStatus',
            },
        );
    }

    static getCredentials(integration: IntegrationConfig<any>) {
        if (!integration?.data) return null;
        const credentials = integration.data.credentials;
        return {
            accessToken: credentials.accessToken ?? credentials.access_token,
            refreshToken: credentials.refreshToken ?? credentials.refresh_token,
            expiryDate: credentials.expiryDate ?? credentials.expiry_date,
        };
    }

    static async getUser(context: WorkerContext) {
        const users = await context.invoke<IUser[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'users',
                payload: {},
                callerContext: 'jira/client.ts/getUser',
            },
        );
        const user = users?.pop?.();
        if (!user) return null;
        return user;
    }

    static async getClouds(
        token: string,
        context: WorkerContext,
    ): Promise<any[]> {
        let url = 'https://api.atlassian.com/oauth/token/accessible-resources';
        const config = {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            } as any,
        };
        if (context.$config.platform === 'web') {
            const user = await JiraIntegrationClient.getUser(context);
            url = `${context.$config.baseUrl}/proxy/jira/oauth/token/accessible-resources`;
            config.headers['x-jira-token'] = token;
            config.headers.Authorization = `Bearer ${user?.credentials?.accessToken}`;
        }
        const response = await axios.get(url, config);
        return response.data;
    }

    get cloudId() {
        return this.integration.data.clouds[0].id;
    }

    get baseUrl() {
        if (this.context.$config.platform === 'web') {
            return `${this.context.$config.baseUrl}/proxy/jira/ex/jira/${this.cloudId}`;
        }
        return `https://api.atlassian.com/ex/jira/${this.cloudId}`;
    }

    public getAvatar(type: string, id: number, size: string) {
        const url =
            this.baseUrl +
            `/rest/api/3/universal_avatar/view/type/${type}/avatar/${id}`;

        return axios.get(url, {
            params: {
                size,
            },
            headers: {
                Authorization: `Bearer ${
                    this.integration.data!.credentials!.access_token
                }`,
            },
            responseType: 'arraybuffer',
        });
    }

    public async getIssue(key: string): Promise<Issue> {
        const issue = await this.client.issues.getIssue({
            issueIdOrKey: key,
            ...this.issueOptions,
        });
        return issue;
    }

    public async getIssuesByJQL(jql: string, status: any): Promise<Issue[]> {
        status = {
            maxResults: 50,
            ...status,
        };
        const issues = await this.searchIssues(jql, {
            ...this.issueOptions,
            startAt: status.startAt,
            maxResults: status.maxResults,
        });
        return issues;
    }

    public async getUsers(
        project: string,
        state?: {
            startAt: number;
        },
    ) {
        const response = await this.client.userSearch
            .findBulkAssignableUsers({
                projectKeys: project,
                query: '',
                maxResults: 1000,
                startAt: state?.startAt ?? 0,
            })
            .catch(e => console.log(e));
        return response;
    }

    async updateIssue(
        key: string,
        transition: any,
        update: any,
        fields: any,
    ): Promise<Issue | null> {
        if (!update && !fields && !transition) return null;
        if (!update && !fields) {
            await this.client.issues.doTransition({
                issueIdOrKey: key,
                transition,
            });
            const issue = await this.client.issues.getIssue({
                issueIdOrKey: key,
                ...this.issueOptions,
            });
            return issue;
        }

        const issueClient = this.client.issues as IssuesAPI;
        const response = await issueClient.editIssue<Issue>({
            issueIdOrKey: key,
            transition: transition ?? undefined,
            update: update ?? undefined,
            fields: fields ?? undefined,
            returnIssue: true,
            expand: this.issueOptions.expand.join(','),
        });

        if (!response) return null;
        return response;
    }

    async getComments(issueId: string, state: any) {
        const response = await this.client.issueComments
            .getComments({
                issueIdOrKey: issueId,
                startAt: state.startAt,
                maxResults: state.maxResults,
                expand: 'renderedBody',
            })
            .catch(e => console.log(e));
        return response;
    }

    getAttachmentMetadata(attachmentId: string) {
        return this.client.issueAttachments.getAttachment({
            id: attachmentId,
        });
    }

    getAttachment(attachmentId: string) {
        return this.client.issueAttachments.getAttachmentContent({
            id: attachmentId,
            redirect: false,
        });
    }

    getAttachmentPreview(attachmentId: string) {
        return this.client.issueAttachments.getAttachmentThumbnail({
            id: attachmentId,
            redirect: false,
            width: 1000,
            height: 700,
        });
    }

    static refreshCredentials(
        axios: AxiosInstance,
        integration: IntegrationConfig<any>,
    ) {
        const credentials = JiraIntegrationClient.getCredentials(integration);
        if (!credentials?.refreshToken) return;

        return axios
            .post(`/api/v1/${integration.vaultId}/integrations/jira/token`, {
                token: credentials.refreshToken,
            })
            .catch(e => {
                return {
                    data: e?.response?.data,
                    status: e?.response?.status,
                    statusText: e?.response?.statusText,
                };
            });
    }

    private createClient(axios: AxiosInstance, config: any = {}) {
        const credentials = JiraIntegrationClient.getCredentials(
            this.integration,
        );

        if (!credentials) throw new Error('No credentials found');

        const accessToken = credentials.accessToken;
        const baseRequestConfig = {
            headers: {},
            validateStatus: status => {
                if (status === StatusCodes.FORBIDDEN) {
                    this.updateAuthStatus(IntegrationAuthStatus.UNAUTHORIZED);
                }

                return true; // Resolve only if the status code is less than 500
            },
        } as AxiosRequestConfig;
        if (config.token) {
            baseRequestConfig.headers['x-jira-token'] = accessToken;
        }
        const client = new Version3Client({
            host: this.baseUrl,
            authentication: {
                oauth2: {
                    accessToken: config.token ?? accessToken,
                },
            },
            // @ts-ignore
            newErrorHandling: true,
            baseRequestConfig: baseRequestConfig as any,
        });

        client.issues = new IssuesAPI(client);
        return client;
    }

    public async getStatuses(project: string): Promise<any> {
        const data = await this.client.projects.getAllStatuses({
            projectIdOrKey: project,
        });
        const statusIds = new Set<string>();
        const resultStatuses: Record<string, any>[] = [];

        for (const issueType of data) {
            const { statuses } = issueType;
            for (const status of statuses) {
                if (statusIds.has(status.id!)) continue;
                statusIds.add(status.id!);
                resultStatuses.push({
                    ...status,
                    statusCategory: this.resolveStatusCategory(
                        status!.statusCategory!.name!,
                    ) as any,
                });
            }
        }
        return { values: resultStatuses };
    }

    public async getPriorities(): Promise<Priority[]> {
        const priorities = await this.client.issuePriorities.getPriorities();
        return [...priorities.values()] ?? [];
    }

    public getMyself(): Promise<User> {
        return this.client.myself.getCurrentUser();
    }

    public getProjects(
        startAt: number = 0,
        maxResults: number = 100,
    ): Promise<Project[]> {
        return this.client.projects
            .searchProjects({
                startAt,
                maxResults,
            })
            .then(response => response.values);
    }

    private searchIssues(
        jql: string,
        options: Partial<JiraSearchOptions> = {},
    ): Promise<any> {
        const requestConfig: RequestConfig = {
            url: '/rest/api/3/search',
            method: 'POST',
            data: {
                ...options,
                jql,
            },
        };
        return this.client
            .sendRequest<any>(requestConfig, undefined as never)
            .catch(e => {
                console.log(e);
            });
    }

    private resolveStatusCategory(statusCategory: string) {
        return {
            'To Do': 'TODO',
            'In Progress': 'IN_PROGRESS',
            Done: 'DONE',
        }[statusCategory];
    }
}
