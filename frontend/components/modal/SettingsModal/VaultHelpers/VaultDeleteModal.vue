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
            maxWidth: '330px',
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
            class="vault-delete-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="vault-delete-modal__header">
                <div class="vault-delete-modal__header__title">
                    {{
                        vault.type === 'remote'
                            ? 'Permanently Delete Vault'
                            : 'Remove Vault'
                    }}
                </div>
            </div>
            <div
                v-if="vault.type === 'remote'"
                class="vault-delete-modal__body"
            >
                This action will remove
                <b>{{ vault.name }}</b> vault and all of its data from acreom.
                {{
                    vault.filepath
                        ? 'Data will not be deleted from file system.'
                        : ''
                }}
            </div>
            <div v-else class="vault-delete-modal__body">
                This action will remove
                <b>{{ vault.name }}</b> vault and all of its data from acreom.
                Data will not be deleted from file system.
            </div>
            <div class="vault-delete-modal__footer">
                <div class="vault-delete-modal__footer__actions">
                    <div>
                        <CButton
                            type="danger"
                            tabindex="0"
                            @click="modalAccept(close)"
                            >{{ vault.type === 'remote' ? 'Delete' : 'Remove' }}
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
import CButton from '@/components/CButton.vue';
import { IVault } from '~/@types';

@Component({
    name: 'VaultDeleteModal',
    components: {
        CButton,
    },
})
export default class VaultDeleteModal extends Vue {
    @Prop()
    vault!: IVault;

    modalAccept(close: any) {
        this.$emit('vault:delete');
        close();
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.vault-delete-modal {
    @include modal;
    user-select: none;

    &__header {
        padding: 16px 16px 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        &__title {
            @include font14-600;
            font-weight: 500;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        @include font12-500;
        padding: 0px 16px 12px;
        color: var(--modal-body-text-color);
    }

    &__footer {
        padding: 0px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        &__actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-direction: row-reverse;
        }
    }
}
</style>
