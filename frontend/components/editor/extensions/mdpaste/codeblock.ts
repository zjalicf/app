import { Node } from '@tiptap/pm/model';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';
import { EditorContext } from '~/@types/app';

export const codeblockPasteRule = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;
    return blockNodePasteRule({
        find: /^```(\w*?)\s([\s\S]*?)```$/gm,
        getAttributes: match => {
            return {
                language: match[1] ?? null,
            };
        },
        execute: (match, range, attrs, chain, state) => {
            const lines = match[0];
            const textMatch = /^```(\w*?)\s([\s\S]*?)```$/gm.exec(lines);
            if (!textMatch) return;

            let codeblockText = textMatch[2];
            if (codeblockText.endsWith('\n')) {
                codeblockText = codeblockText.slice(0, -1);
            }

            const codeBlockJSON = {
                type: 'codeBlock',
                attrs: {
                    language: attrs.language,
                },
                content: codeblockText
                    ? [
                          {
                              type: 'text',
                              text: codeblockText,
                          },
                      ]
                    : undefined,
            };

            const codeBlockNode = Node.fromJSON(editor.schema, codeBlockJSON);

            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    codeBlockNode,
                );
                return true;
            });
        },
    });
};
