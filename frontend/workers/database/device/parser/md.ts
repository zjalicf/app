import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { WorkerContext } from '~/@types/app';
import { ServiceKey, UtilActions } from '~/constants';

export class MDParser implements ContentParser {
    context: WorkerContext;
    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    async parse(parserEntity: PartialParserEntity): Promise<string> {
        const convertedContent = await this.context.invoke<string[]>(
            ServiceKey.UTILS,
            UtilActions.PARSE_MD_TO_HTML,
            {
                vaultId: parserEntity.vaultId,
                entity: [parserEntity],
                callerContext: 'md.ts/parse',
            },
        );
        return convertedContent?.[0];
    }

    async parseBatch(
        vaultId: string,
        parserEntities: PartialParserEntity[],
    ): Promise<string[]> {
        const convertedContent = await this.context.invoke<string[]>(
            ServiceKey.UTILS,
            UtilActions.PARSE_MD_TO_HTML,
            {
                vaultId,
                entity: parserEntities,
                callerContext: 'md.ts/parseBatch',
            },
        );
        return convertedContent;
    }
}
