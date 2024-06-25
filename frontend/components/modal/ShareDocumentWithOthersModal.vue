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
            maxWidth: '367px',
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
            class="update-email-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="update-email-modal__header">
                <div class="update-email-modal__header__title">
                    Someone needs acces to the file
                </div>
            </div>
            <div class="update-email-modal__body">
                <p>
                    Some attendees don’t have access to this page. Would you
                    like to update permissions?
                </p>
            </div>
            <div class="update-email-modal__footer">
                <div class="update-email-modal__footer__info"></div>
                <div class="update-email-modal__footer__actions">
                    <div>
                        <tippy
                            :content="`<div class='tooltip'>Add Public Link <span class='tooltip-divider'>•</span><span class='tooltip-button'>Shift</span>+<span class='tooltip-button'>Enter</span></span></div>`"
                            placement="bottom-start"
                            :delay="[100, 20]"
                            theme="tooltip"
                            :touch="false"
                        >
                            <CButton
                                type="primary"
                                tabindex="0"
                                @click="modalAccept(close)"
                                >Publish Document
                            </CButton>
                        </tippy>
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Keep for Myself
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TrashIcon, DocumentIcon } from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';

@Component({
    name: 'ShareDocumentWithOthersModal',
    components: {
        CButton,
        TrashIcon,
        DocumentIcon,
    },
})
export default class ShareDocumentWithOthersModal extends Vue {
    async modalAccept(close: any) {
        this.$emit('accept');
        await close();
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.update-email-modal {
    @include modal;
    max-width: 367px;
    padding: 0px;
    margin: 0 auto;

    &__header {
        padding: 16px 16px 4px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        p {
            @include font12-500;
            padding: 0 16px;
            color: var(--modal-body-text-color);
        }

        margin-bottom: 12px;
    }

    &__footer {
        padding: 0 16px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
