import {
    createJSONParser,
    createMDParser,
    ParserWrapper,
    EntityStorage,
} from './parsers';
import { GenericActions, ServiceKey, UtilActions } from '~/constants';
import { WorkerBase } from '~/workers/base';
import { WorkerContext } from '~/@types/app';

export class UtilsWorker extends WorkerBase {
    protected invokeTimeout: number = 60_000;
    protected serviceKey = ServiceKey.UTILS;

    protected parser!: ParserWrapper;
    protected entityStorage!: EntityStorage;

    public constructor() {
        super();
    }

    protected async handleMessage(
        operation: string,
        payload: any,
        messageId: string,
        service?: ServiceKey,
    ) {
        if (operation === GenericActions.RESPONSE) {
            this.invokeCallbacks[messageId]?.(payload);
            return;
        }
        const response: any = await this.processMessage(operation, payload);
        return this.emit(
            service || ServiceKey.UTILS,
            GenericActions.RESPONSE,
            response,
            messageId,
        );
    }

    async processMessage(operation: string, payload: any): Promise<any | void> {
        switch (operation) {
            case GenericActions.EMIT:
                return this.handleEvent(payload.event, payload.payload);

            case UtilActions.INITIALIZE:
                return this.initialize(payload.context);

            case UtilActions.INDEX_ENTITY:
                return this.entityStorage.set(
                    payload.vaultId,
                    payload.type,
                    payload.entity,
                );
            case UtilActions.REMOVE_ENTITY:
                return this.entityStorage.set(
                    payload.vaultId,
                    payload.type,
                    payload.entity,
                );
            case UtilActions.PARSE_HTML_TO_MD:
                return this.parser.parseHTMLtoMD(
                    payload.vaultId,
                    payload.entity,
                );
            case UtilActions.PARSE_MD_TO_HTML:
                return this.parser.parseMDtoHTML(
                    payload.vaultId,
                    payload.entity,
                );
        }

        return {} as any;
    }

    initialize(ctx: WorkerContext['$config']) {
        const comms = this.getCommsFunctions();
        const context = {
            ...comms,
            $config: ctx,
        } as WorkerContext;
        this.entityStorage = new EntityStorage(ctx);

        this.parser = new ParserWrapper(
            context,
            createJSONParser(context),
            createMDParser(context),
            this.entityStorage,
        );
    }
}
