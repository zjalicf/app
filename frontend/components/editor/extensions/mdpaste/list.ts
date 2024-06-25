import { Node } from '@tiptap/pm/model';
import { EditorContext } from '~/@types/app';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';

type List = {
    type: string;
    content: (List | any)[];
    spacing?: number;
};

export const listPasteRule = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;

    return blockNodePasteRule({
        find: /^([ \t]*?)([-*+]|\d{1,9}[.)])\s[\s\S]+?\n$/gm,
        getAttributes: match => {
            return {
                type: ['-', '+', '*'].includes(match[2])
                    ? 'bulletList'
                    : 'orderedList',
            };
        },
        execute: (match, range, attrs, chain, state) => {
            const input = match[0];
            const lines = input.split('\n');

            if (lines[lines.length - 1] === '') {
                lines.pop();
            }
            const nodeJSON = createNodeJSON(lines, attrs);
            const listNode = Node.fromJSON(editor.schema, nodeJSON);
            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    listNode,
                );
                return true;
            });
        },
    });
};

export const findCurrentLevelListItem = (root: List, spacing: number): List => {
    const nodesToSearch = [root];
    let deepestNode = root.content[0];

    for (const node of nodesToSearch) {
        if (node.type === 'bulletList' || node.type === 'orderedList') {
            deepestNode = node;
            if (node.spacing === spacing) {
                return node;
            }
            node.content.forEach(node => {
                if (node.type === 'listItem') {
                    nodesToSearch.push(node);
                }
            });
        }
        if (node.type === 'listItem') {
            node.content.forEach(node => {
                if (node.type === 'bulletList' || node.type === 'orderedList') {
                    nodesToSearch.push(node);
                }
            });
        }
    }

    return deepestNode;
};

export const createNodeJSON = (lines: string[], attrs: any) => {
    const listItems = lines.reduce((acc, line) => {
        const startsWithList = line.match(/^\s*?((?:[-*+])|(?:\d{1,9}[.)]))\s/);
        if (!startsWithList) {
            acc[acc.length - 1].push(line);
            return acc;
        }
        acc.push([line]);
        return acc;
    }, [] as string[][]);

    const nodeJSON = listItems.reduce(
        (acc, item) => {
            const spacing = item[0].match(/^\s*/)?.[0].length!;
            const match = item[0].match(/^\s*?((?:[-*+])|(?:\d{1,9}[.)]))\s/)!;
            const type = ['-', '+', '*'].includes(match[1])
                ? 'bulletList'
                : 'orderedList';
            const text = item.map(i =>
                i.replace(/^\s*?((?:[-*+])|(?:\d{1,9}[.)]))\s/, ''),
            );

            if (acc.spacing !== undefined && acc.spacing < 0) {
                acc.spacing = spacing;
            }

            let bulletList = findCurrentLevelListItem(acc, spacing);
            if (spacing > bulletList.spacing!) {
                const newList = {
                    type: type ?? attrs.type,
                    content: [],
                    spacing,
                };
                bulletList.content[bulletList.content.length - 1].content.push(
                    newList,
                );
                bulletList = newList;
            }
            bulletList.content.push({
                type: 'listItem',
                content: [
                    ...text.map(line => {
                        const textLine = line.replace('\n', '');
                        if (!textLine) {
                            return {
                                type: 'paragraph',
                            };
                        }
                        return {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: textLine,
                                },
                            ],
                        };
                    }),
                ],
                spacing,
            });
            return acc;
        },
        {
            type: attrs.type,
            content: [],
            spacing: -1,
        } as List,
    );
    return nodeJSON;
};
