import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { WorkerContext } from '~/@types/app';

export class NoOpParser implements ContentParser {
    context: WorkerContext;
    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    parse(parserEntity: PartialParserEntity): Promise<string> {
        return parserEntity.content as any;
    }

    parseBatch(
        _vaultId: string,
        parserEntities: PartialParserEntity[],
    ): Promise<string[]> {
        return Promise.resolve(parserEntities.map(e => e.content));
    }
}
