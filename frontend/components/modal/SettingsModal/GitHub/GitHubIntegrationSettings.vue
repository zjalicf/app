<template>
    <div class="jira-settings">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="jira-settings--title">GitHub<span>PRO</span></div>
        <div class="jira-settings--caption">
            Link your issues and pull requests to your personal knowledge base.
        </div>
        <div class="jira-settings--divider"></div>
        <div class="jira-settings--section">
            <div class="jira-settings--section-title">
                <div>GitHub Integration</div>
                <div class="jira-settings--description">
                    Add and manage your GitHub account
                </div>
            </div>
            <button
                v-if="!integration"
                ref="connectButton"
                v-pro.style
                class="jira-settings--button"
                :class="{
                    active: dropdownOpen,
                    'has-tippy': $accessControl.readOnlyAccess,
                }"
                :data-tippy-content="
                    $utils.tooltip.createTooltip(
                        'Pro is Required to Integrate Github',
                    )
                "
                @click="handleButtonClick"
            >
                Connect GitHub
            </button>
        </div>
        <div v-if="integration" class="jira-settings--section">
            <div class="jira-settings--section-title">Connected Account</div>
            <div class="jira-settings--section__integrations">
                <GithubAccount :integration="integration" />
            </div>
            <button
                v-if="!isAuthorized"
                ref="connectButton"
                v-pro.style
                class="jira-settings--button"
                :class="{
                    active: dropdownOpen,
                    'has-tippy': $accessControl.readOnlyAccess,
                }"
                :data-tippy-content="
                    $utils.tooltip.createTooltip(
                        'Pro is Required to Integrate Github',
                    )
                "
                @click="handleButtonClick"
            >
                Reconnect GitHub
            </button>
        </div>
        <div class="disclaimer">
            <InterfacePadLockShield class="icon" size="16" />
            <p>
                When connecting your GitHub account, acreom will not make any
                changes on your behalf. You remain in control of all
                modifications to your issues, pull requests, and account.
                <a
                    href="https://acreom.com/docs/37937f40-1c6e-463d-9ac2-0619cff88934"
                    target="_blank"
                    >Read more</a
                >
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { SafeElectronWindow } from '~/@types';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfacePadLockShield from '~/components/streamline/InterfacePadLockShield.vue';
import GithubAccount from '~/components/modal/SettingsModal/GitHub/GithubAccount.vue';
import { GithubIntegration } from '~/components/github/github';
import GithubEnterpriseModal from '~/components/github/GithubEnterpriseModal.vue';
import GithubConnectDropdown from '~/components/github/GithubConnectDropdown.vue';
import { ProRequired } from '~/helpers/decorators';
import { CloudServiceAction, ServiceKey } from '~/constants';
import GithubAccessTokenModal from '~/components/github/GithubAccessTokenModal.vue';
import { IntegrationAuthStatus } from '~/workers/integrations/base';

@Component({
    name: 'GitHubIntegrationSettings',
    components: {
        GithubAccount,
        InterfacePadLockShield,
        LoadingIcon,
    },
})
export default class GitHubIntegrationSettings extends Vue {
    dropdownOpen: boolean = false;

    $refs!: {
        connectButton: HTMLButtonElement;
    };

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

    get integration(): GithubIntegration | null {
        return this.$entities.github.getIntegration();
    }

    get isAuthorized(): boolean {
        return this.$entities.github.isAuthorized();
    }

    handleAccessTokenClick() {
        this.$vfm.show({
            component: GithubAccessTokenModal,
            on: {
                connect: (token: string) => {
                    this.$entities.github.connectWithAccessToken(token);
                },
            },
        });
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

    @ProRequired
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
                    }
                    if (type === 'github-access-token') {
                        this.handleAccessTokenClick();
                    } else if (type === 'enterprise') {
                        this.handleEnterpriseClick();
                    }
                },
            },
            onClose: () => {
                this.dropdownOpen = false;
            },
        });
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
                callerContext: 'GithubIntegrationSettings.vue getCredentials',
            },
        );

        return refreshedCredentials;
    }

    async handleAddIntegrationClick() {
        if (this.$config.platform === 'web') {
            this.webClick();
            return;
        }
        const vaultId = this.$store.getters['vault/activeVaultId'];
        const credentials = await this.getCredentials();
        const feBaseUrl = this.$config.feBaseUrl + '/integrations/github';
        const authUrl = `${
            this.$config.baseUrl
        }/api/v1/${vaultId}/integrations/github/authorize?token=${
            credentials.accessToken
        }&fe_base_url=${encodeURIComponent(feBaseUrl)}`;

        if (this.$config.os === 'linux') {
            (window as SafeElectronWindow).electron.openExternalLogin(authUrl);
            return;
        }

        this.$utils.navigation.openExternalLink(authUrl);
    }
}
</script>
<style lang="scss" scoped>
.project-settings {
    &__project {
        padding-top: 12px;

        &__name {
            @include font12-600;
            color: var(--settings-modal-title-color);
            margin-bottom: 8px;
        }
    }
}

.jira-settings {
    padding: 30px;

    .disclaimer {
        @include font11-500;
        background: var(--jira-disclaimer-bg-color);
        display: flex;
        align-items: center;
        padding: 10px 20px;
        border-radius: 8px;
        gap: 20px;
        color: var(--jira-disclaimer-text-color__settings);
        margin: 20px auto 0px;

        a {
            color: var(--accent-color);
            text-decoration: underline;
        }

        .icon {
            flex-shrink: 0;
        }
    }

    &--divider {
        width: 100%;
        margin: 15px 0 12px;
        height: 1px;
        background: var(--tab-divider-color);
    }

    .step {
        @include font12-500;
        margin-bottom: 5px;
    }

    &--section {
        border-radius: 6px;

        &:not(:last-of-type) {
            margin-bottom: 12px;
        }

        &__integrations {
            margin-top: 8px;
            background: var(--settings-modal-notifications-bg-color);
            border-radius: 10px;
            padding: 12px 12px 12px 16px;
            flex-direction: row;
            gap: 6px;
            margin-bottom: 14px;
        }

        &__form {
            margin-top: 12px;
            flex-direction: column;
            gap: 6px;
        }
    }

    &--section-title {
        @include font12-600;
        color: var(--settings-modal-title-color);
    }

    &--description {
        @include font12-500;
        margin-top: 4px;
        color: var(--settings-modal-option-description-color);
        margin-bottom: 12px;
    }

    &--button {
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        border-radius: 6px;
        padding: 5px 11px;
        font-weight: 600;
        font-size: 13px;
        line-height: 20px;
        color: var(--settings-modal-button-primary-text-color);
        background: var(--settings-modal-button-primary-bg-color);
        outline: none;
        position: relative;

        &:disabled {
            opacity: 0.5;
        }

        &.loading {
            color: rgba(0, 0, 0, 0);
        }

        .icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--settings-modal-button-primary-text-color);
        }

        &:not(:disabled):hover,
        &.active {
            background: var(--settings-modal-button-primary-bg-color__hover);
            color: var(--settings-modal-button-primary-text-color__hover);
        }

        .icon {
            margin-right: 4px;
        }
    }

    &--title {
        @include font14-600;
        color: var(--settings-modal-title-color);

        span {
            margin-left: 4px;
            @include proBadge;
        }
    }

    &--caption {
        @include font12-500;
        margin-top: 6px;
        cursor: default;
        color: var(--settings-modal-option-description-color);
    }

    &--integration {
        width: 100%;

        &--header {
            display: flex;
            justify-content: space-between;
        }
    }

    &--integration-name {
        @include font12-500;
        color: var(--settings-modal-title-color);

        .meta {
            @include font11-500;
            color: var(--settings-modal-option-description-color);

            &.loading {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }

        button {
            outline: none;
            color: var(--settings-modal-calendar-remove-button-color);

            &:not(.loading) {
                padding: 4px;

                &:hover {
                    color: var(
                        --settings-modal-calendar-remove-button-color__hover
                    );
                }
            }

            margin-left: 4px;
        }
    }

    &--integration-actions {
        &--wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        &:disabled {
            opacity: 0.5;
        }

        @include font12-500;
        outline: none;
        color: var(--settings-modal-calendar-remove-button-color);
        padding: 4px;

        &:not(:disabled):hover {
            color: var(--settings-modal-calendar-remove-button-color__hover);
        }
    }
}
</style>
