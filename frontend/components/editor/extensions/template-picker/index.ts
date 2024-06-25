import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import TemplatePicker from './templatePicker.vue';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

export const TEMPLATE_PICKER_NODE_NAME = 'templatePicker';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance() {
        return Node.create({
            name: TEMPLATE_PICKER_NODE_NAME,
            group: 'inline',
            inline: true,

            addAttributes() {
                return {
                    id: {
                        default: 'new',
                    },
                    value: {
                        default: '',
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'template-picker',
                    },
                ];
            },
            addCommands() {
                return {
                    setImage:
                        options =>
                        ({ tr, dispatch }) => {
                            const { selection } = tr;
                            const node = this.type.create(options);

                            if (dispatch) {
                                tr.replaceRangeWith(
                                    selection.from,
                                    selection.to,
                                    node,
                                );
                            }

                            return true;
                        },
                };
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'template-picker',
                    mergeAttributes({ id: HTMLAttributes.id }),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(TemplatePicker);
            },
        });
    },
});
