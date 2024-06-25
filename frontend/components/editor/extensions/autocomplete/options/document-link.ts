import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';

const insertDocument = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    _ctx: EditorContext,
) => {
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes.inlineDocumentLink.create({
            value: '',
            origin: 'autocomplete',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Link Page',
    handler: insertDocument,
};
