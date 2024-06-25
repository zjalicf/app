import { OpenAIAssistant } from '~/workers/assistant/chat/chat';
import { ToolsProvider } from '~/workers/assistant/chat/tools';
import { HistoryProvider } from '~/workers/assistant/chat/history';
import {
    AskPrompt,
    MermaidPrompt,
    SummaryPrompt,
} from '~/workers/assistant/chat/prompts';
import {
    AskEmitter,
    MermaidEmitter,
    SummaryEmitter,
} from '~/workers/assistant/chat/emitter';
import { DummyProvider } from '~/workers/assistant/chat/tools/provider';

export const assistantFactory = (
    context: any,
    type: 'ask' | 'summary' | 'mermaid',
    toolProvider: ToolsProvider,
    historyProvider: HistoryProvider,
    config: any,
) => {
    if (type === 'ask') {
        return new OpenAIAssistant(
            context,
            toolProvider,
            historyProvider,
            new AskPrompt(),
            new AskEmitter(context),
            config,
        );
    }
    if (type === 'summary') {
        return new OpenAIAssistant(
            context,
            new DummyProvider(context),
            historyProvider,
            new SummaryPrompt(),
            new SummaryEmitter(context),
            config,
        );
    }
    if (type === 'mermaid') {
        return new OpenAIAssistant(
            context,
            new DummyProvider(context),
            historyProvider,
            new MermaidPrompt(),
            new MermaidEmitter(context),
            config,
        );
    }
};
