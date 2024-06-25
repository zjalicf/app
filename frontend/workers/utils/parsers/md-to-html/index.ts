import { marked } from 'marked';
import { v4 } from 'uuid';
import { mdParserExtensions } from '~/workers/utils/parsers/md-to-html/extensions';
import { createWalkFunction } from '~/workers/utils/parsers/md-to-html/walk';
import { ServiceKey } from '~/constants';
import {
    getContentNewLine,
    parseEmptyLines,
    processOutput,
} from '~/workers/utils/parsers/md-to-html/utils';
import { ParserEntity } from '~/workers/utils/parsers/wrapper';
import { StorageType } from '~/workers/utils/parsers';
import { modifiedTokenizers } from '~/workers/utils/parsers/md-to-html/tokenizers';

const createExtensions = (extensions: any[], config: any) => {
    return extensions.map(extension => extension(config));
};

marked.setOptions({
    gfm: true,
    headerIds: false,
    smartLists: true,
    breaks: true,
});

const configStore = {
    getConfig: () => {},
};
export const createParser = (initialConfig: any) => {
    const blocks = Object.keys(marked.Lexer?.rules?.block);
    const gfmBlocks = Object.keys(
        (marked.Lexer?.rules?.block as marked.Rules)?.gfm || {},
    );
    const baseConfig = {
        endline: initialConfig.context.$config.os === 'windows' ? '\r\n' : '\n',
        sep: initialConfig.context.$config.os === 'windows' ? '\\' : '/',
        blocks: [...blocks, ...gfmBlocks, 'space'].filter(
            k => !['newline', 'text'].includes(k),
        ),
    };

    const customExtensions = createExtensions(mdParserExtensions, configStore);
    marked.use({
        walkTokens: createWalkFunction(configStore),
        extensions: customExtensions,
        tokenizer: modifiedTokenizers,
        renderer: {
            code(
                code: string,
                language: string | undefined,
                _isEscaped: boolean,
            ): string {
                const lang = (language || '').match(/\S*/)?.[0];
                if (!lang) {
                    return `<pre><code>${code}</code></pre>`;
                }
                return `<pre><code class="hljs language-${lang}">${code}</code></pre>`;
            },
            heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6): string {
                return `<h${level} data-id="${v4()}">${text}</h${level}>`;
            },
            text(text: string): string {
                return text;
            },
            checkbox(_checked: boolean): string {
                return '';
            },
            listitem(text: string): string {
                const lines = text.split('\n');
                const parsedLines = lines.map(line => {
                    if (
                        line.startsWith('<li>') &&
                        (line.endsWith('</ul>') || line.endsWith('</ol>'))
                    ) {
                        return `${line}</li>`;
                    }
                    if (line.endsWith('<ul>')) {
                        if (line.startsWith('<div')) {
                            return `<li>${line}`;
                        }
                        return `<li><p>${line.slice(0, -4)}</p><ul>`;
                    }
                    if (line.endsWith('<ol>')) {
                        if (line.startsWith('<div')) {
                            return `<li>${line}`;
                        }
                        return `<li><p>${line.slice(0, -4)}</p><ol>`;
                    }
                    if (line.startsWith('<div')) {
                        return `<li>${line}</li>`;
                    }
                    return `<li><p>${line}</p></li>`;
                });
                if (
                    parsedLines[parsedLines.length - 1] === '<li><p></p></li>'
                ) {
                    parsedLines.pop();
                }
                return parsedLines.join('');
            },
        },
    });

    // @ts-ignore
    return async (entity: ParserEntity, parserConfig: any): Promise<string> => {
        const config = {
            ...initialConfig,
            ...baseConfig,
            ...parserConfig,
        };
        config.endline = getContentNewLine(entity.content, config);
        if (entity) {
            config.entity = entity;
            config.entityPath = entity.filepath ?? config.entityPath;
        }

        return parse(entity, config);
    };
};

export const parse = (data: ParserEntity, config: any): string => {
    const parsedLines = parseEmptyLines(data.content, config);
    try {
        const vault = config.storage.getById(
            data.vaultId,
            StorageType.VAULT,
            data.vaultId,
        );
        config.vault = vault!;
        config.entity = data;

        configStore.getConfig = () => config;
        const output = marked(parsedLines);
        const processedOutput = processOutput(output, config);
        return processedOutput;
    } catch (err) {
        config?.context?.emit(ServiceKey.SENTRY, 'trackError', err);
        console.log(err);
        return data.content;
    }
};
