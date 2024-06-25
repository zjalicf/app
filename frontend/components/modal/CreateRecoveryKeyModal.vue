<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="false"
        :esc-to-close="false"
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
        name="encryption-passphrase-modal"
        v-on="$listeners"
    >
        <div class="encyption-passphrase">
            <div class="auth-cloud--content">
                <div class="auth-cloud--content--title">
                    <h1>Generate Recovery Key</h1>
                    <p>
                        In case of forgetting your encryption password, you can
                        use recovery keys to reset your encryption password and
                        access your data.
                    </p>
                </div>
                <div v-if="!saved" class="auth-cloud--content--actions">
                    <CButton
                        type="primary"
                        size="full-width"
                        @click="generateRecoveryKey"
                        >Save recovery key
                    </CButton>
                </div>
                <div
                    v-else
                    class="auth-cloud--content--actions"
                    :class="{ saved }"
                >
                    <CButton
                        type="secondary"
                        size="full-width"
                        @click="generateRecoveryKey"
                        >Download again
                    </CButton>
                    <CButton type="primary" size="full-width" @click="close"
                        >Close
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

@Component({
    name: 'EncryptionPassphraseModal',
    components: { CButton },
})
export default class EncryptionPassphraseModal extends Vue {
    saved: boolean = false;

    async generateRecoveryKey() {
        const recoveryData = await this.$serviceRegistry.invoke<{
            recoveryKey: string;
            id: string;
        }>(ServiceKey.DATABASE, DatabaseServiceAction.CREATE_RECOVERY_KEY, {
            callerContext: 'CreateRecoveryKeyModal.vue generateRecoveryKey',
        });
        if (!recoveryData) return;
        const status = await this.$encryption.createRecoveryJSON(recoveryData);
        this.saved = !!status;
    }

    onContinue() {
        this.$vfm.show({
            component: () =>
                import('~/components/modal/OnboardingRecoveryConfirmModal.vue'),
            on: {
                accept: () => {},
            },
        });
    }
}
</script>

<style scoped lang="scss">
.encyption-passphrase {
    @include modal;
    user-select: none;
    padding: 16px;

    .auth-cloud--content--title {
        h1 {
            @include font14-600;
            color: var(--modal-title-text-color);
        }

        p {
            @include font12-500;
            margin-bottom: 12px;
            color: var(--modal-body-text-color);
        }
    }

    .saved {
        max-width: 100%;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 196px;
        gap: 13px;
        justify-content: space-between;
    }
}
</style>
