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
        <div class="jira-settings--title">Jira<span>PRO</span></div>
        <div class="jira-settings--caption">
            Link your Jira issues to your personal knowledge base.
        </div>
        <div class="jira-settings--divider"></div>
        <div class="jira-settings--section">
            <div class="jira-settings--section-title">
                <div>Jira Integrations</div>
                <div class="jira-settings--description">
                    Add and manage your Jira integrations
                </div>
            </div>
            <button
                v-if="!integration"
                v-pro.style
                :disabled="loading"
                class="jira-settings--button"
                :class="{ loading, 'has-tippy': $accessControl.readOnlyAccess }"
                :data-tippy-content="
                    $utils.tooltip.createTooltip(
                        'Pro is Required to Integrate Jira',
                    )
                "
                @click="handleAddIntegrationClick"
            >
                <LoadingIcon v-if="loading" class="icon" size="16" />
                Connect Jira Cloud Account
            </button>
        </div>
        <div v-if="integration" class="jira-settings--section">
            <div class="jira-settings--section__integrations">
                <div
                    class="jira-settings--auth-icon has-tippy"
                    :data-tippy-content="`<div class='tooltip'>Jira authorization failed.<br> Reconnect your Jira Cloud account.</div>`"
                >
                    <InterfaceAlertWarningTriangle
                        v-if="!isAuthorized"
                        size="14"
                    />
                </div>
                <div class="jira-settings--integration--header">
                    <div class="jira-settings--integration-name">
                        <p class="profile">
                            <img
                                v-if="myself && myself.avatarUrls?.['48x48']"
                                :src="myself && myself.avatarUrls?.['48x48']"
                            />
                            {{
                                (myself && myself.emailAddress) ||
                                'Connecting account'
                            }}
                        </p>
                        <p class="meta">
                            {{ integration.data.cloudUrl }} ({{
                                enabledProjects(integration.id).length
                                    ? `${
                                          enabledProjects(integration.id).length
                                      } project${
                                          enabledProjects(integration.id)
                                              .length > 1
                                              ? 's'
                                              : ''
                                      } connected`
                                    : 'No projects connected'
                            }})
                        </p>
                    </div>
                    <div class="jira-settings--integration-actions--wrapper">
                        <tippy
                            :content="`<div class='tooltip'>Sync Projects</div>`"
                            :delay="[300, 20]"
                            :touch="false"
                            boundary="window"
                            placement="top"
                            theme="tooltip"
                            to="sync"
                        />
                        <tippy
                            :content="`<div class='tooltip'>Integration settings</div>`"
                            :delay="[300, 20]"
                            :touch="false"
                            boundary="window"
                            placement="top"
                            theme="tooltip"
                            to="manageIntegration"
                        />
                        <tippy
                            :content="`<div class='tooltip'>Remove integration</div>`"
                            :delay="[300, 20]"
                            :touch="false"
                            boundary="window"
                            placement="top"
                            theme="tooltip"
                            to="removeIntegration"
                        />
                        <button
                            :disabled="updateProgresses || !isAuthorized"
                            class="jira-settings--integration-actions"
                            name="sync"
                            @click="reloadAll(integration)"
                        >
                            <InterfaceArrowsSynchronize
                                v-if="!updateProgresses"
                                class="icon"
                                size="16"
                            />
                            <LoadingIcon v-else class="icon" size="16" />
                        </button>
                        <button
                            :disabled="updateProgresses || !isAuthorized"
                            class="jira-settings--integration-actions"
                            name="manageIntegration"
                            @click="manageIntegration(integration.id)"
                        >
                            <InterfaceSettingCog class="icon" size="16" />
                        </button>
                        <button
                            class="jira-settings--integration-actions"
                            name="removeIntegration"
                            @click="deleteIntegration(integration)"
                        >
                            <InterfaceDelete1 class="icon" siz="16" />
                        </button>
                    </div>
                </div>
            </div>
            <button
                v-if="!isAuthorized"
                v-pro.style
                :disabled="loading"
                class="jira-settings--button"
                :class="{ loading, 'has-tippy': $accessControl.readOnlyAccess }"
                :data-tippy-content="
                    $utils.tooltip.createTooltip(
                        'Pro is Required to Integrate Jira',
                    )
                "
                @click="handleAddIntegrationClick"
            >
                <LoadingIcon v-if="loading" class="icon" size="16" />
                Reconnect Jira Cloud Account
            </button>
        </div>
        <div class="disclaimer">
            <InterfacePadLockShield class="icon" size="16" />
            <p>
                When connecting your Jira workspace, acreom will not make any
                changes on your behalf. You remain in control of all
                modifications to your Jira workspace.
                <a
                    href="https://acreom.com/docs/1982af7d-13d5-4531-a530-303f5145995d"
                    target="_blank"
                    >Read more</a
                >
            </p>
        </div>
        <div v-if="hasActiveProjects">
            <div class="jira-settings--divider"></div>
            <div class="jira-settings--section-title">
                <div>Project settings</div>
                <div class="jira-settings--description">
                    Change the order of your Jira statuses
                </div>
            </div>

            <div class="project-settings">
                <div
                    v-for="integration in integrations"
                    :key="integration.id"
                    class="project-settings__integration"
                >
                    <div
                        v-for="project in enabledProjects(integration.id)"
                        :key="project.id"
                        class="project-settings__project"
                    >
                        <div class="project-settings__project__name">
                            {{ project.name }}
                        </div>
                        <JiraStatusSortable :project-id="project.id" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ExternalLinkIcon, XIcon } from '@vue-hero-icons/solid';
import TemplateDropdown from '~/components/dropdown/TemplateDropdown.vue';
import CInput from '@/components/CInput.vue';
import { IntegrationConfig } from '~/workers/integrations/base';
import { CloudServiceAction, IntegrationType, ServiceKey } from '~/constants';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import InterfacePadLockShield from '~/components/streamline/InterfacePadLockShield.vue';
import JiraStatusSortable from '~/components/modal/SettingsModal/JiraIntegration/JiraStatusSortable.vue';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import { ProRequired } from '~/helpers/decorators';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';
import { SafeElectronWindow } from '~/@types';

@Component({
    name: 'JiraIntegrationSettings',
    components: {
        InterfaceAlertWarningTriangle,
        InterfaceArrowsSynchronize,
        JiraStatusSortable,
        InterfacePadLockShield,
        LoadingIcon,
        InterfaceDelete1,
        InterfaceSettingCog,
        ADropDown,
        CInput,
        ExternalLinkIcon,
        TemplateDropdown,
        XIcon,
        draggable: () => import('vuedraggable'),
    },
})
export default class JiraIntegrationSettings extends Vue {
    config: any = {};
    loading: boolean = false;

    reloadAll(integration: any) {
        this.$entities.jira.fullRefresh();
    }

    selectedProjects(id: string) {
        return (
            this.integrations
                .find((integration: any) => integration.id === id)
                ?.data.projects.filter((project: any) => project.syncEnabled)
                .map((project: any) => project.id) ?? []
        );
    }

    orderedStatuses(project: any) {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.STATUS,
        ).filter(
            (status: any) =>
                status.id.split('/')[2] === project.id.split('/').pop(),
        );
    }

    get hasActiveProjects() {
        return (
            this.$store.getters['integration/byType'](IntegrationType.JIRA)
                .length > 0 &&
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.PROJECT,
            ).filter((project: any) => project.syncEnabled).length > 0
        );
    }

    get myself() {
        return this.$entities.jira.getMyself();
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

    get integration() {
        return this.$entities.jira.getIntegration();
    }

    webClick() {
        this.loading = true;

        const vaultId = this.$store.getters['vault/active'].id;
        const accessToken =
            this.$store.getters['user/credentials']?.accessToken;
        const link = `${this.$config.baseUrl}/api/v1/${vaultId}/integrations/jira/authorize?token=${accessToken}&type=v2`;

        const popup = window.open(
            link,
            'acreomJiraIntegration',
            'popup=true,width=800,height=920',
        );

        setInterval(() => {
            if (popup?.closed) {
                this.loading = false;
            }
        }, 1000);
    }

    get enabledProjects() {
        return (id: string) =>
            this.projects[id]
                ?.map((project: any) => {
                    return { ...project, label: project.name };
                })
                .filter(({ syncEnabled }: any) => syncEnabled) ?? [];
    }

    manageIntegration(integrationId: any) {
        this.$vfm.show({
            component: () =>
                import('@/components/modal/jira/JiraProjectSelectorModal.vue'),
            bind: {
                integrationId,
            },
        });
    }

    get isAuthorized() {
        return this.$entities.jira.isAuthorized();
    }

    get integrations() {
        return this.$store.getters['integration/byType'](IntegrationType.JIRA);
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

    get updateProgresses() {
        const progresses = this.integrations.reduce(
            (acc: any, { updateProgress }: { updateProgress: any[] }) => ({
                ...acc,
                ...(updateProgress ?? {}),
            }),
            {},
        );

        if (!Object.keys(progresses).length) {
            return null;
        }

        return progresses;
    }

    deleteIntegration(integration: IntegrationConfig<any>) {
        this.$vfm.show({
            component: () =>
                import(
                    '@/components/modal/jira/JiraDeleteIntegrationModal.vue'
                ),
            on: {
                remove: async (close: any) => {
                    this.$entities.jira.deleteIntegration();
                    close();
                },
            },
        });
    }

    @ProRequired
    async handleAddIntegrationClick() {
        if (this.$config.platform === 'web') {
            this.webClick();
            return;
        }

        this.loading = true;
        const vaultId = this.$store.getters['vault/active'].id;
        const credentials = await this.getCredentials();
        const feBaseUrl = this.$config.feBaseUrl + '/integrations/jira';
        const authUrl = `${
            this.$config.baseUrl
        }/api/v1/${vaultId}/integrations/jira/authorize?token=${
            credentials.accessToken
        }&type=v2&fe_base_url=${encodeURIComponent(feBaseUrl)}`;

        if (this.$config.os === 'linux' || this.$config.os === 'windows') {
            (window as SafeElectronWindow).electron.openExternalLogin(authUrl);
            return;
        }

        this.$utils.navigation.openExternalLink(authUrl);
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
                callerContext: 'JiraIntegrationSettings.vue getCredentials',
            },
        );

        return refreshedCredentials;
    }

    mounted() {
        this.config = this.integrations.reduce((acc: any, integration: any) => {
            acc[integration.id] = {
                showProperties: false,
                selected: this.selectedProjects(integration.id),
            };
            return acc;
        }, {});
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
            display: flex;
            align-items: center;
            gap: 8px;

            img {
                width: 18px;
                height: 18px;
                border-radius: 3px;
            }
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

    &--auth-icon {
    }

    &--section {
        border-radius: 6px;

        &:not(:last-of-type) {
            margin-bottom: 12px;
        }

        &__integrations {
            display: flex;
            margin-top: 18px;
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
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }

    &--integration-name {
        @include font12-500;
        color: var(--settings-modal-title-color);

        .profile {
            display: flex;
            align-items: center;
            gap: 4px;

            img {
                width: 18px;
                height: 18px;
                border-radius: 50%;
            }
        }

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
