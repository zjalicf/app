import { Node } from '@tiptap/pm/model';
import { blockNodePasteRule } from '~/components/editor/extensions/mdpaste/pasteRule';
import { EditorContext } from '~/@types/app';

export const horizontalRulePasteRule = (ctx: EditorContext) => {
    const editor = ctx.editor();
    if (!editor) return;
    return blockNodePasteRule({
        find: /^ {0,3}-{3,}$/gm,
        getAttributes: () => {
            return {};
        },
        execute: (_match, range, _attrs, chain, state) => {
            const horizontalRuleNode = Node.fromJSON(editor.schema, {
                type: 'horizontalRule',
            });
            chain().command(({ tr }) => {
                tr.replaceRangeWith(
                    range.from,
                    Math.min(range.to, state.doc.content.size),
                    horizontalRuleNode,
                );
                return true;
            });
        },
    });
};
