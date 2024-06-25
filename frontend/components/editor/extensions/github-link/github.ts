import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';
import { isNodeSelection, VueNodeViewRenderer } from '@tiptap/vue-2';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContext } from '~/@types/app';
import GithubEditorComponent from '~/components/editor/extensions/github-link/GithubEditorComponent.vue';
import { GITHUB_ISSUE_REGEX, GITHUB_PR_REGEX } from '~/plugins/entities/github';
import { TrackingActionSource } from '~/@types/tracking';

export const GITHUB_NODE_NAME = 'github-link';

export const isGithubLink = (url: string) => {
    const isIssue = url.match(GITHUB_ISSUE_REGEX);
    const isPr = url.match(GITHUB_PR_REGEX);
    return isIssue || isPr;
};

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(GITHUB_NODE_NAME);

    return Node.create({
        priority: 51,
        name: GITHUB_NODE_NAME,
        group: 'inline',
        inline: true,

        addAttributes() {
            return {
                id: {
                    default: '',
                },
                url: {
                    default: '',
                },
                title: {
                    default: '',
                },
            };
        },

        parseHTML() {
            return [
                {
                    tag: GITHUB_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                url: HTMLAttributes.url,
                id: HTMLAttributes.id,
            };
            return [GITHUB_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(GithubEditorComponent, {});
        },

        addPasteRules() {
            if (!ctx.nuxt.$accessControl.hasProAccess) return [];
            return [
                nodePasteRule({
                    find: GITHUB_ISSUE_REGEX,
                    type: this.type,
                    getAttributes: match => {
                        return {
                            url: match.input,
                            id: ctx.nuxt.$entities.github.getIssueId(
                                match[1],
                                match[2],
                            ),
                        };
                    },
                }),
                nodePasteRule({
                    find: GITHUB_PR_REGEX,
                    type: this.type,
                    getAttributes: match => {
                        return {
                            url: match.input,
                            id: ctx.nuxt.$entities.github.getPullRequestId(
                                match[1],
                                match[2],
                            ),
                        };
                    },
                }),
            ];
        },

        addKeyboardShortcuts() {
            const isGithubLink = () => {
                const selection = this.editor.state.selection;
                if (!isNodeSelection(selection)) return false;
                return selection.node.type.name === GITHUB_NODE_NAME;
            };
            const openDetail = () => {
                if (!isGithubLink()) return false;
                const selection = ctx.editor()?.view.state
                    .selection as NodeSelection;
                const { id } = selection.node.attrs;
                if (!id) return false;
                ctx.utils?.setLastFocusPosition(selection.anchor);
                const entity = ctx.store.getters['integrationData/byId'](id);
                ctx.nuxt.$dropdown.hideAll();
                ctx.nuxt.$entities.github.openModal(
                    entity,
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
