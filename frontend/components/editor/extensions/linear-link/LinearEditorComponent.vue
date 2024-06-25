<template>
    <node-view-wrapper
        as="span"
        class="linear-editor-component"
        @click.native="open"
        ><img class="ProseMirror-separator" /><span
            v-if="loading"
            class="linear-editor-component__link"
            >{{ url }}<LoadingIcon size="14" class="icon" /></span
        ><span
            v-else-if="entity"
            ref="wrapper"
            class="linear-editor-component__entity"
            :class="{
                'has-focus': selected || previewOpen,
                highlight,
            }"
            @mouseover="handleMouseOver"
            @mouseleave.self="handleMouseLeave"
            @mousemove="handleMouseMove"
            ><LinearStateIcon
                size="16"
                class="icon"
                :state="entity.state"
            /><span
                ><span class="linear-editor-component__entity__repository">{{
                    entity?.identifier
                }}</span>
                {{ entity?.title }}</span
            ></span
        ><span
            v-else-if="storedTitle"
            class="linear-editor-component__entity"
            :class="{
                'has-focus': selected || previewOpen,
                highlight,
            }"
            ><LinearIconRound size="16" class="icon--linear" /><span
                ><span class="linear-editor-component__entity__repository">{{
                    storedIdentifier
                }}</span>
                {{ storedTitle }}</span
            > </span
        ><span v-else class="linear-editor-component__link">{{ url }}</span
        ><img class="ProseMirror-separator"
    /></node-view-wrapper>
</template>
<script lang="ts">
import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { TabSymbols } from '~/constants/symbols';

import { throttle } from '@/helpers';
import GithubEntityPreview from '~/components/github/GithubEntityPreview.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';
import { TrackingActionSource } from '~/@types/tracking';

const throttledByFps = throttle(requestAnimationFrame);
const MOUSE_OVER_PREVIEW_TIMEOUT = 500;
const KEYBOARD_OPEN_PREVIEW_TIMEOUT = 250;
const MOUSE_LEAVE_PREVIEW_TIMEOUT = 150;

@Component({
    name: 'LinearEditorComponent',
    components: {
        LinearIconRound,
        LinearStateIcon,
        LoadingIcon,
        NodeViewWrapper,
    },
})
export default class LinearEditorComponent extends Vue {
    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    node!: NodeViewProps['node'];
    deleteNode!: NodeViewProps['deleteNode'];
    getPos!: NodeViewProps['getPos'];
    editor!: NodeViewProps['editor'];
    selected!: NodeViewProps['selected'];
    updateAttributes!: NodeViewProps['updateAttributes'];
    loading: boolean = true;

    $refs!: {
        wrapper: any;
    };

    mouseOver: boolean = false;
    timer: any = null;
    previewOpen: boolean = false;
    exitTimer: any = null;

    @Watch('selected', { immediate: true })
    handleSelectedChange(value: boolean) {
        if (value) {
            return this.openPreview(KEYBOARD_OPEN_PREVIEW_TIMEOUT);
        }
        if (this.mouseOver) return;
        this.$dropdown.hideAll();
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
        if (this.previewOpen) return;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        return;

        this.timer = setTimeout(() => {
            if (!this.entity) return;
            this.previewOpen = true;

            this.$dropdown.show({
                component: GithubEntityPreview,
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
                        this.open();
                    },
                },
                onClose: () => {
                    this.previewOpen = false;
                },
            });
        }, timeout);
    }

    beforeDestroy() {
        this.previewOpen = false;
        this.handleMouseLeave();
        this.mouseOver = false;
        this.$dropdown.hideAll();
    }

    get highlight() {
        const tabData =
            this.$store.getters['tabs/byId'](this.tabId)?.data.panelData?.id ===
            this.node.attrs.id;

        return tabData;
    }

    get resolvedId() {
        const id = this.node.attrs.id;
        const resolvedId = this.$entities.linear.parseId(id);
        return {
            type: resolvedId?.type,
            id: resolvedId?.id,
        };
    }

    get id() {
        if (this.node.attrs.id?.split('/').length < 3) return null;
        return this.node.attrs.id;
    }

    get url() {
        return this.node.attrs.url ?? this.node.attrs.href;
    }

    get storedTitle() {
        return this.node.attrs.title;
    }

    get storedIdentifier() {
        return this.node.attrs.identifier ?? this.node.attrs.label;
    }

    get entity() {
        return this.$entities.linear.deserializeIssue(
            this.$entities.linear.getById(this.id),
        );
    }

    @Watch('entity', { immediate: true })
    onEntityChange(entity: any) {
        if (!entity) return;
        this.updateNodeAttrs(entity);
        this.loading = false;
    }

    updateNodeAttrs(entity: any) {
        if (entity.title === this.storedTitle) return;
        this.updateAttributes({
            title: entity.title,
            identifier: entity.identifier,
        });
    }

    open() {
        if (!this.entity) {
            this.$utils.navigation.openExternalLink(this.url);
            return;
        }
        this.$dropdown.hideAll();
        this.$entities.linear.openModal(
            this.entity.id,
            TrackingActionSource.EDITOR,
        );
    }

    replaceForPlainLink() {
        const pos = this.getPos();
        this.deleteNode();
        this.editor.commands.insertContentAt(
            pos,
            `<a href="${this.url}">${this.url}</a>`,
        );
    }

    async mounted() {
        if (!this.$entities.linear.getIntegration()) {
            this.loading = false;
            return;
        }
        if (!this.id) {
            let issue = this.$entities.linear.getByIdentifier(
                this.storedIdentifier,
            );
            if (!issue) {
                issue = await this.$entities.linear.fetchIssueByIdentifier(
                    this.storedIdentifier,
                );
            }
            if (!issue) {
                this.replaceForPlainLink();
                this.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText: 'Could not load issue',
                    },
                });
                return;
            }
            this.updateAttributes({
                id: issue.id,
            });
            return;
        }
        const res = await this.$entities.linear.fetchIssue(this.resolvedId.id);
        if (res === null && !this.entity) {
            this.replaceForPlainLink();
            this.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Could not load issue',
                },
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.linear-editor-component {
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

    &__entity {
        position: relative;
        background: var(--editor-extension-document-link-bg-color);
        border-radius: 6px;
        padding: 2px 4px;
        cursor: default;
        -webkit-box-decoration-break: clone;
        -o-box-decoration-break: clone;
        box-decoration-break: clone;

        &__repository {
            color: var(--editor-extension-github-link-color);
        }

        &:hover,
        &.has-focus {
            user-select: none;
            background: var(--editor-extension-document-link-bg-color__hover);
            border: 2px solid var(--accent-color);
            padding: 1px 2px;
        }

        &.highlight {
            background: var(--editor-extension-document-link-bg-color__hover);
        }

        .icon {
            position: relative;
            top: 3px;
            margin-right: 4px;
            height: 16px;
            width: 16px;
            display: inline-block;

            &--linear {
                position: relative;
                margin-right: 4px;
                top: -1px;
                display: inline-block;
            }
        }
    }
}
</style>
