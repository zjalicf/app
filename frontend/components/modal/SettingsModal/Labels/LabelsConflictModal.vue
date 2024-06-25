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
            class="label-conflict-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="label-conflict-modal__header">
                <div class="label-conflict-modal__header__title">
                    Label already exist
                </div>
            </div>
            <div class="label-conflict-modal__body">
                <div class="label-conflict-modal__body__title">
                    Label “{{ newLabel }}” already exists. Do you wish to merge
                    labels?
                </div>
            </div>
            <div class="label-conflict-modal__footer">
                <div class="label-conflict-modal__footer__actions">
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalAccept(close)"
                        >Merge
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
    newLabel!: ILabel;

    @Prop({ required: true })
    oldLabel!: ILabel;

    modalAccept(close: any) {
        this.$entities.label.merge(this.oldLabel, this.newLabel);
        close();
    }

    modalCancel(close: any) {
        this.$emit('cancel');
        close();
    }
}
</script>

<style lang="scss" scoped>
.label-conflict-modal {
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
