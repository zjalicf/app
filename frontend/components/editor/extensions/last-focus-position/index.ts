import { Extension } from '@tiptap/core';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Extension.create({
            name: 'lastFocusPosition',

            addStorage() {
                return {
                    value: 0,
                };
            },
        });
    },
});
