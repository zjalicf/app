import { WorkerContext } from '~/@types/app';
import { ServiceKey } from '~/constants';
import { AssistantResponseEmitter } from '~/workers/assistant/chat/interface';

export class SummaryEmitter implements AssistantResponseEmitter {
    context: WorkerContext;
    constructor(context: WorkerContext) {
        this.context = context;
    }

    emit(chatId: string, type: string, content: any) {
        this.context.emit(ServiceKey.NUXT, 'emit', {
            event: `assistant-summary-emit-${chatId}`,
            data: {
                type,
                content,
            },
        });
    }
}
