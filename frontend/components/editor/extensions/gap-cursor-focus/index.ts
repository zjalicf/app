import { GapCursor } from '@tiptap/pm/gapcursor';
import { Command, Extension } from '@tiptap/core';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

declare module '@tiptap/core' {
    interface Commands {
        // @ts-ignore
        gapcursor: {
            focusWithGapcursor: () => Command;
        };
    }
}

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Extension.create({
            // @ts-ignore
            onFocus({ editor }) {
                editor.commands.focusWithGapcursor();
            },

            addCommands() {
                return {
                    focusWithGapcursor:
                        () =>
                        ({ editor, tr }) => {
                            const { from, to } = editor.state.selection;
                            if (from !== to) {
                                return true;
                            }
                            const resolvedPos = editor.state.doc.resolve(from);
                            // @ts-ignore
                            if (GapCursor.valid(resolvedPos)) {
                                // @ts-ignore
                                tr.setSelection(new GapCursor(resolvedPos));
                            }
                            return false;
                        },
                };
            },
        });
    },
});
