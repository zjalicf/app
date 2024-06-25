import { v4 } from 'uuid';
import { EntityController } from '~/plugins/entities/controller';
import { IntegrationConfig } from '~/workers/integrations/base';
import { AssistantActions, IntegrationType, ServiceKey } from '~/constants';
import { SafeElectronWindow } from '~/@types';

export type AssistantIntegrationData = {
    apiKey?: string;
    type: 'custom' | 'default' | 'local';
    ready?: boolean;
    isActive: boolean;
};
export type AssistantIntegration = IntegrationConfig<AssistantIntegrationData>;

export class AssistantController extends EntityController<AssistantIntegration> {
    protected storeEntity: string = 'integration';
    protected dbTable: string = 'integrations';

    get activeIntegration() {
        const existingIntegrations = this.list();
        return existingIntegrations.find((i: any) => i.data.isActive);
    }

    list(): any {
        return this.context.store.getters['integration/byType'](
            IntegrationType.AI_ASSISTANT,
        );
    }

    retrieve(id: string): any {
        return this.context.store.getters['integration/byId'](id);
    }

    delete(integration: AssistantIntegration) {
        return this.context.store.dispatch('integration/delete', integration);
    }

    async saveToStore(entity: Partial<AssistantIntegration>): Promise<any> {
        await this.context.store.dispatch('integration/save', entity);
        const storedEntity = this.retrieve(entity.id!);
        if (storedEntity.data?.isActive) {
            this.updateWorkerConfig(storedEntity);
        }
    }

    async checkModelState() {
        const modelState = await this.retrieveModelState();
        if (modelState?.fetchStatus === 'in-progress') {
            this.fetchModel();
        }
        if (modelState?.state === 'ready') {
        }
    }

    retrieveModelState(): Promise<{
        fetchStatus: string;
        state: string;
    }> {
        return this.context.$serviceRegistry.invoke<any>(
            ServiceKey.DEVICE,
            'assistantAssetsManager:getModelState',
            {
                callerContext: 'entities/assistant.ts retrieveModelState',
            },
        );
    }

    fetchModel() {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DEVICE,
            'assistantAssetsManager:fetchModel',
            { callerContext: 'entities/assistant.ts fetchModel' },
        );
    }

    deleteModel() {
        return this.context.$serviceRegistry.invoke(
            ServiceKey.DEVICE,
            'assistantAssetsManager:cancelFetchModel',
            { callerContext: 'entities/assistant.ts deleteModel' },
        );
    }

    registerModelFetchProgress(listener: (progress: any) => void) {
        const electron = (window as SafeElectronWindow).electron;
        electron.on('fetch-model-progress', (progress: any) => {
            listener(progress);
        });
    }

    registerModelFetchEnd(listener: () => void) {
        const electron = (window as SafeElectronWindow).electron;
        electron.on('fetch-model-end', () => {
            listener();
            this.removeFetchListeners();
        });
    }

    removeFetchListeners() {
        const electron = (window as SafeElectronWindow).electron;
        electron.off('fetch-model-progress');
        electron.off('fetch-model-end');
    }

    createIntegration(data: AssistantIntegrationData): AssistantIntegration {
        return {
            id: v4(),
            vaultId: this.activeVaultId,
            type: IntegrationType.AI_ASSISTANT,
            data,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as AssistantIntegration;
    }

    async updateIntegration(data: AssistantIntegrationData) {
        const integration = this.activeIntegration;
        if (!integration) return;
        await this.saveToStore({
            ...integration,
            updatedAt: new Date(),
            data,
        });
    }

    getToolContext(callId: string): Promise<string[] | null> {
        return this.context.$serviceRegistry.invoke<string[]>(
            ServiceKey.ASSISTANT,
            AssistantActions.GET_TOOL_CONTEXT,
            {
                callId,
                callerContext: 'entities/assistant.ts getToolContext',
            },
        );
    }

    updateWorkerConfig(integration: AssistantIntegration) {
        this.context.$serviceRegistry.emit(
            ServiceKey.ASSISTANT,
            AssistantActions.SET_CONFIG,
            integration,
        );
    }
}
