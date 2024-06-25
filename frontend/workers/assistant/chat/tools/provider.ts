import { ChatCompletionTool } from 'openai/resources';
import { WorkerContext } from '~/@types/app';

export type ToolFunction = (vaultId: string, props: any) => Promise<any> | any;
export class ToolsProvider {
    private definitions: Record<string, ChatCompletionTool> = {};
    private tools: Record<string, ToolFunction> = {};
    private context: WorkerContext;

    constructor(context: WorkerContext) {
        this.context = context;
    }

    registerTool(tool: ToolFunction, definition: ChatCompletionTool) {
        this.definitions[definition.function.name] = definition;
        this.tools[definition.function.name] = tool;
    }

    async executeTool(vaultId: string, toolName: string, args: any) {
        const tool = this.tools[toolName];
        const { metadata, content, ids } = await tool(vaultId, args);
        return { response: JSON.stringify({ metadata, content }), ids };
    }

    collectDefinitions() {
        return Object.values(this.definitions);
    }
}

export class DummyProvider extends ToolsProvider {
    collectDefinitions() {
        return [];
    }
}
