import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';
import { isNodeSelection, VueNodeViewRenderer } from '@tiptap/vue-2';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContext } from '~/@types/app';
import LinearEditorComponent from '~/components/editor/extensions/linear-link/LinearEditorComponent.vue';
import { TrackingActionSource } from '~/@types/tracking';
import { LINEAR_ISSUE_LINK_REGEXP } from '~/plugins/entities/linear';

export const LINEAR_LINK_NODE_NAME = 'linear-link';

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(LINEAR_LINK_NODE_NAME);

    return Node.create({
        priority: 51,
        name: LINEAR_LINK_NODE_NAME,
        group: 'inline',
        inline: true,

        addAttributes() {
            return {
                id: {
                    default: '',
                },
                title: {
                    default: '',
                },
                identifier: {
                    default: '',
                },
                url: {
                    default: '',
                },
            };
        },

        parseHTML() {
            return [
                {
                    tag: LINEAR_LINK_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                url: HTMLAttributes.url,
                id: HTMLAttributes.id,
                title: HTMLAttributes.title,
                identifier: HTMLAttributes.identifier,
            };
            return [LINEAR_LINK_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(LinearEditorComponent, {});
        },

        addPasteRules() {
            if (!ctx.nuxt.$accessControl.hasProAccess) return [];
            return [
                nodePasteRule({
                    find: LINEAR_ISSUE_LINK_REGEXP,
                    type: this.type,
                    getAttributes: match => {
                        return {
                            url: match.input,
                            identifier: match[1],
                            title: match[2].replaceAll('-', ' ') || '',
                        };
                    },
                }),
            ];
        },

        addKeyboardShortcuts() {
            const isLinearLink = () => {
                const selection = this.editor.state.selection;
                if (!isNodeSelection(selection)) return false;
                return selection.node.type.name === LINEAR_LINK_NODE_NAME;
            };
            const openDetail = () => {
                if (!isLinearLink()) return false;
                const selection = ctx.editor()?.view.state
                    .selection as NodeSelection;
                const { id } = selection.node.attrs;
                if (!id) return false;
                ctx.utils?.setLastFocusPosition(selection.anchor);
                const entity = ctx.nuxt.$entities.linear.getById(id);
                ctx.nuxt.$dropdown.hideAll();
                ctx.nuxt.$entities.linear.openModal(
                    entity.id,
                    TrackingActionSource.EDITOR,
                );
                return true;
            };
            return {
                Space: openDetail,
                Enter: openDetail,
            };
        },
    });
};
