<template>
    <IntegrationButton>
        <button
            :disabled="hasIcs"
            :class="{ connected: hasIcs }"
            class="integration-button__button"
            @click="onAddFromUrlHandler"
        >
            <div
                class="integration-button__button__icon"
                :style="{ 'margin-right': '26px' }"
            >
                <InterfaceCalendar class="icon" size="14" />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">
                    Calendar from URL
                </div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasIcs
                            ? 'Connected'
                            : 'Connect read only .ics from the web.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasIcs"
                    size="14"
                    class="icon"
                />
            </div>
        </button>
    </IntegrationButton>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IntegrationType } from '~/constants';
import IntegrationButton from '~/components/onboarding/IntegrationButton.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'ICSOnboarding',
    components: {
        InterfaceValidationCheckCircle,
        InterfaceCalendar,
        IntegrationButton,
    },
})
export default class ICSOnboarding extends Vue {
    get integrations() {
        return this.$store.getters['integration/list'];
    }

    get hasIcs() {
        if (this.$store.getters['onboarding/config'].ICSUrl) {
            return true;
        }

        return this.integrations.some(
            ({ type }: any) => type === IntegrationType.ICS_CALENDAR,
        );
    }

    @Watch('hasIcs', { immediate: true })
    handleHasIcsChange(value: boolean) {
        if (!value) return;
        this.$emit('connected');
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SELECT_INTEGRATION,
        source: TrackingActionSource.ICS_CALENDAR,
    })
    onAddFromUrlHandler() {
        this.$vfm.show({
            component: () =>
                import('@/components/modal/CalendarFromURLModal.vue'),
            bind: {
                vault: this.$store.getters['vault/active'],
                redirect: false,
            },
        });
    }
}
</script>
