import Placeholder from '@tiptap/extension-placeholder';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        return Placeholder.configure({
            placeholder: () => ctx.config.placeholder || '',
        });
    },
});
