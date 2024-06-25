<template>
    <IntegrationButton>
        <button
            v-if="$config.os === 'mac'"
            :disabled="hasAppleCalendar"
            :class="{ connected: hasAppleCalendar }"
            class="integration-button__button"
            @click="handleAddAppleCalendar"
        >
            <div
                class="integration-button__button__icon"
                :style="{ color: 'white' }"
            >
                <AppleIcon class="icon" size="20" />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">
                    Apple Calendar
                </div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasAppleCalendar
                            ? 'Connected'
                            : 'See events from Apple Calendar in acreom.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasAppleCalendar"
                    size="14"
                    class="icon"
                />
            </div>
        </button>
    </IntegrationButton>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import IntegrationButton from '~/components/onboarding/IntegrationButton.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import AppleIcon from '~/components/icons/AppleIcon.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    components: {
        InterfaceValidationCheckCircle,
        AppleIcon,
        InterfaceCalendar,
        IntegrationButton,
    },
})
export default class AppleCalOnboarding extends Vue {
    get integrations() {
        return this.$store.getters['integration/list'];
    }

    get vault() {
        return this.$store.getters['vault/active'];
    }

    get hasAppleCalendar() {
        return (
            this.$store.getters['onboarding/config'].appleCalendarAccess !==
            null
        );
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SELECT_INTEGRATION,
        source: TrackingActionSource.APPLE_CALENDAR,
    })
    async handleAddAppleCalendar() {
        const calendarAccess =
            await this.$entities.appleCalendar.getAccessStatus();

        this.$utils.onboarding.setAppleCalendarAccess(calendarAccess);

        if (calendarAccess === 3) {
            this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
                action: TrackingAction.SAVE_INTEGRATION,
                source: TrackingActionSource.APPLE_CALENDAR,
            });
            return;
        }

        const granted = await this.$entities.appleCalendar.requestAccess();

        if (granted) {
            const calendarAccess =
                await this.$entities.appleCalendar.getAccessStatus();

            if (calendarAccess === 3) {
                this.$utils.onboarding.setAppleCalendarAccess(calendarAccess);
                this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
                    action: TrackingAction.SAVE_INTEGRATION,
                    source: TrackingActionSource.APPLE_CALENDAR,
                });
                return;
            }
        }

        this.$entities.appleCalendar.openPermissionsModal();
        this.$emit('close');
    }
}
</script>
