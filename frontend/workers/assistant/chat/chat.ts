import 'openai/shims/web';
import { OpenAI } from 'openai';
import {
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionTool,
    ChatCompletionCreateParamsNonStreaming,
    ChatCompletionUserMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionCreateParams,
    ChatCompletionCreateParamsStreaming,
} from 'openai/resources';
import { Stream } from 'openai/streaming';
import { ToolsProvider } from '~/workers/assistant/chat/tools/provider';
import { HistoryProvider } from '~/workers/assistant/chat/history';
import { WorkerContext } from '~/@types/app';
import {
    AssistantResponseEmitter,
    PromptProvider,
} from '~/workers/assistant/chat/interface';

export class OpenAIAssistant {
    private context: WorkerContext;
    private toolsProvider: ToolsProvider;
    private historyProvider: HistoryProvider;
    private promptProvider: PromptProvider;
    private responseEmitter: AssistantResponseEmitter;
    private config: any;

    constructor(
        context: WorkerContext,
        toolsProvider: ToolsProvider,
        historyProvider: HistoryProvider,
        promptProvider: PromptProvider,
        responseEmitter: AssistantResponseEmitter,
        config: any,
    ) {
        this.context = context;
        this.toolsProvider = toolsProvider;
        this.historyProvider = historyProvider;
        this.promptProvider = promptProvider;
        this.responseEmitter = responseEmitter;
        this.config = config;
    }

    get defaultParams(): ChatCompletionCreateParamsNonStreaming {
        return {
            messages: [],
            model: 'gpt-3.5-turbo-1106',
            stream: false,
            temperature: 0.5,
        };
    }

    get client() {
        const config = {
            apiKey: this.config.apiKey,
            dangerouslyAllowBrowser: true,
        } as any;
        if (this.config.baseURL) {
            config.baseURL = this.config.baseURL;
        }
        return new OpenAI(config);
    }

    async execute(vaultId: string, chatId: string, message: string) {
        this.initializeHistory(vaultId, chatId);
        let messageToSend: any = this.createUserPrompt(message);
        let firstChoice = {} as any;
        do {
            const response = await this.sendMessage(
                vaultId,
                chatId,
                messageToSend,
                {
                    stream: true,
                },
            );

            firstChoice = await this.processStreamResponse(chatId, response);
            const isToolsCall = firstChoice.message?.tool_calls?.length;
            messageToSend = await this.processChoice(
                vaultId,
                chatId,
                firstChoice,
            );
            if (isToolsCall) {
                const toolCall = firstChoice.message.tool_calls[0];
                this.emitChunk('tool', chatId, {
                    toolName: toolCall.function.name,
                    content: messageToSend.content,
                });
            }
        } while (firstChoice.finish_reason !== 'stop');
        this.emitChunk('end', chatId, null);
        return this.historyProvider.retrieveHistory(vaultId, chatId);
    }

    sendMessage(
        vaultId: string,
        chatId: string,
        message: ChatCompletionMessageParam,
        params: Partial<ChatCompletionCreateParams> = {},
        options: Partial<{ history: boolean }> = {},
    ) {
        options = {
            history: true,
            ...options,
        };
        const tools = this.toolsDefinitions();

        const messages: ChatCompletionMessageParam[] = [];
        if (options.history) {
            messages.push(...this.retrieveHistory(vaultId, chatId));
        }
        messages.push(message);
        this.historyProvider.addToHistory(vaultId, chatId, message);

        // if (params.stream) {
        return this.sendMessageStreaming(messages, tools, params);
        // }
        // return this.sendMessageNonStreaming(messages, tools, params);
    }

    sendMessageStreaming(
        messages: ChatCompletionMessageParam[],
        tools: ChatCompletionTool[],
        params: Partial<ChatCompletionCreateParams> = {},
    ) {
        const body = {
            ...this.defaultParams,
            ...params,
            messages,
            stream: true,
        } as ChatCompletionCreateParamsStreaming;
        if (tools.length) {
            body.tools = tools;
        }
        return this.client.chat.completions.create(body);
    }

    sendMessageNonStreaming(
        messages: ChatCompletionMessageParam[],
        tools: ChatCompletionTool[],
        params: Partial<ChatCompletionCreateParams> = {},
    ) {
        const body = {
            ...this.defaultParams,
            ...params,
            messages,
            stream: false,
        } as ChatCompletionCreateParamsNonStreaming;
        if (tools.length) {
            body.tools = tools;
        }
        return this.client.chat.completions.create(body);
    }

    async processStreamResponse(
        chatId: string,
        response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    ) {
        let isToolsCall = false;
        const message: any = {
            message: { content: '', role: '' },
            finish_reason: '',
        };
        const toolCall: {
            id: string;
            type: string;
            function: { arguments: string; name: string };
        } = {
            id: '',
            type: '',
            function: {
                name: '',
                arguments: '',
            },
        };
        for await (const chunk of response) {
            const chunkFirstChoice = chunk.choices[0];
            if (chunkFirstChoice.delta?.tool_calls?.length) {
                isToolsCall = true;
            }

            if (chunkFirstChoice.finish_reason) {
                message.finish_reason += chunkFirstChoice.finish_reason;
            }
            if (chunkFirstChoice.delta?.role) {
                message.message.role += chunkFirstChoice.delta.role;
            }
            if (chunkFirstChoice.delta?.content) {
                if (!isToolsCall) {
                    this.emitChunk(
                        'content',
                        chatId,
                        chunkFirstChoice.delta.content,
                    );
                }
                message.message.content += chunkFirstChoice.delta.content;
            }

            if (isToolsCall) {
                const callDelta = chunkFirstChoice.delta?.tool_calls?.[0];
                if (callDelta?.type) {
                    toolCall.type += callDelta.type;
                }
                if (callDelta?.function?.name) {
                    toolCall.function.name += callDelta.function!.name;
                }
                if (callDelta?.function?.arguments) {
                    toolCall.function.arguments +=
                        callDelta.function!.arguments;
                }
                if (callDelta?.id) {
                    toolCall.id = callDelta.id;
                }
            }
        }

        if (isToolsCall) {
            message.message.tool_calls = [toolCall];
        }

        return message;
    }

    async processChoice(
        vaultId: string,
        chatId: string,
        choice: ChatCompletion.Choice,
    ): Promise<ChatCompletionMessageParam> {
        const assistantResponse = {
            role: choice.message.role,
            content: choice.message.content,
        } as any;
        this.addToHistory(vaultId, chatId, assistantResponse);

        if (choice.finish_reason === 'tool_calls') {
            const calls = choice.message.tool_calls!;
            const call = calls[0];
            const fnArgs = JSON.parse(call.function.arguments);
            const response = await this.toolsProvider.executeTool(
                vaultId,
                call.function.name,
                fnArgs,
            );
            assistantResponse.content = JSON.stringify(call.function);
            assistantResponse.tool_calls = calls;
            this.historyProvider.addToContext(chatId, response.ids);
            return this.createToolPrompt(call.id, response.response);
        }

        return assistantResponse;
    }

    emitChunk(type: 'content' | 'tool' | 'end', chatId: string, chunk: any) {
        this.responseEmitter.emit(chatId, type, chunk);
    }

    toolsDefinitions() {
        return this.toolsProvider.collectDefinitions();
    }

    initializeHistory(vaultId: string, chatId: string) {
        if (this.historyProvider.retrieveHistory(vaultId, chatId).length) {
            return;
        }
        this.historyProvider.addToHistory(
            vaultId,
            chatId,
            this.promptProvider.createSystemPrompt(),
        );
    }

    retrieveHistory(vaultId: string, chatId: string) {
        return this.historyProvider.retrieveHistory(vaultId, chatId);
    }

    addToHistory(
        vaultId: string,
        chatId: string,
        message: ChatCompletionMessageParam,
    ) {
        this.historyProvider.addToHistory(vaultId, chatId, message);
    }

    createUserPrompt(message: string): ChatCompletionUserMessageParam {
        return this.promptProvider.createUserPrompt(message);
    }

    createToolPrompt(
        callId: string,
        response: string,
    ): ChatCompletionToolMessageParam {
        return {
            role: 'tool',
            tool_call_id: callId,
            content: response,
        };
    }
}
