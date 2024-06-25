<template>
    <node-view-wrapper as="div" style="white-space: nowrap">
        <JiraSearchComponent
            v-if="!entityId"
            @close="close"
            @issue:select="handleIssueSelect"
        />
        <JiraIssueComponent
            v-else
            :entity-id="entityId"
            :selected="selected"
            :is-element-selected="isElementSelected"
            :context-menu-open="contextMenuOpen"
            @click.native="handleMouseDown"
            @contextmenu.native.prevent.stop="handleContextMenu"
        />
    </node-view-wrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import { Editor as TipTapEditor } from '@tiptap/core/dist/packages/core/src/Editor';
import JiraIssueComponent from '~/components/editor/extensions/apps/JiraIssue.vue';
import JiraSearchComponent from '~/components/editor/extensions/apps/JiraSearch.vue';
import JiraContextMenu from '~/components/integrations/jira/JiraContextMenu.vue';
import { AcreomJiraIssue } from '~/components/task/model';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'InlineJiraComponent',
    components: {
        JiraIssueComponent,
        JiraSearchComponent,
        NodeViewWrapper,
    },
    props: nodeViewProps,
})
export default class InlineJiraComponent extends Vue {
    node!: Node;
    updateAttributes!: any;
    extension: any;
    getPos: any;
    editor!: TipTapEditor;
    contextMenuOpen: boolean = false;

    get entityId() {
        return this.node.attrs.id;
    }

    get entity() {
        return (
            this.$store.getters['integrationData/byId'](this.node.attrs.id) ??
            {}
        );
    }

    get text() {
        return this.entity?.text ?? '';
    }

    get isElementSelected() {
        const selection = this.editor?.state.selection;
        if (!selection) return false;
        const { from, to } = selection;
        const pos = this.getPos?.();
        if (pos === undefined || to - from === 1) return false;

        if (this.$config.os === 'android') {
            return pos >= from && pos + 2 < to;
        }
        return pos >= from && pos < to; // TODO: +2 on android
    }

    handleMouseDown(e: MouseEvent) {
        if (this.$utils.isMobile) {
            e?.preventDefault();
        }

        this.$entities.jira.openModal(this.entity, TrackingActionSource.EDITOR);
    }

    handleContextMenu(event: MouseEvent) {
        if (this.$utils.isMobile) return;
        this.contextMenuOpen = true;
        this.$contextMenu.show(event, {
            component: JiraContextMenu,
            bind: {
                entityId: this.node.attrs.id,
            },
            onClose: () => {
                this.contextMenuOpen = false;
                this.$nextTick(() => {
                    this.$dropdown.hideAll();
                });
            },
        });
    }

    handleIssueSelect(issue: AcreomJiraIssue, redirect: boolean = false) {
        this.updateAttributes({
            id: issue.id,
            key: issue.key,
        });
        this.editor.commands.focus(this.getPos() + 1);
        if (redirect) {
            const entity = this.$store.getters['integrationData/byId'](
                issue.id,
            );

            this.$entities.jira.openModal(entity, TrackingActionSource.EDITOR);
        }

        this.$tracking.trackEvent('editor', {
            action: 'insert jira issue link',
        });
    }

    close() {
        const pos = this.getPos();

        this.editor
            .chain()
            .focus(pos)
            .deleteRange({ from: pos, to: pos + 1 })
            .run();
    }
}
</script>
