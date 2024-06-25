import { createInstance } from './github';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance,
});
