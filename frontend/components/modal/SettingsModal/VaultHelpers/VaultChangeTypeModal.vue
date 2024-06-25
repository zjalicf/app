<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '372px',
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
        <div
            v-shortkey="['shift', 'enter']"
            class="vault-change-type-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="vault-change-type-modal__header">
                <div class="vault-change-type-modal__header__title">
                    Change Vault Type
                </div>
            </div>
            <div class="vault-change-type-modal__body">
                This change will affect vault functionality<span
                    v-if="!loggedIn"
                    >. </span
                ><span v-if="!loggedIn" class="sign-in" @click="signIn(close)"
                    >Sign in</span
                ><span v-if="!loggedIn"> to create and use Cloud Vautls.</span>
            </div>
            <div class="vault-change-type-modal__type-select">
                <button
                    class="vault-change-type-modal__type-select__button"
                    :class="{ selected: selectedOption === 'local' }"
                    @click="selectedOption = 'local'"
                >
                    <div
                        class="
                            vault-change-type-modal__type-select__button__icon
                        "
                    >
                        <DesktopComputerIcon class="icon" size="20" />
                    </div>
                    <div
                        class="
                            vault-change-type-modal__type-select__button__text
                        "
                    >
                        <div
                            class="
                                vault-change-type-modal__type-select__button__text__title
                            "
                        >
                            Local Vault
                        </div>
                        <div
                            class="
                                vault-change-type-modal__type-select__button__text__subtitle
                            "
                        >
                            Offline vault, data stored on your device
                        </div>
                    </div>
                </button>

                <button
                    class="vault-change-type-modal__type-select__button"
                    :class="{ selected: selectedOption === 'remote' }"
                    :disabled="!loggedIn"
                    @click="selectedOption = 'remote'"
                >
                    <div
                        class="
                            vault-change-type-modal__type-select__button__icon
                        "
                    >
                        <CloudIcon class="icon" size="20" />
                    </div>
                    <div
                        class="
                            vault-change-type-modal__type-select__button__text
                        "
                    >
                        <div
                            class="
                                vault-change-type-modal__type-select__button__text__title
                            "
                        >
                            Cloud Vault
                            <span v-if="!loggedIn">(account required)</span>
                        </div>
                        <div
                            class="
                                vault-change-type-modal__type-select__button__text__subtitle
                            "
                        >
                            Data synced with acreom cloud
                        </div>
                    </div>
                </button>
            </div>
            <div class="vault-change-type-modal__footer">
                <div class="vault-change-type-modal__footer__actions">
                    <div>
                        <CButton
                            :disabled="isDisabled"
                            type="danger"
                            tabindex="0"
                            @click="modalAccept(close)"
                            >Confirm
                        </CButton>
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CloudIcon, DesktopComputerIcon } from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';
import { IVault } from '~/@types';

@Component({
    name: 'VaultChangeTypeModal',
    components: {
        CButton,
        CloudIcon,
        DesktopComputerIcon,
    },
})
export default class VaultChangeTypeModal extends Vue {
    @Prop()
    vault!: IVault;

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    signIn(close: Function) {
        this.$nuxt.$emit('settings:tab', 'myAccount');
        close();
    }

    selectedOption = this.vault.type;

    get isDisabled() {
        return this.vault.type === this.selectedOption;
    }

    modalAccept(close: any) {
        if (this.isDisabled) return;
        this.$emit('vault:change-type', this.selectedOption);
        close();
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.vault-change-type-modal {
    @include modal;
    user-select: none;
    padding: 0px;
    margin: 0 auto;

    &__header {
        padding: 16px 16px 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        @include font12-500;
        padding: 0px 16px 12px;
        color: var(--modal-body-text-color);

        .sign-in {
            color: var(--vault-change-modal-link-color);

            &:hover {
                text-decoration: underline;
            }
        }
    }

    &__type-select {
        padding: 2px 16px 16px 12px;

        &__button {
            outline: none;
            border-radius: 6px;
            padding: 11px 26px 13px;
            display: flex;
            align-items: center;
            width: 100%;
            background: var(--vault-change-option-bg-color);

            &:not(:disabled):not(.selected):hover {
                background: var(--vault-change-option-bg-color__hover);
            }

            &:disabled {
                opacity: 0.6;
            }

            &.selected {
                color: var(--vault-change-option-text-color__active);
                background: var(--vault-change-option-bg-color__active);
                border: 2px solid var(--accent-color);
                padding: 9px 24px 11px;

                .icon,
                .vault-change-type-modal__type-select__button__text__subtitle {
                    color: var(--vault-change-option-text-color__active);
                }
            }

            &:not(:last-of-type) {
                margin-bottom: 10px;
            }

            &__icon {
                color: var(--vault-change-option-icon-color);
                margin-right: 21px;
            }

            &__text {
                color: var(--vault-change-option-text-color);
                text-align: left;

                &__title {
                    color: var(--vault-change-option-text-title-color);
                    @include font12-600;

                    span {
                        color: var(--vault-change-option-text-title-span-color);
                    }
                }

                &__subtitle {
                    @include font12-500;
                }
            }
        }
    }

    &__footer {
        padding: 0px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        &__actions {
            display: flex;
            gap: 6px;
            align-items: center;
            flex-direction: row-reverse;
        }
    }
}
</style>
