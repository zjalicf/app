import { ChatCompletionMessageParam } from 'openai/resources';

export class HistoryProvider {
    history: Record<string, Record<string, ChatCompletionMessageParam[]>> = {};
    toolContext: Record<string, string[]> = {};

    retrieveHistory(vaultId: string, chatId: string) {
        return this.history?.[vaultId]?.[chatId] ?? [];
    }

    retrieveToolContext(callId: string) {
        return this.toolContext[callId];
    }

    addToContext(callId: string, ids: string[]) {
        this.toolContext[callId] = ids;
    }

    addToHistory(
        vaultId: string,
        chatId: string,
        message: ChatCompletionMessageParam,
    ) {
        if (!this.history[vaultId]) {
            this.history[vaultId] = {};
        }
        if (!this.history[vaultId][chatId]) {
            this.history[vaultId][chatId] = [];
        }
        this.history[vaultId][chatId].push(message);
    }
}
