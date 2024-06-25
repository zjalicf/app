import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext } from '~/@types/app';
import { IntegrationType } from '~/constants';
import { JiraIntegrationClient } from '~/workers/cloud/services/jira/client';
import { IntegrationConfig } from '~/workers/integrations/base';
import { base64ImageToDataUrl, serializeImage } from '~/helpers/image';

export class JiraIntegrationService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, IntegrationType.JIRA, ctx);
    }

    get APIRoot() {
        return (vaultId?: string) => {
            return `${this.apiRoot}/${vaultId}/integrations/${this.entity}`;
        };
    }

    async getRequestConfig() {
        const config: any = {};
        if (this.context.$config.platform === 'web') {
            const user = await JiraIntegrationClient.getUser(this.context);
            config.token = user?.credentials?.accessToken;
        }
        return config;
    }

    async refreshCredentials(integration: IntegrationConfig<any>) {
        const response = await JiraIntegrationClient.refreshCredentials(
            this.axiosInstance,
            integration,
        );

        return {
            data: response?.data,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async initializeIntegration(integration: IntegrationConfig<any>) {
        const credentials = JiraIntegrationClient.getCredentials(integration);
        if (!credentials) {
            return integration;
        }
        const clouds = await JiraIntegrationClient.getClouds(
            credentials.accessToken,
            this.context,
        );

        integration.data.clouds = clouds;
        integration.data.cloudUrl = clouds[0].url;
        return integration;
    }

    async getStatuses(integration: IntegrationConfig<any>, project: string) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getStatuses(project);

            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getProjects(
        integration: IntegrationConfig<any>,
        startAt: number = 0,
        maxResults: number = 100,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getProjects(startAt, maxResults);
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getMyself(integration: IntegrationConfig<any>) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getMyself();
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getPriorities(integration: IntegrationConfig<any>) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getPriorities();
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getComments(
        integration: IntegrationConfig<any>,
        issueId: string,
        startAt: string,
        maxResults: any,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getComments(issueId, {
                startAt,
                maxResults,
            });
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getIssue(integration: IntegrationConfig<any>, key: string) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getIssue(key);
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getIssues(
        integration: IntegrationConfig<any>,
        jql: string,
        startAt: string,
        maxResults: any,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getIssuesByJQL(jql, {
                startAt,
                maxResults,
            });
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getUsers(
        integration: IntegrationConfig<any>,
        project: string,
        startAt: number,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.getUsers(project, {
                startAt,
            });
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async saveIssue(
        integration: IntegrationConfig<any>,
        key: any,
        transition: any,
        update: any,
        fields: any,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );
        try {
            const response = await client.updateIssue(
                key,
                transition,
                update,
                fields,
            );
            return {
                data: response,
                status: 200,
                statusText: 'OK',
            };
        } catch (e) {
            return {
                data: [],
                status: 500,
                statusText: '',
            };
        }
    }

    async getAttachment(
        integration: IntegrationConfig<any>,
        attachmentId: string,
        thumbnail: boolean = true,
    ) {
        const config = await this.getRequestConfig();
        const client = new JiraIntegrationClient(
            this.context,
            integration,
            this.axiosInstance,
            config,
        );

        const promises: any[] = [client.getAttachmentMetadata(attachmentId)];
        if (thumbnail) {
            promises.push(client.getAttachmentPreview(attachmentId));
        } else {
            promises.push(client.getAttachment(attachmentId));
        }
        const [meta, buffer] = await Promise.all(promises);
        if (!buffer) return null;
        if (meta.mimeType?.startsWith('image')) {
            return base64ImageToDataUrl(
                serializeImage(buffer),
                meta.mimeType!.split('/').pop()!,
            );
        }
        return serializeImage(buffer);
    }
}
