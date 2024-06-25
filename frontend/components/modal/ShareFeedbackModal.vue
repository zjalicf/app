<template>
    <vue-final-modal
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="true"
        :esc-to-close="!$shortcutsManager.isRecording"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '420px',
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
        name="share-feedback-modal"
        v-slot="{ close }"
        v-on="$listeners"
    >
        <div class="share-feedback-modal">
            <div class="share-feedback-modal__header">Submit Feedback</div>
            <div class="share-feedback-modal__body">
                <div class="share-feedback-modal__body__text">
                    <textarea
                        v-model="issue"
                        rows="5"
                        placeholder="Please provide detailed information about the feedback or bug you encountered"
                    ></textarea>
                </div>
            </div>
            <div class="share-feedback-modal__footer">
                <CButton type="secondary" @click="close">Cancel</CButton>
                <CButton
                    type="primary"
                    :disabled="!issue.length || loading"
                    @click="submit(close)"
                    >Submit</CButton
                >
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';

@Component({
    components: { CButton, CInput },
    name: 'SettingsModal',
})
export default class SettingsModal extends Vue {
    issue: string = '';
    loading: boolean = false;

    get user() {
        return this.$store.getters['auth/user'];
    }

    get email() {
        if (this.user) {
            if (this.user.email) return this.user.email;
            else return this.user.name;
        }

        return 'anonymous';
    }

    async submit(close: any) {
        this.loading = true;
        try {
            const user = this.email;
            const vaultType = this.$store.getters['vault/active'].type;
            const platform = this.$config.platform;
            const os = this.$config.os;
            const version = this.$store.getters.latest;
            const feedback = this.issue;

            await this.$axios.post(
                'https://europe-west1-dev-acreom.cloudfunctions.net/feedback',
                {
                    user,
                    vaultType,
                    platform,
                    os,
                    version,
                    feedback,
                },
            );
        } catch (e) {}

        this.issue = '';
        close();

        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Feedback received! Thank you!',
            },
        });

        this.loading = false;
    }
}
</script>

<style scoped lang="scss">
.share-feedback-modal {
    @include modal;
    user-select: none;

    &__header {
        @include font14-600;
        color: var(--modal-title-text-color);
        padding: 16px 16px 4px;
    }

    &__body {
        padding: 0px 16px;

        input,
        textarea {
            @include inputMetaStyles;
            @include font12-500;
            min-height: 36px;
            display: block;
            background: var(--vault-settings-input-bg-color);
            color: var(--vault-settings-input-text-color);
            border-radius: 5px;
            width: 100%;
            outline: none;
            padding: 5px 8px;

            &::placeholder {
                color: var(--vault-settings-input-placeholder-color);
            }
        }
    }

    &__footer {
        padding: 12px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
