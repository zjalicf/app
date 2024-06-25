<template>
    <IntegrationButton>
        <button
            :disabled="loadingGoogle || hasGoogle || disabled"
            :class="{ connected: hasGoogle }"
            class="integration-button__button"
            @click="handleAddAccount"
        >
            <div class="integration-button__button__icon">
                <LoadingIcon v-if="loadingGoogle" class="icon" size="20" />
                <GoogleIconColor v-else size="20" class="icon" />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">
                    Google Calendar
                </div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasGoogle
                            ? 'Connected'
                            : 'See your Google Calendar events in acreom.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasGoogle"
                    size="14"
                    class="icon"
                />
            </div>
        </button>
    </IntegrationButton>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import GoogleIconColor from '~/components/icons/GoogleIconColor.vue';
import { CloudServiceAction, IntegrationType, ServiceKey } from '~/constants';
import { isElectron } from '~/helpers/is-electron';
import IntegrationButton from '~/components/onboarding/IntegrationButton.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GoogleCalOnboarding',
    components: {
        InterfaceValidationCheckCircle,
        IntegrationButton,
        GoogleIconColor,
        LoadingIcon,
    },
})
export default class GoogleCalOnboarding extends Vue {
    loadingGoogle: boolean = false;

    @Prop({ required: true })
    disabled!: boolean;

    get integrations() {
        return this.$store.getters['integration/list'];
    }

    get hasGoogle() {
        return this.integrations.some(
            ({ type }: any) => type === IntegrationType.GOOGLE_CALENDAR,
        );
    }

    @Watch('hasGoogle', { immediate: true })
    handleHasGoogleChange(value: boolean) {
        if (!value) return;
        this.$emit('connected');
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
                callerContext: 'GoogleCalOnboarding.vue getCredentials',
            },
        );

        return refreshedCredentials;
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SELECT_INTEGRATION,
        source: TrackingActionSource.GOOGLE,
    })
    async handleAddAccount(ev: Event) {
        const credentials = await this.getCredentials();
        if (!isElectron()) {
            this.loadingGoogle = true;
            const popup = window.open(
                `${this.$config.baseUrl}/api/v1/${this.$store.getters['vault/active'].id}/integrations/google_calendar/authorize?token=${credentials.accessToken}&version=1`,
                'acreomJiraIntegration',
                'popup=true,width=800,height=920',
            );

            setInterval(() => {
                if (popup?.closed) {
                    this.loadingGoogle = false;
                }
            }, 1000);
            return;
        }
        ev.preventDefault();
        const url = `${this.$config.baseUrl}/api/v1/${this.$store.getters['vault/active'].id}/integrations/google_calendar/authorize?token=${credentials.accessToken}&strategy=device&version=1`;
        this.$utils.navigation.openExternalLink(url);
    }
}
</script>
