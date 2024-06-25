import { Context } from '@nuxt/types';
import { isToday } from 'date-fns';
import { v4 } from 'uuid';
import { AssistantActions, ServiceKey } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

export class AssistantUtils {
    context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    get usage() {
        return this.context.store.getters['appSettings/assistantOptions'].usage;
    }

    get lastUsageDate() {
        return this.context.store.getters['appSettings/assistantOptions']
            .lastUsageDate;
    }

    get allowUsage() {
        if (process.env.NODE_ENV === 'production') return true;
        if (this.context.$accessControl.isProActive) return this.usage < 50;
        return this.usage < 25;
    }

    get assistantEnabled() {
        return this.context.store.getters['vaultSettings/assistantOptions']
            .assistantEnabled;
    }

    get allowAssistantUsage() {
        const active = this.context.$entities.assistant.activeIntegration;

        if (!active) return false;

        if (active.data?.type === 'custom') {
            return true;
        }

        if (this.allowUsage) return true;

        // usage exceeded here, but allow if new day
        // we rely on the subsequent call to "increment usage"
        // to reset the cap and increment usage
        if (!isToday(new Date(this.lastUsageDate))) return true;

        this.context.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Assistant usage cap reached',
            },
        });
        return false;
    }

    incrementAssistantUsage() {
        this.updateUsage(this.usage + 1);
    }

    updateUsage(value: number) {
        if (!isToday(new Date(this.lastUsageDate))) {
            this.context.store.dispatch('appSettings/resetAssistantUsage');
            value = 1;
        }

        this.context.store.dispatch('appSettings/updateAssistantOptions', {
            usage: value,
        });
    }

    async generateMermaid(
        prompt: string,
        source: TrackingActionSource = TrackingActionSource.BUBBLE_MENU,
    ): Promise<any> {
        const response = await this.context.$serviceRegistry.invoke<any[]>(
            ServiceKey.ASSISTANT,
            AssistantActions.GENERATE_MERMAID,
            {
                vaultId: this.context.store.getters['vault/activeVaultId'],
                chatId: v4(),
                message: prompt,
                callerContext: 'utils/assistant.ts generateMermaid',
            },
        );

        const result = response?.[response.length - 1].content;
        const didFail = result?.match(/Not possible/);

        this.context.$tracking.trackEventV2(TrackingType.ASSISTANT, {
            action: TrackingAction.GENERATE_MERMAID,
            source,
            sourceMeta: didFail
                ? TrackingActionSourceMeta.FAIL
                : TrackingActionSourceMeta.SUCCESS,
        });

        return result;
    }

    async generateSummary(prompt: string, id?: string) {
        return await this.context.$serviceRegistry.emit(
            ServiceKey.ASSISTANT,
            AssistantActions.GENERATE_SUMMARY,
            {
                vaultId: this.context.store.getters['vault/activeVaultId'],
                chatId: id,
                message: prompt,
            },
        );
    }

    askAssistant(message: string, vaultId?: string, chatId?: string) {
        return this.context.$serviceRegistry.emit(
            ServiceKey.ASSISTANT,
            AssistantActions.ASK_ASSISTANT,
            { message, vaultId, chatId },
        );
    }
}
