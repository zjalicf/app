<template>
    <div class="notifications-settings">
        <div class="calendar-settings-modal__body__notifications">
            <NotificationDefaultCalendarSetting />
            <NotificationDefaultTasksSetting />
            <div
                v-if="integrations.length"
                class="calendar-settings-modal__body__accounts__body"
            >
                <div
                    v-for="integration in integrations"
                    :key="integration.id"
                    class="
                        calendar-settings-modal__body__accounts__body__account
                    "
                >
                    <NotificationsICSSetting
                        v-if="integration.type === IntegrationType.ICS_CALENDAR"
                        :integration="integration"
                    />
                    <NotificationsGoogleCalendarSetting
                        v-else-if="
                            integration.type === IntegrationType.GOOGLE_CALENDAR
                        "
                        :integration="integration"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NotificationsICSSetting from '~/components/modal/SettingsModal/Notifications/NotificationsICSSetting.vue';
import NotificationDefaultCalendarSetting from '~/components/modal/SettingsModal/Notifications/NotificationDefaultCalendarSetting.vue';
import NotificationDefaultTasksSetting from '~/components/modal/SettingsModal/Notifications/NotificationDefaultTasksSetting.vue';
import NotificationsGoogleCalendarSetting from '~/components/modal/SettingsModal/Notifications/NotificationsGoogleCalendarSetting.vue';
import { IntegrationType } from '~/constants';

@Component({
    name: 'NotificationSettings',
    computed: {
        IntegrationType() {
            return IntegrationType;
        },
    },
    components: {
        NotificationsGoogleCalendarSetting,
        NotificationDefaultTasksSetting,
        NotificationDefaultCalendarSetting,
        NotificationsICSSetting,
    },
})
export default class NotificationSettings extends Vue {
    get vault() {
        return this.$store.getters['vault/active'];
    }

    get integrations() {
        return this.$store.getters['integration/list'];
    }
}
</script>

<style lang="scss" scoped>
.notifications-settings {
    margin-top: 20px;
    background: var(--settings-modal-notifications-bg-color);
    border-radius: 10px;
    padding: 12px 12px 12px 16px;
}
</style>
