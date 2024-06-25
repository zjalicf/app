import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { EditorContext } from '~/@types/app';
import GithubEditorComponent from '~/components/editor/extensions/github-search/GithubEditorComponent.vue';

export const GITHUB_SEARCH_NODE_NAME = 'github-search';

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(GITHUB_SEARCH_NODE_NAME);

    return Node.create({
        priority: 51,
        name: GITHUB_SEARCH_NODE_NAME,
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
                    tag: GITHUB_SEARCH_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                url: HTMLAttributes.url,
                id: HTMLAttributes.id,
            };
            return [GITHUB_SEARCH_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(GithubEditorComponent, {});
        },
    });
};
