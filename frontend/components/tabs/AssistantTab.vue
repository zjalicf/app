<template>
    <div class="assistant-tab page" @mousedown="$emit('focus-tab')">
        <div class="assistant-tab__message-wrapper">
            <div v-for="(message, index) in currentChat" :key="index">
                <div
                    class="assistant-tab__message"
                    :class="{ [message.role]: true }"
                >
                    <div class="assistant-tab__message__role">
                        {{ message.role !== 'user' ? 'Assistant' : 'You' }}
                    </div>
                    <div class="assistant-tab__message__content">
                        {{ message.content }}
                    </div>
                </div>
            </div>
        </div>
        <div class="assistant-tab__input">
            <CInput v-model="userChat" @keydown.enter="askAssistant" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { v4 } from 'uuid';
import TabMixin from '~/components/tabs/TabMixin.vue';
import { AssistantActions, ServiceKey } from '~/constants';
import CInput from '~/components/CInput.vue';

@Component({
    name: 'AssistantTab',
    components: { CInput },
})
export default class AssistantTab extends TabMixin<any> {
    chatId = v4();
    chatHistory: any = [];
    userChat = '';

    get currentChat() {
        return this.chatHistory.filter(
            (message: any) =>
                message.role === 'user' || message.role === 'assistant',
        );
    }

    async askAssistant() {
        if (!this.userChat) return;
        const message = this.userChat;
        this.userChat = '';
        this.chatHistory.push({
            role: 'user',
            content: message,
        });

        this.chatHistory = await this.$serviceRegistry.invoke<any[]>(
            ServiceKey.ASSISTANT,
            AssistantActions.ASK_ASSISTANT,
            {
                vaultId: this.$store.getters['vault/activeVaultId'],
                chatId: this.chatId,
                message,
                callerContext: 'AssistantTab.vue askAssistant',
            },
        );
    }
}
</script>
<style scoped lang="scss">
.assistant-tab {
    height: $desktopContentHeight;
    padding-top: 60px;
    user-select: none;
    width: 100%;

    &__message-wrapper {
        @include scrollbar(36px, 9px);
        height: 90%;
        overflow-y: auto;
    }

    &__input {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 10px 20px;
        border-top: 1px solid $blueGrey400;
        background: $blueGrey100-05;
    }

    &__message {
        padding: 10px 20px;
        margin: 5px 0;
        border-radius: 5px;
        max-width: 80%;
        word-break: break-word;
        display: inline-block;
        position: relative;

        &__role {
            @include font12-700;
        }

        &__content {
            @include font14-500;
            margin-top: 6px;
        }

        &.user {
            margin-left: auto;
        }
        &.assistant {
            margin-right: auto;
        }
    }
}
</style>
