import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import InlineKaTeXComponent from '~/components/editor/extensions/katex/InlineKatexComponent.vue';
import BlockKaTeXComponent from '~/components/editor/extensions/katex/BlockKatexComponent.vue';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

export const INLINE_KATEX_NODE_NAME = 'inlineKatex';
export const BLOCK_KATEX_NODE_NAME = 'blockKatex';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance() {
        return Node.create({
            name: INLINE_KATEX_NODE_NAME,
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
                    expression: {
                        default: '',
                    },
                    new: {
                        default: false,
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'inline-katex-component',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'inline-katex-component',
                    mergeAttributes({ expression: HTMLAttributes.expression }),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(InlineKaTeXComponent);
            },

            addInputRules() {
                // (?:^|\s)+ add to require space before
                const inputRegexp = /(\$[^$]?.+\$)$/g;
                return [
                    nodeInputRule({
                        find: text => {
                            const regexExec = inputRegexp.exec(text);
                            if (regexExec) {
                                const { index } = regexExec;
                                return {
                                    index,
                                    text: regexExec[1],
                                    replaceWith: regexExec[1],
                                };
                            }
                            return null;
                        },
                        type: this.type,
                        getAttributes: regexMatch => {
                            const [match] = regexMatch;
                            const expression = match.slice(1, match.length - 1);
                            return {
                                new: false,
                                expression,
                            };
                        },
                    }),
                ];
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

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance() {
        return Node.create({
            name: BLOCK_KATEX_NODE_NAME,
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
                    expression: {
                        default: 'new',
                    },
                    new: {
                        default: false,
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'block-katex-component',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'block-katex-component',
                    mergeAttributes({ expression: HTMLAttributes.expression }),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(BlockKaTeXComponent);
            },

            addInputRules() {
                const inputRegexp = /(\$\$\S+)$/g;
                return [
                    nodeInputRule({
                        find: text => {
                            const regexExec = inputRegexp.exec(text);
                            if (regexExec) {
                                const { index } = regexExec;
                                return {
                                    index,
                                    text: regexExec[1],
                                    replaceWith: regexExec[1],
                                };
                            }
                            return null;
                        },
                        type: this.type,
                        getAttributes: regexMatch => {
                            const [match] = regexMatch;
                            const expression = match.slice(2, match.length);
                            return {
                                new: true,
                                expression,
                            };
                        },
                    }),
                ];
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
