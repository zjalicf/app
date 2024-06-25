<template>
    <div
        class="mobile-editor"
        :class="{
            'mobile-editor--bubble-menu-visible': shouldShowBubbleMenu,
            'dropdown-visible': dropdownVisible,
        }"
    >
        <div id="editor-wrapper" ref="page" class="mobile-editor__wrapper">
            <div class="mobile-editor__wrapper__page">
                <slot name="page-properties" />
                <div class="mobile-editor__wrapper__page__editor">
                    <Editor
                        ref="editor"
                        class="editor"
                        :value="editorPage.content"
                        :doc-id="pageId"
                        placeholder="Start typing..."
                        @update:html="onUpdateHtmlHandler"
                        @create="handleOnCreate"
                    />
                </div>
                <div
                    class="mobile-editor__wrapper__page__editor__footer"
                    @mousedown="handleMouseDownFooter"
                    @click="handleFooterClick"
                ></div>
            </div>
        </div>
        <div v-if="shouldShowBubbleMenu" class="mobile-editor__bubble-menu">
            <MobileBubbleMenu :editor="childEditor" :document-id="pageId" />
        </div>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Vue,
    Prop,
    Watch,
    ProvideReactive,
} from 'vue-property-decorator';
import { animate } from 'motion';
import { FocusPosition } from '@tiptap/core';
import MobileBubbleMenu from '~/components/editor/bubble-menu/mobile/MobileBubbleMenu.vue';
import type Editor from '~/components/editor/EditorComponent.vue';
import { IDocument } from '~/components/document/model';
import { TabSymbols } from '~/constants/symbols';
@Component({
    name: 'MobileEditor',
    components: {
        MobileBubbleMenu,
        Editor: () => import('@/components/editor/EditorComponent.vue'),
    },
})
export default class MobileEditor extends Vue {
    editorPage: Partial<IDocument> = {};
    childEditor: any = null;

    $refs!: {
        editor: Editor;
        page: HTMLElement;
    };

    @Prop({ required: true })
    pageId!: string;

    @ProvideReactive(TabSymbols.IS_ACTIVE)
    get active() {
        return true;
    }

    @Watch('pageId')
    onPageIdChange(newValue: string, oldValue: string) {
        this.editorPage =
            this.$store.getters['document/byId'](this.pageId) || {};
        if (this.$refs.editor?.editor) {
            this.$refs.editor.editor.lastFocusPosition = 0;
            this.$refs.editor.editor.resetEditorContent(
                this.editorPage.content!,
            );
        }
        const oldDocument = this.$store.getters['document/byId'](oldValue);
        if (!oldDocument) return;
        if (
            !oldDocument.dailyDoc &&
            oldDocument?.status &&
            oldDocument.status === 'new'
        ) {
            this.$store.dispatch('document/deleteLocal', oldValue);
            // We rely on daily docs having titles so they don't get deleted
        } else if (this.page.title === '' && this.page.content === '<p></p>') {
            this.$store.dispatch('document/deleteWithoutRedirect', oldValue);
            this.$store.dispatch('document/deleteLocal', oldValue);
        }
    }

    @Watch('page.updateId')
    onDocumentUpdateIdChange() {
        let shouldFocusPreviousPosition = false;
        let lastFocusPosition: any = 0;
        if (this.editorPage.id === this.pageId) {
            shouldFocusPreviousPosition = true;
            lastFocusPosition = this.$refs.editor?.editor?.lastFocusPosition;
        }
        const contentBefore = this.editorPage.content;

        this.editorPage =
            this.$store.getters['document/byId'](this.page?.id) || {};

        const contentAfter = this.editorPage.content;

        if (contentBefore === contentAfter) {
            this.$refs.editor?.editor?.updateContent(contentAfter!);
        }

        if (shouldFocusPreviousPosition && this.$store.getters.editorFocused) {
            this.$refs.editor?.focusEditor(lastFocusPosition);
        }
    }

    get page() {
        return this.$store.getters['document/byId'](this.pageId) ?? {};
    }

    get shouldShowBubbleMenu() {
        return this.childEditor && this.$store.getters.editorFocused;
    }

    get dropdownVisible() {
        return this.$dropdown.dropdownList.length > 0;
    }

    onUpdateHtmlHandler(html: string) {
        this.$store.dispatch('document/update', {
            id: this.pageId,
            updatedAt: new Date(),
            content: html,
        });
    }

    handleOnCreate() {
        this.childEditor = this.$refs.editor?.editorInstance;
    }

    handleMouseDownFooter(e: Event) {
        e.preventDefault();
    }

    handleFooterClick(event: MouseEvent) {
        this.$refs.editor?.focusEditor('end');
        this.onMobileFocus(event);
        this.onMobileScrollEditor(event);
    }

    clearEditorHistory() {
        if (!this.pageId) return;
        this.$refs.editor?.clearHistory(this.page.content);
    }

    onMobileScrollEditor(event: MouseEvent) {
        const keyboardHeight = this.$store.getters['mobile/keyboardHeight'];
        const top = event.pageY;
        const fullHeight = window.innerHeight;
        const threshold = fullHeight - (keyboardHeight + 44);
        const shouldScroll = top > threshold;
        const initialOffset = this.$refs.page.scrollTop;
        if (shouldScroll) {
            animate(
                (progress: number) => {
                    this.$refs.page.scrollTop =
                        initialOffset + progress * (top - threshold + 80);
                },
                { duration: 0.5 },
            );
        }
    }

    onMobileFocus(event: MouseEvent, pos?: FocusPosition) {
        if (!event && !pos) return;
        if (pos) {
            this.$refs.editor?.focusEditor(pos);
            return;
        }
        this.$refs.editor?.focusEditorAtCoords(event.pageX, event.pageY);
    }

    beforeDestroy() {
        this.$nuxt.$off('editor:focus-mobile');
        this.$nuxt.$off('editor:scroll-mobile');
        this.$nuxt.$off('editor:clear-history');
        if (!this.page) return;
        if (this.page.status === 'new') {
            this.$store.dispatch('document/deleteLocal', this.pageId);
        } else if (this.page.title === '' && this.page.content === '<p></p>') {
            this.$store.dispatch(
                'document/deleteWithoutRedirect',
                this.page.id,
            );
            this.$store.dispatch('document/deleteLocal', this.pageId);
        }
        this.editorPage = {};
    }

    mounted() {
        if (this.page) {
            this.onPageIdChange(this.pageId, '');
        }
        this.editorPage =
            this.$store.getters['document/byId'](this.pageId) || {};

        this.$nuxt.$on('editor:focus-mobile', this.onMobileFocus);
        this.$nuxt.$on('editor:scroll-mobile', this.onMobileScrollEditor);
        this.$nuxt.$on('editor:clear-history', this.clearEditorHistory);
    }
}
</script>
<style lang="scss" scoped>
.mobile-editor {
    height: 100%;
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 100%;

    &.dropdown-visible {
        :deep(.ProseMirror) {
            caret-color: transparent;

            &::selection {
                background: transparent;
            }
        }
    }

    &--bubble-menu-visible {
        grid-template-rows: calc(100% - 52px) 52px;
    }

    &__wrapper {
        @include scrollbar;
        overflow-y: overlay;
        width: 100%;
        height: 100%;

        &__page {
            padding: 35px 15px 0px;
            max-width: 570px;
            margin: 0 auto;

            display: flex;
            flex-direction: column;
            height: calc(100% - 52px);

            @media (max-width: 769px) {
                padding: 10px 5px 0px;
            }

            &__editor {
                padding: 0 15px;

                &__footer {
                    height: 100%;
                    cursor: text;
                    min-height: 150px;
                }
            }
        }
    }

    &__bubble-menu {
        height: 52px;
        width: 100%;
    }
}
</style>
