import {
    CommandProps,
    InputRule,
    mergeAttributes,
    Range,
    Node,
} from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { v4 } from 'uuid';
import { NodeSelection } from '@tiptap/pm/state';
import { registerEditorExtension } from '~/components/editor/extensions';
import {
    CloudServiceAction,
    EditorTypes,
    ServiceKey,
    TabType,
} from '~/constants';
import { EditorContext } from '~/@types/app';
import { ITask } from '~/components/task/model';
import TaskItemContent from '~/components/editor/extensions/task-item/TaskItemContent.vue';
import { TaskDateObject } from '~/@types';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

export const INLINE_TASK_NODE_NAME = 'taskItemContent';
const decorationIdSymbol = Symbol('decoration-id');

declare module '@tiptap/core' {
    interface Commands {
        [INLINE_TASK_CONTENT_NAME]: {
            setDecoration: (
                range: Range,
                data?: any,
            ) => (props: CommandProps) => void;
            replaceDecoration: (
                id: string,
                type: string,
            ) => (props: CommandProps) => void;
            removeDecoration: (id: any) => (props: CommandProps) => void;
            focusStart: (taskId: string) => (props: CommandProps) => void;
            focusEnd: (taskId: string) => (props: CommandProps) => void;
        };
    }
}

declare module 'prosemirror-view' {
    interface Decoration {
        type: {
            attrs: any;
            class: string;
        };
    }
}

export const INLINE_TASK_CONTENT_NAME = 'taskItemContent';
export const inputRegex = /^\s*(\[([( |x])?\])$/;

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        const pageId = ctx.documentId;
        const listener = (properties: Partial<ITask>) => {
            const editor = ctx.editor();
            if (!editor) return;
            const { doc } = editor.state;
            let taskPos = -1;
            let taskNode: any = null;
            doc.descendants((node: any, pos: number, parent, index) => {
                if (
                    node.type.name === INLINE_TASK_CONTENT_NAME &&
                    node.attrs.id === properties.id
                ) {
                    taskNode = node;
                    taskPos = pos;
                    return false;
                }

                if (taskNode) return false;
            });
            if (taskPos < 0) return false;
            editor.view.dispatch(
                editor.state.tr.setNodeMarkup(taskPos, undefined, {
                    ...taskNode.attrs,
                    ...properties,
                }),
            );
        };
        ctx.nuxt.$on(`editor:${pageId}:update-task`, listener);
        ctx.onDestroy.push(() => {
            ctx.nuxt.$off(`editor:${pageId}:update-task`, listener);
        });
        const decorationKey = new PluginKey('dateDecoration');
        return Node.create({
            name: INLINE_TASK_CONTENT_NAME,
            selectable: true,
            priority: 999,
            group: 'block',

            content: 'inline*',

            addOptions() {
                return {
                    HTMLAttributes: {},
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
                    mergeAttributes(
                        { 'data-type': INLINE_TASK_CONTENT_NAME },
                        attrs,
                    ),
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
                            const editor = ctx.editor()!;
                            const tr = state.tr.delete(range.from, range.to);
                            const $start = tr.doc.resolve(range.from);
                            const blockRange = $start.blockRange();
                            if (!blockRange) return null;
                            const taskItemContent =
                                editor.schema.nodes.taskItemContent;

                            const attrs = {
                                completed: match[match.length - 1] === 'x',
                            };

                            chain()
                                .setNode(taskItemContent, attrs)
                                .wrapIn('listItem')
                                .wrapIn('bulletList')
                                .run();
                            ctx.nuxt.$tracking.trackEvent('task', {
                                action: 'create',
                            });
                            const activeTab = ctx.nuxt.$tabs.activeTab();
                            if (!activeTab) return;
                            ctx.nuxt.$tracking.trackEventV2(
                                TrackingType.EDITOR,
                                {
                                    action: TrackingAction.INSERT_TASK,
                                    source: TrackingActionSource.MARKDOWN,
                                    sourceMeta:
                                        activeTab.type === TabType.MY_DAY
                                            ? TrackingActionSourceMeta.MY_DAY
                                            : TrackingActionSourceMeta.PAGE,
                                },
                            );

                            ctx.nuxt.$tracking.trackEventV2(TrackingType.TASK, {
                                action: TrackingAction.CREATE,
                                source: TrackingActionSource.MARKDOWN,
                                sourceMeta:
                                    activeTab.type === TabType.MY_DAY
                                        ? TrackingActionSourceMeta.MY_DAY
                                        : TrackingActionSourceMeta.PAGE,
                            });
                        },
                    }),
                ];
            },

            addKeyboardShortcuts() {
                const isTaskContent = () => {
                    const selection = this.editor.state.selection;
                    return selection.$from.parent.type === this.type;
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
                    Escape: () => {
                        if (!isTaskContent()) return false;
                        const selection = this.editor.state.selection;
                        const parent = selection.$from.parent;
                        if (!parent.attrs.suggestion) {
                            return false;
                        }
                        const suggestion = parent.attrs.suggestion;
                        this.editor.commands.replaceDecoration(
                            suggestion.id,
                            'nonsuggestion',
                        );
                        this.editor.commands.updateAttributes(
                            INLINE_TASK_CONTENT_NAME,
                            {
                                suggestion: null,
                            },
                        );
                        ctx.nuxt.$emit(`suggestion-${suggestion.id}:close`);
                        return true;
                    },
                    Enter: () => {
                        if (!isTaskContent()) return false;
                        const state = this.editor.state;
                        const selection = state.selection;
                        const parent = selection.$from.parent;
                        const blockRange = selection.$from.blockRange();

                        if (parent.attrs.suggestion) {
                            const suggestion = parent.attrs.suggestion;
                            if (!blockRange) return false;

                            const { id } = suggestion;
                            const dateDecoration = decorationKey
                                .getState(state)
                                .find()
                                .find((decoration: Decoration) => {
                                    return (
                                        decoration.type.attrs[
                                            decorationIdSymbol
                                        ] === id
                                    );
                                });

                            if (!dateDecoration) return false;

                            const text = state.doc.textBetween(
                                dateDecoration.from,
                                dateDecoration.to,
                            );
                            let range = {
                                from: dateDecoration.from,
                                to: dateDecoration.to,
                            };
                            if (text.startsWith(' ') && text.endsWith(' ')) {
                                range = {
                                    from: dateDecoration.from,
                                    to: dateDecoration.to - 1,
                                };
                            }
                            this.editor.commands.removeDecoration(
                                suggestion.id,
                            );
                            const start =
                                ctx.nuxt.$entities.task.formatStoredDate(
                                    suggestion.start,
                                );
                            const end =
                                ctx.nuxt.$entities.task.formatStoredDate(
                                    suggestion.end,
                                );
                            const rrule = suggestion.rrule;

                            this.editor.commands.updateAttributes(
                                INLINE_TASK_CONTENT_NAME,
                                {
                                    ...parent.attrs,
                                    start,
                                    end,
                                    rrule,
                                    suggestion: null,
                                },
                            );
                            this.editor.commands.deleteRange(range);

                            const activeTab = ctx.nuxt.$tabs.activeTab();
                            if (!activeTab) return true;

                            if (suggestion.start.date) {
                                ctx.nuxt.$tracking.trackEventV2(
                                    TrackingType.TASK,
                                    {
                                        action: TrackingAction.SET_DATE,
                                        source: TrackingActionSource.QUICKADD,
                                        sourceMeta:
                                            activeTab.type === TabType.MY_DAY
                                                ? TrackingActionSourceMeta.MY_DAY
                                                : TrackingActionSourceMeta.PAGE,
                                    },
                                );
                            }

                            if (suggestion.start.dateTime) {
                                ctx.nuxt.$tracking.trackEventV2(
                                    TrackingType.TASK,
                                    {
                                        action: TrackingAction.SET_TIME,
                                        source: TrackingActionSource.QUICKADD,
                                        sourceMeta:
                                            activeTab.type === TabType.MY_DAY
                                                ? TrackingActionSourceMeta.MY_DAY
                                                : TrackingActionSourceMeta.PAGE,
                                    },
                                );
                            }

                            if (suggestion.rrule) {
                                ctx.nuxt.$tracking.trackEventV2(
                                    TrackingType.TASK,
                                    {
                                        action: TrackingAction.SET_RECURRENCE,
                                        source: TrackingActionSource.QUICKADD,
                                        sourceMeta:
                                            activeTab.type === TabType.MY_DAY
                                                ? TrackingActionSourceMeta.MY_DAY
                                                : TrackingActionSourceMeta.PAGE,
                                    },
                                );
                            }

                            return true;
                        }
                        // if it's not the top level node, let list handle it
                        if (
                            selection.$from.depth > 3 ||
                            selection.$from.parent.nodeSize > 2
                        ) {
                            const taskItemContent =
                                this.editor.schema.nodes.taskItemContent;
                            const { start, end, rrule } = parent.attrs;
                            this.editor
                                .chain()
                                .splitListItem('listItem')
                                .setNode(taskItemContent, {
                                    completed: false,
                                    start,
                                    end,
                                    rrule,
                                })
                                .run();
                            ctx.nuxt.$tracking.trackEvent('task', {
                                action: 'create',
                            });
                            return true;
                        }

                        this.editor
                            .chain()
                            .setNode('paragraph')
                            .setNode('paragraph')
                            .run();
                        return true;
                    },
                    Backspace: () => {
                        const isNewTask = () => {
                            try {
                                const historyState = state.plugins
                                    .find(
                                        (plugin: any) =>
                                            plugin.key === 'history$',
                                    )
                                    ?.getState(state);
                                if (!historyState) return false;
                                if (!historyState?.done?.items?.values)
                                    return false;
                                const doneItems = [
                                    ...historyState?.done?.items?.values,
                                ];
                                if (!doneItems.length) return false;
                                const lastItem =
                                    doneItems[doneItems.length - 1];
                                const step = lastItem?.step;
                                const isInsert = step?.insert === 1;
                                const isTask =
                                    step?.slice?.content?.content?.[0]?.type
                                        ?.name === INLINE_TASK_CONTENT_NAME;
                                return isInsert && isTask;
                            } catch (e) {
                                return false;
                            }
                        };
                        if (!isTaskContent()) return false;
                        const state = this.editor.state;
                        const selection = state.selection;
                        const blockRange = selection.$from.blockRange();
                        if (!blockRange) return false;
                        if (
                            blockRange.start + 1 === selection.from &&
                            selection.empty
                        ) {
                            ctx.nuxt.$tracking.trackEvent('task', {
                                action: 'delete',
                            });
                            this.editor.commands.setNode('paragraph');
                            if (isNewTask()) {
                                this.editor.commands.setNode('paragraph');
                                this.editor.commands.insertContent({
                                    type: 'text',
                                    text: '[]',
                                });
                                return true;
                            }
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
            addCommands() {
                return {
                    setDecoration:
                        (range: Range, data: any) =>
                        ({ state, view }: CommandProps) => {
                            const transaction = state.tr.setMeta(
                                'set-decoration',
                                { range, data },
                            );
                            return view.dispatch(transaction);
                        },

                    replaceDecoration:
                        (id: string, type: string) =>
                        ({ state, view }: CommandProps) => {
                            const transaction = state.tr.setMeta(
                                'replace-decoration',
                                { id, type },
                            );
                            return view.dispatch(transaction);
                        },
                    removeDecoration:
                        (id: any) =>
                        ({ state, view }: CommandProps) => {
                            const transaction = state.tr.setMeta(
                                'remove-decoration',
                                { id },
                            );
                            return view.dispatch(transaction);
                        },
                    acceptSuggestion:
                        (decorationId: string) =>
                        ({ state, tr }: CommandProps) => {
                            const dateDecoration = decorationKey
                                .getState(state)
                                .find()
                                .find((decoration: Decoration) => {
                                    return (
                                        decoration.type.attrs[
                                            decorationIdSymbol
                                        ] === decorationId
                                    );
                                });
                            if (!dateDecoration) return false;
                            const text = state.doc.textBetween(
                                dateDecoration.from,
                                dateDecoration.to,
                            );
                            let range = {
                                from: dateDecoration.from,
                                to: dateDecoration.to,
                            };
                            if (text.startsWith(' ') && text.endsWith(' ')) {
                                range = {
                                    from: dateDecoration.from,
                                    to: dateDecoration.to - 1,
                                };
                            }

                            tr.deleteRange(range.from, range.to);
                            this.editor.commands.focus(range.from);
                        },
                    confirmSuggestion:
                        (range: { from: number; to: number }) =>
                        ({ state }: CommandProps) => {
                            const blockRange =
                                state.selection.$from.blockRange();
                            if (!blockRange) return false;
                            const node = state.doc.nodeAt(blockRange.start);
                            if (!node) return false;

                            const suggestion = { ...node.attrs.suggestion };
                            return this.editor
                                .chain()
                                .updateAttributes(INLINE_TASK_CONTENT_NAME, {
                                    ...node.attrs,
                                    start: ctx.nuxt.$entities.task.formatStoredDate(
                                        suggestion.start,
                                    ),
                                    end: ctx.nuxt.$entities.task.formatStoredDate(
                                        suggestion.end,
                                    ),
                                    suggestion: null,
                                })
                                .deleteRange(range)
                                .run();
                        },
                    focusStart:
                        (taskId: string) =>
                        ({ state }: CommandProps) => {
                            const { doc } = state;
                            let taskPos = -1;
                            doc.descendants((node, pos) => {
                                if (taskPos >= 0) {
                                    return false;
                                }
                                if (
                                    node.type.name === INLINE_TASK_NODE_NAME &&
                                    node.attrs.id === taskId
                                ) {
                                    taskPos = pos;
                                    return false;
                                }
                                return true;
                            });
                            if (taskPos < 0) return;
                            const resolved = doc.resolve(taskPos);
                            ctx.utils?.focusEditor(resolved.pos);
                        },
                    focusEnd:
                        (taskId: string) =>
                        ({ state }: CommandProps) => {
                            const { doc } = state;
                            let taskPos = -1;
                            doc.descendants((node, pos) => {
                                if (taskPos >= 0) {
                                    return false;
                                }
                                if (
                                    node.type.name === INLINE_TASK_NODE_NAME &&
                                    node.attrs.id === taskId
                                ) {
                                    taskPos = pos;
                                    return false;
                                }
                                return true;
                            });
                            if (taskPos < 0) return;
                            const resolved = doc.resolve(taskPos);
                            const taskNode = this.editor.view.state.doc.nodeAt(
                                resolved.pos,
                            );
                            const focusOffset = taskNode
                                ? taskNode.textContent.length + 1
                                : 0;
                            ctx.utils?.focusEditor(resolved.pos + focusOffset);
                        },
                };
            },
            addProseMirrorPlugins() {
                const handleQuickAdd = async (
                    text: string,
                    range: Range,
                    previousSuggestion: any,
                ) => {
                    if (ctx.nuxt.$utils.isMobile) return;
                    const data = await ctx.nuxt.$serviceRegistry.invoke<{
                        text: string;
                        start: TaskDateObject;
                        end: TaskDateObject;
                        rrule: string | null;
                        parsed_text: string | null;
                    }>(ServiceKey.CLOUD, CloudServiceAction.QUICKADD, {
                        data: text,
                        callerContext:
                            'editor/extensions/task-item/index.ts addProseMirrorPlugins',
                    });

                    if (previousSuggestion && !data?.start) {
                        if (data?.text?.includes(previousSuggestion.text)) {
                            this.editor.commands.removeDecoration(
                                previousSuggestion.id,
                            );
                            this.editor.commands.updateAttributes(
                                INLINE_TASK_CONTENT_NAME,
                                {
                                    suggestion: null,
                                },
                            );
                        }
                    }

                    if (!data) return;

                    data.rrule = data.rrule ? data.rrule : null;

                    if (!data.parsed_text) return;
                    if (data.parsed_text.trim().length < 3) return;
                    const start = text.lastIndexOf(data.parsed_text);
                    const end = start + data.parsed_text.length;

                    const from = range.from + start - 1;
                    const to = range.from + end - 1;

                    const decoration = decorationKey
                        .getState(this.editor.state)
                        .find(from - 1, to + 1)
                        .find((decoration: Decoration) => {
                            return (
                                from === decoration.from && to === decoration.to
                            );
                        });

                    if (decoration) return;

                    const suggestion = {
                        ...data,
                        id: v4(),
                    };

                    this.editor.commands.setDecoration(
                        {
                            from,
                            to,
                        },
                        suggestion,
                    );
                    this.editor.commands.updateAttributes(
                        INLINE_TASK_CONTENT_NAME,
                        {
                            suggestion,
                        },
                    );
                };

                const createDecoration = (
                    range: Range,
                    id: string,
                    type = 'date-decoration',
                ) => {
                    return Decoration.inline(range.from, range.to, {
                        class: type,
                        [decorationIdSymbol]: id,
                    });
                };

                const setDecoration = (
                    tr: Transaction,
                    oldSet: DecorationSet,
                ) => {
                    const { range, data } = tr.getMeta('set-decoration');
                    tr.setMeta('set-decoration', null);
                    const existingDecoration = oldSet
                        .find(
                            tr.selection.$from.before(),
                            tr.selection.$to.after(),
                        )
                        .find(
                            decoration =>
                                isDateSuggestion(decoration) &&
                                decoration.from === range.from &&
                                decoration.to === range.to,
                        );

                    if (existingDecoration) {
                        return oldSet.map(tr.mapping, tr.doc);
                    }

                    const decoration = createDecoration(range, data.id);
                    return oldSet
                        .add(tr.doc, [decoration])
                        .map(tr.mapping, tr.doc);
                };

                const replaceDecoration = (
                    tr: Transaction,
                    oldSet: DecorationSet,
                ) => {
                    const { id, type } = tr.getMeta('replace-decoration');
                    const existingDecoration = oldSet.find().find(
                        decoration =>
                            // @ts-ignore
                            decoration.type.attrs[decorationIdSymbol] === id,
                    );
                    if (!existingDecoration)
                        return oldSet.map(tr.mapping, tr.doc);
                    const decoration = createDecoration(
                        {
                            from: existingDecoration.from,
                            to: existingDecoration.to,
                        },
                        id,
                        type,
                    );
                    const currentDecorations = oldSet.remove([
                        existingDecoration,
                    ]);
                    return currentDecorations
                        .add(tr.doc, [decoration])
                        .map(tr.mapping, tr.doc);
                };

                const removeDecoration = (
                    tr: Transaction,
                    oldSet: DecorationSet,
                ) => {
                    const { id } = tr.getMeta('remove-decoration');
                    const existingDecoration = oldSet.find().find(
                        decoration =>
                            // @ts-ignore
                            decoration.type.attrs[decorationIdSymbol] === id,
                    );
                    return oldSet.remove([existingDecoration!]);
                };

                const isDateSuggestion = (decoration: Decoration) => {
                    return decoration.type.attrs.class === 'date-decoration';
                };

                return [
                    new Plugin({
                        key: decorationKey,
                        state: {
                            init(_, _state) {
                                return DecorationSet.empty;
                            },
                            apply: (tr, oldSet) => {
                                const isDeleteStep = (stepJSON: any) => {
                                    return (
                                        stepJSON.stepType === 'replace' &&
                                        !stepJSON.slice
                                    );
                                };
                                const isDeleteTransaction = tr.steps.some(
                                    step => isDeleteStep(step.toJSON()),
                                );
                                if (
                                    // @ts-ignore
                                    tr.selection?.$cursor?.parent?.type
                                        ?.name !== INLINE_TASK_CONTENT_NAME
                                ) {
                                    const decos = oldSet.find();
                                    if (!decos.length) {
                                        return oldSet.map(tr.mapping, tr.doc);
                                    }
                                    const validDecorations = decos.reduce(
                                        (
                                            acc: DecorationSet,
                                            decoration: Decoration,
                                        ) => {
                                            const isDateDecoration =
                                                isDateSuggestion(decoration);
                                            if (!isDateDecoration) {
                                                return acc;
                                            }
                                            setTimeout(() => {
                                                this.editor.commands.command(
                                                    ({ tr }) => {
                                                        const nodeSelection =
                                                            NodeSelection.create(
                                                                tr.doc,
                                                                decoration.from,
                                                            );
                                                        const inlineTaskSelection =
                                                            nodeSelection.$head.blockRange(
                                                                tr.doc.resolve(
                                                                    nodeSelection.to +
                                                                        1,
                                                                ),
                                                            );
                                                        if (
                                                            !inlineTaskSelection
                                                        )
                                                            return false;

                                                        tr.setNodeMarkup(
                                                            inlineTaskSelection.start,
                                                            null,
                                                            {
                                                                suggestion:
                                                                    null,
                                                            },
                                                        );
                                                        return true;
                                                    },
                                                );
                                            }, 20);

                                            ctx.nuxt.$emit(
                                                // @ts-ignore
                                                `suggestion-${decoration.type.attrs[decorationIdSymbol]}:close`,
                                            );
                                            return acc.remove([decoration]);
                                        },
                                        oldSet,
                                    );

                                    return validDecorations.map(
                                        tr.mapping,
                                        tr.doc,
                                    );
                                }

                                if (tr.getMeta('replace-decoration')) {
                                    return replaceDecoration(tr, oldSet);
                                }

                                if (tr.getMeta('set-decoration')) {
                                    return setDecoration(tr, oldSet);
                                }

                                if (tr.getMeta('remove-decoration')) {
                                    return removeDecoration(tr, oldSet);
                                }

                                if (isDeleteTransaction) {
                                    const ranges = tr.steps.reduce(
                                        (acc, step) => {
                                            const stepJSON = step.toJSON();
                                            if (!isDeleteStep(stepJSON)) {
                                                return acc;
                                            }
                                            return [
                                                ...acc,
                                                {
                                                    from: stepJSON.from,
                                                    to: stepJSON.to,
                                                },
                                            ];
                                        },
                                        [] as {
                                            from: number;
                                            to: number;
                                        }[],
                                    );
                                    const decorations = oldSet.find();
                                    const decorationsToDelete =
                                        decorations.filter(
                                            (decoration: any) => {
                                                return ranges.some(range => {
                                                    return (
                                                        (range.from >=
                                                            decoration.from &&
                                                            range.from <=
                                                                decoration.to) ||
                                                        (range.to >=
                                                            decoration.from &&
                                                            range.to <=
                                                                decoration.to &&
                                                            [
                                                                'date-decoration',
                                                                'nonsuggestion',
                                                            ].includes(
                                                                decoration.type
                                                                    .attrs
                                                                    .class,
                                                            ))
                                                    );
                                                });
                                            },
                                        );

                                    decorationsToDelete.forEach(
                                        (decoration: any) => {
                                            if (
                                                decoration.type.attrs.class ===
                                                'date-decoration'
                                            ) {
                                                setTimeout(() => {
                                                    this.editor.commands.updateAttributes(
                                                        INLINE_TASK_CONTENT_NAME,
                                                        {
                                                            suggestion: null,
                                                        },
                                                    );
                                                }, 20);

                                                ctx.nuxt.$emit(
                                                    // @ts-ignore
                                                    `suggestion-${decoration.type.attrs[decorationIdSymbol]}:close`,
                                                );
                                            }
                                            oldSet = oldSet.remove([
                                                decoration,
                                            ]);
                                        },
                                    );
                                    return oldSet.map(tr.mapping, tr.doc);
                                }

                                return oldSet.map(tr.mapping, tr.doc);
                            },
                        },
                        props: {
                            decorations: state => {
                                return decorationKey.getState(state);
                            },
                            handleTextInput: (
                                view: EditorView,
                                from,
                                to,
                                text,
                            ) => {
                                const state = view.state;
                                const selection = state.selection;
                                const parent = selection.$from.parent;

                                if (ctx.nuxt.$utils.isMobile) return false;
                                if (parent.type.name !== this.type.name) {
                                    return false;
                                }

                                const before = selection.$from.before();

                                const existingDecoration = decorationKey
                                    .getState(state)
                                    .find(before, to)
                                    .filter((decoration: Decoration) => {
                                        return (
                                            decoration.type.attrs.class ===
                                            'nonsuggestion'
                                        );
                                    })
                                    .reduce(
                                        (
                                            acc: Decoration | null,
                                            deco: Decoration,
                                        ) => {
                                            if (!acc || deco.from > acc.from)
                                                return deco;

                                            return acc;
                                        },
                                        null,
                                    );
                                const fromPos = before + 1;
                                const start = existingDecoration
                                    ? existingDecoration.to - fromPos
                                    : 0;

                                const content =
                                    parent.textContent.slice(
                                        start,
                                        to - fromPos,
                                    ) + text;

                                const previousSuggestion =
                                    parent.attrs.suggestion;

                                handleQuickAdd(
                                    content,
                                    {
                                        from: fromPos + 1 + start,
                                        to: to + 1,
                                    },
                                    previousSuggestion,
                                );
                                return false;
                            },
                        },
                    }),
                ];
            },
        });
    },
});
