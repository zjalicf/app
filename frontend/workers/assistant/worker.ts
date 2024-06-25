import {
    AssistantActions,
    DatabaseServiceAction,
    GenericActions,
    ServiceKey,
} from '~/constants';
import { WorkerBase } from '~/workers/base';
import { WorkerContext } from '~/@types/app';
import { HistoryProvider, ToolsProvider } from '~/workers/assistant/chat';
import {
    getRelevantContent,
    getRelevantContentDefinition,
} from '~/workers/assistant/chat/tools';
import { assistantFactory } from '~/workers/assistant/chat/builder';
import { IUser } from '~/workers/database/indexeddb/types';

export class AssistantWorker extends WorkerBase {
    protected invokeTimeout: number = 10_000;
    private channel!: MessageChannel;
    private context!: WorkerContext;
    private configs: Record<string, any> = {};
    private historyProvider!: HistoryProvider;
    private toolsProvider!: ToolsProvider;
    protected serviceKey = ServiceKey.ASSISTANT;

    public constructor() {
        super();
    }

    initialize(ctx: WorkerContext['$config']) {
        const comms = this.getCommsFunctions();
        this.context = {
            ...comms,
            $config: ctx,
            channel: this.channel,
        } as any;
        this.historyProvider = new HistoryProvider();
        this.toolsProvider = new ToolsProvider(this.context);
        this.toolsProvider.registerTool(
            getRelevantContent(this.context),
            getRelevantContentDefinition,
        );
    }

    assistantFactory(type: 'ask' | 'summary' | 'mermaid', config: any) {
        return assistantFactory(
            this.context,
            type,
            this.toolsProvider,
            this.historyProvider,
            config,
        );
    }

    private get beBaseUrl() {
        return this.context.$config.baseUrl;
    }

    private async retrieveUser() {
        const users = await this.context.invoke<IUser[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'users',
                callerContext: 'assistant/worker.ts/retrieveUser',
            },
        );
        const user = users?.shift();

        return user ?? null;
    }

    async createConfig(vaultId: string) {
        const config = this.configs[vaultId];
        if (!config) {
            return null;
        }
        if (config.data.type === 'default') {
            const user = await this.retrieveUser();
            if (!user) return null;
            return {
                apiKey: user?.credentials?.accessToken!,
                baseURL: `${this.beBaseUrl}/proxy/openai/v1`,
            };
        }
        return {
            apiKey: config.data.apiKey!,
        };
    }

    protected async handleMessage(
        operation: string,
        payload: any,
        messageId: string,
    ) {
        if (operation === GenericActions.RESPONSE) {
            this.invokeCallbacks[messageId]?.(payload);
            return;
        }
        let response: any = {};
        let config = null;
        switch (operation) {
            case GenericActions.EMIT:
                this.handleEvent(payload.event, payload.payload);
                return;
            case AssistantActions.INITIALIZE:
                this.initialize(payload.context);
                break;
            case AssistantActions.SET_CONFIG:
                this.configs[payload.vaultId] = payload;
                break;
            case AssistantActions.GET_TOOL_CONTEXT:
                response = this.historyProvider.retrieveToolContext(
                    payload.callId,
                );
                break;
            case AssistantActions.ASK_ASSISTANT:
                config = await this.createConfig(payload.vaultId);
                if (!config) break;
                response = await this.assistantFactory('ask', config)?.execute(
                    payload.vaultId,
                    payload.chatId,
                    payload.message,
                );
                break;
            case AssistantActions.GENERATE_MERMAID:
            case AssistantActions.GENERATE_MERMAID_LOCAL:
                config = await this.createConfig(payload.vaultId);
                if (!config) break;
                response = await this.assistantFactory(
                    'mermaid',
                    config,
                )?.execute(payload.vaultId, payload.chatId, payload.message);
                break;
            case AssistantActions.GENERATE_SUMMARY:
            case AssistantActions.GENERATE_SUMMARY_LOCAL:
                config = await this.createConfig(payload.vaultId);
                if (!config) break;
                response = await this.assistantFactory(
                    'summary',
                    config,
                )?.execute(payload.vaultId, payload.chatId, payload.message);
                break;
        }

        return this.emit(
            ServiceKey.ASSISTANT,
            GenericActions.RESPONSE,
            response,
            messageId,
        );
    }
}
