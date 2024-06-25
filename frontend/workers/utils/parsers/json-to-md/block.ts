import { StorageType } from '../storage';
import {
    Config,
    ContentObj,
    ParserExtension,
    ParserExtensionResult,
} from './types';
import { ImageObject } from '~/@types';

export const createBlockParser = () => {
    return async (contentArray: ContentObj[], config: any): Promise<string> => {
        let text = '';
        const depth = config.depth + 1;
        for (const index in contentArray) {
            const iterationConfig = { ...config };
            if (Number(index) === contentArray.length - 1 && depth === 0) {
                iterationConfig.paragraph = {
                    ...iterationConfig.paragraph,
                    skipEndline: true,
                };
            }
            try {
                const content = contentArray[index];
                const { result, matched } = await handleCustomBlockParsers(
                    iterationConfig.block.extensions,
                    content,
                    {
                        ...iterationConfig,
                        index: Number(index),
                        total: contentArray.length,
                        depth,
                    },
                );
                if (matched) {
                    text += result;
                    continue;
                }
                text += await handleDefaults(content, {
                    ...iterationConfig,
                    index,
                    total: contentArray.length,
                    depth,
                });
            } catch (err) {
                console.log(err);
            }
        }
        return text;
    };
};

const handleCustomBlockParsers = async (
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

const incrementListLevel = (config: Config): number => {
    if (!config.list?.level && config.list?.level !== 0) return 0;
    return config.list?.level + 1;
};

const handleDefaults = async (
    content: ContentObj,
    config: Config,
): Promise<string> => {
    let text = '';
    let listConfig;
    switch (content.type) {
        case 'paragraph':
            text += await processParagraph(content, config);
            if (config.table?.skipEndline || config.paragraph?.skipEndline)
                break;
            text += config.paragraph.endline;
            break;
        case 'heading':
            text += await processHeading(content, config);
            text += config.paragraph.endline;
            break;
        case 'codeBlock':
            text += await processCodeBlock(content, config);
            text += config.paragraph.endline;
            break;
        case 'bulletList':
            listConfig = {
                ...config,
                list: {
                    ...config.list,
                    isActive: true,
                    type: 'bulletList',
                    level: incrementListLevel(config),
                },
            } as Config;
            text += await processList(content, listConfig);
            if (listConfig.list?.level === 0) {
                text += config.paragraph.endline;
            }
            break;
        case 'orderedList':
            listConfig = {
                ...config,
                list: {
                    ...config.list,
                    isActive: true,
                    type: 'orderedList',
                    level: incrementListLevel(config),
                },
            } as Config;
            text += await processList(content, listConfig);
            if (listConfig?.list?.level === 0) {
                text += config.paragraph.endline;
            }
            break;
        case 'listItem':
            text += await processListItem(content, config);
            break;
        case 'table':
            text += await processTable(content, config);
            text += config.paragraph.endline;
            break;
        case 'tableRow':
            text += await processTableRow(content, config);
            break;
        case 'tableHeader':
            text += await processTableHeader(content, config);
            break;
        case 'tableCell':
            text += await processTableCell(content, config);
            break;
        case 'taskList':
            text += await processList(content, {
                ...config,
                list: {
                    ...config.list,
                    isActive: true,
                    type: 'taskList',
                    level: incrementListLevel(config),
                },
            });
            break;
        case 'taskItem':
            text += await processTaskItem(content, config);
            break;
        case 'image':
        case 'imageComponent':
            text += await processImage(content, config);
            text += config.paragraph.endline;
            break;
        case 'blockKatex':
            text += await processBlockKatex(content, config);
            text += config.paragraph.endline;
            break;
        case 'horizontalRule':
            text += await processHorizontalRule(content, config);
            text += config.paragraph.endline;
            break;
        case 'blockquote':
            text += await processBlockquote(content, config);
            if (!config.list.isActive) {
                text += config.paragraph.endline;
            }
            break;
        case 'mermaid-component':
            text += await processMermaid(content, config);
            text += config.paragraph.endline;
            break;
        case 'youtube':
            text += processYoutube(content, config);
            text += config.paragraph.endline;
            break;
        case 'details':
            text += await processDetails(content, config);
            break;
        case 'detailsSummary':
            text += await processDetailsSummary(content, config);
            text += config.paragraph.endline;
            break;
        case 'detailsContent':
            text += await processDetailsContent(content, config);
            break;
        case 'jira-issue':
            text += await processJiraIssue(content, config);
            break;
        case 'taskItemContent':
            text += await processTask(content, config);
            break;
    }
    return text;
};

const processJiraIssue = async (issue: ContentObj, config: Config) => {
    const id = issue.attrs?.id;
    if (!id) return '';
    const jiraIssue = config.storage.getById(
        config.vault.id,
        StorageType.INTEGRATION_DATA,
        id,
    );
    return `[[jira:${jiraIssue.key}]]\n`;
};

const processDetails = async (
    details: ContentObj,
    config: Config,
): Promise<string> => {
    const content = await config.block.parse(details.content || [], {
        ...config,
        isBlockActive: true,
    });
    const splitContent = content.split(config.paragraph.endline);
    splitContent.pop(); // remove last empty line;
    const blockquoteContent = splitContent
        .map(line => '> ' + line)
        .join(config.paragraph.endline);
    return blockquoteContent + config.paragraph.endline;
};

const processDetailsSummary = async (
    detailsSummary: ContentObj,
    config: Config,
): Promise<string> => {
    const content = await config.inline.parse(
        detailsSummary.content || [],
        config,
    );

    return [
        `[!${detailsSummary.attrs?.type ?? 'info'}]${
            detailsSummary.attrs?.open ? '+' : '-'
        }`,
        content,
    ].join(' ');
};

const processDetailsContent = async (
    detailsContent: ContentObj,
    config: Config,
): Promise<string> => {
    return config.block.parse(detailsContent.content || [], config);
};

const processHorizontalRule = async (
    _hr: ContentObj,
    config: Config,
): Promise<string> => {
    return `---${config.paragraph.endline}`;
};

const processBlockquote = async (
    blockquote: ContentObj,
    config: Config,
): Promise<string> => {
    const content = await config.block.parse(blockquote.content || [], {
        ...config,
        isBlockActive: true,
    });

    const splitContent = content.split(config.paragraph.endline);
    splitContent.pop(); // remove last empty line;
    const blockquoteContent = splitContent
        .map(line => '> ' + line)
        .join(config.paragraph.endline);
    return blockquoteContent + config.paragraph.endline;
};

const processHeading = async (
    heading: ContentObj,
    config: Config,
): Promise<string> => {
    const level = heading.attrs?.level;
    const text = await config.inline.parse(heading.content || [], config);

    const headingContent = Array<string>(level).fill('#').join('');
    return `${headingContent} ${text}`;
};

const processParagraph = async (
    paragraph: ContentObj,
    config: Config,
): Promise<string> => {
    const content = await config.inline.parse(paragraph.content || [], config);
    if (!content) return '';
    return content;
    if (config.table?.skipEndline) return content;
    return `${content}${
        !config.paragraph?.skipEndline ? config.paragraph.endline : ''
    }`;
};

const processYoutube = (youtube: ContentObj, config: Config) => {
    const link = youtube.attrs?.src;
    return `![${link}](${link})`;
};

const processCodeBlock = async (
    codeblock: ContentObj,
    config: Config,
): Promise<string> => {
    const parsedContent = await config.inline.parse(
        codeblock.content || [],
        config,
    );

    const language = codeblock.attrs?.language || '';
    const backticks = '```';
    const endline = config.paragraph.endline;
    return `${backticks}${language}${endline}${parsedContent}${endline}${backticks}`;
};

const processList = async (
    list: ContentObj,
    config: Config,
): Promise<string> => {
    config.list.isActive = true;

    if (config.list.type === 'orderedList') {
        config = {
            ...config,
            isBlockActive: true,
            list: { ...config.list, start: list.attrs?.start ?? 1 },
        };
    }

    const endlineRegexp = new RegExp(`(?:${config.paragraph.endline})+$`);

    const listContent = await config.block.parse(list.content || [], {
        ...config,
        isBlockActive: true,
    });

    return listContent.replace(endlineRegexp, '') + config.paragraph.endline;
};

const processTask = async (
    task: ContentObj,
    config: Config,
): Promise<string> => {
    const text = await config.inline.parse(task.content || [], config);
    const endline = config.paragraph.endline;
    const completed = task.attrs?.completed;
    const start = task.attrs?.start;
    const end = task.attrs?.end;
    const rrule = task.attrs?.rrule;
    const metadata = [];
    if (start) {
        metadata.push('start:' + start);
    }
    if (end) {
        metadata.push('end:' + end);
    }
    if (rrule) {
        metadata.push(`rrule:` + task.attrs?.id + ':' + rrule);
    }
    if (metadata.length > 0) {
        metadata.unshift('');
    }
    return `[${completed ? 'x' : ' '}] ${text} ${metadata.join(' ')}${endline}`;
};

const processTaskItem = async (
    listItem: ContentObj,
    config: Config,
): Promise<string> => {
    const listMark = '- ';
    const listItemContent = await config.block.parse(
        listItem.content || [],
        config,
    );
    const checked = listItem.attrs?.checked;
    return `${listMark}[${checked ? 'x' : ' '}] ${listItemContent}`;
};

const processListItem = async (
    listItem: ContentObj,
    config: Config,
): Promise<string> => {
    const level = config.list?.level;
    if (!level && level !== 0) return '';
    const indentLength = config.list?.indent ?? 4;
    const start = config.list.start ?? 0;
    const listMark =
        config.list.type === 'bulletList'
            ? '-'
            : `${start + Number(config.index)}.`;
    const indent = Array(level * indentLength)
        .fill(' ')
        .join('');
    const listItemContent = await config.block.parse(
        listItem.content || [],
        config,
    );
    const endlineRegexp = new RegExp(`(?:${config.paragraph.endline})+$`);

    return `${indent}${listMark} ${listItemContent.replace(endlineRegexp, '')}${
        config.paragraph.endline
    }`;
};

const processTable = async (
    table: ContentObj,
    config: Config,
): Promise<string> => {
    const tableContent = await config.block.parse(table.content || [], {
        ...config,
        isBlockActive: true,
        table: {
            ...config.table,
            skipEndline: true,
            didPrintHeader: false,
        },
    });
    return tableContent;
};

const processTableRow = async (
    tableRow: ContentObj,
    config: Config,
): Promise<string> => {
    const shouldAddSplit = !config.table.didPrintHeader;
    const tableRowContent = await config.block.parse(
        tableRow.content || [],
        config,
    );

    const endline = config.paragraph.endline;
    const output = [`${tableRowContent}|${endline}`];
    if (shouldAddSplit && config.table.didPrintHeader) {
        const headingSplit = '|' + tableRow.content?.map(() => '---|').join('');
        output.push(`${headingSplit}${endline}`);
    }
    if (!config.table.didPrintHeader) {
        config.table.didPrintHeader = true;
        const headingSplit = '|' + tableRow.content?.map(() => '---|').join('');
        output.unshift(`${headingSplit}${endline}`);
        const heading = '|' + tableRow.content?.map(() => ' |').join('');
        output.unshift(`${heading}${endline}`);
    }

    return output.join('');
};

const processTableHeader = async (
    table: ContentObj,
    config: Config,
): Promise<string> => {
    config.table.didPrintHeader = true;
    const tableHeaderContent = await config.block.parse(table.content || [], {
        ...config,
    });
    return `| ${escapeNewLines(tableHeaderContent)} `;
};

const processTableCell = async (
    tableCell: ContentObj,
    config: Config,
): Promise<string> => {
    const tableCellContent = await config.block.parse(
        tableCell.content || [],
        config,
    );
    return `| ${escapeNewLines(tableCellContent)} `;
};

const processImage = async (
    image: ContentObj,
    config: Config,
): Promise<string> => {
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
        if (image.attrs?.src?.startsWith('file://')) {
            return (
                image.attrs?.src
                    ?.replace('file://', '')
                    .replaceAll(/\\/g, '/')
                    .replace(
                        config.vault.filepath!.replaceAll(/\\/g, '/'),
                        '',
                    ) || ''
            );
        }
        return image.attrs?.src || '';
    }

    if (imageObj.filepath) {
        let imagePath = imageObj.filepath
            .replace('file://', '')
            .replaceAll(/\\/g, '/');

        imagePath = config.storage.getLeastCommonPath(
            config.vault.id,
            StorageType.IMAGE,
            imagePath,
        );
        const relativePath = imagePath.replace(
            config.vault.filepath!.replaceAll(/\\/g, '/'),
            '',
        );
        return `![${imageObj.name!}](${relativePath})`;
    }

    return `![${imageObj.name!}](${imageObj.remoteUri})`;
};

const processBlockKatex = async (
    katex: ContentObj,
    config: Config,
): Promise<string> => {
    const endline = config.paragraph.endline;
    return katex.attrs?.expression
        ? `$$${endline}${katex.attrs.expression}${endline}$$`
        : '';
};

const processMermaid = async (
    mermaid: ContentObj,
    config: Config,
): Promise<string> => {
    const endline = config.paragraph.endline;
    const expression = mermaid.attrs?.expression.replace(/\\n/g, endline);
    if (!expression) return ['```mermaid', '```'].join(endline);
    return ['```mermaid', expression, '```'].join(endline);
};

const escapeNewLines = (content: string): string => {
    return content.replace(/\n/m, '\\n').replace(/\r/m, '\\r');
};
