import { sub } from 'date-fns';
import { v4 } from 'uuid';
import { WorkerContext } from '~/@types/app';
import { IntegrationType } from '~/constants';

export const migrateJira = async (vaultId: string, context: WorkerContext) => {
    const integrations: {
        id: string;
        type: IntegrationType;
        updatedAt: Date;
    }[] = await context.$deviceService.Integrations.list(vaultId);

    for (const integration of integrations) {
        if (integration.type !== IntegrationType.JIRA) continue;

        integration.updatedAt = sub(new Date(), { years: 1 });

        await context.$deviceService.Integrations.save(vaultId, integration, {
            clientId: v4(),
            writeToDevice: true,
            encrypt: false,
            updatedAt: false,
        });
    }
};
