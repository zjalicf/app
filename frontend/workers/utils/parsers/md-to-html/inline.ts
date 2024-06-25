import { marked } from 'marked';
import { StorageType } from '~/workers/utils/parsers/storage';
import { getImage } from '~/workers/utils/parsers/md-to-html/image';
import {
    extractWikilinks,
    getMostCommonPath,
    parseAsWikiLink,
} from '~/workers/utils/parsers/md-to-html/helpers';
import { GithubIntegrationDataType } from '~/components/github/github';
import { extensionErrorWrapper } from '~/workers/utils/parsers/md-to-html/utils';

const wikilinkImagesInline = (configFn: any) =>
    ({
        name: 'wikilinkImagesInline',
        level: 'inline',
        start(src: string) {
            return src.match(/!\[\[[^\]]/)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /!\[\[([^[\]\n]+)]]/;
                    const match = rule.exec(src);
                    if (match && match.index === 0) {
                        const link = match[1].trim();
                        const token = getImage(
                            config,
                            link,
                            'wikilinkImagesInline',
                        );
                        if (token.kind === 'document') {
                            return {
                                ...token,
                                raw: match[0], // Text to consume from the source
                                preview: true,
                            };
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
                'wikilinkImagesInline',
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

const inlineImages = (configFn: any) =>
    ({
        name: 'inlineImages',
        level: 'inline',
        start(src: string) {
            return src.match(/^!\[/)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^!\[([^[]+)]\(([^(]+)\)/;
                    const match = rule.exec(src);
                    if (match) {
                        const link = match[2].trim();
                        const token = getImage(config, link, 'inlineImages');
                        return {
                            ...token,
                            href: link,
                            raw: match[0],
                        };
                    }
                },
                src,
                'inlineImages',
                config,
            );
        },
        renderer(token: any) {
            if (token.imageObject) {
                return `<image-component id='${token.imageObject.id}'></image-component>`;
            }
            // @ts-ignore
            return `<img src='${token.href}' alt='${token.alt}'>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const wikilinkLinks = (configFn: any, rule: RegExp = /^\[\[(.+?)]]/) =>
    ({
        name: 'wikilinkLinks',
        level: 'inline',
        start(src: string) {
            return src.match(/^\[\[/)?.index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const match = rule.exec(src);
                    if (match) {
                        const wikilink = extractWikilinks(
                            src.split('\n').shift()!,
                        ).shift();
                        if (!wikilink || src.indexOf(wikilink) !== 0) return;
                        const linkContent = wikilink
                            .replace(/^\[\[/, '')
                            .replace(/\]\]$/, '');
                        const { link, oc } = parseAsWikiLink(
                            linkContent,
                            config,
                        ) ?? {
                            link: '',
                        };
                        const searchableEntities = [StorageType.DOCUMENT];
                        if (link.startsWith('.events')) {
                            searchableEntities.push(StorageType.EVENT);
                        }
                        if (link.startsWith('.tasks')) {
                            searchableEntities.push(StorageType.TASK);
                        }
                        let kind = 'document';
                        const entities = searchableEntities.reduce(
                            (acc, type) => {
                                if (acc.length) return acc;
                                kind = type;
                                return (
                                    config.storage.getByIndex(
                                        config.entity.vaultId,
                                        type,
                                        link.replaceAll('/', config.sep),
                                    ) ?? []
                                );
                            },
                            [],
                        );

                        if (!entities?.length) return;
                        let linkEntity: any = getMostCommonPath(
                            link.replaceAll('/', config.sep),
                            config.entity.filepath
                                ?.replace(config.vault.filepath, '')
                                ?.replace('\\', '/') ?? '',
                            entities,
                        );
                        if (!linkEntity) {
                            linkEntity = entities.shift();
                        }
                        return {
                            // Token to generate
                            type: 'wikilinkLinks', // Should match "name" above
                            raw: wikilink, // Text to consume from the source
                            id: linkEntity.id,
                            entity: linkEntity,
                            kind,
                            oc,
                        };
                    }
                },
                src,
                'wikilinkLinks',
                config,
            );
        },
        renderer(token: any) {
            // @ts-ignore
            if (token.kind === 'task') {
                return `<vue-todo uuid='${token.id}'></vue-todo>`;
            }
            if (token.kind === 'event') {
                return `<inline-event id='${token.id}'></inline-event>`;
            }
            if (token.kind === 'jira') {
                return `<jira-issue id='${token.id}'></jira-issue>`;
            }
            const attrs: string[] = [`id='${token.id}'`];
            if (token.preview) {
                attrs.push(`preview=true`);
            }
            if (token.oc) {
                attrs.push(`oc='${token.oc}'`);
            }
            return `<inline-document-link ${attrs.join(
                ' ',
            )}></inline-document-link>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const githubLink = (configFn: any) => ({
    name: 'github-link',
    lavel: 'inline',
    renderer(token: any) {
        const config = configFn.getConfig();
        return extensionErrorWrapper(
            () => {
                // extract owner/repo and number from URL, can be issues or pull URL
                const match = token.href.match(
                    /https:\/\/github.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/,
                );

                const [_, owner, repo, __, number] = match ?? [];

                const isIssue = token.title.includes('github/issue');

                const idStart = isIssue
                    ? GithubIntegrationDataType.ISSUE
                    : GithubIntegrationDataType.PR;

                const type = isIssue ? 'issues' : 'pulls';

                const id = [idStart, owner, repo, type, number].join('/');

                // @ts-ignore
                return `<github-link url='${token.href}' id='${id}'></github-link>`;
            },
            undefined,
            'github-link',
            config,
        );
    },
});

const jiraLink = () => ({
    name: 'jira-link',
    lavel: 'inline',
    renderer(token: any) {
        // @ts-ignore
        return `<jira-link url='${token.href}' id='${token?.title?.replace(
            'preview:acreom/jira/',
            '',
        )}'></jira-link>`;
    },
});

const highlight = (configFn: any) =>
    ({
        name: 'highlight',
        level: 'inline',
        start(src: string) {
            const index = src.match(/==[^=]+/)?.index;
            return index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^==([^=]+)==/;
                    const match = rule.exec(src);
                    if (match && match.index === 0) {
                        const token = {
                            // Token to generate
                            type: 'highlight', // Should match "name" above
                            raw: match[0],
                            text: match[1],
                            tokens: [],
                        };
                        this.lexer.inline(token.text, token.tokens);
                        return token;
                    }
                },
                src,
                'highlight',
                config,
            );
        },
        renderer(token) {
            // @ts-ignore
            return `<mark class='text-highlight'>${this.parser.parseInline(
                token.tokens!,
            )}</mark>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const inlineKatex = (configFn: any) =>
    ({
        name: 'inlineKatex',
        level: 'inline',
        start(src: string) {
            const index = src.match(/\$([^$]+)\$/)?.index;
            return index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /^\$([^$]+)\$/;
                    const match = rule.exec(src);
                    if (match && match.index === 0) {
                        return {
                            // Token to generate
                            type: 'inlineKatex', // Should match "name" above
                            raw: match[0], // Text to consume from the source
                            expression: match[1].trim(),
                        };
                    }
                },
                src,
                'inlineKatex',
                config,
            );
        },
        renderer(token: any) {
            // @ts-ignore
            return `<inline-katex-component expression='${token.expression}'></inline-katex-component>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

const kbd = (configFn: any) =>
    ({
        name: 'kbd',
        level: 'inline',
        start(src: string) {
            const index = src.match(/<kbd>/)?.index;
            return index;
        },
        tokenizer(src: string, _tokens: any) {
            const config = configFn.getConfig();
            return extensionErrorWrapper(
                () => {
                    const rule = /<kbd>(.+?)<\/kbd>/;
                    const match = rule.exec(src);
                    if (match && match.index === 0) {
                        return {
                            // Token to generate
                            type: 'kbd', // Should match "name" above
                            raw: match[0], // Text to consume from the source
                            text: match[1],
                        };
                    }
                },
                src,
                'kbd',
                config,
            );
        },
        renderer(token: any) {
            // @ts-ignore
            return `<kbd>${token.text}</kbd>`;
        },
    } as marked.TokenizerExtension & marked.RendererExtension);

export const extensions = [
    inlineImages,
    wikilinkImagesInline,
    wikilinkLinks,
    inlineKatex,
    highlight,
    githubLink,
    jiraLink,
    kbd,
];
