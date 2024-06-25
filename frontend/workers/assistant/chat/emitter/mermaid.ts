import { WorkerContext } from '~/@types/app';
import { AssistantResponseEmitter } from '~/workers/assistant/chat/interface';

export class MermaidEmitter implements AssistantResponseEmitter {
    context: WorkerContext;
    constructor(context: WorkerContext) {
        this.context = context;
    }

    emit(_chatId: string, _type: string, _content: any) {}
}
