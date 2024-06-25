import ListItem from '@tiptap/extension-list-item';
import {
    Plugin,
    PluginKey,
    TextSelection,
    Transaction,
} from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Extension } from '@tiptap/core';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';

const listItemDecorationKey = new PluginKey('listItemClassDecorator');

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        if (!ctx.nuxt.$utils.isMobile) return [];
        return [
            new Extension({
                name: 'taskBackspaceHandler',
                priority: 1000000000,
                addProseMirrorPlugins() {
                    const deleteRange = (range: any) => {
                        return this.editor.commands.deleteRange(range);
                    };
                    return [
                        new Plugin({
                            key: new PluginKey('mobileTaskBackspaceHandler'),
                            props: {
                                handleKeyDown(view, event) {
                                    if (event.key !== 'Backspace') return false;
                                    const { state } = view;
                                    const { selection } = state;
                                    const { empty, $anchor } = selection;
                                    if (!empty) return false;
                                    const { parent } = $anchor;
                                    if (parent.type.name !== 'taskItemContent')
                                        return false;
                                    const parentPos =
                                        $anchor.pos - $anchor.parentOffset;

                                    const isAtStart = parentPos === $anchor.pos;
                                    if (!isAtStart) return false;

                                    const blockRange =
                                        selection.$from.blockRange();
                                    if (!blockRange) return false;

                                    const beforeSelection =
                                        TextSelection.findFrom(
                                            state.doc.resolve(
                                                blockRange.start - 1,
                                            ),
                                            -1,
                                            true,
                                        );

                                    return deleteRange({
                                        from: beforeSelection!.from,
                                        to: selection.from,
                                    });
                                },
                            },
                        }),
                    ];
                },
            }),
        ];
    },
});

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        return [
            ListItem.extend({
                content:
                    '(paragraph (bulletList|orderedList)*)|(taskItemContent (bulletList|orderedList)*)',
                addKeyboardShortcuts() {
                    return {
                        ...this.parent?.(),
                        Tab: () => {
                            const state = this.editor.state;
                            const selection = state.selection;
                            const blockRange = selection.$from.blockRange();
                            if (!blockRange) return false;
                            if (blockRange.parent.type.name !== this.name) {
                                return false;
                            }
                            const beforeRange = selection.$to.blockRange(
                                state.doc.resolve(blockRange.start - 2),
                            );
                            let chain = this.editor.chain();
                            if (
                                beforeRange &&
                                ['bulletList', 'orderedList'].includes(
                                    beforeRange.$from.nodeBefore?.type
                                        .name as string,
                                ) &&
                                this.editor.can().joinBackward()
                            ) {
                                chain = chain.joinBackward();
                            }
                            return chain.sinkListItem(this.name).run();
                        },
                        'Shift-Tab': () => {
                            return this.editor.commands.liftListItem(this.name);
                        },
                        Backspace: () => {
                            const state = this.editor.state;
                            const selection = state.selection;
                            const blockRange = selection.$from.blockRange();
                            if (!blockRange) return false;
                            if (
                                blockRange.parent.type.name !== this.name ||
                                !selection.empty
                            )
                                return false;

                            if (blockRange.start + 1 !== selection.from) {
                                return false;
                            }

                            const beforeSelection = TextSelection.findFrom(
                                state.doc.resolve(blockRange.start - 1),
                                -1,
                                true,
                            );
                            const beforeBlockRange =
                                beforeSelection?.$from.blockRange();
                            if (
                                beforeBlockRange?.parent.type.name !== this.name
                            )
                                return false;
                            return this.editor.commands.deleteRange({
                                from: beforeSelection!.from,
                                to: selection.from,
                            });
                        },
                    };
                },
                addProseMirrorPlugins() {
                    return [
                        ...(this.parent?.() ?? []),
                        // adds custom class to list items with tasks in them
                        new Plugin({
                            key: listItemDecorationKey,
                            props: {
                                decorations: state => {
                                    const decorations: Decoration[] = [];
                                    state.doc.nodesBetween(
                                        0,
                                        Math.max(0, state.doc.nodeSize - 2),
                                        (
                                            node: Node,
                                            pos: number,
                                            parent: Node | null,
                                            _: number,
                                        ) => {
                                            if (!node.type.isBlock) {
                                                return false;
                                            }
                                            if (
                                                node.type.name ===
                                                'taskItemContent'
                                            ) {
                                                decorations.push(
                                                    Decoration.node(
                                                        Math.max(pos - 1, 0),
                                                        pos -
                                                            1 +
                                                            parent!.nodeSize,
                                                        {
                                                            class: 'list-item--task',
                                                        },
                                                    ),
                                                );
                                                return false;
                                            }
                                        },
                                    );
                                    return DecorationSet.create(
                                        state.doc,
                                        decorations,
                                    );
                                },
                            },
                        }),
                    ];
                },
            }),
        ];
    },
});
