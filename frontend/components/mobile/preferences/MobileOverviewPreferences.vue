<template>
    <div class="mobile-vault-settings">
        <div class="mobile-vault-settings__image-wrapper">
            <div
                class="mobile-vault-settings__image-wrapper__image"
                :title="vaultName"
                :style="{
                    backgroundColor: $store.getters['vault/color'](vault.id),
                }"
            >
                <span>{{ name[0] || '#' }}</span>
            </div>
        </div>
        <MobileSettingsSection>
            <template #title>Vault Name</template>
            <template #buttons>
                <MobileSettingsButton @click="vaultNameHandler">
                    <div class="mobile-settings-button__title">Name</div>
                    <div class="mobile-settings-button__value">
                        {{ vaultName }}
                        <AcreomChevronRight
                            class="mobile-settings-button__icon"
                        />
                    </div>
                </MobileSettingsButton>
                <MobileSettingsButton @click="colorPickerHandler">
                    <div class="mobile-settings-button__title">Color</div>
                    <div class="mobile-settings-button__value">
                        <span
                            :style="{
                                background: $store.getters['vault/color'](
                                    vault.id,
                                ),
                                display: 'block',
                                width: '16px',
                                height: '16px',
                                'border-radius': '50%',
                            }"
                        >
                        </span>
                        <AcreomChevronRight
                            class="mobile-settings-button__icon"
                        />
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
        <MobileSettingsSection>
            <template #title>Data Storage</template>
            <template #buttons>
                <MobileSettingsButton class="disabled">
                    <div class="mobile-settings-button__title">Storage</div>
                    <div class="mobile-settings-button__value">
                        {{ email }}
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
        <MobileSettingsSection>
            <template #title>Danger Zone</template>
            <template #buttons>
                <MobileSettingsButton
                    class="danger"
                    @click="deleteVaultHandler"
                >
                    <div class="mobile-settings-button__title">
                        Delete Vault
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ExternalLinkIcon } from '@vue-hero-icons/solid';
import { isElectron } from '~/helpers/is-electron';
import { VAULT_COLORS, ServiceKey, DatabaseServiceAction } from '~/constants';
import CSwitch from '~/components/CSwitch.vue';
import { IVault } from '~/workers/database/indexeddb/types';
import MirrorContextMenu from '~/components/context-menu/MirrorContextMenu.vue';
import MobileSettingsSection from '~/components/mobile/preferences/navigation/MobileSettingsSection.vue';
import MobileSettingsButton from '~/components/mobile/preferences/navigation/MobileSettingsButton.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import NameChangePane from '~/components/mobile/preferences/panes/NameChangePane.vue';
import ColorPickerPane from '~/components/mobile/preferences/panes/ColorPickerPane.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobileOverviewPreferences',
    components: {
        AcreomChevronRight,
        MobileSettingsButton,
        MobileSettingsSection,
        ExternalLinkIcon,
        CSwitch,
        MirrorContextMenu,
    },
})
export default class MobileOverviewPreferences extends Vue {
    @Prop({
        default: null,
    })
    selectedVault!: string | null;

    loading: boolean = false;
    filepath: string | null = null;
    isElectron = isElectron();
    name: string = '';
    isEncryptionUnlocked: boolean = false;

    async deleteVault() {
        try {
            const activeVault = { ...this.vault } as IVault;
            const remainingVaults = this.$entities.vault
                .list()
                .filter((vault: IVault) => vault.id !== activeVault.id);
            if (remainingVaults.length) {
                await this.$entities.vault.activate(remainingVaults[0].id);
                this.$emit('vault:select', remainingVaults[0].id);
            }

            if (remainingVaults.length === 0) {
                await this.$vfm.hideAll();
            }
            await this.$entities.vault.delete(activeVault.id);
            this.$tracking.trackEvent('vault', {
                action: 'delete',
                entity_id: activeVault.id,
                type: activeVault.type,
            });

            this.$vfm.hideAll();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    deleteVaultHandler() {
        // TODO: mobile - rework modal to pane
        this.$vfm.show({
            component: () =>
                import(
                    '@/components/modal/SettingsModal/VaultHelpers/VaultDeleteModal.vue'
                ),
            bind: {
                vault: this.vault,
            },
            on: {
                'vault:delete': () => {
                    this.deleteVault();
                },
            },
        });
    }

    saveName() {
        if (this.name === '') {
            this.name = this.vault.name || 'Untitled vault';
        }
        this.$entities.vault.saveToStore({
            id: this.vault.id,
            name: this.name,
        });
    }

    updateName(name: string) {
        this.name = name;
    }

    get vault(): IVault {
        if (this.selectedVault === null) {
            return {} as IVault;
        }
        return {
            // filepath: this.filepath!,
            ...(this.$entities.vault.byId(this.selectedVault) || {}),
        } as IVault;
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get email() {
        return this.user?.email ?? '';
    }

    getEncryptionUnlockedState(): Promise<boolean | null> {
        return this.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DID_RESTORE_SESSION_KEY,
            {
                callerContext:
                    'MobileOverviewPreferences.vue getEncryptionUnlockedState',
            },
        );
    }

    async mounted() {
        this.name = this.vault?.name ?? '';
        this.filepath = this.vault.filepath!;
        this.isEncryptionUnlocked = !!(await this.getEncryptionUnlockedState());
    }

    get vaultName() {
        const id = this.$entities.vault.active?.id ?? '';
        const vault = this.$entities.vault.byId(id);

        return vault?.name ?? '';
    }

    colorPickerHandler() {
        this.$pane.show({
            component: ColorPickerPane,
            bind: {
                'colors-old': VAULT_COLORS.map(color => ({ id: color, color })),
                value: this.$store.getters['vault/color'](this.vault.id),
            },
            on: {
                select: (value: string) => {
                    this.$pane.hide();
                    this.$entities.vault.saveToStore({
                        id: this.vault.id,
                        color: value,
                    });

                    this.$tracking.trackEventV2(TrackingType.VAULT, {
                        action: TrackingAction.CHANGE_COLOR,
                        source: TrackingActionSource.MOBILE,
                    });
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }

    vaultNameHandler() {
        this.$pane.show({
            component: NameChangePane,
            type: 'fullscreen',
            bind: {},
            options: {
                initialBreak: 'top',
            },
            on: {
                done: (name: string) => {
                    this.$pane.hide();
                    this.updateName(name);
                    this.saveName();
                },
                cancel: () => {
                    this.$pane.hide();
                },
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.mobile-vault-settings {
    margin-top: 50px;

    &__image-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 49px;
        user-select: none;

        &__image {
            width: 76px;
            height: 76px;
            color: var(--vault-settings-image-text-color);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-weight: 500;
            font-size: 36px;
            line-height: 155.2%;
        }
    }
}
</style>
