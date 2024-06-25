<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="true"
        :esc-to-close="!$shortcutsManager.isRecording"
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
            opacity: '0.8',
        }"
        transition="slide-fade"
        name="encryption-passphrase-modal"
        v-on="$listeners"
        @opened="setFocus"
    >
        <div class="encyption-passphrase">
            <div class="encyption-passphrase__header">
                Create new encryption password
            </div>
            <div class="encyption-passphrase__body">
                <div class="encyption-passphrase__body__text">
                    Enter new password that will be used to re-encrypt your
                    content
                </div>
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
                            valid: !passphraseError && passphrase.length > 0,
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
                <div
                    class="encyption-passphrase__body__input"
                    :class="{
                        error: !!confirmPassphraseError,
                    }"
                >
                    <label for="input">Confirm Password</label>
                    <input
                        id="input"
                        ref="confirmPassphraseInput"
                        v-model="confirmPassphrase"
                        :class="{
                            error: !!confirmPassphraseError,
                            valid:
                                !confirmPassphraseError &&
                                confirmPassphrase.length > 0,
                        }"
                        type="password"
                        @keydown.enter.prevent.stop="handleEnter(close)"
                    />
                    <p
                        :class="{
                            visible: !!confirmPassphraseError,
                        }"
                        class="hint"
                    >
                        {{ confirmPassphraseError }}
                    </p>
                </div>
            </div>
            <div class="encyption-passphrase__footer">
                <CButton
                    type="primary"
                    size="full-width"
                    :disabled="!passphrasesMatch"
                    @click="handleEnter(close)"
                >
                    Continue
                </CButton>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { DatabaseWrapper } from '~/plugins/workers/database';

@Component({
    components: { CButton, CInput },
    name: 'EncryptionPassphraseModal',
})
export default class EncryptionPassphraseModal extends Vue {
    type = 'password';

    passphrase: string = '';
    passphraseError: string = '';

    confirmPassphrase: string = '';
    confirmPassphraseError: string = '';

    @Prop()
    privateKeys!: any;

    @Prop()
    recoveryId!: string;

    $refs!: {
        passphraseInput: HTMLInputElement;
        confirmPassphraseInput: HTMLInputElement;
    };

    get user() {
        return this.$store.getters['user/user'];
    }

    async setFocus() {
        await this.$nextTick();
        this.$refs.passphraseInput?.focus();
    }

    validatePassphrase(): boolean {
        const isLongEnough = this.passphrase.length >= 8;
        const hasNumber = /\d/.test(this.passphrase);
        const hasUpperCase = /[A-Z]/.test(this.passphrase);
        const hasValue = this.passphrase.length > 0;
        this.passphraseError = '';
        if (!hasUpperCase && hasValue) {
            this.passphraseError =
                'Password must contain at least one uppercase letter';
        }
        if (!hasNumber && hasValue) {
            this.passphraseError = 'Password must contain at least one number';
        }
        if (!isLongEnough && hasValue) {
            this.passphraseError =
                'Password must be at least 8 characters long';
        }
        return isLongEnough && hasNumber && hasUpperCase;
    }

    validateConfirmPassphrase(): boolean {
        const isLongEnough = this.confirmPassphrase.length >= 8;
        const hasNumber = /\d/.test(this.confirmPassphrase);
        const hasUpperCase = /[A-Z]/.test(this.confirmPassphrase);
        const isSame = this.passphrase === this.confirmPassphrase;
        const hasValue = this.confirmPassphrase.length > 0;
        this.confirmPassphraseError = '';

        if (!isSame && isLongEnough && hasNumber && hasUpperCase && hasValue) {
            this.confirmPassphraseError = 'Password do not match';
        }
        if (!hasUpperCase && hasValue) {
            this.confirmPassphraseError =
                'Password must contain at least one uppercase letter';
        }
        if (!hasNumber && hasValue) {
            this.confirmPassphraseError =
                'Password must contain at least one number';
        }
        if (!isLongEnough && hasValue) {
            this.confirmPassphraseError =
                'Password must be at least 8 characters long';
        }
        return isLongEnough && hasNumber && hasUpperCase && isSame;
    }

    get passphrasesMatch() {
        const passphraseValid = this.validatePassphrase();
        const confimPassphraseValid = this.validateConfirmPassphrase();
        return passphraseValid && confimPassphraseValid;
    }

    async handleEnter(close: () => void) {
        if (!this.passphrasesMatch) {
            return;
        }
        try {
            const passphraseSalt = this.$encryption.generateSalt();
            const hkdfSalt = this.$encryption.generateSalt();
            const passphraseHash = await this.$encryption.passwordDerivedSecret(
                this.passphrase,
                passphraseSalt,
            );
            const hkdf = this.$encryption.deriveHKDF(passphraseHash, hkdfSalt);
            const encryptedPrivateKeys =
                this.$encryption.encryptUserPrivateKeys(this.privateKeys, hkdf);

            await this.$encryption.storeKeyInSession(hkdf, this.user.id);
            await this.$store.dispatch('user/updateRemote', {
                id: this.user.id,
                passphraseSalt,
                hkdfSalt,
                privateKeys: encryptedPrivateKeys,
            });
            await (
                this.$serviceRegistry.service(
                    ServiceKey.DATABASE,
                ) as DatabaseWrapper
            ).RecoveryKeys.delete('', { id: this.recoveryId });
            await this.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                {
                    payload: {
                        data: hkdf,
                        userId: this.user.id,
                    },
                    callerContext:
                        'RecoveryNewEncryptionPassphraseModal.vue unlock private keys',
                },
            );
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.ENABLE_ENCRYPTION,
                {},
            );

            this.$store.dispatch(
                'vault/reloadData',
                this.$store.getters['vault/activeVaultId'],
            );
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.INITIALIZE_VAULTS_SYNC,
                {},
            );
            this.passphrase = '';
            this.confirmPassphrase = '';
            this.$vfm.hideAll();
        } catch (e) {
            console.log(e);
            close();
        }
    }
}
</script>

<style scoped lang="scss">
.encyption-passphrase {
    @include modal;
    user-select: none;

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
        //margin-top: 22px;
        padding: 6px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
