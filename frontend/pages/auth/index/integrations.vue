<template>
    <div class="auth-integrations">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="auth-integrations__content">
            <div class="auth-integrations__content__wrapper">
                <h2>Integrations</h2>
                <div class="auth-integrations__description">
                    Connect apps to your knowledge base.
                </div>
                <LinearOnboarding
                    :disabled="isLocalVault"
                    :class="{ 'has-tippy': isLocalVault }"
                    data-tippy-content="<div class='tooltip'>Linear Sync requires a Cloud Vault</div>"
                />
                <JiraOnboarding
                    :class="{ 'has-tippy': isLocalVault }"
                    data-tippy-content="<div class='tooltip'>Jira Sync requires a Cloud Vault</div>"
                    :disabled="isLocalVault"
                    @connected="onJiraConnected"
                />
                <GithubOnboarding
                    :disabled="isLocalVault"
                    :class="{ 'has-tippy': isLocalVault }"
                    @connected="onGithubConnected"
                    data-tippy-content="<div class='tooltip'>Github Sync requires a Cloud Vault</div>"
                />
                <GoogleCalOnboarding
                    :disabled="isLocalVault"
                    :class="{ 'has-tippy': isLocalVault }"
                    @connected="onGoogleCalendarConnected"
                    data-tippy-content="<div class='tooltip'>Google Calendar Sync requires a Cloud Vault</div>"
                />
                <AppleCalOnboarding @connected="onAppleConnected" />
                <ICSOnboarding @connected="onICSConnected" />
                <div class="auth-integrations__content__footer">
                    <CButton
                        class="
                            auth-integrations__content__footer__footer-button
                            continue
                        "
                        type="primary"
                        size="full-width"
                        @click="onContinue"
                    >
                        Continue
                    </CButton>
                    <CButton
                        v-if="isLocalVault"
                        class="
                            auth-integrations__content__footer__footer-button
                            cloud
                        "
                        type="tertiary"
                        @click="onCloud"
                    >
                        Enable Cloud
                    </CButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { is } from 'date-fns/locale';
import GoogleCalOnboarding from '~/components/onboarding/GoogleCalOnboarding.vue';
import ICSOnboarding from '~/components/onboarding/ICSOnboarding.vue';
import AppleCalOnboarding from '~/components/onboarding/AppleCalOnboarding.vue';
import JiraOnboarding from '~/components/onboarding/JiraOnboarding.vue';
import GithubOnboarding from '~/components/onboarding/GithubOnboarding.vue';
import CButton from '~/components/CButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';
import LinearOnboarding from '~/components/onboarding/LinearOnboarding.vue';

@Component({
    name: 'Integrations',
    computed: {
        is() {
            return is;
        },
    },
    components: {
        LinearOnboarding,
        CButton,
        GithubOnboarding,
        JiraOnboarding,
        AppleCalOnboarding,
        ICSOnboarding,
        GoogleCalOnboarding,
    },
})
export default class Integrations extends Vue {
    hasJiraProjects: boolean = false;

    get isLocalVault() {
        return (
            this.$entities.vault.active?.type === 'local' ||
            this.$store.getters['onboarding/config'].type === 'local'
        );
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.INTEGRATIONS_ENABLE_CLOUD,
    })
    onCloud() {
        this.$router.push('/auth/cloud');
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.INTEGRATIONS_PAGE_CONTINUE,
    })
    async onContinue() {
        if (this.isLocalVault) {
            await this.$entities.vault.createNewVault(
                TrackingActionSource.ONBOARDING,
            );
        }

        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.COMPLETE,
        });
        this.$router.push('/');
    }

    onGithubConnected() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.SAVE_INTEGRATION,
            source: TrackingActionSource.GITHUB,
        });
    }

    onICSConnected() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.SAVE_INTEGRATION,
            source: TrackingActionSource.ICS_CALENDAR,
        });
    }

    onAppleConnected() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.SAVE_INTEGRATION,
            source: TrackingActionSource.APPLE_CALENDAR,
        });
    }

    onGoogleCalendarConnected() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.SAVE_INTEGRATION,
            source: TrackingActionSource.GOOGLE_CALENDAR,
        });
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SAVE_INTEGRATION,
        source: TrackingActionSource.JIRA,
    })
    onJiraConnected(hasProjects: boolean) {
        this.hasJiraProjects = hasProjects;
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.INTEGRATIONS,
        });
    }
}
</script>

<style lang="scss" scoped>
.auth-integrations {
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;

    @media (max-height: 680px) {
        height: auto;
        padding-top: 180px;
    }

    &__content {
        padding: 45px 130px 47px;
        border-radius: 30px;
        background: var(--vault-wrapper-bg-color);

        &__wrapper {
            max-width: 390px;
        }

        &__footer {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;

            &__footer-button {
                &.continue {
                    max-width: 230px;
                }
            }
        }
    }

    h2 {
        font-weight: 500;
        font-size: 24px;
        line-height: 155.2%;
        text-align: center;
        color: var(--auth-heading-color);
        margin-bottom: 6px;
    }

    &__description {
        font-weight: 500;
        font-size: 15px;
        line-height: 155.2%;
        text-align: center;
        color: var(--onboarding-description-text-color);
        margin: 0 auto 25px;
    }

    &__section {
        @include font10-700;
        text-transform: uppercase;
    }
}
</style>
