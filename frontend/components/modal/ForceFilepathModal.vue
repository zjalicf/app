<template>
    <vue-final-modal
        v-slot="{ close }"
        name="new-vault"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="false"
        :click-to-close="false"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '390px',
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
        <div class="force-filepath-modal">
            <div class="force-filepath-modal__header">
                <div class="force-filepath-modal__header__title">
                    {{ vault.name }} vault storage issue
                </div>
            </div>
            <div class="force-filepath-modal__body">
                <div class="force-filepath-modal__body__title">
                    <div>
                        acreom encountered an issue with the storage of vault.
                        Please select a new path where your vault will be
                        stored.
                    </div>
                </div>
            </div>
            <div class="force-filepath-modal__footer">
                <div class="force-filepath-modal__footer__actions">
                    <CButton type="primary" @click="selectNewFilepath(close)">
                        Select new path
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AButton from '~/components/system/AButton.vue';
import { IVault, SafeElectronWindow } from '~/@types';
import CButton from '~/components/CButton.vue';

@Component({
    name: 'ForceFilepathModal',
    components: { CButton, AButton },
})
export default class ForceFilepathModal extends Vue {
    @Prop()
    vault!: IVault;

    async selectNewFilepath(close: () => void) {
        const filepath = await this.selectFilepath();
        if (!filepath) return;
        await this.$entities.vault.createVaultFolder(filepath);
        await this.$entities.vault.removeFilepathFromEntities(this.vault.id);
        await this.$entities.vault.saveToStore({
            id: this.vault.id,
            filepath,
        });
        await this.$entities.vault.syncToDisk(this.vault.id);
        close();
    }

    async selectFilepath(): Promise<string | null> {
        const filepath = await (
            window as SafeElectronWindow
        ).electron.selectDirectory({
            canCreate: true,
            buttonLabel: 'Select new path',
        });
        if (!filepath) return null;
        const sep = this.$config.os === 'windows' ? '\\' : '/';
        return [filepath, this.vault.name].join(sep);
    }
}
</script>

<style scoped lang="scss">
.force-filepath-modal {
    @include modal;
    padding: 16px;
    margin: 0 auto;

    &__header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 4px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        &__title {
            @include font12-500;
            margin-bottom: 12px;
            color: var(--modal-body-text-color);
        }
    }

    &__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
