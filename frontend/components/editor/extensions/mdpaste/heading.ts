import { Node } from '@tiptap/pm/model';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';
import { EditorContext } from '~/@types/app';

export const headingPasteRule = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;
    return blockNodePasteRule({
        find: /^ {0,3}(#{1,6})(\s|$)(.*)(?:\n|$)/gm,
        getAttributes: match => {
            return {
                level: match[1].length,
            };
        },
        execute: (match, range, attrs, chain, state) => {
            const text = match[3];
            const headingNode = Node.fromJSON(editor.schema, {
                type: 'heading',
                content: text.trim().length
                    ? [
                          {
                              type: 'text',
                              text,
                          },
                      ]
                    : undefined,
                attrs,
            });
            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    headingNode,
                );
                return true;
            });
        },
    });
};
