import path from 'path';
import { StorageType } from '../storage';
import {
    Config,
    ContentObj,
    ParserExtension,
    ParserExtensionResult,
} from './types';
import { ImageObject } from '~/@types';
import { GithubIntegrationDataType } from '~/components/github/github';

export const createInlineParser = () => {
    return async (
        contentArray: ContentObj[],
        config: Config,
    ): Promise<string> => {
        let text = '';
        for (const content of contentArray) {
            try {
                const { result, matched } = await handleCustomInlineParsers(
                    config.inline.extensions,
                    content,
                    config,
                );
                if (matched) {
                    text += result;
                    continue;
                }

                switch (content.type) {
                    case 'text':
                        text += processText(content, config);
                        break;
                    case 'hashtag':
                        text += processHashtag(content, config);
                        break;
                    case 'inlineDocumentLink':
                        text += await processInlineDocumentLink(
                            content,
                            config,
                        );
                        break;
                    case 'inlineEvent':
                        text += await processInlineEvent(content, config);
                        break;
                    case 'inlineKatex':
                        text += processInlineKatex(content, config);
                        break;
                    case 'image-inline':
                        text += processImageInline(content, config);
                        break;
                    case 'github-link':
                        text += processGithubLink(content, config);
                        break;
                    case 'jira-link':
                        text += processJiraLink(content, config);
                        break;
                }
            } catch (err) {
                console.log(err);
            }
        }
        return text;
    };
};

const processJiraLink = (
    jiraLink: ContentObj | undefined,
    _config: Config,
): string => {
    const key = jiraLink?.attrs?.id;

    if (!key) {
        return `[${jiraLink?.attrs?.url}](${jiraLink?.attrs?.url})`;
    }

    const preview = `preview:acreom/jira/${key}`;

    return `[${jiraLink?.attrs?.url}](${jiraLink?.attrs?.url} "${preview}")`;
};

const processGithubLink = (
    githubLink: ContentObj | undefined,
    _config: Config,
): string => {
    const id = githubLink?.attrs?.id;

    if (!id) {
        return `[${githubLink?.attrs?.url}](${githubLink?.attrs?.url})`;
    }

    const preview = id.startsWith(GithubIntegrationDataType.ISSUE)
        ? 'preview:acreom/github/issue'
        : 'preview:acreom/github/pull';

    return `[${githubLink?.attrs?.url}](${githubLink?.attrs?.url} "${preview}")`;
};

const handleCustomInlineParsers = async (
    customParsers: ParserExtension[],
    content: ContentObj,
    config: Config,
): Promise<ParserExtensionResult> => {
    const output = { result: '', matched: false };
    if (!customParsers) return output;
    for (const parser of customParsers) {
        if (content.type === parser.type) {
            output.result = await parser.parse(content, config);
            output.matched = true;
            break;
        }
    }
    return output;
};

const processText = (text: ContentObj | undefined, config: Config): string => {
    const { open, close } = config.marks.parse(text?.marks!, config);
    return `${open}${text?.text || ''}${close}`;
};

const processImageInline = (image: ContentObj, config: Config): string => {
    const uuid = image.attrs?.id;
    let imageObj!: ImageObject;
    if (image.attrs?.id) {
        imageObj = config.storage.getById(
            config.vault.id,
            StorageType.IMAGE,
            uuid,
        );
    }

    if (!imageObj || (!imageObj.filepath && !imageObj.remoteUri)) {
        let src = image.attrs?.src || '';
        if (image.attrs?.src.startsWith('file://')) {
            src =
                image.attrs?.src
                    .replace('file://', '')
                    .replaceAll(/\\/g, '/')
                    .replaceAll(
                        config.vault.filepath!.replaceAll(/\\/g, '/'),
                        '',
                    ) || '';
        }

        return `![${image.attrs?.title || image.attrs?.alt || ''}](${src})`;
    }

    if (imageObj.filepath) {
        const imagePath = imageObj.filepath
            .replace('file://', '')
            .replaceAll(/\\/g, '/');

        let relativePath = imagePath.replace(
            config.vault.filepath!.replaceAll(/\\/g, '/'),
            '',
        );

        const docPath = (config.entityFilepath ?? config.entity.filepath)
            ?.replaceAll(/\\/g, '/')
            .split('/');
        if (docPath) {
            docPath.pop();
            relativePath = path.relative(docPath.join('/'), imagePath);
        }

        return `![${imageObj.name!}](${relativePath})`;
    }

    return `![${imageObj.name!}](${imageObj.remoteUri})`;
};

const processHashtag = (
    hashtag: ContentObj | undefined,
    config: Config,
): string => {
    if (!hashtag?.attrs?.id) return '';
    const label = config.storage.getById(
        config.vault.id,
        StorageType.LABEL,
        hashtag?.attrs?.id,
    );

    if (!label) return `#${hashtag?.attrs?.id}`;

    return `#${label.name}`;
};

const processInlineDocumentLink = async (
    docLink: ContentObj | undefined,
    config: Config,
): Promise<string> => {
    const prefix = docLink?.attrs?.preview ? '!' : '';
    const oc = docLink?.attrs?.oc ?? '';
    const document = config.storage.getById(
        config.vault.id,
        StorageType.DOCUMENT,
        docLink?.attrs?.id!,
    );
    if (!document) return '';
    const normalizedPath =
        config.helpers.normalizeDocumentLink(
            config.vault.filepath!.replaceAll(/\\/g, '/'),
            document.filepath?.replaceAll(/\\/g, '/'),
        ) || document.title;

    const documentPath = config.storage
        .getLeastCommonPath(
            config.vault.id,
            StorageType.DOCUMENT,
            normalizedPath + '.md',
        )
        .replace('.md', '');

    const ocIsLink = oc.slice(1).trim() === documentPath;
    if (oc && !ocIsLink) {
        return `${prefix}[[${documentPath}${oc}]]`;
    }
    return `${prefix}[[${documentPath}${
        documentPath !== document.title ? '|' + document.title : ''
    }]]`;
};

const processInlineEvent = async (
    inlineEvent: ContentObj | undefined,
    config: Config,
): Promise<string> => {
    const event = config.storage.getById(
        config.vault.id,
        StorageType.EVENT,
        inlineEvent?.attrs?.id,
    );
    if (!event) return '';

    const eventPath = config.helpers.normalizeDocumentLink(
        config.vault.filepath!,
        event.filepath,
    );
    return `[[${eventPath}]]`;
};

const processInlineKatex = (
    katex: ContentObj | undefined,
    config: Config,
): string => {
    return katex?.attrs?.expression ? `$${katex?.attrs?.expression}$` : '';
};
