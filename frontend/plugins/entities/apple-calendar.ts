import { Context } from '@nuxt/types';
import { v4 } from 'uuid';
import { IntegrationsActions, IntegrationType, ServiceKey } from '~/constants';
import { SafeElectronWindow } from '~/@types';
import { TrackingActionSource } from '~/@types/tracking';

export class AppleCalendarController {
    context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    getAccessStatus() {
        const safeElectronWindow = window as SafeElectronWindow;
        return safeElectronWindow.devicedriver.AppleCalendarSync.getAccessStatus();
    }

    requestAccess() {
        const safeElectronWindow = window as SafeElectronWindow;
        return safeElectronWindow.devicedriver.AppleCalendarSync.requestAccess();
    }

    getIntegration() {
        const integrations = this.context.store.getters['integration/byType'](
            IntegrationType.APPLE_CALENDAR,
        );

        if (!integrations.length) return null;

        return integrations[0];
    }

    async createIntegration(vaultId?: string) {
        if (!vaultId) {
            vaultId = this.context.$entities.vault.activeVaultId;
        }

        const calendarAccess = await this.getAccessStatus();
        const integrationObj = {
            id: v4(),
            name: 'Apple Calendar',
            type: IntegrationType.APPLE_CALENDAR,
            vaultId,
            data: {
                name: 'Apple Calendar',
                calendars: [],
                access: calendarAccess,
            },
        };

        await this.context.store.dispatch('integration/save', integrationObj);

        if (calendarAccess !== 3) {
            return;
        }

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            IntegrationsActions.MANUAL_RUN,
            {
                id: integrationObj.id,
                vaultId: integrationObj.vaultId,
            },
        );
    }

    openPermissionsModal() {
        this.context.$vfm.show({
            component: () =>
                import('@/components/modal/AppleCalendarPermissions.vue'),
        });
    }

    async updateIntegration(calendarAccess: number) {
        const integration = this.getIntegration();

        await this.context.store.dispatch('integration/save', {
            ...integration,
            data: {
                ...integration.data,
                access: calendarAccess,
            },
        });

        if (calendarAccess !== 3) return;

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            IntegrationsActions.MANUAL_RUN,
            {
                id: integration.id,
                vaultId: integration.vaultId,
            },
        );
    }
}
