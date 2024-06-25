<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="mermaid-container"
        content-class="mermaid-content"
        overlay-transition="fade"
        :focus-retain="false"
        :esc-to-close="true"
        :click-to-close="true"
        :content-style="{
            maxWidth: '95vw',
            width: '100%',
            maxHeight: '95vh',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div
            v-shortkey="{ enter: ['shift', 'enter'] }"
            class="mermaid-wrapper"
            :class="{ 'editor-closed': !editorOpen }"
            @shortkey="shortkeyHandler($event, close)"
        >
            <div class="mermaid-wrapper--editor">
                <div class="mermaid-wrapper--editor--header">
                    <tippy
                        :content="$utils.tooltip.getRefText"
                        :delay="[300, 20]"
                        :offset="`0, 0`"
                        :touch="false"
                        boundary="window"
                        placement="bottom"
                        theme="tooltip"
                        target=".has-tippy"
                    />
                    <div class="mermaid-wrapper--editor--header--diagram">
                        Mermaid
                    </div>
                    <div
                        class="mermaid-wrapper--editor--header--link"
                        @click="openExternal"
                    >
                        How to write in mermaid?
                    </div>
                    <button
                        ref="assistantButton"
                        class="
                            mermaid-wrapper--editor--header--assistant
                            has-tippy
                        "
                        :class="{ active: mermaidWizardOpen }"
                        :data-tippy-content="`<div class='tooltip'>Generate diagram with Assistant</div>`"
                        :disabled="generatingMermaid"
                        @click="generateMermaidFromText"
                    >
                        <InterfaceEditMagicWand
                            v-if="!generatingMermaid"
                            class="icon"
                        />
                        <LoadingIcon v-else size="14" class="icon" />
                    </button>
                </div>
                <div class="mermaid-wrapper--editor--codemirror">
                    <div ref="mermaidCodemirror"></div>
                </div>
            </div>
            <div class="mermaid-wrapper--right">
                <tippy
                    :content="$utils.tooltip.getRefText"
                    :delay="[300, 20]"
                    :offset="`0, 0`"
                    :touch="false"
                    boundary="window"
                    placement="top"
                    theme="tooltip"
                    target=".has-tippy"
                />
                <button
                    class="mermaid-wrapper--right__toggle has-tippy"
                    :data-tippy-content="`<div class='tooltip'>Toggle code editor</div>`"
                    @click="toggleEditorVisibility"
                >
                    <AcreomChevronLeft v-if="editorOpen" class="icon" />
                    <AcreomChevronRight v-else class="icon" />
                </button>
                <button
                    v-if="errorMessage.length === 0"
                    ref="downloadTrigger"
                    class="mermaid-wrapper--right__download-trigger has-tippy"
                    :class="{ active: downloadButtonActive }"
                    :data-tippy-content="`<div class='tooltip'>Download the diagram</div>`"
                    @click="openDownloadDropdown"
                >
                    <InterfaceDownloadButton2 class="icon" />
                </button>
                <div
                    class="mermaid-wrapper--right--renderer"
                    contenteditable="false"
                >
                    <div
                        v-if="errorMessage.length"
                        class="mermaid-wrapper--right--renderer--error-wrapper"
                        contenteditable="false"
                    >
                        <div
                            v-for="(message, index) of errorMessage"
                            :key="index"
                            class="
                                mermaid-wrapper--right--renderer--error-wrapper--error
                            "
                            contenteditable="false"
                        >
                            {{ message }}
                        </div>
                    </div>
                    <div class="mermaid-wrapper--right--renderer--svg">
                        <div
                            id="mermaid"
                            ref="mermaidDiv"
                            class="
                                mermaid-wrapper--right--renderer--svg--content
                            "
                            contenteditable="false"
                        ></div>
                    </div>
                </div>
                <div class="mermaid-wrapper--right--actions">
                    <CButton type="secondary" @click="onCancel(close)"
                        >Cancel
                    </CButton>
                    <CButton @click="onComplete(close)">Done</CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { minimalSetup } from 'codemirror';
import { keymap, ViewUpdate, lineNumbers, EditorView } from '@codemirror/view';
import { indentWithTab, standardKeymap } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import debounce from 'lodash/debounce';
import { v4 } from 'uuid';
import { saveAs } from 'file-saver';
import CButton from '~/components/CButton.vue';
import InterfaceEditMagicWand from '~/components/streamline/InterfaceEditMagicWand.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import MermaidWizardDropdown from '~/components/dropdown/MermaidWizardDropdown.vue';
import { TrackingActionSource } from '~/@types/tracking';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import AcreomChevronLeft from '~/components/icons/AcreomChevronLeft.vue';
import InterfaceDownloadButton2 from '~/components/streamline/InterfaceDownloadButton2.vue';
import MermaidDownloadDropdown from '~/components/dropdown/MermaidDownloadDropdown.vue';

@Component({
    name: 'MermaidModal',
    components: {
        InterfaceDownloadButton2,
        AcreomChevronLeft,
        AcreomChevronRight,
        LoadingIcon,
        InterfaceEditMagicWand,
        CButton,
    },
})
export default class MermaidModal extends Vue {
    extension!: any;
    editor!: any;
    mermaidId: string = Buffer.from(v4()).toString('base64');
    errorMessage: string[] = [];
    isRendered: boolean = false;
    errorTimeout!: any;
    mermaidWizardOpen: boolean = false;
    codeMirror!: EditorView;
    url =
        'https://mermaid-js.github.io/mermaid/#/flowchart?id=flowcharts-basic-syntax';

    internalState!: string;
    generatingMermaid: boolean = false;

    editorOpen: boolean = true;
    downloadButtonActive: boolean = false;

    @Prop()
    content!: string;

    options = {
        tabSize: 4,
        theme: 'base16-dark',
        lineNumbers: true,
        line: true,
    };

    $refs!: {
        mermaidDiv: Element;
        mermaidCodemirror: Element;
        assistantButton: HTMLButtonElement;
        downloadTrigger: HTMLButtonElement;
    };

    toggleEditorVisibility() {
        this.editorOpen = !this.editorOpen;
    }

    openExternal() {
        this.$utils.navigation.openExternalLink(this.url);
    }

    generateMermaidFromText() {
        if (!this.$utils.assistant.assistantEnabled) {
            this.$utils.navigation.openSettings(
                'assistant',
                TrackingActionSource.MERMAID_MODAL,
            );
            return;
        }

        this.mermaidWizardOpen = true;
        this.$dropdown.show({
            parent: this.$refs.assistantButton,
            component: MermaidWizardDropdown,
            popperOptions: {
                placement: 'bottom-end',
            },
            on: {
                generate: async (query: string) => {
                    if (!this.$utils.assistant.allowAssistantUsage) return;
                    this.$utils.assistant.incrementAssistantUsage();

                    this.generatingMermaid = true;
                    const diagramText =
                        await this.$utils.assistant.generateMermaid(
                            query,
                            TrackingActionSource.MERMAID_MODAL,
                        );

                    const commentedTextInput = query
                        .split('\n')
                        .map(line => '%% ' + line)
                        .join('\n');

                    this.codeMirror.destroy();
                    this.internalState =
                        commentedTextInput +
                        '\n\n' +
                        diagramText.replaceAll(/```(?:mermaid)?/g, '');
                    this.createEditor(this.internalState);
                    this.renderMermaid();

                    this.generatingMermaid = false;
                },
            },
            onClose: () => {
                this.mermaidWizardOpen = false;
            },
        });
    }

    async renderMermaid() {
        const render = debounce(
            async () => {
                const { default: mermaid } = await import('mermaid'); // TODO: always import?
                await mermaid.mermaidAPI.parse(this.internalState);
                const { svg } = (await mermaid.mermaidAPI.render(
                    this.mermaidId,
                    this.internalState,
                )) as any;

                this.isRendered = true;
                clearTimeout(this.errorTimeout);
                this.errorMessage = [];
                this.$refs.mermaidDiv.innerHTML = svg;
            },
            300,
            { trailing: true, leading: true, maxWait: 450 },
        );
        await render().catch((err: any) => {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout(() => {
                this.errorMessage = err.message.split('\n') || [];
            }, 500);
        });
    }

    shortkeyHandler(event: any, close: Function) {
        switch (event.srcKey) {
            case 'enter':
                this.onComplete(close);
                break;
            case 'escape':
                this.onCancel(close);
                break;
        }
    }

    @Watch('content')
    setState() {
        this.internalState = this.content;
        this.renderMermaid();
    }

    onCancel(close: any) {
        close();
    }

    onComplete(close: any) {
        close();
        this.$emit('onComplete', this.internalState);
    }

    createEditor(content: string) {
        const theme = EditorView.theme({
            '&': {
                'font-family': 'Consolas',
                'font-style': 'normal',
                'font-weight': '400',
                'font-size': '14px',
            },
            '.cm-cursor': {
                'border-left': '1.2px solid #00F0FF',
            },
            '.cm-selectionBackground': {
                background: '#00F0FF !important',
                opacity: 0.2,
            },
        });
        this.codeMirror = new EditorView({
            doc: content,
            extensions: [
                theme,
                minimalSetup,
                keymap.of(standardKeymap),
                // autocompletion({}),
                keymap.of([indentWithTab]),
                indentUnit.of('    '),
                EditorView.updateListener.of((update: ViewUpdate) => {
                    if (!update.docChanged) return;
                    this.internalState = update.state.doc.toString();
                    this.renderMermaid();
                }),
                lineNumbers(),
            ],
            parent: this.$refs.mermaidCodemirror,
        });
    }

    downloadAsSvg() {
        const svg = this.$refs.mermaidDiv.innerHTML;
        const blob = URL.createObjectURL(
            new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
        );
        saveAs(blob);
    }

    downloadAsPng() {
        const svg = this.$refs.mermaidDiv.innerHTML;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = this.$refs.mermaidDiv.getClientRects()[0].width;
        const height = this.$refs.mermaidDiv.getClientRects()[0].height;
        const img = new Image(width, height);
        img.src = 'data:image/svg+xml;base64,' + btoa(svg);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                saveAs(blob!);
            });
        };
    }

    openDownloadDropdown() {
        this.downloadButtonActive = true;
        this.$dropdown.show({
            component: MermaidDownloadDropdown,
            bind: {},
            parent: this.$refs.downloadTrigger,
            backdrop: true,
            retainFocus: true,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-end',
            },
            on: {
                'download-png': () => this.downloadAsPng(),
                'download-svg': () => this.downloadAsSvg(),
            },
            onClose: () => {
                this.downloadButtonActive = false;
            },
        });
    }

    async mounted() {
        this.internalState = this.content;
        this.$store.commit('editorFocused', false);
        this.createEditor(this.internalState);
        this.renderMermaid();
        setTimeout(() => {
            this.codeMirror?.focus();
        }, 300);
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
    .vfm__container {
        padding-bottom: 5vh !important;
        padding-top: 5vh !important;
    }
}

.mermaid-wrapper {
    @include modal;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 35% auto;
    grid-template-rows: 100%;
    transition: 300ms;

    &.editor-closed {
        grid-template-columns: 0 auto;
    }

    :deep(.cm-editor) {
        height: 100%;
    }

    &--editor {
        width: 100%;

        .editor-closed & {
            overflow: hidden;
        }

        &--header {
            padding: 16px 18px 16px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--tab-divider-color);

            &--diagram {
                font-weight: 600;
            }

            &--link {
                @include font12-400;
                @include ellipsis;
                color: var(--mermaid-modal-link-color);
                cursor: pointer;
                margin-left: auto;

                &:hover {
                    text-decoration: underline;
                }
            }

            &--assistant {
                margin-left: 10px;
                padding: 7px;
                border-radius: 6px;
                color: var(--tab-controls-icon-color__hover);

                &:hover,
                &.active {
                    color: var(--tab-controls-icon-color__hover);
                    background: var(--tab-controls-bg-color__hover);
                }
            }
        }

        &--codemirror {
            @include inputMetaStyles;
            padding: 0;
            width: 100%;
            height: calc(100% - 61px);
            border-radius: 12px;

            div {
                @include scrollbar;
                height: 100%;
                overflow-y: auto;

                .editor-closed & {
                    overflow: hidden;
                }
            }

            :deep(.cm-selectionBackground) {
                background: var(--app-selection-color) !important;
            }

            :deep(.cm-cursor) {
                border-left: 1.2px solid var(--accent-color) !important;
            }

            :deep(.cm-gutters) {
                background: var(--modal-bg-color);
                z-index: 10;
                border-right-color: var(--tab-divider-color);
                user-select: none;
                cursor: default;
                border-bottom-left-radius: 12px;
            }

            :deep(.cm-gutterElement) {
                color: var(--extension-codeblock-line-number-text-color);
                padding: 0px 6px;
                min-width: 30px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
                    Consolas, 'Liberation Mono', 'Courier New', monospace;
                font-size: 13.6px;
                line-height: 20px;
            }

            :deep(.cm-line) {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
                    Consolas, 'Liberation Mono', 'Courier New', monospace;
                font-size: 13.6px;
                line-height: 20px;
                color: var(--editor-text-color);
            }

            :deep(.cm-scroller) {
                @include scrollbar;
                .editor-closed & {
                    overflow: hidden;
                }
            }
        }
    }

    &--divider {
        border: 1px solid var(--tab-divider-color);
    }

    &--right {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        border-left: 1px solid var(--tab-divider-color);
        position: relative;
        background: var(--modal-bg-color);
        border-radius: 0 12px 12px 0;

        .editor-closed & {
            border-radius: 12px;
        }

        &--renderer {
            width: 100%;
            height: calc(100% - 54px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;

            &--error-wrapper {
                position: absolute;
                width: 100%;
                top: 0;
                padding: 16px;
                z-index: 3;

                &--error {
                    background: var(--mermaid-error-bg-color);
                    padding: 10px;
                    font-size: 12px;
                    color: var(--danger-color);

                    &:first-of-type {
                        border-top-left-radius: 6px;
                        border-top-right-radius: 6px;
                    }

                    &:last-of-type {
                        border-bottom-left-radius: 6px;
                        border-bottom-right-radius: 6px;
                    }
                }
            }

            &--svg {
                height: 100%;
                width: 100%;
                padding: 16px;
                display: flex;
                flex-direction: column;
                justify-content: center;

                &--content {
                    height: 100%;
                    display: flex;
                    justify-content: center;
                }
            }
        }

        &--actions {
            padding: 12px;
            width: 100%;
            display: flex;
            justify-content: right;
            gap: 10px;
        }

        &__toggle {
            position: absolute;
            z-index: 10;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            padding: 18px 3px;
            background: var(--mermaid-toggle-bg-color);
            border-radius: 0 8px 8px 0;
            border: 1px solid var(--tab-divider-color);
            border-left: none;

            .icon {
                color: var(--mermaid-toggle-icon-color);
            }

            &:hover {
                background: var(--mermaid-toggle-bg-color__hover);

                .icon {
                    color: var(--mermaid-toggle-icon-color__hover);
                }
            }
        }

        &__download-trigger {
            position: absolute;
            top: 6px;
            right: 6px;
            padding: 6px;
            border-radius: 6px;
            z-index: 10;

            .icon {
                color: var(--mermaid-toggle-icon-color);
            }
            &:hover,
            &.active {
                background: var(--mermaid-toggle-bg-color__hover);

                .icon {
                    color: var(--mermaid-toggle-icon-color__hover);
                }
            }
        }
    }
}
</style>
