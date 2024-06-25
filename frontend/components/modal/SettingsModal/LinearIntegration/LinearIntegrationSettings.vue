<template>
    <div class="linear-settings">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="linear-settings--title">Linear<span>PRO</span></div>
        <div class="linear-settings--caption">
            Link your Linear issues to your personal knowledge base.
        </div>
        <div class="linear-settings--divider"></div>
        <div class="linear-settings--section">
            <div class="linear-settings--section-title">
                <div>Linear Integrations</div>
                <div class="linear-settings--description">
                    Add and manage your Linear integrations
                </div>
            </div>
            <button
                v-if="!integration"
                v-pro.style
                :disabled="loading"
                class="linear-settings--button"
                :class="{ loading, 'has-tippy': $accessControl.readOnlyAccess }"
                :data-tippy-content="
                    $utils.tooltip.createTooltip(
                        'Pro is Required to Integrate Linear',
                    )
                "
                @click="handleAddIntegrationClick"
            >
                <LoadingIcon v-if="loading" class="icon" size="16" />
                Connect Linear
            </button>
        </div>
        <div v-if="integration && !loading" class="linear-settings--section">
            <div class="linear-settings--section__integrations">
                <div class="linear-settings--integration--header">
                    <div class="linear-settings--integration-name">
                        <p class="profile">
                            <LinearUserIcon :user="user" />
                            {{ user.email }}
                        </p>
                    </div>
                    <div class="linear-settings--integration-actions--wrapper">
                        <button
                            class="linear-settings--integration-actions"
                            name="manageIntegration"
                            @click="manageIntegration()"
                        >
                            <InterfaceSettingCog class="icon" size="16" />
                        </button>
                        <button
                            class="linear-settings--integration-actions"
                            name="removeIntegration"
                            @click="deleteIntegration()"
                        >
                            <InterfaceDelete1 class="icon" siz="16" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="disclaimer">
            <InterfacePadLockShield class="icon" size="16" />
            <p>
                When connecting your Linear workspace, acreom will not make any
                changes on your behalf. You remain in control of all
                modifications to your Linear workspace.
                <a
                    href="https://acreom.com/docs/1982af7d-13d5-4531-a530-303f5145995d"
                    target="_blank"
                    >Read more</a
                >
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ExternalLinkIcon, XIcon } from '@vue-hero-icons/solid';
import TemplateDropdown from '~/components/dropdown/TemplateDropdown.vue';
import CInput from '~/components/CInput.vue';
import { IntegrationConfig } from '~/workers/integrations/base';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfacePadLockShield from '~/components/streamline/InterfacePadLockShield.vue';
import JiraStatusSortable from '~/components/modal/SettingsModal/JiraIntegration/JiraStatusSortable.vue';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import { ProRequired } from '~/helpers/decorators';
import LinearStatusSortable from '~/components/modal/SettingsModal/LinearIntegration/LinearStatusSortable.vue';
import { LinearIntegrationConfig } from '~/@types/integrations';
import { TabType } from '~/constants';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearIntegrationSettings',
    components: {
        LinearUserIcon,
        LinearStatusSortable,
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
export default class LinearIntegrationSettings extends Vue {
    config: any = {};
    loading: boolean = false;
    shouldShowTeamPicker: boolean = false;

    get integration() {
        return this.$entities.linear.getIntegration();
    }

    get user() {
        return this.integration?.data?.myself ?? null;
    }

    @Watch('user', { immediate: true })
    onUserChange() {
        if (this.user) {
            this.loading = false;
        }
    }

    @ProRequired
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
    }

    manageIntegration() {
        this.$entities.linear.showTeamPicker();
    }

    deleteIntegration() {
        this.loading = false;
        this.$entities.linear.deleteIntegration();
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

.linear-settings {
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

    &--section {
        border-radius: 6px;

        &:not(:last-of-type) {
            margin-bottom: 12px;
        }

        &__integrations {
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    &--integration-name {
        @include font12-500;
        color: var(--settings-modal-title-color);

        .profile {
            display: flex;
            align-items: center;
            gap: 8px;

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
