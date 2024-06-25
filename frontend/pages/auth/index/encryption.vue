<template>
    <div class="auth-encryption">
        <div class="auth-encryption__content">
            <div class="auth-encryption__content__title">
                <h1>End-to-End Encryption</h1>
                <p>
                    Enter password to enable End-to-End encryption for your
                    sync. You can always enable encryption later.
                </p>
            </div>
            <div class="auth-encryption__content__body">
                <span>Password</span>
                <div
                    class="auth-encryption__content__body__input-wrapper"
                    :class="{
                        error: !!passphraseError,
                        valid: !passphraseError && passphrase.length > 0,
                    }"
                >
                    <input
                        ref="passphraseInput"
                        v-model="passphrase"
                        :type="inputType"
                        @keydown.enter.prevent.stop="enableEncryption"
                    />
                    <button
                        tabindex="-1"
                        class="
                            auth-encryption__content__body__input-wrapper__reveal
                        "
                        @click.stop.prevent="changeInputType"
                    >
                        <IconVisibilityOn
                            v-if="inputType === 'password'"
                            size="16"
                        />
                        <IconVisibilityOff v-else size="16" />
                    </button>
                </div>
                <p
                    :class="{
                        visible: !!passphraseError,
                    }"
                >
                    {{ passphraseError }}
                </p>
                <span>Confirm Password</span>
                <div
                    class="auth-encryption__content__body__input-wrapper"
                    :class="{
                        error: !!confirmPassphraseError,
                        valid:
                            !confirmPassphraseError &&
                            confirmPassphrase.length > 0,
                    }"
                >
                    <input
                        ref="confirmPassphraseInput"
                        v-model="confirmPassphrase"
                        :type="inputType"
                        @keydown.enter.prevent.stop="enableEncryption"
                    />
                    <button
                        tabindex="-1"
                        class="
                            auth-encryption__content__body__input-wrapper__reveal
                        "
                        @click.stop.prevent="changeInputType"
                    >
                        <IconVisibilityOn
                            v-if="inputType === 'password'"
                            size="16"
                        />
                        <IconVisibilityOff v-else size="16" />
                    </button>
                </div>
                <p
                    :class="{
                        visible: !!confirmPassphraseError,
                    }"
                >
                    {{ confirmPassphraseError }}
                </p>
            </div>
            <div class="auth-encryption__content__actions">
                <CButton
                    :disabled="!passphrasesMatch"
                    type="primary"
                    size="full-width"
                    @click="enableEncryption"
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
import ComputerWebcamVideoCircle from '~/components/streamline/ComputerWebcamVideoCircle.vue';
import IconVisibilityOn from '~/components/icons/IconVisibilityOn.vue';
import IconVisibilityOff from '~/components/icons/IconVisibilityOff.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    components: {
        IconVisibilityOff,
        IconVisibilityOn,
        ComputerWebcamVideoCircle,
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
    inputType: string = 'password';

    passphrase: string = '';
    passphraseError: string = '';

    confirmPassphrase: string = '';
    confirmPassphraseError: string = '';

    $refs!: {
        passphraseInput: HTMLInputElement;
        confirmPassphraseInput: HTMLInputElement;
    };

    get user() {
        return this.$store.getters['auth/user'];
    }

    async setFocus() {
        await this.$nextTick();
        this.$refs.passphraseInput?.focus();
    }

    changeInputType() {
        if (this.inputType === 'password') {
            this.inputType = 'text';
            return;
        }
        this.inputType = 'password';
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
        return (
            !this.passphraseError && isLongEnough && hasNumber && hasUpperCase
        );
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

    async enableEncryption() {
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
            const privateKeys = this.$encryption.createUserPrivateKeys();
            const encryptedPrivateKeys =
                this.$encryption.encryptUserPrivateKeys(privateKeys, hkdf);

            await this.$encryption.storeKeyInSession(hkdf, this.user.id);
            await this.$store.dispatch('user/updateRemote', {
                id: this.user.id,
                passphraseSalt,
                hkdfSalt,
                privateKeys: encryptedPrivateKeys,
            });
            await this.$serviceRegistry.invoke(
                ServiceKey.DATABASE,
                DatabaseServiceAction.UNLOCK_PRIVATE_KEYS,
                {
                    payload: {
                        data: hkdf,
                        userId: this.user.id,
                    },
                    callerContext: 'encryption.vue enableEncryption',
                },
            );
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.ENABLE_ENCRYPTION,
                {},
            );

            await this.$entities.vault.createNewVault(
                TrackingActionSource.ONBOARDING,
            );

            this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
                action: TrackingAction.ENCRYPTION_COMPLETE,
            });

            await this.$router.push('/auth/generate-recovery');
            setTimeout(() => {
                this.passphrase = '\0';
            }, 200);
        } catch (e) {
            console.log(e);
            this.$router.push('/auth/generate-recovery');
        }
    }

    mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.ENCRYPTION_START,
        });
        this.$utils.onboarding.setNewVaultType('remote');
    }
}
</script>
<style lang="scss" scoped>
.auth-encryption {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-height: 680px) {
        height: auto;
        padding-top: 180px;
    }

    &__content {
        margin-top: 60px;
        padding: 45px 143px 39px;
        border-radius: 30px;
        background: var(--vault-wrapper-bg-color);

        &__title {
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
            }
        }

        &__body {
            padding-bottom: 16px;

            &__text {
                margin-bottom: 14px;
            }

            &__input-wrapper {
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                border-radius: 6px;
                background: var(--vault-settings-input-bg-color);
                padding: 2px 2px 2px 4px;

                &.error {
                    padding: 0 0 0 2px;
                    border: 2px solid var(--danger-color);
                    margin-bottom: 0px;
                }

                &.valid {
                    padding: 0 0 0 2px;
                    border: 2px solid var(--accent-color);
                }

                input {
                    @include inputMetaStyles;
                    @include font12-500;
                    color: var(--vault-settings-input-text-color);
                    border-radius: 5px;
                    width: 100%;
                    outline: none;
                    padding: 5px 2px 5px 9px;

                    &::placeholder {
                        color: var(--vault-settings-input-placeholder-color);
                    }
                }

                &__reveal {
                    padding: 6px;
                    color: var(--vault-settings-input-placeholder-color);

                    &:hover,
                    &:focus {
                        color: var(--vault-settings-input-text-color);
                    }
                }
            }

            span {
                @include font12-500;
            }

            p {
                @include animateOpacity;
                font-style: normal;
                font-weight: 500;
                font-size: 12px;
                line-height: 16px;
                color: var(--danger-color);
                opacity: 0;

                &.visible {
                    opacity: 1;
                }
            }
        }

        &__actions {
            margin: 0 auto;

            :deep(button) {
                padding: 7px 16px;
            }
        }
    }
}
</style>
