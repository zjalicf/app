import { Mark, mergeAttributes } from '@tiptap/core';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        return Mark.create({
            name: 'diff',

            addAttributes() {
                return {
                    diffType: {
                        default: null,
                        parseHTML: element => {
                            const classes = [...Array.from(element.classList)];
                            const diffClass = classes.find(className =>
                                className.startsWith('diff'),
                            );
                            return diffClass?.includes('added')
                                ? 'added'
                                : 'removed';
                        },
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'span[data-type="diff"]',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'span',
                    mergeAttributes({
                        class: `diff--${HTMLAttributes.diffType}`,
                    }),
                    0,
                ];
            },
        });
    },
});
