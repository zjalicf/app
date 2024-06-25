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
            maxWidth: '352px',
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
            class="vault-unlink-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="vault-unlink-modal__header">
                <div class="vault-unlink-modal__header__title">
                    Are You Sure to Unlinnk Vault?
                </div>
            </div>
            <div class="vault-unlink-modal__body">
                This action will delete vault form acreom ?? but vault data will
                stay in your computer.
            </div>
            <div class="vault-unlink-modal__footer">
                <div class="vault-unlink-modal__footer__actions">
                    <div>
                        <CButton
                            type="danger"
                            tabindex="0"
                            @click="modalAccept(close)"
                            >Delete</CButton
                        >
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Cancel</CButton
                    >
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
    name: 'VaultUnlinkModal',
    components: {
        CButton,
    },
})
export default class VaultUnlinkModal extends Vue {
    @Prop()
    vault!: IVault;

    modalAccept(close: any) {
        this.$emit('vault:unlink');
        close();
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.vault-unlink-modal {
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
