import { Node } from '@tiptap/pm/model';
import { EditorContext } from '~/@types/app';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';

export const blockquotePasteRule = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;

    return blockNodePasteRule({
        find: text => {
            const match = text.matchAll(/(^ {0,3}>\s+?(.*?\n?)+?)$/gm);
            if (!match) return null;
            const output = [];
            for (const line of match) {
                output.push({
                    index: line.index!,
                    text: line[0],
                    replaceWith: line[0],
                    match: line,
                });
            }
            return output;
        },
        getAttributes: () => {
            return {};
        },
        execute: (match, range, _attrs, chain, state) => {
            const input = match[1];
            const lines = input.split('\n');
            if (lines[lines.length - 1] === '') {
                lines.pop();
            }

            const blockquoteJSON = {
                type: 'blockquote',
                content: lines.map(line => {
                    const text = line.replace(/^>\s/, '');
                    return {
                        type: 'paragraph',
                        content: text
                            ? [
                                  {
                                      type: 'text',
                                      text: line.replace(/^>\s/, ''),
                                  },
                              ]
                            : undefined,
                    };
                }),
            };

            const blockquoteNode = Node.fromJSON(editor.schema, blockquoteJSON);
            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    blockquoteNode,
                );
                return true;
            });
        },
    });
};
