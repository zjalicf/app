<template>
    <IntegrationButton>
        <button
            ref="connectButton"
            :disabled="hasGithub || disabled"
            :class="{ connected: hasGithub }"
            class="integration-button__button"
            @click="handleButtonClick"
        >
            <div
                class="integration-button__button__icon"
                :style="{ color: 'white' }"
            >
                <GithubIcon size="20" class="icon" />
            </div>
            <div class="integration-button__button__text">
                <div class="integration-button__button__text__title">
                    Github
                </div>
                <div class="integration-button__button__text__subtitle">
                    {{
                        hasGithub
                            ? 'Connected'
                            : 'Link issues and pull requests to your pages.'
                    }}
                </div>
            </div>
            <div class="integration-button__button__connected">
                <InterfaceValidationCheckCircle
                    v-if="hasGithub"
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
import { IntegrationType } from '~/constants';
import IntegrationButton from '~/components/onboarding/IntegrationButton.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import GithubConnectDropdown from '~/components/github/GithubConnectDropdown.vue';
import { SafeElectronWindow } from '~/@types';
import GithubEnterpriseModal from '~/components/github/GithubEnterpriseModal.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubOnboarding',
    components: {
        InterfaceValidationCheckCircle,
        GithubIcon,
        IntegrationButton,
        GoogleIconColor,
        LoadingIcon,
    },
})
export default class GithubOnboarding extends Vue {
    dropdownOpen: boolean = false;

    @Prop({ required: true })
    disabled!: boolean;

    $refs!: {
        connectButton: HTMLButtonElement;
    };

    get integrations() {
        return this.$store.getters['integration/list'];
    }

    get hasGithub() {
        return this.integrations.some(
            ({ type }: any) => type === IntegrationType.GITHUB,
        );
    }

    @Watch('hasGithub', { immediate: true })
    handleHasGithubChange(value: boolean) {
        if (!value) return;
        this.$emit('connected');
    }

    handleButtonClick() {
        this.dropdownOpen = true;
        this.$dropdown.show({
            parent: this.$refs.connectButton,
            component: GithubConnectDropdown,
            on: {
                select: (type: string) => {
                    this.$dropdown.hideAll();
                    if (type === 'github') {
                        this.handleAddIntegrationClick();
                    } else {
                        this.handleEnterpriseClick();
                    }

                    this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
                        action: TrackingAction.SELECT_INTEGRATION,
                        source: TrackingActionSource.GITHUB,
                    });
                },
            },
            onClose: () => {
                this.dropdownOpen = false;
            },
        });
    }

    handleAddIntegrationClick() {
        if (this.$config.platform === 'web') {
            this.webClick();
            return;
        }
        const vaultId = this.$store.getters['vault/activeVaultId'];
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        const feBaseUrl = this.$config.feBaseUrl + '/integrations/github';
        const authUrl = `${
            this.$config.baseUrl
        }/api/v1/${vaultId}/integrations/github/authorize?token=${accessToken}&fe_base_url=${encodeURIComponent(
            feBaseUrl,
        )}`;

        if (this.$config.os === 'linux') {
            (window as SafeElectronWindow).electron.openExternalLogin(authUrl);
            return;
        }

        this.$utils.navigation.openExternalLink(authUrl);
    }

    handleEnterpriseClick() {
        this.$vfm.show({
            component: GithubEnterpriseModal,
            on: {
                connect: (url: string, token: string) => {
                    this.$entities.github.connectEnterprise(url, token);
                },
            },
        });
    }

    webClick() {
        const vaultId = this.$store.getters['vault/activeVaultId'];
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        const feBaseUrl = this.$config.feBaseUrl + '/integrations/github';

        const link = `${
            this.$config.baseUrl
        }/api/v1/${vaultId}/integrations/github/authorize?token=${accessToken}&fe_base_url=${encodeURIComponent(
            feBaseUrl,
        )}`;

        const popup = window.open(
            link,
            'acreomGithubIntegration',
            'popup=true,width=800,height=920',
        );
    }
}
</script>
