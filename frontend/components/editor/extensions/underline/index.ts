import Underline from '@tiptap/extension-underline';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Underline;
    },
});
