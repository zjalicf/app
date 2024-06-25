import { Command, mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import MermaidRenderer from './MermaidRenderer.vue';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

declare module '@tiptap/core' {
    interface Commands {
        mermaid: {
            openMermaid: () => Command;
        };
    }
}

export const MERMAID_NODE_NAME = 'mermaid-component';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx) {
        ctx.bubbleMenuExceptions.add(MERMAID_NODE_NAME);
        return Node.create({
            name: MERMAID_NODE_NAME,
            group: 'block',
            inline: false,
            draggable: true,

            addOptions() {
                return {
                    ...this.parent?.(),
                    HTMLAttributes: {},
                };
            },

            addAttributes() {
                return {
                    new: {
                        default: null,
                    },
                    expression: {
                        default: 'graph TD\\n\tA(New Diagram)\\n',
                    },
                };
            },

            addNodeView() {
                return VueNodeViewRenderer(MermaidRenderer);
            },

            parseHTML() {
                return [
                    {
                        tag: MERMAID_NODE_NAME,
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    MERMAID_NODE_NAME,
                    mergeAttributes({
                        expression: HTMLAttributes.expression,
                    }),
                ];
            },

            addCommands() {
                return {
                    openMermaid: () => () => {
                        ctx.nuxt.$emit('mermaid:enter');
                        return true;
                    },
                };
            },

            addKeyboardShortcuts() {
                return {
                    'Shift-Enter': () => {
                        this.editor.commands.openMermaid();
                        return true;
                    },
                };
            },
        });
    },
});
