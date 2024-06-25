import { Command, mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import InlineEvent from '~/components/editor/extensions/inline-event/InlineEventComponent.vue';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';

export const INLINE_EVENT_NODE_NAME = 'inlineEvent';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        ctx.bubbleMenuExceptions.add(INLINE_EVENT_NODE_NAME);
        return Node.create({
            name: INLINE_EVENT_NODE_NAME,
            group: 'inline',
            inline: true,

            addOptions() {
                return {
                    ...this.parent?.(),
                    HTMLAttributes: {},
                };
            },

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
                        tag: 'inline-event',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'inline-event',
                    mergeAttributes({ id: HTMLAttributes.id }),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(InlineEvent);
            },

            addKeyboardShortcuts() {
                return {
                    Backspace: () =>
                        this.editor.commands.command(({ tr, state }) => {
                            let isActive = false;
                            const { selection } = state;
                            const { empty, anchor } = selection;

                            if (!empty) {
                                return false;
                            }

                            state.doc.nodesBetween(
                                anchor - 1,
                                anchor,
                                (node, pos) => {
                                    if (node.type.name === this.name) {
                                        isActive = true;
                                        tr.insertText(
                                            '',
                                            pos,
                                            pos + node.nodeSize,
                                        );

                                        return false;
                                    }
                                },
                            );

                            return isActive;
                        }),
                };
            },
        });
    },
});
