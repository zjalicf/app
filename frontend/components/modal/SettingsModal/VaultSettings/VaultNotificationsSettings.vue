<template>
    <div class="vault-notifications-settings">
        <div class="vault-notifications-settings__title">Notifications</div>
        <div
            v-if="$config.os !== 'linux'"
            class="vault-notifications-settings__section"
        >
            <div class="vault-notifications-settings__section__title">
                System Notifications
            </div>
            <div class="vault-notifications-settings__section__text">
                Allow notifications in system settings
            </div>
            <button
                class="vault-notifications-settings__section__system-settings"
                @click="openSystemPreferences"
            >
                System Settings
                <ExternalLinkIcon class="icon" size="20" />
            </button>
        </div>
        <div class="vault-notifications-settings__section">
            <div class="vault-notifications-settings__section__title">
                Calendars & Tasks Notifications
            </div>
            <div class="vault-notifications-settings__section__text">
                Default notifications for calendars and tasks. Google Calendar
                notifications are based on your Google Calendar settings.
            </div>
            <NotificationSettings />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ExternalLinkIcon } from '@vue-hero-icons/solid';
import NotificationSettings from '~/components/modal/SettingsModal/Notifications/NotificationSettings.vue';
import { isElectron } from '~/helpers/is-electron';
import { SafeElectronWindow } from '~/@types';

@Component({
    name: 'VaultNotificationsSettings',
    components: { NotificationSettings, ExternalLinkIcon },
})
export default class VaultNotificationsSettings extends Vue {
    openSystemPreferences() {
        if (isElectron()) {
            (window as SafeElectronWindow).electron.openSystemPreferences(
                'notifications',
            );
        }
    }
}
</script>

<style lang="scss" scoped>
.vault-notifications-settings {
    padding: 30px;

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
        margin-bottom: 20px;
    }

    &__section {
        margin-bottom: 30px;

        &__title {
            @include font12-600;
            color: var(--settings-modal-title-color);
            margin-bottom: 4px;
        }

        &__text {
            @include font12-500;
            color: var(--settings-modal-option-description-color);
            margin-bottom: 10px;
        }

        &__system-settings {
            @include font12-600;
            color: var(--settings-modal-notifications-external-link-color);
            display: flex;
            align-items: center;
            outline: none;

            .icon {
                margin-left: 6px;
            }

            &:hover {
                color: var(
                    --settings-modal-notifications-external-link-color__hover
                );
            }
        }
    }
}
</style>
