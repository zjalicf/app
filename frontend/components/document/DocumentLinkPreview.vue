<template>
    <div
        class="document-link-preview"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @click.stop.prevent="$emit('close')"
    >
        <div class="document-link-preview__title">
            {{ title }}
        </div>
        <div ref="editor" class="document-link-preview__editor">
            <ReadOnlyEditor
                class="document-link-preview__readonly-editor"
                :value="document.content"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import scrollIntoView from 'scroll-into-view';
import ReadOnlyEditor from '~/components/editor/ReadOnlyEditor.vue';

@Component({
    name: 'DocumentLinkPreview',
    components: {
        ReadOnlyEditor,
    },
})
export default class DocumentLinkPreview extends Vue {
    @Prop({ required: true })
    id!: string;

    @Prop()
    parentDocumentId!: string | null;

    $refs!: {
        editor: HTMLDivElement;
    };

    mounted() {
        this.$nextTick(() => {
            const height = this.$refs.editor.offsetHeight;
            this.$refs.editor.style.height = `${Math.max(
                Math.round(height * 0.7), // transform: scale(0.7) changes the element visually but keeps real width and height. We need to adjust the height too.
                0, // 250px is the height of the preview window. do not go below that.
            )}px`;

            if (this.parentDocumentId) {
                const elements = this.$refs.editor.querySelectorAll(
                    `.document-link-${this.parentDocumentId}`,
                );

                if (!elements.length) return;

                scrollIntoView(elements[0] as HTMLElement, {
                    time: 250,
                    align: {
                        lockX: true,
                    },
                });
            }
        });
    }

    get title() {
        return this.$entities.page.displayTitle(this.document);
    }

    get document() {
        return this.$store.getters[`document/byId`](this.id);
    }

    handleMouseOver() {
        this.$emit('enter');
    }

    handleMouseLeave() {
        this.$emit('leave');
    }
}
</script>

<style lang="scss" scoped>
.document-link-preview {
    @include frostedGlassBackground;
    @include scrollbar;
    width: 378px;
    max-height: 250px;
    position: relative;
    //background: var(--document-link-preview-bg-color);
    border-radius: 6px;
    //box-shadow: var(--document-link-preview-box-shadow);
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;
    padding-bottom: 10px;

    &__title {
        padding-top: 10px;
        padding-left: 10px;
        color: var(--document-link-preview-title-color);
        font-size: 16px;
        font-weight: 700;
        line-height: 28px;
    }

    &__editor {
        width: 540px;
        transform-origin: top left;
        transform: scale(0.7);
        pointer-events: none;
        padding: 0 15px;

        :deep(.read-only-editor) {
            @include editorStyling;
        }

        :deep(p) {
            min-height: 28px;
        }

        :deep(code),
        :deep(p) {
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    }
}
</style>
