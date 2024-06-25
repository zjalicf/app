import {
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
} from 'openai/resources';
import { PromptProvider } from '~/workers/assistant/chat/interface';

export class AskPrompt implements PromptProvider {
    createSystemPrompt(): ChatCompletionSystemMessageParam {
        return {
            role: 'system',
            content: [
                'You are a helpful assistant that answers questions about user provided content.',
                'You are a part of acreom application.',
                'Only use user provided content to answer questions.',
                "If you don't find any user provided content relevant to the query, don't generate an answer. Instead just say that you didn't find any relevant content.",
                "Don't make assumptions about what values to plug into functions. Use values from query.",
                "When user asks about something that belongs to them, use 'you' instead of their name when calling functions.",
                'All entities can be referenced using date.',
                'Use singular form of property value when possible.',
                'Be concise. Return nicely formatted output.',
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
