import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { isNodeSelection, VueNodeViewRenderer } from '@tiptap/vue-2';
import { parse } from 'date-fns';
import InlineDocumentLink from '~/components/editor/extensions/inline-document-link/InlineDocumentLinkComponent.vue';
import { EditorTypes, TabType } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export const INLINE_DOCUMENT_LINK_NODE_NAME = 'inlineDocumentLink';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance: (ctx: EditorContext) => {
        ctx.bubbleMenuExceptions.add(INLINE_DOCUMENT_LINK_NODE_NAME);
        return Node.create({
            name: INLINE_DOCUMENT_LINK_NODE_NAME,
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
                    title: {
                        default: '',
                    },
                    preview: {
                        default: undefined,
                    },
                    oc: {
                        default: undefined,
                    },
                    origin: {
                        default: 'markdown',
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'inline-document-link',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                const attrs = { id: HTMLAttributes.id } as Record<
                    string,
                    string | boolean
                >;
                if (HTMLAttributes.preview) {
                    attrs.preview = true;
                }
                if (HTMLAttributes.oc) {
                    attrs.oc = HTMLAttributes.oc;
                }
                if (HTMLAttributes.title) {
                    attrs.title = HTMLAttributes.title;
                }
                return ['inline-document-link', mergeAttributes(attrs)];
            },

            addNodeView() {
                return VueNodeViewRenderer(InlineDocumentLink);
            },

            addInputRules() {
                // (?:^|\s)+ add to require space before
                const inputRegexp = /(\[\[)(?!\S)$/g;
                return [
                    nodeInputRule({
                        find: text => {
                            const regexExec = inputRegexp.exec(text);
                            if (regexExec) {
                                const { index } = regexExec;
                                return {
                                    index,
                                    text: regexExec[1],
                                    match: regexExec,
                                    replaceWith: regexExec[1],
                                };
                            }
                            return null;
                        },
                        type: this.type,
                        getAttributes: regexMatch => {
                            const [match] = regexMatch;
                            const value = match.replace('[[', '');
                            return {
                                value,
                            };
                        },
                    }),
                ];
            },

            addKeyboardShortcuts() {
                const openDocumentLink = (openInNewTab: boolean = false) =>
                    this.editor.commands.command(({ state }) => {
                        const selection = state.selection;
                        if (
                            !isNodeSelection(selection) ||
                            selection.node.type.name !== 'inlineDocumentLink'
                        ) {
                            return false;
                        }
                        const attrs = selection.node.attrs;
                        const doc = ctx.store.getters['document/byId'](
                            attrs.id,
                        );

                        if (doc.dailyDoc) {
                            const activeTab = ctx.tabs.activeTab();
                            if (activeTab) {
                                const source =
                                    activeTab?.type === TabType.DOCUMENT
                                        ? TrackingActionSource.BACKLINK_EDITOR_PAGE
                                        : TrackingActionSource.BACKLINK_EDITOR_MY_DAY;
                                ctx.tracking.trackEventV2(TrackingType.MY_DAY, {
                                    source,
                                    action: TrackingAction.OPEN,
                                });
                            }
                            const tabOpenOptions = openInNewTab
                                ? { openInNewTab: true, shouldActivate: true }
                                : {};
                            ctx.entities.myDay.open(
                                {
                                    data: {
                                        date: parse(
                                            doc.dailyDoc,
                                            'yyyy-MM-dd',
                                            new Date(),
                                        ),
                                    },
                                },
                                tabOpenOptions,
                            );
                            return true;
                        }

                        const tab = ctx.tabs.createNewTabObject(
                            attrs.id,
                            TabType.DOCUMENT,
                        );

                        if (openInNewTab) {
                            ctx.tabs.openTab(tab, null, {
                                openInNewTab: true,
                                shouldActivate: true,
                            });
                            return true;
                        }
                        ctx.tabs.openTab(tab);
                        return true;
                    });

                return {
                    'Shift-g': () => openDocumentLink(true),
                    g: () => openDocumentLink(false),
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
