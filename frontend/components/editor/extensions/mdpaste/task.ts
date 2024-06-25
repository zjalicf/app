import { Node } from '@tiptap/pm/model';
import { PasteRuleMatch } from '@tiptap/core';
import { EditorContext } from '~/@types/app';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';

export const taskBlockPaste = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;
    return blockNodePasteRule({
        find: (text: string) => {
            const matches = text.matchAll(/^\s?\[([x ]?)]?\s(.*)?$/gim);
            const output = [];
            for (const match of matches) {
                output.push({
                    index: match.index,
                    text: match[0],
                    match,
                    replaceWith: match[0],
                    data: {
                        completed: match[1].toLowerCase() === 'x',
                        text: match[2],
                    },
                } as PasteRuleMatch);
            }
            return output;
        },
        getAttributes: match => {
            return {
                completed: match.data!.completed,
            };
        },
        execute: (match, range, attrs, chain, state) => {
            const text = match.data!.text;
            const taskNodeJSON = {
                type: 'taskItemContent',
                content: text.trim().length
                    ? [
                          {
                              type: 'text',
                              text,
                          },
                      ]
                    : undefined,
                attrs: {
                    completed: attrs.completed,
                },
            };

            const taskNode = Node.fromJSON(editor.schema, taskNodeJSON);

            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    taskNode,
                );
                return true;
            });
        },
    });
};
