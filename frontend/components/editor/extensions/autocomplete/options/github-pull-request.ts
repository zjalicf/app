import { Editor as TipTapEditor, Range } from '@tiptap/core';

const insertJira = (
    cmd: { editor: TipTapEditor; range: Range; props: any },
    _options: any,
) => {
    const focusIndex = cmd.range.from === 1 ? 0 : cmd.range.from - 1;

    cmd.editor
        .chain()
        .deleteRange(cmd.range)
        .insertContentAt(focusIndex, '<jira-issue></jira-issue>')
        .run();

    const { content } = cmd.editor.view.state.selection.content();
    const name = content.firstChild?.type.name;
    if (name === 'paragraph' && content.firstChild?.text === '') {
        cmd.editor.commands.deleteSelection();
    }
};

export default {
    name: 'Github Pull Request',
    handler: insertJira,
};
