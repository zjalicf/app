import Heading from '@tiptap/extension-heading';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Heading.extend({
            addKeyboardShortcuts() {
                return {
                    ...this.parent?.(),
                    Backspace: ({ editor }) => {
                        // convert heading to paragraph if its empty or cursor is at the beginning of the heading
                        const { selection } = editor.state;
                        const { $from, empty } = selection;
                        if (!empty) return false;
                        if ($from.parent.type.name !== 'heading') return false;

                        const isAtStart = $from.parentOffset === 0;
                        const isEmptyHeading = $from.parent.content.size === 0;

                        if (!isAtStart && !isEmptyHeading) {
                            return false;
                        }
                        return this.editor.commands.setNode('paragraph');
                    },
                };
            },
        });
    },
});
