<template>
    <div class="auth-calendar">
        <div class="auth-calendar--image-wrapper">
            <div class="new-sync-vault-modal">
                <div class="new-sync-vault-modal--title">Vault Name</div>
                <VaultSetup :context="`onboarding`" @create="onCreateVault" />
            </div>
        </div>

        <button
            v-if="$config.platform !== 'web'"
            class="back-button"
            @click="goBack"
        >
            Back
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import VaultSetup from '~/components/vault/VaultSetup.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'Jira',
    components: {
        VaultSetup,
        CButton,
    },
})
export default class Calendar extends Vue {
    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.CREATE_VAULT,
    })
    onCreateVault() {
        if (this.$config.platform === 'web') {
            if (this.$encryption.isEncryptionEnabled()) {
                this.$router.push('/auth/integrations');
            } else {
                this.$router.push('/auth/encryption');
            }
            return;
        }
        this.$router.push('/auth/cloud');
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.BACK,
    })
    goBack() {
        this.$router.push('/auth/vault');
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.NEW_VAULT,
        });
    }
}
</script>

<style lang="scss" scoped>
.new-sync-vault-modal {
    background: var(--vault-wrapper-bg-color);
    padding: 36px 66px 60px;
    border-radius: 20px;

    &--title {
        font-weight: 500;
        font-size: 24px;
        line-height: 37px;
        text-align: center;
        color: var(--auth-heading-color);
        margin-bottom: 35px;
    }
}

.auth-calendar {
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

    h2 {
        font-weight: 500;
        font-size: 24px;
        line-height: 155.2%;
        text-align: center;
        color: var(--auth-heading-color);
        margin-bottom: 6px;
    }

    &--image-wrapper {
        max-width: 330px;
        width: 100%;
        margin-top: 80px;
        margin-bottom: 30px;
    }

    &--description {
        font-weight: 500;
        font-size: 15px;
        line-height: 155.2%;
        text-align: center;
        color: var(--onboarding-description-text-color);
        max-width: 270px;
        margin: 0 auto 25px;
    }

    > button {
        @include animateBackgroundColor;
        outline: none;
        font-weight: 500;
        font-size: 13px;
        line-height: 20px;
        color: var(--onboarding-skip-button-text-color);

        &:hover {
            color: var(--onboarding-skip-button-text-color__hover);
        }
    }
}
</style>
