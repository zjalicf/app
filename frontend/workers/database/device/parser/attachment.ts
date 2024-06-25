import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { WorkerContext } from '~/@types/app';

export class AttachmentParser implements ContentParser {
    context: WorkerContext;
    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    async parse(parserEntity: PartialParserEntity): Promise<string> {
        const data = await this.context.$deviceService.ImageData.retrieve(
            parserEntity.vaultId,
            parserEntity.id!,
        );

        return parserEntity.content as any;
    }

    parseBatch(
        _vaultId: string,
        parserEntities: PartialParserEntity[],
    ): Promise<string[]> {
        return parserEntities.map(parserEntity => parserEntity.content) as any;
    }
}
