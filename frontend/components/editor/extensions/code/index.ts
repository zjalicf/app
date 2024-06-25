import { Mark } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        return Code.extend({
            addKeyboardShortcuts() {
                return {
                    ...this.parent?.(),
                    ArrowRight: () => {
                        if (!this.editor.isActive(Code.name)) return false;
                        return Mark.handleExit({
                            editor: this.editor,
                            mark: Code,
                        });
                    },
                };
            },
        });
    },
});
