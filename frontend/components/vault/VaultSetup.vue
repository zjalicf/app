<template>
    <div class="vault-setup">
        <div
            class="vault-setup__image"
            :style="{
                backgroundColor: color,
            }"
        >
            <span>{{ name ? name[0] : '#' }}</span>
        </div>
        <div class="vault-setup__name">
            <div class="vault-setup__name__input">
                <button
                    ref="changeColorButton"
                    class="vault-setup__name__input__color-button"
                    @click="colorPickerHandler"
                >
                    <span :style="{ background: color }"> </span>
                </button>
                <input
                    id="name"
                    ref="input"
                    :value="name"
                    placeholder="Vault Name"
                    type="text"
                    spellcheck="false"
                    autocomplete="off"
                    @input="
                        $utils.onboarding.setNewVaultName($event.target.value)
                    "
                    @keydown.enter.prevent="handleEnter($event)"
                />
            </div>
            <div class="vault-setup__name__actions">
                <CButton
                    type="primary"
                    size="full-width"
                    :disabled="name.length === 0 || loading"
                    class="meta-action continue"
                    @click="createVault"
                >
                    Create Vault
                </CButton>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AColorPicker from '~/components/system/AColorPicker.vue';
import { VAULT_COLORS } from '~/constants';
import { SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import CButton from '~/components/CButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'VaultSetup',
    components: { CButton },
})
export default class VaultSetup extends Vue {
    @Prop({ default: null })
    context!: string | null;

    loading: boolean = false;
    isElectron = isElectron();

    get color() {
        return this.$store.getters['onboarding/config'].color;
    }

    get name() {
        return this.$store.getters['onboarding/config'].name;
    }

    $refs!: {
        input: HTMLInputElement;
        changeColorButton: HTMLButtonElement;
    };

    colorPickerHandler() {
        this.$dropdown.show({
            // @ts-ignore
            parent: this.$refs.changeColorButton,
            component: AColorPicker,
            bind: {
                'colors-old': VAULT_COLORS.map(color => ({ id: color, color })),
                value: this.color,
            },
            on: {
                select: (value: string) => {
                    this.$tracking.trackEventV2(TrackingType.VAULT, {
                        action: TrackingAction.CHANGE_COLOR,
                        source:
                            this.context === 'onboarding'
                                ? TrackingActionSource.ONBOARDING
                                : TrackingActionSource.NEW_VAULT,
                    });
                    this.$utils.onboarding.setNewVaultColor(value);
                },
            },
            popperOptions: {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [6, 0],
                        },
                    },
                ],
            },
        });
    }

    async handleEnter(event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (this.name.length > 0) {
            await this.createVault();
        }
    }

    async createVault() {
        if (this.$config.platform === 'web') {
            this.$emit('create');
            this.$utils.onboarding.setNewVaultOpenExisting(false);
            return;
        }
        this.loading = true;
        try {
            const vaultPath = await this.openDialog({
                canCreate: true,
                buttonLabel: 'Create Vault',
            });

            if (!vaultPath) {
                this.loading = false;
                return;
            }

            this.$utils.onboarding.setNewVaultPath(vaultPath);
            this.$utils.onboarding.setNewVaultOpenExisting(false);

            this.$emit('create');
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }

        this.loading = false;
    }

    async openDialog(
        meta: { canCreate: boolean; buttonLabel?: string } = {
            canCreate: false,
        },
    ): Promise<string | null> {
        return await (window as SafeElectronWindow).electron.selectDirectory(
            meta,
        );
    }

    mounted() {
        this.$nextTick(() => {
            this.$refs.input.focus({
                preventScroll: true,
            });
        });
    }
}
</script>
<style lang="scss" scoped>
.vault-setup {
    &__image {
        margin: 0 auto 30px;
        height: 68px;
        width: 68px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 45px;
        line-height: 155.2%;
        color: var(--new-vault-image-text-color);
    }
    &__name {
        &__input {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 25px;

            &__color-button {
                flex-shrink: 0;
                outline: none;
                display: block;
                padding: 10px;
                background-color: var(--vault-settings-input-bg-color);
                border-radius: 6px;

                span {
                    display: block;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                }
            }

            input {
                @include inputMetaStyles;
                @include font12-500;
                padding: 8px 13px;
                background: var(--vault-settings-input-bg-color);
                width: 100%;
                color: var(--vault-settings-input-text-color);
                border-radius: 6px;
                outline: none;

                &::placeholder {
                    color: var(--vault-settings-input-placeholder-color);
                }
            }
        }

        &__actions {
            :deep(button) {
                padding-top: 7px;
                padding-bottom: 7px;
            }
        }
    }
}
</style>
