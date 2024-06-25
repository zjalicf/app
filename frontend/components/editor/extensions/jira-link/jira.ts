import {
    InputRule,
    InputRuleFinder,
    mergeAttributes,
    Node,
    nodePasteRule,
    PasteRuleMatch,
} from '@tiptap/core';
import { isNodeSelection, VueNodeViewRenderer } from '@tiptap/vue-2';
import { NodeType, Node as InternalNode } from '@tiptap/pm/model';
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { EditorContext } from '~/@types/app';
import { isDragEvent } from '~/helpers/editor';
import JiraEditorComponent from '~/components/editor/extensions/jira-link/JiraEditorComponent.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { TrackingActionSource } from '~/@types/tracking';

export const JIRA_LINK_NODE_NAME = 'jira-link';

const customNodeInputRule = (config: {
    find: InputRuleFinder;
    type: NodeType;
    filter: (text: RegExpMatchArray) => boolean;
    createEntity?: (match: RegExpMatchArray) => InternalNode;
    shouldFocus?: boolean;
}) => {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            const { tr } = state;
            const start = range.from;
            const end = range.to;

            if (match[0] && config.filter(match)) {
                tr.replaceWith(
                    start,
                    end,
                    config.createEntity
                        ? config.createEntity(match)
                        : config.type.create(),
                );
            }
            // if (config.shouldFocus) {
            //     tr.setSelection(NodeSelection.create(tr.doc, start + 1));
            // }
        },
    });
};

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(JIRA_LINK_NODE_NAME);
    return Node.create({
        name: JIRA_LINK_NODE_NAME,
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
                key: {
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
                    tag: JIRA_LINK_NODE_NAME,
                },
            ];
        },

        addInputRules() {
            const inputRegexp = /\s?([A-Z]+-\d+)\s/g;
            return [
                customNodeInputRule({
                    find: inputRegexp,
                    type: this.type,
                    filter: (match: RegExpMatchArray) => {
                        const entity = ctx.store.getters[
                            'integrationData/byKey'
                        ](match[1]);
                        return !!entity;
                    },
                    createEntity: match => {
                        const key = match[1];
                        const entity = ctx.nuxt.$entities.jira.getByKey(key);

                        return this.type.create({
                            id: key,
                            url: entity.url || '',
                        });
                    },
                    shouldFocus: true,
                }),
            ];
        },

        addPasteRules() {
            if (!ctx.nuxt.$accessControl.hasProAccess) return [];
            return [
                nodePasteRule({
                    find: text => {
                        const integration =
                            ctx.nuxt.$entities.jira.getIntegration();
                        if (!integration) {
                            return null;
                        }
                        const isJiraLink = ctx.nuxt.$entities.jira.isJiraLink(
                            text,
                            integration,
                        );
                        if (!isJiraLink) return null;

                        const matches =
                            ctx.nuxt.$entities.jira.getJiraMatch(text);
                        const output: PasteRuleMatch[] = [];
                        for (const match of matches) {
                            output.push({
                                match,
                                index: match.index,
                                text: match[0],
                                replaceWith: match[0],
                                data: {
                                    key: match[1],
                                    integration,
                                },
                            } as PasteRuleMatch);
                        }

                        return output;
                    },
                    type: this.type,
                    getAttributes: match => {
                        const key = match.data?.key;
                        const integration = match.data?.integration;
                        const issueCloud = integration.data.clouds.find(
                            (cloud: any) => match[0].startsWith(cloud.url),
                        );
                        if (!key || !integration || !issueCloud) return null;

                        const [projectKey] = key.split('-');

                        const project =
                            ctx.nuxt.$entities.jira.getProjectByKey(projectKey);
                        if (!project) return null;

                        ctx.nuxt.$entities.jira.fetchIssue(
                            integration,
                            project,
                            key,
                        );

                        return {
                            url: match[0],
                            id: key,
                        };
                    },
                }),
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                id: HTMLAttributes.id,
                url: HTMLAttributes.url,
            };
            return [JIRA_LINK_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(JiraEditorComponent, {});
        },

        addKeyboardShortcuts() {
            const isJiraLink = () => {
                const selection = this.editor.state.selection;
                if (!isNodeSelection(selection)) return false;
                return selection.node.type.name === JIRA_LINK_NODE_NAME;
            };
            const openDetail = () => {
                if (!isJiraLink()) return false;
                const selection = ctx.editor()?.view.state
                    .selection as NodeSelection;
                const { id } = selection.node.attrs;
                if (!id) return false;
                ctx.utils?.setLastFocusPosition(selection.anchor);
                const entity =
                    ctx.nuxt.$entities.jira.getByKey(id) ??
                    ctx.nuxt.$entities.jira.getById(id) ??
                    null;
                if (!entity) return true;
                ctx.nuxt.$dropdown.hideAll();
                ctx.nuxt.$entities.jira.openModal(
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

        addProseMirrorPlugins() {
            const type = this.type;

            return [
                new Plugin({
                    key: new PluginKey('jira-drop'),
                    props: {
                        handleDrop(view: EditorView, event: Event) {
                            if (
                                !isDragEvent(event) ||
                                !event.dataTransfer?.getData('acreom/task')
                            ) {
                                return false;
                            }

                            const entityId =
                                event.dataTransfer.getData('acreom/task');

                            const key = `${JiraIntegrationDataType.ISSUE}/`;
                            if (!entityId.startsWith(key)) return false;

                            const dropPos = view.posAtCoords({
                                left: (event as MouseEvent).clientX,
                                top: (event as MouseEvent).clientY,
                            });
                            if (!dropPos) return false;

                            const entity =
                                ctx.nuxt.$entities.jira.getById(entityId);

                            const {
                                dispatch,
                                state: { tr },
                            } = view;

                            dispatch(
                                tr.insert(
                                    dropPos?.pos,
                                    type.create({
                                        id: entity.key,
                                        url: entity.url,
                                    }),
                                ),
                            );

                            return true;
                        },
                    },
                }),
            ];
        },
    });
};
