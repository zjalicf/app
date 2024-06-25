import { marked } from 'marked';
import { v4 } from 'uuid';
import { join } from '~/workers/utils/parsers/helpers';
import { extensionErrorWrapper } from '~/workers/utils/parsers/md-to-html/utils';

export const YOUTUBE_REGEX =
    /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?!.*\/channel\/)(?!\/@)(.+)?$/;

const getProperty = (text: string, property: string) => {
    const match = text.match(new RegExp(`${property}:([^\\s]+)`));
    return match?.[1] ?? null;
};
export const isValidYoutubeUrl = (url: string) => {
    return url.match(YOUTUBE_REGEX);
};

type WalkFn = (token: any, config: any) => void;
type WalkTransformer = {
    type: string[];
    fn: WalkFn;
};

export const createWalkFunction = (configFn: any) => {
    return (token: marked.Token) => {
        const transformers = resolveWalkFns(token.type);
        for (const transformer of transformers) {
            extensionErrorWrapper(
                () => {
                    return transformer(token, configFn);
                },
                undefined,
                'walk' + token?.type,
                configFn.getConfig(),
            );
        }
    };
};

const resolveWalkFns = (type: string): WalkFn[] => {
    return walkTokenFunctions
        .filter(({ type: _type }) => _type.includes(type))
        .map(({ fn }) => fn);
};

const resolveYoutube = {
    type: ['inlineImages', 'blockImages'],
    fn: (token: marked.Tokens.Link, _configFn: any) => {
        const isYoutube =
            isValidYoutubeUrl(token.href) || token.href.includes('youtu.be');
        if (isYoutube) {
            // @ts-ignore
            token.type = 'youtube';
        }
    },
};

const resolveLink = {
    type: ['link'],
    fn: (token: marked.Tokens.Link, _configFn: any) => {
        // here check title for github preview
        if (!token.title) return;
        if (token.title.startsWith('preview:acreom/github')) {
            // @ts-ignore
            token.type = 'github-link';
            token.tokens = [];
        }

        if (token.title.startsWith('preview:acreom/jira')) {
            // @ts-ignore
            token.type = 'jira-link';
            token.tokens = [];
        }
    },
};

const wrapListItems = {
    type: ['list_item'],
    fn: (token: marked.Tokens.ListItem, configFn: any) => {
        const config = configFn.getConfig();

        // @ts-ignore
        if (token.tokens?.[0]?.type === 'taskItemContent') {
            return;
        }
        if (!token.task) {
            const istask = /^\[[ xX]?\] /.exec(token.text);
            if (!istask) return;
            const ischecked = istask[0].toLowerCase().includes('x');
            token.task = true;
            token.checked = ischecked;
        }

        if (!token.task) {
            return;
        }

        const attrs = {
            completed: token.checked,
            id: v4(),
        } as any;
        let tokens = [...token.tokens];
        const start = getProperty(token.text, 'start');
        const end = getProperty(token.text, 'end');
        const rrule = getProperty(token.text, 'rrule');
        if (start) {
            attrs.start = start;
            tokens = tokens.map((token: any) => {
                if (token.type !== 'text') {
                    return token;
                }
                return {
                    ...token,
                    text: token.text.replace(`start:${start}`, ''),
                    tokens:
                        token.tokens?.map((token: any) => {
                            if (token.type !== 'text') {
                                return token;
                            }
                            return {
                                ...token,
                                text: token.text.replace(`start:${start}`, ''),
                            };
                        }) ?? [],
                };
            });
        }
        if (end) {
            tokens = tokens.map((token: any) => {
                if (token.type !== 'text') {
                    return token;
                }
                return {
                    ...token,
                    text: token.text.replace(`end:${end}`, ''),
                    tokens:
                        token.tokens?.map((token: any) => {
                            if (token.type !== 'text') {
                                return token;
                            }
                            return {
                                ...token,
                                text: token.text.replace(`end:${end}`, ''),
                            };
                        }) ?? [],
                };
            });
            attrs.end = end;
        }
        if (rrule) {
            tokens = tokens.map((token: any) => {
                if (token.type !== 'text') {
                    return token;
                }
                return {
                    ...token,
                    text: token.text.replace(`rrule:${rrule}`, ''),
                    tokens:
                        token.tokens?.map((token: any) => {
                            if (token.type !== 'text') {
                                return token;
                            }
                            return {
                                ...token,
                                text: token.text.replace(`rrule:${rrule}`, ''),
                            };
                        }) ?? [],
                };
            });
            const [id, ...rest] = rrule.split(':');
            attrs.rrule = rest.join(':');
            attrs.id = id;
        }
        token.text = token.text.trim();

        // @ts-ignore
        token.tokens = [
            {
                type: 'taskItemContent',
                ...attrs,
                tokens: tokens.filter(
                    token =>
                        token.type !== 'text' || token.text.trim().length > 0,
                ),
            },
        ];
    },
} as WalkTransformer;

const mermaid = {
    type: ['code'],
    fn: (token: marked.Tokens.Code, _configFn: any) => {
        if (token.lang === 'mermaid') {
            (token as marked.Tokens.Generic).type = 'blockMermaid';
        }
    },
};

const walkTokenFunctions: WalkTransformer[] = [
    wrapListItems,
    resolveYoutube,
    mermaid,
    resolveLink,
];
