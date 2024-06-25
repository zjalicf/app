<template>
    <div class="vault">
        <h2>Vault Set-Up</h2>
        <div class="vault--description">
            In acreom, Vault is a folder with your data
        </div>
        <div class="vault--wrapper">
            <NewVaultButtons @new="onNewVault" @open="onOpenVault" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NewVaultButtons from '~/components/vault/NewVaultButtons.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: '',
    components: { NewVaultButtons },
    transition: 'fade',
})
export default class Vault extends Vue {
    onNewVault() {
        this.$router.push('/auth/vault-setup');
    }

    @TrackEvent(TrackingType.ONBOARDING, {
        action: TrackingAction.OPEN_EXISTING_VAULT,
    })
    onOpenVault() {
        this.$router.push('/auth/cloud');
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.VAULT_SET_UP,
        });
    }
}
</script>

<style lang="scss" scoped>
.vault {
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;

    &--wrapper {
        width: 100%;
        max-width: 600px;
        padding: 35px 30px 30px;
        background: var(--vault-wrapper-bg-color);
        border-radius: 30px;
    }

    @media (max-height: 680px) {
        height: auto;
        padding-top: 180px;
    }

    h2 {
        font-weight: 500;
        font-size: 24px;
        line-height: 37px;
        text-align: center;
        color: var(--auth-heading-color);
        margin-bottom: 6px;
    }

    &--description {
        font-weight: 500;
        font-size: 15px;
        line-height: 23px;
        text-align: center;
        color: var(--onboarding-description-text-color);
        max-width: 300px;
        margin: 0 auto 25px;
    }
}
</style>
