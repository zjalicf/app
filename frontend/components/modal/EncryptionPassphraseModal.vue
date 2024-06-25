<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="hasLocalVaults"
        :esc-to-close="hasLocalVaults"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '420px',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '1',
        }"
        transition="slide-fade"
        name="encryption-passphrase-modal"
        v-on="$listeners"
        @opened="setFocus"
    >
        <div class="encyption-passphrase">
            <div
                class="encyption-passphrase__logout"
                @click.stop.prevent="handleLogout"
            >
                Logout
            </div>

            <div class="encyption-passphrase__header">
                Unlock encrypted vaults
            </div>
            <div class="encyption-passphrase__body">
                <div
                    class="encyption-passphrase__body__input"
                    :class="{
                        error: !!passphraseError,
                    }"
                >
                    <label for="input">Password</label>
                    <input
                        id="input"
                        ref="passphraseInput"
                        v-model="passphrase"
                        :class="{
                            error: !!passphraseError,
                        }"
                        type="password"
                        @keydown.enter.prevent.stop="handleEnter(close)"
                    />
                    <p
                        :class="{
                            visible: !!passphraseError,
                        }"
                        class="hint"
                    >
                        {{ passphraseError }}
                    </p>
                </div>
            </div>
            <div class="encyption-passphrase__footer">
                <CButton
                    type="primary"
                    size="full-width"
                    :disabled="!validPassphrase"
                    @click="handleEnter(close)"
                >
                    Continue
                </CButton>
            </div>
            <div class="encyption-passphrase__recovery">
                <div @click="openRecoveryModal">
                    Forgot password?
                    <span class="encyption-passphrase__recovery__action"
                        >Recover account</span
                    >
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';
import { IUser } from '~/workers/database/indexeddb/types';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    components: { CButton, CInput },
    name: 'EncryptionPassphraseModal',
})
export default class EncryptionPassphraseModal extends Vue {
    passphrase: string = '';
    passphraseError: string = '';

    $refs!: {
        passphraseInput: HTMLInputElement;
    };

    get hasLocalVaults() {
        return !!this.$store.getters['vault/local'].length;
    }

    get user(): IUser {
        return this.$store.getters['user/user'];
    }

    async setFocus() {
        await this.$nextTick();
        this.$refs?.passphraseInput?.focus?.();
    }

    async openRecoveryModal() {
        this.$vfm.show({
            component: () => import('~/components/modal/RecoveryModal.vue'),
        });
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOG_OUT,
    })
    handleLogout() {
        this.$store.dispatch('auth/logout');
        this.$vfm.hideAll();
    }

    get validPassphrase() {
        if (this.passphrase.length > 0) return true;
        this.passphraseError = '';
        return false;
    }

    async handleEnter(close: () => void) {
        if (!this.validPassphrase) return;
        const passphraseHash = await this.$encryption.passwordDerivedSecret(
            this.passphrase,
            this.user.passphraseSalt!,
        );
        const hkdf = this.$encryption.deriveHKDF(
            passphraseHash,
            this.user.hkdfSalt!,
        );
        try {
            const passwordIsCorrect = await this.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                {
                    payload: {
                        data: hkdf,
                        userId: this.user.id,
                    },
                    callerContext:
                        'EnableEncryptionModal.vue unlock private keys',
                },
            );
            if (!passwordIsCorrect) {
                this.passphraseError = 'Incorrect passphrase';
                this.$refs.passphraseInput?.setSelectionRange(
                    0,
                    this.passphrase.length,
                );
                return;
            }

            await this.$encryption.storeKeyInSession(hkdf, this.user.id);
            this.passphraseError = '';
            this.passphrase = '';
            this.$emit('success');
        } catch (e) {}
        close();
    }
}
</script>

<style scoped lang="scss">
.encyption-passphrase {
    @include modal;
    user-select: none;

    &__logout {
        @include font12-600;
        padding: 10px 16px;
        position: absolute;
        right: 0;
        top: 0;

        .windows & {
            right: 100px;
        }
    }

    &__header {
        @include font14-600;
        color: var(--modal-title-text-color);
        padding: 16px 16px 4px;
    }

    &__body {
        padding: 0px 16px;

        &__text {
            margin-bottom: 14px;
        }

        &__input {
            margin-bottom: 18px;

            &.error {
                margin-bottom: 0px;
            }
        }

        label {
            @include font12-500;
        }

        input,
        textarea {
            @include inputMetaStyles;
            @include font12-500;
            min-height: 36px;
            display: block;
            background: var(--vault-settings-input-bg-color);
            color: var(--vault-settings-input-text-color);
            border-radius: 5px;
            width: 100%;
            outline: none;
            padding: 5px 8px;

            &::placeholder {
                color: var(--vault-settings-input-placeholder-color);
            }
            &.error {
                padding: 2px 4px;
                border: 2px solid var(--danger-color);
            }
            &.valid {
                padding: 2px 4px;
                border: 2px solid var(--accent-color);
            }
        }
        p {
            &.hint {
                font-style: normal;
                font-weight: 500;
                font-size: 12px;
                line-height: 18px;
                color: var(--danger-color);
                @include animateOpacity;
                opacity: 0;

                &.visible {
                    opacity: 1;
                }
            }
        }
    }

    &__footer {
        padding: 6px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }

    &__recovery {
        padding: 0px 16px 16px;
        color: var(--modal-body-text-color);
        text-align: center;
        @include font12-500;

        &__action {
            color: var(--modal-title-text-color);
            cursor: pointer;
        }
    }
}
</style>
