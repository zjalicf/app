import TableRow from '@tiptap/extension-table-row';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        const output = [TableRow, TableCell, TableHeader];
        if (ctx.config.table) {
            output.unshift(Table.configure(ctx.config.table));
        } else {
            output.unshift(Table);
        }

        return output;
    },
});
