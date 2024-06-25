import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { ImageOptions } from '~/components/editor/extensions/image';

function selectFile(contentType: string, multiple: boolean): Promise<File[]> {
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        input.accept = contentType;

        input.onchange = () => {
            const files = Array.from(input.files!);
            if (multiple) resolve(files);
            else resolve([files[0]]);
        };

        input.click();
    });
}

const insertImage = async (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: ImageOptions,
) => {
    const files = await selectFile('image/*', true);
    cmd.editor.commands.deleteRange(cmd.range);
    // @ts-ignore
    return cmd.editor.commands.uploadImage(files);
};

export default {
    name: 'Image',
    handler: insertImage,
};
