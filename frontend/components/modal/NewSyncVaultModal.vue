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
            <div class="new-sync-vault-modal--title">New Cloud Vault</div>
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
                        @keydown.enter.prevent="handleEnter(close, $event)"
                    />
                </div>
            </div>
            <label v-if="isElectron" class="new-sync-vault-modal--sync">
                <div class="new-sync-vault-modal--sync--title">
                    <tippy
                        :content="`<div class='tooltip new-sync-vault'>Vault data is stored in .md files.<br/>Changes to those files are synced to acreom.</div>`"
                        placement="left-start"
                        :delay="[200, 20]"
                        theme="tooltip"
                        :touch="false"
                    >
                        <div class="new-sync-vault-modal--sync--title--main">
                            Sync Vault with Folder on Your Device
                        </div>
                        <div class="new-sync-vault-modal--sync--title--tip">
                            What is this?
                        </div>
                    </tippy>
                </div>
                <div class="new-sync-vault-modal--sync--toggle">
                    <CSwitch
                        id="local-sync"
                        :value="localSyncValue"
                        @input="updateLocalSync"
                    />
                </div>
            </label>
            <div class="new-sync-vault-modal--actions">
                <CButton type="secondary" tabindex="-1" @click="close"
                    >Cancel</CButton
                >
                <CButton
                    v-if="localSyncValue"
                    type="primary"
                    tabindex="-1"
                    :disabled="name.length === 0"
                    @click="selectPath(close)"
                    >Select Path</CButton
                >
                <CButton
                    v-else
                    type="primary"
                    tabindex="-1"
                    :disabled="name.length === 0 || loading"
                    @click="createVault(close)"
                    >Create</CButton
                >
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { VAULT_COLORS } from '~/constants';
import AColorPicker from '~/components/system/AColorPicker.vue';
import CSwitch from '~/components/CSwitch.vue';
import { IVault, SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import CButton from '~/components/CButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'NewSyncVaultModal',
    components: { CButton, CSwitch },
})
export default class NewSyncVaultModal extends Vue {
    name: string = '';
    color: string = '#FDA4AF';
    localSyncValue: boolean = false;
    vaultImgColor: string = '#949DAD';
    path: string = '';
    loading: boolean = false;
    isElectron = isElectron();

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

    async handleEnter(close: any, event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (this.name.length > 0) {
            await this.createVault(close);
        }
    }

    updateLocalSync() {
        this.localSyncValue = !this.localSyncValue;
    }

    async openDialog(
        meta: { canCreate: boolean } = { canCreate: false },
    ): Promise<string | null> {
        return await (window as SafeElectronWindow).electron.selectDirectory(
            meta,
        );
    }

    async selectPath(close: any) {
        this.loading = true;
        const vaultPath = await this.openDialog({ canCreate: true });
        if (!vaultPath) {
            this.loading = false;
            return;
        }

        this.path = vaultPath;
        await this.createVault(close);
        this.loading = false;
    }

    async createVault(close: any) {
        this.loading = true;
        close();
        const vaultId = v4();

        const newSyncedVault = {
            id: vaultId,
            name: this.name,
            type: 'remote',
            status: 'new',
            color: this.color,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Partial<IVault>;
        if (this.localSyncValue && this.path) {
            const sep = this.$config.os === 'windows' ? '\\' : '/';
            newSyncedVault.filepath = this.path + sep + this.name;
        }
        await this.$store.dispatch('vault/update', newSyncedVault);
        await this.$store.dispatch('vault/activate', {
            id: vaultId,
            redirect: false,
        });
        await this.$store.dispatch('createOnboarding', vaultId);

        this.loading = false;
        this.$vfm.hideAll();

        if (this.$route.name === 'auth-index-vault') {
            await this.$router.push('/auth/jira');
        } else {
            await this.$router.push(`/`);
        }

        this.$tracking.trackEventV2(TrackingType.VAULT, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.MOBILE,
        });
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
            color: var(--settings-modal-title-color);
        }

        &--input {
            display: flex;
            align-items: center;
            gap: 4px;

            input {
                padding: 5px 11px;
                background: var(--vault-settings-input-bg-color);
                width: 100%;
                @include font12-500;
                color: var(--vault-settings-input-text-color);
                border-radius: 6px;
                outline: none;

                &::placeholder {
                    color: var(--vault-settings-input-placeholder-color);
                }
            }
        }
    }

    &--sync {
        display: flex;
        justify-content: space-between;
        margin-bottom: 25px;

        &--title {
            &--main {
                @include font12-500;
                color: var(--modal-body-text-color);
            }

            &--tip {
                @include font11-500;
                color: var(--modal-body-text-color);
            }
        }

        &--toggle {
            display: flex;
            align-items: center;
        }
    }

    &--actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
