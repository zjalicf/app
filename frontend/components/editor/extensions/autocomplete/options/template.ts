import { Editor as TipTapEditor, Range } from '@tiptap/core';

const insertTemplate = (cmd: {
    editor: TipTapEditor;
    range: Range;
    props: any;
}) => {
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes.templatePicker.create({
            value: '',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Template',
    handler: insertTemplate,
};
