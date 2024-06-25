import { Context } from '@nuxt/types';

export class OnboardingUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    setNewVaultName(name: string) {
        this.context.store.dispatch('onboarding/update', {
            name,
        });
    }

    setNewVaultColor(color: string) {
        this.context.store.dispatch('onboarding/update', {
            color,
        });
    }

    setNewVaultPath(filepath: string) {
        this.context.store.dispatch('onboarding/update', {
            filepath,
        });
    }

    setNewVaultOpenExisting(openExisting: boolean) {
        this.context.store.dispatch('onboarding/update', {
            openExisting,
        });
    }

    setNewVaultType(type: 'remote' | 'local') {
        this.context.store.dispatch('onboarding/update', {
            type,
        });
    }

    setNewVaultICSUrl(ICSUrl: string) {
        this.context.store.dispatch('onboarding/update', {
            ICSUrl,
        });
    }

    async clearNewVault() {
        this.context.store.dispatch('onboarding/clear');
    }

    setAppleCalendarAccess(access: number) {
        this.context.store.dispatch('onboarding/update', {
            appleCalendarAccess: access,
        });
    }
}
