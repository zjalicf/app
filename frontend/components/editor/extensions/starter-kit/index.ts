import StarterKit from '@tiptap/starter-kit';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        if (ctx.config.starterKit) {
            return StarterKit.configure(ctx.config.starterKit);
        }

        return StarterKit;
    },
});
