<template>
    <node-view-wrapper
        as="span"
        class="jira-editor-component"
        @click.native="open"
        ><img class="ProseMirror-separator" /><span
            v-if="loading"
            class="jira-editor-component__link"
            >{{ url }}<LoadingIcon size="14" class="icon" /></span
        ><span
            v-else-if="resolvedId.type === JiraIntegrationDataType.ISSUE"
            ref="wrapper"
            class="jira-editor-component__wrapper"
            :class="{
                selected,
                'has-focus': selected || previewOpen,
                'read-only': !editor.isEditable,
            }"
            @mouseover="handleMouseOver"
            @mouseleave.self="handleMouseLeave"
            @mousemove="handleMouseMove"
            ><span><IssueType class="issue-avatar" :entity="entity" /></span
            ><span class="jira-editor-component__key">{{ key }}</span
            ><span class="jira-editor-component__text">{{ text }}</span></span
        ><span
            v-else-if="storedTitle"
            class="jira-editor-component__wrapper"
            :class="{
                selected,
                'has-focus': selected || previewOpen,
                'read-only': !editor.isEditable,
            }"
            ><span><JiraIcon class="issue-avatar" :size="16" /></span
            ><span class="jira-editor-component__key">{{
                storedIdentifier
            }}</span
            ><span class="jira-editor-component__text">{{
                storedTitle
            }}</span></span
        ><span v-else class="jira-editor-component__link">{{ url }}</span
        ><img class="ProseMirror-separator"
    /></node-view-wrapper>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { CalendarIcon } from '@vue-hero-icons/solid';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { TabSymbols } from '~/constants/symbols';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { throttle } from '~/helpers';
import JiraEntityPreview from '~/components/editor/extensions/jira-link/JiraEntityPreview.vue';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import { TrackingActionSource } from '~/@types/tracking';

const throttledByFps = throttle(requestAnimationFrame);
const MOUSE_OVER_PREVIEW_TIMEOUT = 500;
const KEYBOARD_OPEN_PREVIEW_TIMEOUT = 250;
const MOUSE_LEAVE_PREVIEW_TIMEOUT = 150;

@Component({
    name: 'JiraIssueComponent',
    components: {
        IssueType,
        LoadingIcon,
        NodeViewWrapper,
        JiraIcon,
        CalendarIcon,
    },
})
export default class JiraIssueComponent extends Vue {
    loading: boolean = true;

    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Prop()
    entityId!: string;

    $refs!: {
        wrapper: any;
    };

    node!: NodeViewProps['node'];
    deleteNode!: NodeViewProps['deleteNode'];
    getPos!: NodeViewProps['getPos'];
    editor!: NodeViewProps['editor'];
    selected!: NodeViewProps['selected'];
    updateAttributes!: NodeViewProps['updateAttributes'];

    JiraIntegrationDataType = JiraIntegrationDataType;

    mouseOver: boolean = false;
    timer: any = null;
    previewOpen: boolean = false;
    exitTimer: any = null;

    @Watch('selected', { immediate: true })
    handleSelectedChange(value: boolean) {
        if (this.$utils.isMobile) return;
        if (value) {
            return this.openPreview(KEYBOARD_OPEN_PREVIEW_TIMEOUT);
        }
        if (this.mouseOver) return;
        this.$dropdown.hideAll();
    }

    get id() {
        return this.node.attrs.id;
    }

    get url() {
        return this.node.attrs.url;
    }

    get resolvedId() {
        const resolvedId = this.$entities.jira.parseId(
            this.entity?.id ?? this.id,
        );
        return {
            type: resolvedId?.type,
            id: resolvedId?.entityId,
        };
    }

    replaceForPlainLink() {
        const pos = this.getPos();
        this.deleteNode();
        this.editor.commands.insertContentAt(
            pos,
            `<a href="${this.url}">${this.url}</a>`,
        );
    }

    @Watch('mouseOver')
    handleMouseOverChange(value: boolean) {
        clearTimeout(this.exitTimer);

        if (value) return;

        this.exitTimer = setTimeout(() => {
            this.$dropdown.hideAll();
        }, MOUSE_LEAVE_PREVIEW_TIMEOUT);
    }

    handleMouseOver() {
        if (this.$utils.isMobile) return;
        this.mouseOver = true;
    }

    handleMouseLeave() {
        this.mouseOver = false;
        clearTimeout(this.timer);
    }

    handleMouseMove() {
        throttledByFps(() => {
            if (!this.mouseOver) return;
            this.openPreview();
        });
    }

    openPreview(timeout: number = MOUSE_OVER_PREVIEW_TIMEOUT) {
        if (!this.editor.isEditable) return;
        if (this.previewOpen) return;
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            if (!this.entity?.id) return;
            this.previewOpen = true;

            this.$dropdown.show({
                component: JiraEntityPreview,
                parent: this.$refs.wrapper,
                bind: {
                    id: this.entity.id,
                },
                backdrop: false,
                retainFocus: true,
                on: {
                    enter: () => {
                        this.mouseOver = true;
                    },
                    leave: () => {
                        this.mouseOver = false;
                    },
                    click: () => {
                        this.$dropdown.hideAll();
                        this.open();
                    },
                },
                onClose: () => {
                    this.previewOpen = false;
                },
            });
        }, timeout);
    }

    get entity() {
        return this.$entities.jira.getByKey(this.id);
    }

    get storedTitle() {
        return this.node.attrs.title;
    }

    get storedIdentifier() {
        return this.node.attrs.identifier;
    }

    @Watch('entity', { immediate: true })
    onEntityChange(entity: any) {
        if (!entity) return;
        this.updateNodeAttrs(entity);
        this.loading = false;
    }

    updateNodeAttrs(entity: any) {
        if (entity.text === this.storedTitle) return;
        this.updateAttributes({
            title: entity.text,
            key: entity.key,
        });
    }

    get key() {
        return this.entity?.key ?? this.id ?? '';
    }

    get issueType() {
        return this.entity?.properties?.issuetype ?? null;
    }

    get status() {
        const status = this.$entities.jira.getStatusById(
            this.entity?.properties?.status,
        );

        if (!status) {
            return {
                name: 'Unknown',
                iconUrl: '',
                statusCategory: 'UNKNOWN',
            };
        }

        return status.status;
    }

    get statusProperties(): { icon: any; color: string } {
        return this.$entities.jira.getStatusProperties(this.status);
    }

    get text() {
        return this.entity?.text ?? '';
    }

    open() {
        if (!this.editor.isEditable) return;
        this.$dropdown.hideAll();
        if (!this.entity) {
            this.$utils.navigation.openExternalLink(this.node.attrs.url);
            return;
        }
        if (this.$utils.isMobile) {
            this._openMobile();
            return;
        }
        this._openDesktop();
    }

    _openDesktop() {
        this.$entities.jira.openModal(this.entity, TrackingActionSource.EDITOR);
    }

    async _openMobile() {
        if (!this.entity.url) return;
        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({
                url: this.entity.url,
            });
        } catch (error) {
            console.log(error);
        }
    }

    beforeDestroy() {
        this.previewOpen = false;
        this.handleMouseLeave();
        this.mouseOver = false;
        this.$dropdown.hideAll();
    }

    async mounted() {
        const project = this.$entities.jira.getProjectByKey(
            this.key.split('-')[0],
        );
        const res = await this.$entities.jira.fetchIssue(
            this.$entities.jira.getIntegration(),
            project,
            this.id ?? this.key,
            false,
        );
        if (res === null && !this.entity) {
            this.replaceForPlainLink();
            this.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: `Could not load JIRA issue ${this.key}`,
                },
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.jira-editor-component {
    img {
        user-select: none;
    }

    &__link {
        color: var(--accent-color);
        word-break: break-all;

        .icon {
            margin-left: 4px;
            display: inline-block;
        }
    }

    &__wrapper {
        cursor: default;
        border-radius: 6px;
        -webkit-box-decoration-break: clone;
        -o-box-decoration-break: clone;
        box-decoration-break: clone;
        position: relative;
        padding: 2px 4px;
        background: var(--editor-extension-document-link-bg-color);

        .read-only {
            user-select: none;
        }

        .issue-avatar {
            user-select: none;
            display: inline-block;
            border-radius: 4px;
            position: relative;
            top: 2px;
            margin-right: 4px;
        }

        &:hover:not(.read-only),
        &.selected:not(.read-only) {
            user-select: none;
            background: var(--editor-extension-document-link-bg-color__hover);
            border: 2px solid var(--accent-color);
            padding: 1px 2px;
        }
    }

    &__key {
        color: var(--editor-extension-jira-key-color);
        margin-right: 4px;
    }

    &__text {
        outline: none;
        min-width: 0;
    }
}
</style>
