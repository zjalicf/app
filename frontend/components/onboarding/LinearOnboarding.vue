<template>
    <IntegrationButton>
        <button
            :disabled="loading || hasLinear || disabled"
            class="integration-button__button"
            :class="{ connected: hasLinear }"
            @click="handleAddIntegrationClick"
        >
            <div class="integration-button__button__icon">
                <LinearIconRound v-if="!loading" />
                <LoadingIcon v-else />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">
                    Linear
                </div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasLinear
                            ? 'Connected'
                            : 'Link issues to your pages and see overview.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasLinear"
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
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';

@Component({
    components: {
        LinearIconRound,
        LinearIcon,
        InterfaceValidationCheckCircle,
        IntegrationButton,
        LoadingIcon,
    },
})
export default class JiraOnboarding extends Vue {
    loading: boolean = false;
    shouldShowTeamPicker: boolean = false;

    @Prop({ required: true })
    disabled!: boolean;

    get integration() {
        return this.$entities.linear.getIntegration();
    }

    get user() {
        return this.integration.data.myself;
    }

    get linearTeams() {
        return this.$entities.linear.teams;
    }

    @Watch('linearTeams')
    onLinearTeamsChange(val: any) {
        if (!val.length) return;
        if (!this.shouldShowTeamPicker) return;
        this.$entities.linear.showTeamPicker(true, false);
        this.shouldShowTeamPicker = false;
        this.loading = false;
    }

    get hasLinear() {
        return !!this.integration;
    }

    get link() {
        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        return `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/jira/authorize?token=${accessToken}&type=v2`;
    }

    webClick() {
        this.loading = true;

        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        const link = `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/linear/authorize?token=${accessToken}`;

        const popup = window.open(
            link,
            'acreomLinearIntegration',
            'popup=true,width=800,height=920',
        );

        setInterval(() => {
            if (popup?.closed) {
                this.loading = false;
            }
        }, 1000);
    }

    handleAddIntegrationClick() {
        this.shouldShowTeamPicker = true;
        if (this.$config.platform === 'web') {
            this.webClick();
            return;
        }

        this.loading = true;
        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        this.$utils.navigation.openExternalLink(
            `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/linear/authorize?token=${accessToken}`,
        );
        setTimeout(() => {
            this.loading = false;
        }, 30 * 1000);
    }
}
</script>
