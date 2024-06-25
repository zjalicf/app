<template>
    <vue-final-modal
        name="new-vault"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="step !== 'cloud'"
        :click-to-close="step !== 'cloud'"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '580px',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="new-vault-modal">
            <div class="new-vault-modal__steps">
                <div
                    v-if="step === 'new'"
                    class="new-vault-modal__steps__step new"
                >
                    <div class="new-vault-modal__steps__step__title">
                        New Vault
                    </div>
                    <div class="new-vault-modal__steps__step__body">
                        <NewVaultButtons
                            @new="onNewVault"
                            @open="onOpenVault"
                        />
                    </div>
                </div>

                <div
                    v-if="step === 'vault-setup'"
                    class="new-vault-modal__steps__step vault-setup"
                >
                    <div class="new-vault-modal__steps__step__title">
                        Setup Vault
                    </div>
                    <div class="new-vault-modal__steps__step__body">
                        <VaultSetup
                            :context="`new-vault`"
                            @create="onCreateVault"
                        />
                    </div>
                </div>

                <div
                    v-if="step === 'cloud'"
                    class="new-vault-modal__steps__step cloud"
                >
                    <div class="new-vault-modal__steps__step__title">
                        acreom Cloud
                    </div>
                    <div class="new-vault-modal__steps__step__body">
                        <p>
                            Sync this vault across devices, enable web access
                            and more. You can always change this later.
                            <a
                                href="https://acreom.com/docs/96b08203-9acc-4fb5-8cda-2f0858323672"
                                target="_blank"
                                >Learn more</a
                            >.
                        </p>
                        <CloudFeatures />
                        <div
                            class="new-vault-modal__steps__step__body__actions"
                        >
                            <CButton
                                type="secondary"
                                size="full-width"
                                @click="keepLocal"
                                >Use without cloud</CButton
                            >
                            <CButton
                                type="primary"
                                :disabled="loading"
                                size="full-width"
                                @click="enableCloud"
                                >Continue</CButton
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import NewVaultButtons from '~/components/vault/NewVaultButtons.vue';
import VaultSetup from '~/components/vault/VaultSetup.vue';
import CloudFeatures from '~/components/vault/CloudFeatures.vue';
import CButton from '~/components/CButton.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'NewSyncVaultModal',
    components: { CButton, CloudFeatures, VaultSetup, NewVaultButtons },
})
export default class NewSyncVaultModal extends Vue {
    step: 'new' | 'vault-setup' | 'cloud' = 'new';
    loading: boolean = false;

    onNewVault() {
        this.step = 'vault-setup';
    }

    onOpenVault() {
        this.step = 'cloud';
    }

    async onCreateVault() {
        if (this.$config.platform === 'web') {
            this.$utils.onboarding.setNewVaultType('remote');
            await this.$entities.vault.createNewVault(
                TrackingActionSource.NEW_VAULT,
            );
            this.$vfm.hideAll();
            return;
        }
        this.step = 'cloud';
    }

    @Watch('user', { deep: true })
    async handleUserChange(newValue: any, oldValue: any) {
        if (oldValue || !newValue) return;

        if (this.user) {
            await this.$vfm.hide('log-in');
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

    async keepLocal() {
        this.$utils.onboarding.setNewVaultType('local');
        await this.$entities.vault.createNewVault(
            TrackingActionSource.NEW_VAULT,
        );
        this.$vfm.hideAll();
    }

    async enableCloud() {
        if (!this.loggedIn) {
            this.showLoginModal();

            return;
        }

        this.loading = true;
        this.$utils.onboarding.setNewVaultType('remote');
        await this.$entities.vault.createNewVault(
            TrackingActionSource.NEW_VAULT,
        );
        this.$vfm.hideAll();
        this.loading = false;
    }

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    mounted() {
        if (this.$config.platform === 'web') {
            this.step = 'vault-setup';
        }
    }

    showLoginModal() {
        this.$vfm.show({
            component: () => import('~/components/modal/LogInModal.vue'),
        });
    }
}
</script>

<style scoped lang="scss">
.new-vault-modal {
    @include modal(20px);
    background: var(--search-modal-bg-color);
    padding: 30px 30px 30px;
    user-select: none;

    &__steps {
        &__step {
            &.new {
            }

            &.vault-setup {
                max-width: 230px;
                margin: 0 auto;
            }

            &.cloud {
                max-width: 330px;
                margin: 0 auto;
            }

            &__title {
                font-weight: 500;
                font-size: 24px;
                line-height: 155.2%;
                text-align: center;
                color: var(--modal-title-text-color);
                margin-bottom: 25px;
            }

            &__body {
                p {
                    @include font12-500;
                    text-align: center;
                    max-width: 330px;
                    margin: 0 auto 30px;
                    color: var(--modal-body-text-color);

                    a {
                        color: var(--modal-title-text-color);

                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }

                &__actions {
                    max-width: 313px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 145px 165px;
                    gap: 13px;
                    justify-content: space-around;

                    :deep(button) {
                        padding: 7px 16px;
                    }
                }
            }
        }
    }
}
</style>
