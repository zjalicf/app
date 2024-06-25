import { marked } from 'marked';
import { StorageType } from '~/workers/utils/parsers/storage';
import { getImage } from '~/workers/utils/parsers/md-to-html/image';
import { extensionErrorWrapper } from '~/workers/utils/parsers/md-to-html/utils';

const wikilinkImages = (configFn: any) =>
    ({
        name: 'wikilinksImages',
        level: 'block',
        start(src: string) {
            return src.match(/!\[\[[^\]]/)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^!\[\[([^[\]\n]+)]]/;
                    const match = rule.exec(src);
                    if (match && match.index === 0) {
                        const link = match[1].trim();
                        const token = getImage(config, link, 'wikilinksImages');
                        if (token.kind === 'document') {
                            return;
                        }

                        return {
                            ...token,
                            link,
                            href: link,
                            raw: match[0],
                        };
                    }
                },
                src,
                'wikilinksImages',
                config,
            );
        },
        renderer(token: any) {
            if (token.imageObject) {
                return `<image-component id='${token.imageObject.id}'></image-component>`;
            }
            // @ts-ignore
            return `<img src='${token.href}'>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const blockKatex = (configFn: any) =>
    ({
        name: 'blockKatex',
        level: 'block',
        start(src: string) {
            return src.match(/^\$\$/m)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^\$\$([^$]+)\$\$/;
                    const match = rule.exec(src);
                    if (match) {
                        return {
                            // Token to generate
                            type: 'blockKatex', // Should match "name" above
                            raw: match[0], // Text to consume from the source
                            // @ts-ignore
                            expression: match[1].trim(),
                        };
                    }
                },
                src,
                'blockKatex',
                config,
            );
        },
        renderer(token: any) {
            // @ts-ignore
            return `<block-katex-component expression='${token.expression}'></block-katex-component>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const blockImages = (configFn: any) =>
    ({
        name: 'blockImages',
        level: 'block',
        start(src: string) {
            return src.match(/^!\[/m)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^!\[([^[]+)]\(([^("]+)\s?(?:".+")?\)/;
                    const match = rule.exec(src);
                    if (match) {
                        const link = match[2].trim();
                        const token = getImage(config, link, 'blockImages');
                        return {
                            ...token,
                            href: link,
                            alt: match[1].trim(),
                            raw: match[0],
                        };
                    }
                },
                src,
                'blockImages',
                config,
            );
        },
        renderer(token: any) {
            if (token.imageObject) {
                return `<image-component id='${token.imageObject?.id}'></image-component>`;
            }
            // @ts-ignore
            return `<img src='${token.href}' alt='${token.alt}'>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const jiraIssueLink = (configFn: any) => ({
    name: 'jiraIssueLink',
    level: 'block',
    start(src: string) {
        return src.match(/\[\[jira:[^\]]+\]\]/)?.index;
    },
    tokenizer(src: string, _tokens: any) {
        const config = configFn.getConfig();
        return extensionErrorWrapper(
            () => {
                const rule = /\[\[\s*(jira:[^\]]+)\s*\]\]/;
                const match = rule.exec(src);
                if (match && match.index === 0) {
                    const link = match[1].trim();

                    const entity = config.storage.getByIndex(
                        config.entity.vaultId,
                        StorageType.INTEGRATION_DATA,
                        link,
                    );
                    if (!entity.length) return;

                    return {
                        type: 'jiraIssueLink',
                        raw: match[0],
                        id: entity.shift().id,
                    };
                }
            },
            src,
            'jiraIssueLink',
            config,
        );
    },
    renderer(token: any) {
        return `<jira-issue id='${token.id}'></jira-issue>`;
    },
});

const youtube = (_config: any) => ({
    name: 'youtube',
    level: 'block',

    renderer(token: any) {
        return `<div data-youtube-video=""><iframe
width="1280"
height="720"
allowfullscreen="true"
autoplay="false"
disablekbcontrols="false"
enableiframeapi="false"
endtime="0"
ivloadpolicy="0"
loop="false"
modestbranding="false"
origin=""
playlist=""
src="${token.href}"
start="0"></iframe></div>`.replaceAll('\n', ' ');
    },
});

const blockMermaid = (configFn: any) =>
    ({
        name: 'blockMermaid',
        level: 'block',
        renderer(token: any) {
            // @ts-ignore
            return `<mermaid-component expression='${token.text.replace(
                /\n/g,
                '\\n',
            )}'></mermaid-component>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const listItem = (_configFn: any) =>
    ({
        name: 'list_item',
        level: 'block',
        renderer(token: any): string {
            return `<li>${this.parser.parse(token.tokens)}</li>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const taskPropertyRegexp =
    /(?:start:(?:(?:(?:dateTime)|(?:date)):(?:\d*)) ?)|(?:end:(?:(?:(?:dateTime)|(?:date)):(?:\d*)) ?)|(?:rrule:[^<\s]+ ?)/g;

const taskItemContent = (configFn: any) =>
    ({
        name: 'taskItemContent',
        level: 'block',
        renderer(token: any): string {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const attrsKeys = [
                        'id',
                        'completed',
                        'start',
                        'end',
                        'rrule',
                    ];
                    const attrs = attrsKeys.reduce((acc, key) => {
                        if (!(key in token)) {
                            return acc;
                        }
                        return [...acc, `${key}="${token[key]}"`];
                    }, [] as string[]);
                    if (attrs.length) {
                        attrs.unshift('');
                    }
                    const rawText = this.parser.parse(token.tokens);
                    const [firstLine, ...rest] = rawText.split('\n');
                    const text = firstLine.replaceAll(taskPropertyRegexp, '');

                    const taskItemContent =
                        `<div data-type="taskItemContent"${attrs.join(
                            ' ',
                        )}>${text
                            .replaceAll(/(?:<p>)|(?:<\/p>)/g, '')
                            .trimEnd()}</div>${rest.join('\n')}`.replace(
                            '\n',
                            '',
                        );
                    return taskItemContent;
                },
                undefined,
                'taskItemContent',
                config,
            );
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const emptyLine = (_configFn: any) => ({
    name: 'emptyLine',
    renderer(token: any) {
        return new Array(token.lines).fill('<p></p>').join('');
    },
});

export const extensions = [
    emptyLine,
    // taskList,
    // taskItem,
    taskItemContent,
    listItem,
    // taskItemContent,
    jiraIssueLink,
    blockImages,
    wikilinkImages,
    blockKatex,
    blockMermaid,
    youtube,
];
