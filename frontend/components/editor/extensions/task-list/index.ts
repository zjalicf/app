import TaskList from '@tiptap/extension-task-list';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance() {
        return [];
        return TaskList;
    },
});
