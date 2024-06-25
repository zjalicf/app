import { ParserEntity } from '../wrapper';
import { StorageType } from '../storage';
import { createBlockParser } from './block';
import { createInlineParser } from './inline';
import { createMarksParser } from './marks';
import { Config } from './types';
import {
    generateJSON,
    ParserNodesList,
} from '~/components/editor/extensions/parser-node-list';
import { ServiceKey } from '~/constants';

export const createParser = (
    context?: Config,
): ((entity: ParserEntity, config: any) => Promise<string>) => {
    const blockParser = createBlockParser();
    const inlineParser = createInlineParser();
    const marksParser = createMarksParser();

    const prepareConfig = (entity: any, scopedParserConfig: Config) => {
        const vault = scopedParserConfig.storage.getById(
            entity.vaultId,
            StorageType.VAULT,
            entity.vaultId,
        );
        scopedParserConfig.vault = vault!;
        if (scopedParserConfig.vault.filepath?.endsWith(scopedParserConfig.sep))
            return;
        scopedParserConfig.vault.filepath =
            scopedParserConfig.vault.filepath + scopedParserConfig.sep;
    };

    return async (
        entity: ParserEntity,
        config: Partial<Config>,
    ): Promise<string> => {
        try {
            const parserConfig = {
                ...(config || {}),
                ...(context || {}),
                depth: -1,
                sep: context?.$config?.os === 'windows' ? '\\' : '/',
                blockend:
                    context?.$config?.os === 'windows' ? '\r\n\r\n' : '\n\n',
                paragraph: {
                    skipEndline: false,
                    endline: context?.$config?.os === 'windows' ? '\r\n' : '\n',
                    ...config?.paragraph,
                },
                list: {
                    ...config?.list,
                },
                inline: {
                    parse: config?.inline?.parse || inlineParser,
                    extensions: config?.inline?.extensions || [],
                },
                block: {
                    parse: config?.block?.parse || blockParser,
                    extensions: config?.block?.extensions || [],
                },
                marks: {
                    parse: config?.marks?.parse || marksParser,
                    extensions: config?.marks?.extensions || [],
                },
            } as Config;
            const scopedParserConfig = {
                ...parserConfig,
                vaultId: entity.vaultId,
            };
            scopedParserConfig.entity = entity as any;
            scopedParserConfig.entityFilepath = entity.filepath;
            const JSONContent = generateJSON(
                entity.content || '',
                ParserNodesList,
            );
            await prepareConfig(entity, scopedParserConfig);
            const output = await scopedParserConfig.block.parse(
                JSONContent.content,
                scopedParserConfig,
            );
            if (output.endsWith(scopedParserConfig.paragraph.endline)) {
                return output.slice(
                    0,
                    output.length - scopedParserConfig.paragraph.endline.length,
                );
            }
            return output;
        } catch (err) {
            config?.emit(ServiceKey.SENTRY, 'trackError', err);
            console.log(err);
            return entity.content;
        }
    };
};
