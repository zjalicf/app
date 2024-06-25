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
            maxWidth: '275px',
            width: '100%',
            height: '100%',
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
            class="delete-label-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="delete-label-modal__header">
                <div class="delete-label-modal__header__title">
                    Delete Label
                </div>
            </div>
            <div class="delete-label-modal__body">
                <div class="delete-label-modal__body__title">
                    Do you wish to delete label “{{ label }}”?
                </div>
            </div>
            <div class="delete-label-modal__footer">
                <div class="delete-label-modal__footer__actions">
                    <CButton
                        type="danger"
                        tabindex="0"
                        data-e2e="label-delete-confirm"
                        @click="modalAccept(close)"
                        >Delete
                    </CButton>
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
import { TrashIcon } from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';
import { ILabel } from '~/@types';

@Component({
    name: 'DeleteLabelModal',
    components: {
        CButton,
        TrashIcon,
    },
})
export default class DeleteLabelModal extends Vue {
    @Prop({ required: true })
    label!: ILabel;

    modalAccept(close: any) {
        this.$entities.label.delete(this.label);
        close();
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.delete-label-modal {
    @include modal;
    padding: 16px 0 16px;

    &__header {
        margin-bottom: 4px;
        padding: 0 16px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        padding: 0 16px;

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
        padding: 0 16px;

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
