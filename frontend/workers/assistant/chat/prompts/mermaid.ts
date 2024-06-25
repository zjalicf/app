import {
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
} from 'openai/resources';
import { PromptProvider } from '~/workers/assistant/chat/interface';

const diagramTypes = [
    'Class diagram',
    'Sequence diagram',
    'State diagram',
    'Activity diagram',
    'Component diagram',
    'Deployment diagram',
    'Object diagram',
    'Data flow diagram',
    'Entity relationship diagram',
    'Use case diagram',
].join();

export class MermaidPrompt implements PromptProvider {
    createSystemPrompt(): ChatCompletionSystemMessageParam {
        return {
            role: 'system',
            content: [
                'You are an assistant that generates mermaid diagrams from text provided by user.',
                `Use one of the following diagrams ${diagramTypes} based on what fits the text best.`,
                `Return nothing but the mermaid diagram code. Mermaid diagram code will be fenced by \`\`\` at the start and end of the diagram code.`,
                `If it is not possible answer with: Not possible.`,
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
