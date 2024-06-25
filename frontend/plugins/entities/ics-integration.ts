import { EntityController } from '~/plugins/entities/controller';
import { IcsIntegration } from '~/workers/integrations/ics';
import { WorkerContext } from '~/@types/app';
import { IntegrationsActions, IntegrationType, ServiceKey } from '~/constants';

export class IcsIntegrationController extends EntityController<any> {
    async createFromUrl(url: string, vaultId?: string) {
        const sanitizedUrl = url.trim();
        if (!vaultId) {
            vaultId = this.context.$entities.vault.active!.id;
        }

        if (!sanitizedUrl) {
            throw new Error('URL is required');
        }

        if (!vaultId) {
            throw new Error('Vault is required');
        }

        const integration = new IcsIntegration({} as WorkerContext);
        const payload = integration.createObject(vaultId, sanitizedUrl);
        const icsIntegrations = this.context.store.getters[
            'integration/byType'
        ](IntegrationType.ICS_CALENDAR);
        const exists = icsIntegrations.find((integration: any) => {
            return (
                integration.data.url === sanitizedUrl &&
                integration.vaultId === vaultId
            );
        });
        if (exists) {
            this.context.$serviceRegistry.emit(
                ServiceKey.INTEGRATIONS,
                IntegrationsActions.MANUAL_RUN,
                { vaultId, id: exists.id },
            );
            return;
        }

        await this.context.store.dispatch('integration/save', payload);

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            IntegrationsActions.MANUAL_RUN,
            { vaultId, id: payload.id },
        );
    }
}
