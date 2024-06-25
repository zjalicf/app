import { BaseIntegration, IntegrationConfig } from './base';
import { IcsIntegration } from './ics';
import { IVault } from '~/plugins/storage-service/cloud/vaults';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { JiraIntegrationProcessor } from '~/workers/integrations/jira';
import { GithubIntegrationProcessor } from '~/workers/integrations/github/processor';
import { AppleCalendarIntegration } from '~/workers/integrations/apple-calendar';
import { LinearIntegrationProcessor } from '~/workers/integrations/linear/processor';

export class IntegrationProcessor {
    private context: WorkerContext;
    private icsIntegration: IcsIntegration;
    private jiraIntegrationProcessor: JiraIntegrationProcessor;
    private githubIntegrationProcessor: GithubIntegrationProcessor;
    private appleCalendarIntegration: AppleCalendarIntegration;
    private linearIntegrationProcessor: LinearIntegrationProcessor;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
        this.icsIntegration = new IcsIntegration(ctx);
        this.appleCalendarIntegration = new AppleCalendarIntegration(ctx);
        this.jiraIntegrationProcessor = new JiraIntegrationProcessor(ctx);
        this.githubIntegrationProcessor = new GithubIntegrationProcessor(ctx);
        this.linearIntegrationProcessor = new LinearIntegrationProcessor(ctx);
        this.appleCalendarIntegration.registerWatchListener();
    }

    get JiraIntegrationProcessor() {
        return this.jiraIntegrationProcessor;
    }

    getIntegrations(vault: IVault): Promise<IntegrationConfig<any>[]> {
        return this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'integrations',
                vaultId: vault.id,
                payload: { vaultId: vault.id },
                callerContext: 'integrations/processor.ts/getIntegrations',
            },
        );
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
                callerContext: 'integrations/processor.ts/getIntegration',
            },
        );
    }

    resolve(integration: IntegrationConfig<any>): BaseIntegration<any> | null {
        switch (integration.type) {
            case this.icsIntegration.name:
                return this.icsIntegration;
            case this.githubIntegrationProcessor.name:
                return this.githubIntegrationProcessor;
            case this.jiraIntegrationProcessor.name:
                return this.jiraIntegrationProcessor;
            case this.appleCalendarIntegration.name:
                return this.appleCalendarIntegration;
            case this.linearIntegrationProcessor.name:
                return this.linearIntegrationProcessor;
            default:
                return null;
        }
    }

    async manualProcessIntegration(vaultId: string, integrationId: string) {
        const integration = await this.getIntegration(
            { id: vaultId } as IVault,
            integrationId,
        );
        const processor = this.resolve(integration);
        if (!processor) return null;
        return processor.manualExecute(integration).catch((err: Error) => {
            this.context.emit(ServiceKey.SENTRY, 'trackError', err);
            console.log(err);
            return null;
        });
    }

    async manualProcessVault(vaultId: string) {
        const vault = await this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.RETRIEVE,
            {
                table: 'vaults',
                payload: { vaultId },
                callerContext: 'integrations/processor.ts/manualProcessVault',
            },
        );
        if (!vault) return;

        const integrations = await this.getIntegrations({
            id: vaultId,
        } as IVault).catch(() => [] as IntegrationConfig<any>[]);
        await Promise.all(
            integrations.map((integration: IntegrationConfig<any>) => {
                const processor = this.resolve(integration);
                if (!processor) return null;
                return processor
                    .manualExecute(integration)
                    .catch((err: Error) => {
                        this.context.emit(ServiceKey.SENTRY, 'trackError', err);
                        console.log(err);
                        return null;
                    });
            }),
        );
    }

    async process(isInitial: boolean = false) {
        const vaults = await this.context.invoke<IVault[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.CONNECTED_VAULTS,
            {
                callerContext: 'integrations/processor.ts/process',
            },
        );

        const integrations = (
            await Promise.all(
                vaults.map((vault: IVault) =>
                    this.getIntegrations(vault).catch(
                        () => [] as IntegrationConfig<any>[],
                    ),
                ),
            )
        ).reduce((acc, integration) => [...acc, ...integration], []);

        await Promise.all(
            integrations.map((integration: IntegrationConfig<any>) => {
                const processor = this.resolve(integration);
                if (!processor) return null;
                return processor
                    .execute(integration, isInitial)
                    .catch((err: Error) => {
                        this.context.emit(ServiceKey.SENTRY, 'trackError', err);
                        console.log(err);
                        return null;
                    });
            }),
        );
    }
}
