import {
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
} from 'openai/resources';
import { PromptProvider } from '~/workers/assistant/chat/interface';

export class SummaryPrompt implements PromptProvider {
    createSystemPrompt(): ChatCompletionSystemMessageParam {
        return {
            role: 'system',
            content: [
                'You are an assistant that creates summary of the text provided by user.',
                'Only use content provided by user to create the summary.',
                'Respond only with the created summary.',
            ].join(' '),
        };
    }

    createUserPrompt(message: string): ChatCompletionUserMessageParam {
        return {
            role: 'user',
            content: message,
        };
    }
}
