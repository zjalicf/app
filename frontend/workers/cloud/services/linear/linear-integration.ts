import { AxiosInstance } from 'axios';
import { IssueUpdateInput } from '@linear/sdk/dist/_generated_documents';
import { ServiceBase } from '~/workers/cloud/services/base';
import { WorkerContext } from '~/@types/app';
import {
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import { IUser } from '~/workers/database/indexeddb/types';
import { LinearIntegrationClient } from '~/workers/cloud/services/linear/client';
import { LinearIntegrationConfig } from '~/@types/integrations';
import { IntegrationConfig } from '~/workers/integrations/base';

export class LinearIntegrationService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, IntegrationType.JIRA, ctx);
    }

    get APIRoot() {
        return (vaultId?: string) => {
            return `${this.apiRoot}/${vaultId}/integrations/${this.entity}`;
        };
    }

    async createRequestConfig(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        if (this.context.$config.platform === 'web') {
            const user = await this.getUser();
            return LinearIntegrationClient.createRequestConfig(
                integration,
                user!,
            );
        }
        return LinearIntegrationClient.createRequestConfig(integration);
    }

    async getUser() {
        const users = await this.context.invoke<IUser[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'users',
                payload: {},
            },
        );
        const user = users?.pop?.();
        if (!user) return null;
        return user;
    }

    async getMyself(integration: IntegrationConfig<LinearIntegrationConfig>) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        const myself = await client.getMyself();
        return {
            id: myself.id,
            name: myself.name,
            avatarUrl: myself.avatarUrl,
            displayName: myself.displayName,
            email: myself.email,
        };
    }

    async getOrganization(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        const organization = await client.getOrganization();
        return {
            id: organization.id,
            name: organization.name,
            logoUrl: organization.logoUrl,
            gitBranchFormat: organization.gitBranchFormat,
        };
    }

    async getTeams(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        first: number,
        after: string,
        filter: any,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getTeams(first, after, filter);
    }

    async getPriorities(
        integration: IntegrationConfig<LinearIntegrationConfig>,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getPriorities();
    }

    async getCycles(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        first: number,
        after: string,
        filter: any,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getCycles(first, after, filter);
    }

    async getProjects(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: string,
        filter: any,
        first: number,
        after: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getProjects(first, after, teamId, filter);
    }

    async getStates(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filter: any,
        first: number,
        after: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getStates(first, after, filter);
    }

    async getLabels(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filter: any,
        first: number,
        after: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getLabels(first, after, filter);
    }

    async getUsers(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        teamId: any,
        filter: any,
        first: number,
        after: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getUsers(first, after, teamId, filter);
    }

    async getIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string | undefined,
        identifier: string | undefined,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        if (identifier) {
            return client.getIssueByIdentifier(identifier);
        }
        return client.getIssue(issueId!);
    }

    async getIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        filter: Record<string, any>,
        first: number,
        after: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getIssues(first, after, filter);
    }

    async searchIssues(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        query: string,
        filter: Record<string, any>,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.searchIssues(query, filter);
    }

    async getCommentsAndHistory(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.getCommentsAndHistory(issueId);
    }

    async updateIssue(
        integration: IntegrationConfig<LinearIntegrationConfig>,
        issueId: string,
        issue: IssueUpdateInput,
    ) {
        const config = await this.createRequestConfig(integration);
        const client = new LinearIntegrationClient(this.context, config);
        return client.updateIssue(issueId, issue);
    }
}
