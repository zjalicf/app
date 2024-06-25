import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { EditorContext } from '~/@types/app';
import LinearEditorComponent from '~/components/editor/extensions/linear-search/LinearEditorComponent.vue';

export const LINEAR_SEARCH_NODE_NAME = 'linear-search';

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(LINEAR_SEARCH_NODE_NAME);

    return Node.create({
        priority: 51,
        name: LINEAR_SEARCH_NODE_NAME,
        group: 'inline',
        inline: true,

        addAttributes() {
            return {
                type: {
                    default: 'inline',
                },
            };
        },

        parseHTML() {
            return [
                {
                    tag: LINEAR_SEARCH_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                url: HTMLAttributes.url,
                id: HTMLAttributes.id,
            };
            return [LINEAR_SEARCH_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(LinearEditorComponent, {});
        },
    });
};
