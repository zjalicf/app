// @ts-ignore
import { Issue } from 'jira.js/out/version3/models';
import { StatusCodes } from 'http-status-codes';
import {
    BaseIntegration,
    IntegrationAuthStatus,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { WorkerContext, CloudResponse } from '~/@types/app';
import {
    JiraIntegration,
    JiraIntegrationConfig,
    JiraIntegrationProject,
} from '~/workers/integrations/jira/controller';
import { AcreomJiraIssue } from '~/components/task/model';
import {
    CloudServiceAction,
    DatabaseServiceAction,
    IntegrationType,
    JiraIntegrationAction,
    ServiceKey,
} from '~/constants';
import { JiraIntegrationClient } from '~/workers/cloud/services/jira/client';
import { EncryptionWorkerActions } from '~/workers/encryption/constants';

export class JiraIntegrationProcessor extends BaseIntegration<JiraIntegrationConfig> {
    private context: WorkerContext;
    runInterval = 3 * 60 * 1000;
    name = IntegrationType.JIRA;

    constructor(ctx: WorkerContext) {
        super();
        this.context = ctx;
    }

    async getIssue(
        integrationObj: IntegrationConfig<JiraIntegrationConfig>,
        project: any,
        issueId: string,
        options: {
            fetchUsers: boolean;
            fetchStatuses: boolean;
        },
    ) {
        const jiraIntegration = await this.createJiraIntegration(
            integrationObj,
        );

        if (!jiraIntegration) {
            return;
        }

        const promises = [];
        if (options.fetchUsers) {
            promises.push(jiraIntegration.getUsers(project));
        }
        if (options.fetchStatuses) {
            promises.push(jiraIntegration.getStatuses(project));
        }
        const [users, statuses] = await Promise.all(promises);
        const issue = await jiraIntegration.getIssue(project, issueId, options);
        if (!issue) return null;
        const dataToSave = [issue];
        if (users?.length) {
            dataToSave.push(...users);
        }
        if (statuses?.length) {
            dataToSave.push(...statuses);
        }
        if ((issue as any).properties.subtasks?.length) {
            const issues: any[] = await Promise.all(
                (issue as any).properties.subtasks.map((issue: Issue) => {
                    return jiraIntegration.getIssue(project, issue.key, {
                        fetchUsers: false,
                        fetchStatuses: false,
                    });
                }),
            ).catch(e => {
                console.log(e);
                return [];
            });
            dataToSave.push(...(issues.filter(issue => !!issue) as any));
        }
        await jiraIntegration.saveIntegrationData(dataToSave);
        return issue;
    }

    async saveTask(
        integration: IntegrationConfig<JiraIntegrationConfig>,
        task: AcreomJiraIssue,
        mods: AcreomJiraIssue,
        oldEntity: AcreomJiraIssue,
    ) {
        const jiraIntegration = new JiraIntegration(this.context, integration);
        await jiraIntegration.updateIssue(
            {
                ...task.properties,
                key: task.key,
            },
            mods.properties,
            oldEntity.properties! as any,
        );
    }

    shouldRun(integration: IntegrationConfig<JiraIntegrationConfig>): boolean {
        const now = Date.now();
        const lastRun = integration.lastRunTimestamp ?? 0;
        const diff = now - lastRun;
        return diff >= this.runInterval;
    }

    handleWatch(
        integration: IntegrationConfig<JiraIntegrationConfig>,
        issue: Issue,
    ) {
        // return this.executeOnWebhoook(integration, []);
        // const jiraIntegration = new JiraIntegration(this.context, integration);
        // return jiraIntegration.processIncomingIssue(issue as any);
    }

    getCredentials(integration: IntegrationConfig<any>) {
        const credentials = integration.data.credentials;
        return {
            accessToken: credentials.accessToken ?? credentials.access_token,
            refreshToken: credentials.refreshToken ?? credentials.refresh_token,
            expiryDate: credentials.expiryDate ?? credentials.expiry_date,
        };
    }

    async getLastSyncedIntegration(
        integration: IntegrationConfig<JiraIntegrationConfig>,
    ) {
        const beResponse = await this.context.invoke<CloudResponse<any>>(
            ServiceKey.CLOUD,
            CloudServiceAction.RETRIEVE,
            {
                entity: 'integrations',
                payload: {
                    id: integration.id,
                    vaultId: integration.vaultId,
                },
                callerContext: 'jira/processor.ts/getLastSyncedIntegration',
            },
        );

        if (beResponse.status !== StatusCodes.OK || !beResponse?.data) {
            return null;
        }

        const [lastSyncedIntegration] = await this.context.invoke<any[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DECRYPT_INTEGRATION,
            {
                payload: {
                    data: beResponse.data,
                },
                callerContext: 'jira/processor.ts/getLastSyncedIntegration',
            },
        );
        if (!lastSyncedIntegration) return null;
        return lastSyncedIntegration;
    }

    shouldRefresh(integration: IntegrationConfig<JiraIntegrationConfig>) {
        const credentials = JiraIntegrationClient.getCredentials(integration);
        const expireDate = new Date(Number(credentials!.expiryDate));
        const date = Date.now();
        return expireDate.getTime() - 5 * 60 * 1000 < date;
    }

    resolveUpToDateIntegration(
        localIntegration: IntegrationConfig<JiraIntegrationConfig>,
        remoteIntegration: IntegrationConfig<JiraIntegrationConfig>,
    ): IntegrationConfig<JiraIntegrationConfig> | null {
        const localCredentials =
            JiraIntegrationClient.getCredentials(localIntegration);
        const remoteCredentials =
            JiraIntegrationClient.getCredentials(remoteIntegration);
        if (!localCredentials?.expiryDate && !remoteCredentials?.expiryDate) {
            return null;
        }
        if (!localCredentials?.expiryDate) {
            return remoteIntegration;
        }
        if (!remoteCredentials?.expiryDate) {
            return localIntegration;
        }
        if (localCredentials?.expiryDate > remoteCredentials?.expiryDate) {
            return localIntegration;
        }
        return remoteIntegration;
    }

    setUnauthorized(integration: IntegrationConfig<JiraIntegrationConfig>) {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                vaultId: integration.vaultId,
                payload: {
                    table: 'integrations',
                    vaultId: integration.vaultId,
                    entity: {
                        ...integration,
                        authStatus: IntegrationAuthStatus.UNAUTHORIZED,
                    },
                    meta: {
                        clientId: '*',
                    },
                },
                callerContext: 'jira/processor.ts/setUnauthorized',
            },
        );
    }

    saveCredentials(
        integration: IntegrationConfig<JiraIntegrationConfig>,
        credentials: JiraIntegrationConfig['credentials'],
    ) {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                vaultId: integration.vaultId,
                payload: {
                    table: 'integrations',
                    vaultId: integration.vaultId,
                    entity: {
                        ...integration,
                        data: {
                            ...integration.data,
                            credentials,
                        },
                    },
                    meta: {
                        clientId: '*',
                        encrypt: true,
                    },
                },
                callerContext: 'jira/processor.ts/saveCredentials',
            },
        );
    }

    async refreshCredentials(
        integration: IntegrationConfig<JiraIntegrationConfig>,
    ) {
        const lastSyncedIntegration = await this.getLastSyncedIntegration(
            integration,
        );

        const mostUpToDateIntegration = this.resolveUpToDateIntegration(
            integration,
            lastSyncedIntegration,
        );

        if (!mostUpToDateIntegration) {
            await this.setUnauthorized(integration);
            return null;
        }

        await this.saveCredentials(
            integration,
            mostUpToDateIntegration.data.credentials,
        );

        if (!this.shouldRefresh(mostUpToDateIntegration)) {
            return mostUpToDateIntegration;
        }

        const refreshDate = Date.now();
        const response = await this.context.invoke<CloudResponse<any>>(
            ServiceKey.CLOUD,
            JiraIntegrationAction.REFRESH_CREDENTIALS,
            {
                integration: mostUpToDateIntegration,
                callerContext: 'jira/processor.ts/refreshCredentials',
            },
        );

        if (response?.status === StatusCodes.FORBIDDEN) {
            await this.setUnauthorized(integration);
            return null;
        }

        if (response?.status > 300) {
            return null;
        }

        if (!response?.data) {
            return null;
        }

        integration.data.credentials = {
            accessToken: response.data?.access_token,
            refreshToken: response.data?.refresh_token,
            expiryDate: refreshDate + response.data?.expires_in * 1000,
        };
        await this.saveCredentials(integration, integration.data.credentials);
        return integration;
    }

    async initialize(
        integrationObj: IntegrationConfig<JiraIntegrationConfig>,
    ): Promise<void> {
        const jiraIntegration = await this.createJiraIntegration(
            integrationObj,
        );

        if (!jiraIntegration) {
            return;
        }

        const [myself, projects, priorities] = await Promise.all([
            jiraIntegration.getMyself(),
            jiraIntegration.getProjects(),
            jiraIntegration.getPriorities(),
        ]);
        await jiraIntegration.saveIntegrationData([
            myself,
            ...projects,
            ...priorities,
        ]);

        const enabledProjects = projects.filter(project => project.syncEnabled);
        if (!enabledProjects.length) {
            return;
        }

        await this._execute(jiraIntegration.integration, enabledProjects, true);
    }

    execute(
        config: IntegrationConfig<JiraIntegrationConfig>,
        isInitial: boolean = false,
    ): Promise<void> {
        if (!this.shouldRun(config)) {
            return Promise.resolve();
        }
        if (isInitial) {
            return this._execute(config);
        }
        return this.fetchIssues(config);
    }

    manualExecute(
        config: IntegrationConfig<JiraIntegrationConfig>,
    ): Promise<void> {
        return this._execute(config);
    }

    async fetchIssues(
        integrationObj: IntegrationConfig<JiraIntegrationConfig>,
    ): Promise<void> {
        const jiraIntegration = await this.createJiraIntegration(
            integrationObj,
        );

        if (!jiraIntegration) {
            return;
        }

        const enabledProjects = jiraIntegration.enabledProjects;
        return jiraIntegration.retrieveIssues(enabledProjects, false);
    }

    async getIntegration(vaultId: string, id: string) {
        return await this.context.invoke<
            IntegrationConfig<JiraIntegrationConfig>
        >(ServiceKey.DATABASE, DatabaseServiceAction.RETRIEVE, {
            table: 'integrations',
            vaultId,
            id,
            payload: {
                vaultId,
                id,
            },
            callerContext: 'jira/processor.ts/getIntegration',
        });
    }

    async _execute(
        integrationObj: IntegrationConfig<JiraIntegrationConfig>,
        projects?: JiraIntegrationProject[],
        initialRun?: boolean,
    ): Promise<void> {
        const jiraIntegration = await this.createJiraIntegration(
            integrationObj,
        );

        if (!jiraIntegration) {
            return;
        }

        const initial = initialRun ?? !jiraIntegration.lastRunTimestamp;

        const enabledProjects = projects?.length
            ? projects
            : jiraIntegration.enabledProjects;

        if (!initial) {
            const [myself, allProjects, priorities] = await Promise.all([
                jiraIntegration.getMyself(),
                jiraIntegration.getProjects(),
                jiraIntegration.getPriorities(),
            ]);
            await jiraIntegration.saveIntegrationData([
                myself,
                ...allProjects,
                ...priorities,
            ]);
        }

        await Promise.all([
            ...enabledProjects.map(async project => {
                const statuses = await jiraIntegration.getStatuses(project);
                await jiraIntegration.saveIntegrationData(statuses);
            }),
            jiraIntegration.retrieveIssues(enabledProjects, initial),
            jiraIntegration.getUsersPerProject(enabledProjects),
        ]);
    }

    private async createJiraIntegration(
        integrationObj: IntegrationConfig<JiraIntegrationConfig>,
    ) {
        const isVaultConnected = await this.isVaultConnected(
            integrationObj.vaultId,
        );
        if (!isVaultConnected) return null;

        const integration = await this.getIntegration(
            integrationObj.vaultId,
            integrationObj.id,
        );

        if (!integration) return null;

        const credentials = JiraIntegrationClient.getCredentials(integration);
        if (!credentials) {
            return null;
        }
        const refreshedIntegration = await this.refreshCredentials(integration);
        if (!refreshedIntegration) return null;

        integration.data.credentials = refreshedIntegration.data.credentials;

        return new JiraIntegration(this.context, integration);
    }

    private isVaultConnected(vaultId: string) {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.IS_VAULT_CONNECTED,
            {
                vaultId,
                payload: {
                    vaultId,
                },
                callerContext: 'jira/processor.ts/isVaultConnected',
            },
        );
    }
}
