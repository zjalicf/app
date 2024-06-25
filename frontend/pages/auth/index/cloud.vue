<template>
    <div class="auth-cloud">
        <div class="auth-cloud--content">
            <div class="auth-cloud--content--title">
                <h1>acreom Cloud</h1>
                <p>
                    Sync this vault across devices, enable web access and more.
                    You can always change this later.
                    <a
                        href="https://acreom.com/docs/96b08203-9acc-4fb5-8cda-2f0858323672"
                        target="_blank"
                        >Learn more</a
                    >.
                </p>
            </div>
            <div class="auth-cloud--content--body">
                <CloudFeatures />
            </div>
            <div class="auth-cloud--content--actions">
                <CButton
                    data-e2e="acreom-cloud-skip"
                    type="secondary"
                    size="full-width"
                    @click="keepLocal"
                    >Use without cloud
                </CButton>
                <CButton
                    :disabled="loading"
                    type="primary"
                    size="full-width"
                    @click="enableCloud"
                    >Continue
                </CButton>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';
import ProgrammingCloudCheck from '~/components/streamline/ProgrammingCloudCheck.vue';
import PhoneMobilePhone from '~/components/streamline/PhoneMobilePhone.vue';
import InterfaceShare from '~/components/streamline/InterfaceShare.vue';
import ProgrammingApplicationAdd from '~/components/streamline/ProgrammingApplicationAdd.vue';
import CloudFeatures from '~/components/vault/CloudFeatures.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    components: {
        CloudFeatures,
        ProgrammingApplicationAdd,
        InterfaceShare,
        PhoneMobilePhone,
        ProgrammingCloudCheck,
        CButton,
    },
})
export default class AuthCloud extends Vue {
    loading: boolean = false;

    @Watch('user', { deep: true })
    async handleUserChange(newValue: any, oldValue: any) {
        if (oldValue || !newValue) return;

        if (this.user) {
            await this.$vfm.hideAll();
            this.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: `Logged in as ${newValue.email}`,
                },
            });
        }
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.KEEP_LOCAL,
    })
    keepLocal() {
        this.$utils.onboarding.setNewVaultType('local');
        this.$router.push('/auth/integrations');
    }

    async enableCloud() {
        if (!this.loggedIn) {
            this.showLoginModal();
            return;
        }

        this.loading = true;

        this.$utils.onboarding.setNewVaultType('remote');
        if (this.$encryption.isEncryptionEnabled()) {
            await this.$entities.vault.createNewVault(
                TrackingActionSource.ONBOARDING,
            );
            this.$router.push('/auth/integrations');
        } else {
            this.$router.push('/auth/encryption');
        }

        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.ENABLE_CLOUD,
        });
        this.loading = false;
    }

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    showLoginModal() {
        this.$vfm.show({
            component: () => import('~/components/modal/LogInModal.vue'),
        });
    }

    @Watch('loggedIn')
    async onLoggedInChange(newValue: any) {
        if (newValue) {
            if (this.$encryption.isEncryptionEnabled()) {
                await this.$entities.vault.createNewVault(
                    TrackingActionSource.ONBOARDING,
                );
                this.$router.push('/auth/integrations');
            } else {
                this.$router.push('/auth/encryption');
            }
        }
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.ACREOM_CLOUD,
        });
    }
}
</script>
<style lang="scss" scoped>
.auth-cloud {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-height: 680px) {
        height: auto;
        padding-top: 180px;
    }

    &--content {
        padding: 45px 130px 47px;
        border-radius: 30px;
        background: var(--vault-wrapper-bg-color);

        &--title {
            margin-bottom: 35px;
            text-align: center;
            color: $white;

            h1 {
                font-weight: 500;
                font-size: 24px;
                line-height: 37px;
                text-align: center;
                color: var(--auth-heading-color);
                margin-bottom: 10px;
            }

            p {
                @include font12-500;
                max-width: 330px;
                margin: 0 auto;
                color: $blueGrey400;

                a {
                    color: $white;

                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }

        &--actions {
            max-width: 313px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 135px 165px;
            gap: 13px;
            justify-content: space-around;

            :deep(button) {
                padding: 7px 16px;
            }
        }
    }
}
</style>
