import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { EditorContext } from '~/@types/app';
import JiraEditorComponent from '~/components/editor/extensions/jira-search/JiraEditorComponent.vue';

export const JIRA_SEARCH_NODE_NAME = 'jira-search';
export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(JIRA_SEARCH_NODE_NAME);

    return Node.create({
        priority: 51,
        name: JIRA_SEARCH_NODE_NAME,
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
                    tag: JIRA_SEARCH_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                key: HTMLAttributes.key,
                id: HTMLAttributes.id,
            };
            return [JIRA_SEARCH_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(JiraEditorComponent, {});
        },
    });
};
