import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { WorkerContext } from '~/@types/app';
import { ServiceKey, UtilActions } from '~/constants';

export class HTMLParser implements ContentParser {
    context: WorkerContext;
    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    async parse(parserEntity: PartialParserEntity): Promise<string> {
        const convertedContent = await this.context.invoke<string[]>(
            ServiceKey.UTILS,
            UtilActions.PARSE_HTML_TO_MD,
            {
                vaultId: parserEntity.vaultId,
                entity: [parserEntity],
                callerContext: 'html.ts/parse',
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
            UtilActions.PARSE_HTML_TO_MD,
            {
                vaultId,
                entity: parserEntities,
                callerContext: 'html.ts/parseBatch',
            },
        );
        return convertedContent;
    }
}
