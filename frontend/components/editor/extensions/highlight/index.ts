import Highlight from '@tiptap/extension-highlight';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx: EditorContext) {
        if (ctx.config.highlight) {
            return Highlight.configure(ctx.config.highlight);
        }

        return Highlight;
    },
});
