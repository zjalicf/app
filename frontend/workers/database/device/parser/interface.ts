import { ParserEntity } from '~/workers/utils/parsers/wrapper';

export type PartialParserEntity = Partial<ParserEntity> & {
    content: ParserEntity['content'];
    vaultId: ParserEntity['vaultId'];
};
export interface ContentParser {
    parse(parserEntity: PartialParserEntity): Promise<string>;
    parseBatch(
        vaultId: string,
        parserEntities: PartialParserEntity[],
    ): Promise<string[]>;
}
