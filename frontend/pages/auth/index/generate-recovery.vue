<template>
    <div class="auth-cloud">
        <div class="auth-cloud--content">
            <div class="auth-cloud--content--title">
                <h1>Generate Recovery Key</h1>
                <p>
                    In case of forgetting your encryption password, you can use
                    recovery keys to reset your encryption password and access
                    your data.
                </p>
            </div>
            <div v-if="!saved" class="auth-cloud--content--actions">
                <CButton
                    type="primary"
                    size="full-width"
                    @click="generateRecoveryKey"
                    >Save recovery key
                </CButton>
            </div>
            <div v-else class="auth-cloud--content--actions" :class="{ saved }">
                <CButton
                    type="secondary"
                    size="full-width"
                    @click="generateRecoveryKey"
                    >Download again
                </CButton>
                <CButton type="primary" size="full-width" @click="onContinue"
                    >Continue
                </CButton>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';
import ProgrammingCloudCheck from '~/components/streamline/ProgrammingCloudCheck.vue';
import PhoneMobilePhone from '~/components/streamline/PhoneMobilePhone.vue';
import InterfaceShare from '~/components/streamline/InterfaceShare.vue';
import ProgrammingApplicationAdd from '~/components/streamline/ProgrammingApplicationAdd.vue';
import CloudFeatures from '~/components/vault/CloudFeatures.vue';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { TrackingAction, TrackingType } from '~/@types/tracking';
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
    saved: boolean = false;

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.SAVE_RECOVERY_KEY,
    })
    async generateRecoveryKey() {
        const recoveryData = await this.$serviceRegistry.invoke<{
            recoveryKey: string;
            id: string;
        }>(ServiceKey.DATABASE, DatabaseServiceAction.CREATE_RECOVERY_KEY, {
            callerContext: 'generate-recovery.vue generateRecoveryKey',
        });
        if (!recoveryData) return;
        const status = await this.$encryption.createRecoveryJSON(recoveryData);
        this.saved = !!status;
    }

    onContinue() {
        if (this.$config.platform === 'web') {
            this.$vfm.show({
                component: () =>
                    import(
                        '~/components/modal/OnboardingRecoveryConfirmModal.vue'
                    ),
                on: {
                    accept: () => {
                        this.$router.push('/auth/integrations');
                    },
                },
            });
            return;
        }
        this.$router.push('/auth/integrations');
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.GENERATE_RECOVERY_KEY,
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
            max-width: 229px;
            margin: 0 auto;

            &.saved {
                max-width: 100%;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 124px 196px;
                gap: 13px;
                justify-content: space-between;
            }
        }
    }
}
</style>
