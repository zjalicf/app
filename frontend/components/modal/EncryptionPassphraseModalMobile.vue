<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        name="encryption-passphrase-modal"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="hasLocalVaults"
        :esc-to-close="hasLocalVaults"
        overlay-transition="fade"
        :focus-retain="false"
        :styles="{
            paddingLeft: '0px',
            paddingRight: '0px',
            paddingTop: 'var(--ion-safe-area-top)',
            paddingBottom: 'var(--ion-safe-area-bottom)',
            height: modalHeight,
        }"
        :content-style="{
            maxWidth: '100%',
            width: '100%',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '1',
        }"
        transition="slide-fade"
        v-on="$listeners"
        @opened="setFocus"
    >
        <div class="unlock-vault-modal" :style="style">
            <div>
                <div class="unlock-vault-modal__header" @click="handleLogout">
                    Logout
                </div>
                <div class="unlock-vault-modal__title">Unlock vault</div>
            </div>
            <div class="unlock-vault-modal__form__wrapper">
                <div class="unlock-vault-modal__form">
                    <label for="input">Password</label>
                    <input
                        id="input"
                        ref="passphraseInput"
                        v-model="passphrase"
                        :class="{
                            error: !!passphraseError,
                        }"
                        placeholder="Password"
                        type="password"
                        @input="passphraseError = ''"
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
                    <button
                        :disabled="!validPassphrase"
                        @click.stop.prevent="handleEnter(close)"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { animate, AnimationControls } from 'motion';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';
import { IUser } from '~/workers/database/indexeddb/types';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

let runningAnimation: AnimationControls | null = null;
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

    modalHeight = '100vh';

    get keyboardWillShow() {
        return this.$utils.mobile.keyboardOpen;
    }

    @Watch('keyboardWillShow')
    onWillShow(value: boolean) {
        if (this.$config.os === 'android') return;
        const fullHeight = window.innerHeight;
        const keyboardHeight = this.$store.getters['mobile/keyboardHeight'];
        if (runningAnimation) runningAnimation.stop();
        if (value) {
            runningAnimation = animate(
                (progress: number) => {
                    this.modalHeight = `${
                        fullHeight - progress * keyboardHeight
                    }px`;
                },
                { duration: 0.15 },
            );
        } else {
            runningAnimation = animate(
                (progress: number) => {
                    this.modalHeight = `${
                        fullHeight - (1 - progress) * keyboardHeight
                    }px`;
                },
                { duration: 0.15 },
            );
        }
    }

    async setFocus() {
        await this.$nextTick();
        this.$refs?.passphraseInput?.focus?.();
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
                        'EncryptionPassphraseModalMobile.vue unlock private keys',
                },
            );
            if (!passwordIsCorrect) {
                this.passphraseError = 'Incorrect password';
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
.unlock-vault-modal {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;

    &__title {
        color: #fff;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        letter-spacing: -0.24px;
        padding: 20px;
    }

    &__header {
        padding: 20px;
        color: $blueGrey400;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: -0.24px;
    }

    &__form {
        &__wrapper {
            padding: 0px 15px 20px;
            height: min-content;
        }
        padding: 20px;
        border-radius: 20px;
        background: $darkBlack;
        label {
            display: block;
            @include font12-500;
            color: $blueGrey500;
            margin-bottom: 3px;
        }
        input {
            width: 100%;
            background: $blueGrey900;
            display: block;
            outline: none;
            padding: 12px 18px;
            border-radius: 12px;
            @include font14-500;
            margin-bottom: 20px;

            &.error {
                padding: 10px 16px;
                border: 2px solid var(--danger-color);
            }

            &::placeholder {
                color: $blueGrey500;
            }
        }

        button {
            display: block;
            outline: none;
            width: 100%;
            padding: 12px 18px;
            background: $white;
            color: $black;
            font-size: 15.83px;
            font-style: normal;
            font-weight: 600;
            line-height: 22px;
            border-radius: 12px;

            &:disabled {
                opacity: 0.5;
            }
        }

        p {
            @include font10-700;
            text-transform: uppercase;
            transform: translateY(-20px);
            position: absolute;
            color: $danger;
            line-height: 20px;
        }
    }
}
.encyption-passphrase {
    user-select: none;

    &__logout {
        @include font12-600;
        padding: 10px 16px;
        position: absolute;
        right: 0;
        top: 0;
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
