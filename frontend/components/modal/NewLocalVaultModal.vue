<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :focus-retain="false"
        :content-style="{
            maxWidth: '340px',
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
        <div class="new-sync-vault-modal">
            <div class="new-sync-vault-modal--title">New Local Vault</div>
            <div
                class="new-sync-vault-modal--image"
                :style="{
                    backgroundColor: color,
                }"
            >
                <span>{{ name ? name[0] : '#' }}</span>
            </div>
            <div class="new-sync-vault-modal--name">
                <div class="new-sync-vault-modal--name--label">
                    <label for="name">Vault Name</label>
                </div>
                <div class="new-sync-vault-modal--name--input">
                    <button
                        ref="changeColorButton"
                        class="new-sync-vault-modal--color-button"
                        @click="colorPickerHandler"
                    >
                        <span :style="{ background: color }"> </span>
                    </button>
                    <input
                        id="name"
                        ref="input"
                        v-model="name"
                        placeholder="Vault Name"
                        type="text"
                        @keydown.enter.prevent="handleEnter"
                    />
                </div>
            </div>
            <div class="new-sync-vault-modal--actions">
                <CButton type="secondary" tabindex="-1" @click="close">
                    Cancel
                </CButton>
                <CButton
                    type="primary"
                    tabindex="-1"
                    :disabled="name.length === 0"
                    @click="selectPath"
                >
                    Select Path
                </CButton>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { SafeElectronWindow } from '~/@types';
import { VAULT_COLORS } from '~/constants';
import AColorPicker from '~/components/system/AColorPicker.vue';
import CButton from '~/components/CButton.vue';

@Component({
    name: 'NewLocalVaultModal',
    components: { CButton },
})
export default class NewLocalVaultModal extends Vue {
    name: string = '';
    loading: boolean = false;
    path: string | null = null;
    color: string = '#FDA4AF';

    $refs!: {
        input: HTMLInputElement;
        changeColorButton: HTMLButtonElement;
    };

    handleEnter(event: KeyboardEvent) {
        if (event.isComposing && !this.$utils.isMobile) return;

        if (this.name.length > 0) {
            this.selectPath();
        }
    }

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
                    this.color = value;
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

    async openDialog(
        meta: { canCreate: boolean } = { canCreate: false },
    ): Promise<string | null> {
        return await (window as SafeElectronWindow).electron.selectDirectory(
            meta,
        );
    }

    async selectPath() {
        this.loading = true;
        const vaultPath = await this.openDialog({ canCreate: true });
        if (!vaultPath) {
            this.loading = false;
            return;
        }

        this.path = vaultPath;
        await this.createVault();
    }

    async createVault() {
        try {
            const path = await (
                window as SafeElectronWindow
            ).electron.createFolder(this.path as string, this.name as string);

            const id = v4();

            const newLocalVault = {
                id,
                name: this.name,
                type: 'local',
                filepath: path,
                status: 'new',
                color: this.color,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await this.$store.dispatch('vault/update', newLocalVault);
            await this.$store.dispatch('vault/activate', {
                id,
                redirect: false,
            });
            await this.$store.dispatch('createOnboarding', id);

            this.$vfm.hideAll();

            if (this.$route.name === 'auth-index-vault') {
                await this.$router.push('/auth/integrations');
            } else {
                await this.$router.push(`/`);
            }
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    mounted() {
        // TODO: single focus does not work. Some issue with $vfm having some focus logic of its own
        this.$nextTick(() => {
            this.$nextTick(() => {
                this.$refs.input.focus({
                    preventScroll: true,
                });
            });
        });
    }
}
</script>

<style scoped lang="scss">
.new-sync-vault-modal {
    @include modal(20px);
    user-select: none;
    padding: 40px 35px 30px;

    &--title {
        text-align: center;
        font-weight: 600;
        font-size: 24px;
        line-height: 155.2%;
        color: var(--modal-title-text-color);
        margin-bottom: 32px;
        user-select: none;
    }

    &--color-button {
        flex-shrink: 0;
        outline: none;
        display: block;
        padding: 6px;
        background-color: var(--vault-settings-input-bg-color);
        border-radius: 6px;

        span {
            display: block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }
    }

    &--image {
        margin: 0 auto 25px;
        height: 76px;
        width: 76px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 45px;
        line-height: 155.2%;
        color: var(--new-vault-image-text-color);
    }

    &--name {
        margin-bottom: 25px;

        &--label {
            @include font11-500;
            margin-bottom: 4px;
            color: var(--settings-modal-title-color);
        }

        &--input {
            display: flex;
            align-items: center;
            gap: 4px;

            input {
                @include font12-500;
                padding: 5px 11px;
                background: var(--vault-settings-input-bg-color);
                width: 100%;
                color: var(--vault-settings-input-text-color);
                border-radius: 6px;
                outline: none;

                &::placeholder {
                    user-select: none;
                    color: var(--vault-settings-input-placeholder-color);
                }
            }
        }
    }

    &--actions {
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
