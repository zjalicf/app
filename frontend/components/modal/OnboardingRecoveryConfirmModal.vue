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
            backgroundColor: '#000000',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="onboarding-recover-confirm">
            <div class="onboarding-recover-confirm__header">
                <div class="onboarding-recover-confirm__header__title">
                    Are you sure?
                </div>
            </div>
            <div class="onboarding-recover-confirm__body">
                <div class="onboarding-recover-confirm__body__title">
                    Make sure you have saved the recovery key. In case you
                    forget your password, there is no other way to recover your
                    data.
                </div>
            </div>
            <div class="onboarding-recover-confirm__footer">
                <div class="onboarding-recover-confirm__footer__actions">
                    <div>
                        <CButton
                            type="primary"
                            tabindex="0"
                            @click="modalAccept(close)"
                            >Continue
                        </CButton>
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Go back
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';

@Component({
    name: 'OnboardingRecoveryConfirmModal',
    components: {
        CButton,
    },
})
export default class OnboardingRecoveryConfirmModal extends Vue {
    modalAccept(close: any) {
        close();
        this.$emit('accept');
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.onboarding-recover-confirm {
    @include modal;
    user-select: none;

    &__header {
        padding: 16px 16px 0px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        padding: 0px 16px 8px;

        &__title {
            @include font12-500;
            margin-bottom: 4px;
            margin-top: 4px;
        }
    }

    &__footer {
        padding: 0px 16px 16px;
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
