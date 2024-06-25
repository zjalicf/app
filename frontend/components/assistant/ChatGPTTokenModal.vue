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
        v-on="$listeners"
    >
        <div class="github-enterprise-modal">
            <div class="github-enterprise-modal__title">Add OpenAI API Key</div>
            <div class="github-enterprise-modal__body">
                <p>
                    Add your API key to integrate OpenAI
                    <input
                        ref="input"
                        v-model="token"
                        placeholder="OpenAI API Key"
                    />
                </p>
            </div>

            <div class="github-enterprise-modal__footer">
                <div class="github-enterprise-modal__footer__actions">
                    <CButton
                        :disabled="token.trim() === ''"
                        type="primary"
                        tabindex="0"
                        @click="connect(close)"
                        >Add
                    </CButton>
                    <CButton type="secondary" tabindex="0" @click="close"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import CButton from '~/components/CButton.vue';

@Component({
    name: 'ChatGPTTokenModal',
    components: { CButton, CInput },
})
export default class ChatGPTTokenModal extends Vue {
    token: string = '';

    $refs!: {
        input: HTMLInputElement;
    };

    connect(close: any) {
        this.$emit('save', this.token);
        close();
    }

    mounted() {
        this.$nextTick(() => {
            this.$refs.input?.focus({ preventScroll: true });
        });
    }
}
</script>
<style lang="scss" scoped>
.github-enterprise-modal {
    @include modal;
    user-select: none;

    &__title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
        padding: 16px 16px 0;
    }

    &__body {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 12px;
        padding: 0px 16px;

        p {
            margin-bottom: 8px;

            a {
                color: var(--accent-color);

                &:hover {
                    text-decoration: underline;
                }
            }
        }

        input {
            @include inputMetaStyles;
            @include font12-500;
            padding: 5px 11px;
            background: var(--vault-settings-input-bg-color);
            width: 100%;
            color: var(--vault-settings-input-text-color);
            border-radius: 6px;
            outline: none;
            margin-top: 8px;

            &::placeholder {
                color: var(--vault-settings-input-placeholder-color);
            }
        }
    }

    &__footer {
        padding: 0 16px 16px;
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
