import Subscript from '@tiptap/extension-subscript';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Subscript;
    },
});
