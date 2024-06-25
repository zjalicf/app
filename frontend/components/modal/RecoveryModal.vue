<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="true"
        :esc-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '600px',
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
        name="recovery-modal"
        v-on="$listeners"
    >
        <div class="recovery-modal" @drop="handleDrop">
            <div
                class="recovery-modal__logout"
                @click.stop.prevent="handleLogout"
            >
                Logout
            </div>
            <div class="recovery-modal__header">
                <div class="recovery-modal__header__title">
                    Recover Encryption password
                </div>
            </div>
            <div class="recovery-modal__body">
                <div class="recovery-modal__body__description">
                    Upload recovery file or enter your data manually to change
                    encryption of all your vaults
                </div>
                <div v-if="!recoveryJSON" class="recovery-modal__body__select">
                    <div class="recovery-modal__body__select__header">
                        Upload recovery key
                    </div>
                    <div class="recovery-modal__body__select__action">
                        <label
                            for="file-upload"
                            class="recovery-modal__body__select__action--input"
                            >Choose a file or drag and drop recovery JSON</label
                        >
                        <input
                            id="file-upload"
                            type="file"
                            placeholder="Select a file"
                            multiple="false"
                            @change="selectRecoveryJSON"
                        />
                    </div>
                </div>
                <div
                    v-if="!!recoveryJSON"
                    class="recovery-modal__body__recovery"
                >
                    <div class="recovery-modal__body__recovery__section">
                        <div
                            class="
                                recovery-modal__body__recovery__section__label
                            "
                        >
                            Recovery Key ID
                        </div>
                        <div
                            class="
                                recovery-modal__body__recovery__section__value
                            "
                        >
                            {{ recoveryJSON.id }}
                        </div>
                    </div>

                    <div class="recovery-modal__body__recovery__section">
                        <div
                            class="
                                recovery-modal__body__recovery__section__label
                            "
                        >
                            Recovery Key
                        </div>
                        <div
                            class="
                                recovery-modal__body__recovery__section__value
                            "
                        >
                            {{ recoveryJSON.recoveryKey }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="recovery-modal__footer">
                <CButton
                    class="recovery-modal__footer--cancel"
                    type="secondary"
                    @click="cancelRecovery(close)"
                    >Cancel</CButton
                >
                <CButton
                    class="recovery-modal__footer--continue"
                    type="primary"
                    @click="recoverAccount(close)"
                    >Continue</CButton
                >
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    components: { CButton, CInput },
    name: 'RecoveryModal',
})
export default class RecoveryModal extends Vue {
    recoveryJSON: any = null;

    cancelRecovery(close: any) {
        close();
    }

    async recoverAccount(close: any) {
        const response = await this.$serviceRegistry.invoke<{
            isValid: boolean;
            keys: any;
        }>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_PRIVATE_KEYS_FROM_RECOVERY,
            {
                payload: this.recoveryJSON,
                callerContext: 'RecoveryModal.vue recoverAccount',
            },
        );
        if (!response) return;
        const { isValid, keys } = response;
        if (!isValid) return;
        this.$vfm.show({
            component: () =>
                import(
                    '~/components/modal/RecoveryNewEncryptionPassphraseModal.vue'
                ),
            bind: {
                privateKeys: keys,
                recoveryId: this.recoveryJSON.id,
            },
        });
        close();
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOG_OUT,
    })
    handleLogout() {
        this.$store.dispatch('auth/logout');
        this.$vfm.hideAll();
    }

    async selectRecoveryJSON(event: InputEvent) {
        const file = (event.target as EventTarget & { files: File[] })
            ?.files?.[0];
        if (!file) {
            return;
        }
        await this.processFile(file);
    }

    async handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files[0];
        if (!file) {
            return;
        }

        await this.processFile(file);
    }

    async processFile(file: File) {
        const recoveryJSON = await this.$encryption.parseFileToRecoveryJSON(
            file,
        );
        if (!recoveryJSON) {
            return;
        }
        const isValid = await this.$encryption.validateRecoveryJSON(
            recoveryJSON,
        );
        if (!isValid) {
            return;
        }
        this.recoveryJSON = recoveryJSON;
    }
}
</script>

<style scoped lang="scss">
.recovery-modal {
    @include modal;
    user-select: none;
    padding: 45px 122px;

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

        &__title {
            @include font-h1;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        padding: 0px 16px;

        &__description {
            @include font12-500;
            color: var(--modal-body-text-color);
            padding: 10px 18px 21px;
            text-align: center;
        }

        &__select {
            border-radius: 12px;
            background: var(--share-modal-access-bg-color);
            padding: 14px 11px 14px 22px;
            margin-bottom: 16px;

            &__header {
                @include font12-500;
            }

            &__action {
                input[type='file'] {
                    display: none;
                }

                &--input {
                    @include font12-500;
                    color: var(--modal-body-text-color);
                    border-radius: 12px;
                    padding: 4px 0;
                    padding-right: auto;
                    cursor: pointer;
                }
            }
        }

        &__recovery {
            padding: 0 0 15px;
            &__section {
                padding: 4px 0;

                &__label {
                }
                &__value {
                    @include font14-500;
                    font-family: 'Courier New';
                    border-radius: 12px;
                    background: var(--share-modal-access-bg-color);
                    padding: 8px 12px;
                    max-width: 326px;
                    word-break: break-all;
                }
            }
        }

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
        gap: 8px;

        &--cancel {
        }

        &--continue {
            width: 100%;
            text-align: center;
            display: block;
        }
    }
}
</style>
