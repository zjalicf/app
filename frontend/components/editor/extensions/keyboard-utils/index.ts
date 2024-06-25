import { Extension } from '@tiptap/core';
import { v4 } from 'uuid';
import { Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import { Editor, isNodeSelection } from '@tiptap/vue-2';
import { CloudServiceAction, EditorTypes, ServiceKey } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { IDocument } from '~/components/document/model';
import {
    generateDocumentFromSelection,
    generateTaskFromSelection,
    generateTaskListFromSelection,
    listSelected,
} from '~/helpers/editor';
import { labelsFromText } from '~/plugins/entities/label';
import { INLINE_TASK_NODE_NAME } from '~/components/editor/extensions/task-item';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        return [
            Extension.create({
                name: 'remove-marks-on-enter',
                addKeyboardShortcuts() {
                    return {
                        Enter: ({ editor }) => {
                            const { state } = editor;
                            const { $from, empty } = state.selection;

                            if (!empty) return false;
                            const marks = $from.marks();

                            marks.forEach(mark => {
                                editor.chain().unsetMark(mark.type).run();
                            });

                            return false;
                        },
                    };
                },
            }),
            Extension.create({
                name: 'keyboardUtils',
                addProseMirrorPlugins() {
                    return [
                        new Plugin({
                            key: new PluginKey<any>('keyboardUtils'),
                            props: {
                                handleDOMEvents: {
                                    mousedown: (
                                        _view: EditorView,
                                        event: MouseEvent,
                                    ) => {
                                        // prevent mousebutton 4 and 5 from triggering
                                        if (event.button > 2) {
                                            event.preventDefault();
                                            return false;
                                        }
                                        return false;
                                    },
                                },
                            },
                        }),
                    ];
                },
                addKeyboardShortcuts() {
                    const isWrappingBlock = (type: string) => {
                        return [
                            'listItem',
                            'bulletList',
                            'orderedList',
                            'blockquote',
                            'taskItem',
                            'taskList',
                        ].includes(type);
                    };

                    const isWrappingList = (type: string) => {
                        return ['bulletList', 'orderedList'].includes(type);
                    };

                    const flatten = (
                        doc: Node,
                        depth: number,
                        endPos: number,
                    ) => {
                        const flattenedList: any[] = [];
                        let afterPos = 0;
                        doc.descendants((node, pos, parent, index) => {
                            const nodeDepth = doc.resolve(pos).depth;
                            if (nodeDepth > depth) return false;
                            if (!node.isBlock) return false;
                            if (afterPos > 10) return false;
                            if (pos > endPos) {
                                afterPos++;
                            }
                            flattenedList.push({
                                node,
                                pos,
                                end: pos + node.nodeSize,
                                parent,
                                type: node.type.name,
                                depth: nodeDepth,
                            });
                        });
                        return flattenedList;
                    };

                    const getSelectedRange = (
                        editor: Editor,
                        selection: Selection,
                    ) => {
                        if (isNodeSelection(selection)) {
                            return {
                                start: selection.from,
                                end: selection.to,
                                depth: selection.$from.depth,
                                isNodeSelection: true,
                            };
                        }

                        let selectedRange = selection.$from.blockRange(
                            selection.$to,
                        );
                        if (!selectedRange) return null;
                        const isParentBlock = selectedRange.parent.isBlock;
                        const isParentList = [
                            'listItem',
                            'blockquote',
                        ].includes(selectedRange.parent.type.name);
                        if (isParentList || !isParentBlock) {
                            selectedRange = editor.state.doc
                                .resolve(selectedRange.start - 1)
                                .blockRange(
                                    editor.state.doc.resolve(
                                        selectedRange.end + 1,
                                    ),
                                );
                        }
                        if (!selectedRange) return null;
                        const isOnlyListItem =
                            isWrappingBlock(selectedRange.parent?.type?.name) &&
                            selectedRange.parent?.nodeSize - 2 ===
                                selectedRange.end - selectedRange.start;

                        if (isOnlyListItem) {
                            selectedRange = editor.state.doc
                                .resolve(selectedRange.start - 1)
                                .blockRange(
                                    editor.state.doc.resolve(
                                        selectedRange.end + 1,
                                    ),
                                );
                        }

                        return selectedRange;
                    };

                    const findBefore = (
                        list: any[],
                        pos: number,
                        depth: number,
                        isList: boolean,
                    ) => {
                        const index = list.findIndex(item => item.pos === pos);
                        const itemsBefore = list.slice(0, index).reverse();
                        if (isList && isWrappingList(itemsBefore[0]?.type)) {
                            itemsBefore.shift();
                        }
                        for (const item of itemsBefore) {
                            if (isList && isWrappingList(item.type)) {
                                return item.pos;
                            }
                            if (item.depth > depth) continue;
                            if (
                                isList &&
                                item.depth > 0 &&
                                item.type !== 'listItem'
                            ) {
                                continue;
                            }
                            const prevItem = itemsBefore.find(
                                prev => prev.end === item.pos,
                            );
                            if (prevItem && isWrappingList(prevItem.type)) {
                                return prevItem.end - 1;
                            }
                            return item.pos;
                        }
                        return -1;
                    };

                    const findAfter = (
                        list: any[],
                        pos: number,
                        depth: number,
                        isList: boolean,
                    ) => {
                        const index = list.findIndex(item => item.end === pos);
                        const itemsAfter = list.slice(index + 1, list.length);
                        for (const item of itemsAfter) {
                            if (item.depth > depth) continue;
                            if (
                                isList &&
                                item.depth > 1 &&
                                item.type !== 'listItem'
                            ) {
                                continue;
                            }
                            const nextItem = itemsAfter.find(
                                next => next.pos === item.end,
                            );
                            if (
                                isList &&
                                nextItem &&
                                isWrappingList(nextItem.type)
                            ) {
                                return nextItem.pos + 1;
                            }
                            return item.end;
                        }
                        return -1;
                    };

                    const moveBlock = (dir: -1 | 1) => {
                        const editor = this.editor as Editor;
                        const doc = editor.state.doc;
                        const selection = editor.state.selection as Selection;
                        const nodeSelection = isNodeSelection(selection);
                        const selectedRange = getSelectedRange(
                            editor,
                            selection,
                        );
                        if (!selectedRange) return false;

                        let content = doc
                            .slice(
                                selectedRange.start,
                                selectedRange.end,
                                false,
                            )
                            .toJSON().content;
                        let type = content[0].type;
                        if (isWrappingList(type)) {
                            content = content[0].content;
                            type = content[0].type;
                        }

                        const isList = type === 'listItem';
                        const flattenedNodes = flatten(
                            doc,
                            selectedRange.depth + 1,
                            selectedRange.end,
                        );

                        const insertPosition =
                            dir === -1
                                ? findBefore(
                                      flattenedNodes,
                                      selectedRange.start,
                                      selectedRange.depth,
                                      isList,
                                  )
                                : findAfter(
                                      flattenedNodes,
                                      selectedRange.end,
                                      selectedRange.depth,
                                      isList,
                                  );

                        if (insertPosition === -1) return true;

                        const newFrom =
                            insertPosition +
                            (selection.from - selectedRange.start);

                        const newRange = {
                            from: newFrom,
                            to: newFrom + (selection.to - selection.from),
                        };
                        const deleteRange = {
                            from: selectedRange.start,
                            to: selectedRange.end,
                        };

                        if (dir === -1) {
                            let chain = editor
                                .chain()
                                .deleteRange(deleteRange)
                                .insertContentAt(insertPosition, content);
                            if (nodeSelection) {
                                chain = chain.setNodeSelection(insertPosition);
                            } else {
                                chain = chain.setTextSelection(newRange);
                            }
                            return chain.run();
                        }

                        let chain = editor
                            .chain()
                            .insertContentAt(insertPosition, content);
                        if (nodeSelection) {
                            chain = chain.setNodeSelection(insertPosition);
                        } else {
                            chain = chain.setTextSelection(newRange);
                        }
                        return chain.deleteRange(deleteRange).run();
                    };
                    return {
                        Backspace: () => {
                            const state = this.editor.state;
                            const selection = state.selection;
                            const blockRange = selection.$from.blockRange();
                            if (!blockRange || !selection.empty) return false;
                            if (blockRange.depth > 0) return false;
                            if (blockRange.start - 1 < 0) return false;
                            const beforeSelection = TextSelection.findFrom(
                                state.doc.resolve(blockRange.start - 1),
                                -1,
                                true,
                            );
                            const beforeBlockRange =
                                beforeSelection?.$from.blockRange();
                            if (
                                beforeBlockRange?.parent.type.name !==
                                    'listItem' ||
                                selection.from - blockRange.start !== 1
                            ) {
                                return false;
                            }
                            return this.editor.commands.deleteRange({
                                from: beforeSelection!.to,
                                to: selection.from,
                            });
                        },
                        'Alt-Shift-ArrowUp': () => {
                            return moveBlock(-1);
                        },
                        'Alt-Shift-ArrowDown': () => {
                            return moveBlock(1);
                        },
                        Escape: () => {
                            if (
                                ctx.editor()?.storage.autocomplete?.value
                                    ?.isActive
                            )
                                return false;

                            ctx.nuxt.$emit('editor:blur');
                            ctx.store.commit('userForcedBlur', true);
                            return true;
                        },
                        'Alt-d': () => {
                            if (process.env.platform === 'web') return false;
                            const editor = ctx.editor();
                            if (!editor) return false;
                            const from =
                                editor.view.state.selection.$anchor.pos;
                            const to = editor.view.state.selection.$head.pos;
                            const selectionLength = to - from;
                            if (!selectionLength) {
                                return false;
                            }
                            const document =
                                generateDocumentFromSelection(editor);
                            if (!document) return false;
                            const { title, content } = document;
                            const originalDocument = ctx.store.getters[
                                'document/byId'
                            ](
                                ctx.config.keyboardUtils?.documentId,
                            ) as IDocument;
                            const id = v4();
                            ctx.store.dispatch('document/new', {
                                id,
                                title,
                                content,
                                status: 'new',
                                updatedAt: new Date(),
                                createdAt: new Date(),
                                projectId: originalDocument.projectId,
                            });
                            ctx.store.dispatch('document/update', {
                                id,
                                content, // find tasks and set new parentId
                            });
                            editor
                                .chain()
                                .deleteSelection()
                                .insertContent({
                                    type: 'inlineDocumentLink',
                                    attrs: { id, value: '' },
                                })
                                .insertContent(' ')
                                .focus()
                                .run();
                            return true;
                        },
                        'Alt-t': () => {
                            if (process.env.platform === 'web') return false;
                            const editor = ctx.editor();
                            if (!editor) return false;
                            const selection = editor.view.state.selection;
                            const from = selection.$anchor.pos;
                            const to = selection.$head.pos;
                            const selectionLength = to - from;
                            if (!selectionLength) {
                                editor.commands.insertContent(
                                    ctx.nuxt.$entities.task.createTaskHtml(
                                        v4(),
                                    ),
                                );
                                return true;
                            }

                            generateTaskListFromSelection(editor);

                            return true;
                        },
                    };
                },
            }),
            // this is the last extension to be loaded
            // it will catch all keyboard shortcuts that did not match any other extensions
            // you can freely overwrite shortcuts registered here in other extensions
            Extension.create({
                name: 'keyboardCatchall',
                priority: 1,
                addKeyboardShortcuts() {
                    return {
                        Tab: () => {
                            return true;
                        },
                        'Shift-Tab': () => {
                            return true;
                        },
                    };
                },
            }),
        ];
    },
});
