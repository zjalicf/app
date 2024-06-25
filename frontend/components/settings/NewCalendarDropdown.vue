<template>
    <div class="new-calendar-dropdown">
        <button
            v-if="vault.type === 'remote' && !$accessControl.readOnlyAccess"
            @click="handleAddAccount"
        >
            Add Google Calendar
        </button>
        <button ref="button" @click="handleAddCalendarFromURL">
            Add Calendar from URL
        </button>
        <button
            v-if="$config.os === 'mac' && !hasAppleCalendar"
            ref="appleCalendarButton"
            @click="handleAddAppleCalendar"
        >
            Add Apple Calendar
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { isElectron } from '~/helpers/is-electron';
import { IVault } from '~/workers/database/indexeddb/types';
import {
    CloudServiceAction,
    IntegrationsActions,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import { SafeElectronWindow } from '~/@types';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'NewCalendarDropdown',
})
export default class NewCalendarDropdown extends Vue {
    $refs!: {
        button: HTMLElement;
    };

    @Prop()
    vault!: IVault;

    get appIsElectron() {
        return isElectron();
    }

    get hasAppleCalendar() {
        return (
            this.$store.getters['integration/byType']('apple_calendar')
                ?.length > 0
        );
    }

    handleAddCalendarFromURL() {
        this.$emit('close');

        this.$vfm.show({
            component: () =>
                import('@/components/modal/CalendarFromURLModal.vue'),
            bind: {
                vault: this.vault,
            },
        });
    }

    async handleAddAppleCalendar() {
        this.$emit('close');
        await this.$entities.appleCalendar.createIntegration(this.vault.id);
        let calendarAccess =
            await this.$entities.appleCalendar.getAccessStatus();
        if (calendarAccess === 3) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.ADD_CALENDAR,
                sourceMeta: TrackingActionSourceMeta.APPLE_CALENDAR,
            });
            return;
        }
        const granted = this.$entities.appleCalendar.requestAccess();
        if (!granted) {
            this.$entities.appleCalendar.openPermissionsModal();
            return;
        }

        calendarAccess = await this.$entities.appleCalendar.getAccessStatus();
        if (calendarAccess === 3) {
            await this.$entities.appleCalendar.updateIntegration(
                calendarAccess,
            );
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.ADD_CALENDAR,
                sourceMeta: TrackingActionSourceMeta.APPLE_CALENDAR,
            });
        }
    }

    async getCredentials() {
        const user = this.$store.getters['user/user'];
        const credentials = this.$store.getters['user/credentials'];

        if (
            new Date(credentials.expiresAt).getTime() >
            Date.now() - 5 * 1_000
        ) {
            return credentials;
        }
        const refreshedCredentials = await this.$serviceRegistry.invoke(
            ServiceKey.CLOUD,
            CloudServiceAction.REFRESH_CREDENTIALS,
            {
                userId: user.id,
                credentials,
                callerContext: 'NewCalendarDropdown.vue getCredentials',
            },
        );

        return refreshedCredentials;
    }

    async handleAddAccount(ev: Event) {
        const credentials = await this.getCredentials();
        this.$emit('close');
        if (this.$config.platform === 'web') {
            window.location.href = `${this.$config.baseUrl}/api/v1/${this.vault.id}/integrations/google_calendar/authorize?token=${credentials.accessToken}&version=1`;
            return;
        }

        const url = `${this.$config.baseUrl}/api/v1/${this.vault.id}/integrations/google_calendar/authorize?token=${credentials.accessToken}&strategy=device&version=1`;

        if (this.$utils.isMobile) {
            try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({
                    url,
                });
            } catch (error) {
                console.log(error);
            }

            return;
        }

        ev.preventDefault();
        this.$utils.navigation.openExternalLink(url);
    }
}
</script>

<style lang="scss" scoped>
.new-calendar-dropdown {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
