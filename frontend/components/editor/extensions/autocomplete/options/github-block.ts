import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';

const insertGithubSearch = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    _ctx: EditorContext,
) => {
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes['github-search'].create({
            type: 'block',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Github Link Block',
    handler: insertGithubSearch,
};
