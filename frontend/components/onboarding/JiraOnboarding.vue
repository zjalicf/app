<template>
    <IntegrationButton>
        <button
            :disabled="loading || hasJira || disabled"
            class="integration-button__button"
            :class="{ connected: hasJira }"
            @click="handleAddIntegrationClick"
        >
            <div class="integration-button__button__icon">
                <JiraIcon v-if="!loading" />
                <LoadingIcon v-else />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">Jira</div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasJira
                            ? 'Connected'
                            : 'Link issues to your pages and see overview.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasJira"
                    size="14"
                    class="icon"
                />
            </div>
        </button>
    </IntegrationButton>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import IntegrationButton from '~/components/onboarding/IntegrationButton.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
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
        IntegrationButton,
        JiraIcon,
        LoadingIcon,
    },
})
export default class JiraOnboarding extends Vue {
    popup: any = null;
    loading: boolean = false;

    @Prop({ required: true })
    disabled!: boolean;

    get integrations() {
        return this.$store.getters['integration/list'];
    }

    get hasJira() {
        return (
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.PROJECT,
            ).length > 0
        );
    }

    @Watch('hasJira', { immediate: true })
    handleHasJiraChange(value: boolean) {
        if (!value) return;
        this.$emit('connected');
    }

    get isWeb() {
        return this.$config.platform === 'web';
    }

    get link() {
        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        return `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/jira/authorize?token=${accessToken}&type=v2`;
    }

    webClick() {
        this.loading = true;
        const popup = window.open(
            this.link,
            'acreomJiraIntegration',
            'popup=true,width=800,height=920',
        );

        setInterval(() => {
            if (popup?.closed) {
                this.loading = false;
            }
        }, 1000);
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SELECT_INTEGRATION,
        source: TrackingActionSource.JIRA,
    })
    handleAddIntegrationClick() {
        if (this.isWeb) {
            this.webClick();
            return;
        }
        this.loading = true;
        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;

        this.$utils.navigation.openExternalLink(
            `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/jira/authorize?token=${accessToken}&type=v2`,
        );

        setTimeout(() => {
            this.loading = false;
        }, 30 * 1000);
    }

    get projects() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        ).reduce((acc: any, curr: any) => {
            if (!acc[curr.integrationId]) {
                acc[curr.integrationId] = [];
            }
            acc[curr.integrationId].push(curr);
            return acc;
        }, {});
    }

    @Watch('projects')
    handleJiraIntegrationsChange(newIntegrations: any, oldIntegrations: any) {
        if (
            Object.keys(newIntegrations).length <=
            Object.keys(oldIntegrations).length
        )
            return;
        const newIntegration = Object.keys(newIntegrations).find(
            (id: string) => !oldIntegrations[id],
        );
        this.loading = false;
        this.manageIntegration(newIntegration);
    }

    manageIntegration(integrationId: any) {
        this.$vfm.show({
            component: () =>
                import(
                    '@/components/modal/jira/JiraOnboardingProjectSelectorModal.vue'
                ),
            bind: {
                integrationId,
            },
        });
    }
}
</script>
