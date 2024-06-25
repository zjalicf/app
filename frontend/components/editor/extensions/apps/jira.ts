import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { EditorContext } from '~/@types/app';
import InlineJiraComponent from '~/components/editor/extensions/apps/JiraComponent.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { TrackingActionSource } from '~/@types/tracking';

export const JIRA_NODE_NAME = 'jira-issue';

export const createInstance = (ctx: EditorContext) => {
    ctx.bubbleMenuExceptions.add(JIRA_NODE_NAME);
    return Node.create({
        name: JIRA_NODE_NAME,
        group: 'block',
        inline: false,
        atom: true,
        selectable: true,
        draggable: true,

        addAttributes() {
            return {
                id: {
                    default: '',
                },
                key: {
                    default: '',
                },
            };
        },

        parseHTML() {
            return [
                {
                    tag: JIRA_NODE_NAME,
                },
            ];
        },

        renderHTML({ HTMLAttributes }) {
            const attrs: any = {
                id: HTMLAttributes.id,
                key: HTMLAttributes.key,
            };
            return [JIRA_NODE_NAME, mergeAttributes(attrs)];
        },

        addNodeView() {
            return VueNodeViewRenderer(InlineJiraComponent, {});
        },

        addKeyboardShortcuts() {
            return {
                Space: () =>
                    ctx.utils!.executeOnFocusedNodeOfType(
                        JIRA_NODE_NAME,
                        node => {
                            const entityId = node.attrs.id;
                            if (
                                !entityId ||
                                entityId.startsWith(
                                    !JiraIntegrationDataType.ISSUE,
                                )
                            ) {
                                return;
                            }
                            const entity =
                                ctx.store.getters['integrationData/byId'](
                                    entityId,
                                );

                            ctx.nuxt.$entities.jira.openModal(
                                entity,
                                TrackingActionSource.EDITOR,
                            );
                        },
                    ),
            };
        },
    });
};
