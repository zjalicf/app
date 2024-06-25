import Focus from '@tiptap/extension-focus';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance() {
        return Focus;
    },
});
