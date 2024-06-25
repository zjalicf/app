import {
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
} from 'openai/resources';

export interface AssistantResponseEmitter {
    emit(chatId: string, type: string, content: any): void;
}

export interface PromptProvider {
    createSystemPrompt(): ChatCompletionSystemMessageParam;
    createUserPrompt(message: string): ChatCompletionUserMessageParam;
}
