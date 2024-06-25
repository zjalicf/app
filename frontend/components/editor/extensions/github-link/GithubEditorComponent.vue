<template>
    <node-view-wrapper
        as="span"
        class="github-editor-component"
        @click.native="open"
        ><img class="ProseMirror-separator" /><span
            v-if="loading"
            class="github-editor-component__link"
            >{{ url }}<LoadingIcon size="14" class="icon" /></span
        ><span
            v-else-if="resolvedId.type === GithubIntegrationDataType.PR"
            ref="wrapper"
            class="github-editor-component__entity"
            :class="{
                'has-focus': selected || previewOpen,
                highlight,
                'read-only': !editor.isEditable,
            }"
            @mouseover="handleMouseOver"
            @mouseleave.self="handleMouseLeave"
            @mousemove="handleMouseMove"
            ><GithubPullRequestIcon
                size="16"
                class="icon"
                :entity="entity"
            /><span
                ><span class="github-editor-component__entity__repository"
                    >#{{ entity?.number }}</span
                >
                {{ entity?.title }}
            </span></span
        ><span
            v-else-if="resolvedId.type === GithubIntegrationDataType.ISSUE"
            ref="wrapper"
            class="github-editor-component__entity"
            :class="{
                'has-focus': selected || previewOpen,
                highlight,
                'read-only': !editor.isEditable,
            }"
            @mouseover="handleMouseOver"
            @mouseleave.self="handleMouseLeave"
            @mousemove="handleMouseMove"
            ><GithubIssueIcon size="16" class="icon" :entity="entity" /><span
                ><span class="github-editor-component__entity__repository"
                    >#{{ entity?.number }}</span
                >
                {{ entity?.title }}</span
            ></span
        ><span v-else class="github-editor-component__link">{{ url }}</span
        ><img class="ProseMirror-separator"
    /></node-view-wrapper>
</template>
<script lang="ts">
import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import GithubPullRequestIcon from '~/components/github/GithubPullRequestIcon.vue';
import GithubIssueIcon from '~/components/github/GithubIssueIcon.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { GithubIntegrationDataType } from '~/components/github/github';
import { TabSymbols } from '~/constants/symbols';

import { throttle } from '@/helpers';
import GithubEntityPreview from '~/components/github/GithubEntityPreview.vue';
import { TrackingActionSource } from '~/@types/tracking';

const throttledByFps = throttle(requestAnimationFrame);
const MOUSE_OVER_PREVIEW_TIMEOUT = 500;
const KEYBOARD_OPEN_PREVIEW_TIMEOUT = 250;
const MOUSE_LEAVE_PREVIEW_TIMEOUT = 150;

@Component({
    name: 'GithubEditorComponent',
    computed: {
        GithubIntegrationDataType() {
            return GithubIntegrationDataType;
        },
    },
    components: {
        LoadingIcon,
        GithubIssueIcon,
        GithubPullRequestIcon,
        NodeViewWrapper,
    },
})
export default class GithubEditorComponent extends Vue {
    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    node!: NodeViewProps['node'];
    deleteNode!: NodeViewProps['deleteNode'];
    getPos!: NodeViewProps['getPos'];
    editor!: NodeViewProps['editor'];
    selected!: NodeViewProps['selected'];
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
        if (this.$utils.isMobile) return;
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
        const resolvedId = this.$entities.github.resolveId(id);
        return {
            type: resolvedId?.type,
            id: resolvedId?.id,
            repository: resolvedId?.repository,
        };
    }

    get id() {
        return this.node.attrs.id;
    }

    get url() {
        return this.node.attrs.url;
    }

    get entity() {
        return this.$entities.github.getById(this.id);
    }

    @Watch('entity', { immediate: true })
    onEntityChange(entity: any) {
        if (entity) {
            this.loading = false;
        }
    }

    open() {
        if (!this.editor.isEditable) return;
        this.$dropdown.hideAll();
        if (this.$utils.isMobile) {
            this._openMobile();
            return;
        }
        this._openDesktop();
    }

    _openDesktop() {
        if (!this.entity) return;
        this.$entities.github.openModal(
            this.entity,
            TrackingActionSource.EDITOR,
        );
    }

    async _openMobile() {
        if (!this.entity) return;
        if (!this.entity.html_url) return;
        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({
                url: this.entity.html_url,
            });
        } catch (error) {
            console.log(error);
        }
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
        if (!this.$entities.github.getIntegration()) {
            this.replaceForPlainLink();
            return;
        }
        if (this.resolvedId.type === GithubIntegrationDataType.ISSUE) {
            const res = await this.$entities.github.fetchIssue(
                this.resolvedId.repository!,
                this.resolvedId.id!,
            );

            if (res === null && !this.entity) {
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
            }
        }

        if (this.resolvedId.type === GithubIntegrationDataType.PR) {
            const res2 = await this.$entities.github.fetchIssue(
                this.resolvedId.repository!,
                this.resolvedId.id!,
            );

            const res = await this.$entities.github.fetchPullRequest(
                this.resolvedId.repository!,
                this.resolvedId.id!,
            );

            if ((res === null || res2 === null) && !this.entity) {
                this.replaceForPlainLink();
                this.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText: 'Could not load pull request',
                    },
                });
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.github-editor-component {
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

        &:hover:not(.read-only),
        &.has-focus:not(.read-only) {
            user-select: none;
            background: var(--editor-extension-document-link-bg-color__hover);
            border: 2px solid var(--accent-color);
            padding: 1px 2px;
        }

        &.highlight:not(.read-only) {
            background: var(--editor-extension-document-link-bg-color__hover);
        }

        .icon {
            position: relative;
            top: -2px;
            margin-right: 4px;
            height: 16px;
            width: 16px;
            display: inline;
        }
    }
}
</style>
