import { InputRule, mergeAttributes } from '@tiptap/core';
import { Editor, VueNodeViewRenderer } from '@tiptap/vue-2';
import Paragraph from '@tiptap/extension-paragraph';
import TaskItemContent from '~/components/editor/extensions/task-item/TaskItemContent.vue';

export const INLINE_TASK_CONTENT_NAME = 'taskItemContent';
export const inputRegex = /^\s*(\[([( |x])?\])\s$/;

export default Paragraph.extend({
    name: INLINE_TASK_CONTENT_NAME,
    selectable: true,

    addOptions(this: any) {
        return {
            ...this.parent?.(),
        };
    },

    addStorage() {
        return {
            suggestion: null,
        };
    },

    addAttributes() {
        return {
            id: {
                parseHTML: element => {
                    return (
                        element.getAttribute('data-id') ??
                        element.getAttribute('id')
                    );
                },
            },
            suggestion: {
                default: null,
            },
            completed: {
                default: false,
            },
            start: {
                default: null,
            },
            end: {
                default: null,
            },
            rrule: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: `div[data-type="${INLINE_TASK_CONTENT_NAME}"]`,
                context: 'listItem/',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const attrs: any = {
            id: HTMLAttributes['data-id'],
            completed: HTMLAttributes.completed,
            start: HTMLAttributes.start,
            rrule: HTMLAttributes.rrule,
            end: HTMLAttributes.end,
        };
        return [
            'div',
            mergeAttributes({ 'data-type': INLINE_TASK_CONTENT_NAME }, attrs),
            0,
        ];
    },

    addNodeView() {
        return VueNodeViewRenderer(TaskItemContent);
    },

    addInputRules() {
        return [
            new InputRule({
                find: inputRegex,
                handler: ({ state, range, chain, match }) => {
                    // const editor = ctx.editor()!;
                    const tr = state.tr.delete(range.from, range.to);
                    const $start = tr.doc.resolve(range.from);
                    const blockRange = $start.blockRange();
                    if (!blockRange) return null;

                    const taskItemContent = state.schema.nodes.taskItemContent;

                    const attrs = {
                        completed: match[match.length - 1] === 'x',
                    };

                    chain()
                        .setNode(taskItemContent, attrs)
                        .wrapIn('listItem')
                        .wrapIn('bulletList')
                        .run();
                },
            }),
        ];
    },

    addKeyboardShortcuts(this: any) {
        const isTaskContent = () => {
            const selection = this.editor.state.selection;
            return (
                selection.$from.parent.type.name === INLINE_TASK_CONTENT_NAME
            );
        };

        return {
            'Mod-Shift-X': () => {
                if (!isTaskContent()) return false;
                const selection = this.editor.state.selection;
                const parent = selection.$from.parent;
                this.editor.commands.updateAttributes(
                    INLINE_TASK_CONTENT_NAME,
                    {
                        completed: !parent.attrs.completed,
                    },
                );
                return true;
            },
            Enter: () => {
                if (!isTaskContent()) return false;
                const state = this.editor.state;
                const selection = state.selection;
                // if it's not the top level node, let list handle it
                if (
                    selection.$from.depth > 3 ||
                    selection.$from.parent.nodeSize > 2
                ) {
                    const taskItemContent =
                        this.editor.schema.nodes.taskItemContent;
                    this.editor
                        .chain()
                        .splitListItem('listItem')
                        .setNode(taskItemContent, {
                            completed: false,
                        })
                        .run();
                    return true;
                }

                return this.editor.commands.setNode('paragraph');
            },
            Backspace: () => {
                if (!isTaskContent()) return false;
                const state = this.editor.state;
                const selection = state.selection;
                const blockRange = selection.$from.blockRange();
                if (!blockRange) return false;
                if (
                    blockRange.start + 1 === selection.from &&
                    selection.empty
                ) {
                    this.editor.commands.setNode('paragraph');
                }
                return false;
            },
            'Shift-Tab': () => {
                if (!isTaskContent()) return false;
                if (this.editor.state.selection.$head.depth < 4) {
                    return this.editor
                        .chain()
                        .liftListItem('listItem')
                        .setNode('paragraph', {})
                        .run();
                }
                return false;
            },
        };
    },
});
