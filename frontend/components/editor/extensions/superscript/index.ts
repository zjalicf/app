import Superscript from '@tiptap/extension-superscript';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Superscript;
    },
});
