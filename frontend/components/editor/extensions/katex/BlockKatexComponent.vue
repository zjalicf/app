<template>
    <node-view-wrapper as="div" style="white-space: nowrap">
        <div
            v-if="!editor.isEditable || $utils.isMobile || (!selected && !open)"
            :class="{
                multiselect: isElementSelected,
                mobileselect: mobileSelected,
            }"
            v-html="expression"
        ></div>
        <div v-else class="inline-katex">
            <div class="inline-katex--wrapper">
                <ResizeableTextarea
                    ref="input"
                    type="text"
                    :editable="editor.isEditable"
                    :placeholder="placeholder"
                    :value="value"
                    @keydown="handleKeydown"
                    @change="handleInput"
                    @blur="handleBlur"
                />
            </div>
        </div>
    </node-view-wrapper>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import 'katex/dist/katex.css';
import { Editor } from '@tiptap/core';
import ResizeableTextarea from './ResizeableTextarea.vue';

@Component({
    name: 'BlockKaTeXComponent',
    components: {
        ResizeableTextarea,
        NodeViewWrapper,
    },
    props: nodeViewProps,
})
export default class BlockKaTeXComponent extends Vue {
    open: boolean = false;
    node!: Node;
    getPos!: any;
    editor!: Editor;
    deleteNode!: Function;
    value: string = '';
    shadowValue: string = '';
    placeholder: string = '\\frac{1}{1+x}';
    selectedIndex: number = 0;
    updateAttributes!: any;
    canBlur: boolean = true;
    popperInstance: any = null;
    prevSelectionStart = -1;
    prevSelectionEnd = -1;
    katex: any = null;

    $refs!: {
        input: ResizeableTextarea;
        katex: HTMLDivElement;
        shadow: HTMLSpanElement;
    };

    get mobileSelected() {
        // @ts-ignore
        return this.$utils.isMobile && this.selected;
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

    get expression() {
        if (!this.katex) return '<div></div>';

        return this.katex.default.renderToString(
            String.raw`${this.node?.attrs.expression}`,
            this.options,
        );
    }

    get options(): {
        throwOnError: boolean;
        output: 'html';
        displayMode: boolean;
    } {
        return {
            throwOnError: false,
            output: 'html',
            displayMode: true,
        };
    }

    @Watch('selected')
    handleSelected(value: boolean) {
        if (value) {
            this.canBlur = true;
            this.$nextTick(() => {
                this.recalculateWidth();
                this.$refs?.input?.setFocus();
            });
        }
    }

    handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp':
                this.handleKeyUp();
                break;
            case 'ArrowDown':
                this.handleKeyDown();
                break;
            case 'ArrowLeft':
                event.stopPropagation();
                this.handleKeyLeft();
                break;
            case 'ArrowRight':
                event.stopPropagation();
                this.handleKeyRight();
                break;
            case 'Backspace':
                this.handleBackspace();
                break;
            case 'Enter':
                if (event.metaKey || event.ctrlKey) {
                    this.handleEnter();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.handleEscape();
                break;
        }
    }

    handleBlur(pos = 'end') {
        if (!this.canBlur) return;
        this.open = false;
        this.canBlur = false;
        if (this.value.trim().length === 0) {
            return this.removeKatex();
        }
        this.$refs.input.setBlur();
        if (this.value.trim() !== this.node?.attrs.expression) {
            this.updateAttributes({
                expression: this.value,
            });
        }
        const mod = pos === 'end' ? 1 : 0;
        this.editor.commands.focus(this.getPos() + mod);
        const resolvedPos = this.editor.state.doc.resolve(this.getPos());
        if (
            resolvedPos?.nodeAfter?.type.name === 'blockKatex' &&
            resolvedPos?.nodeBefore?.type.name !== 'blockKatex' &&
            pos === 'start'
        ) {
            this.editor.commands.focus(this.getPos() - 1);
        }
        if (
            resolvedPos?.nodeBefore?.type.name === 'blockKatex' &&
            resolvedPos?.nodeAfter?.type.name === 'blockKatex' &&
            pos === 'end'
        ) {
            const resolvedPos1 = this.editor.state.doc.resolve(
                this.getPos() + 1,
            );
            if (resolvedPos1.nodeAfter?.type.name !== 'blockKatex') {
                this.editor.commands.focus(resolvedPos1.pos + 1);
            } else {
                this.editor.commands.focus(this.getPos() + 1);
            }
        }
        this.editor.commands.focusWithGapcursor();
    }

    handleKeyLeft() {
        this.prevSelectionEnd = -1;
        this.prevSelectionStart = -1;
        if (this.$refs.input.$refs.textarea.selectionStart === 0) {
            this.handleBlur('start');
        }
    }

    handleKeyRight() {
        this.prevSelectionEnd = -1;
        this.prevSelectionStart = -1;
        if (
            this.$refs.input?.$refs.textarea.selectionEnd! >= this.value.length
        ) {
            this.handleBlur('end');
        }
    }

    handleKeyUp() {
        if (this.$refs.input.$refs.textarea.selectionEnd === 0) {
            return this.handleBlur('start');
        }
        if (this.$refs.input.$refs.textarea.selectionEnd === 0) {
            return this.handleBlur('start');
        }
    }

    handleKeyDown() {
        if (
            this.$refs.input.$refs.textarea.selectionEnd! >= this.value.length
        ) {
            return this.handleBlur('end');
        }
        if (
            this.$refs.input.$refs.textarea.selectionEnd! >= this.value.length
        ) {
            return this.handleBlur('end');
        }
    }

    handleEnter() {
        if (!this.value.trim().length) {
            this.canBlur = true;
            return;
        }
        this.handleBlur();
    }

    handleClick() {
        this.handleBlur();
    }

    handleEsc() {
        this.handleBlur();
    }

    handleInput(value: string) {
        this.shadowValue = value.length === 0 ? this.placeholder : value;
        this.value = value;
        this.recalculateWidth();
    }

    recalculateWidth() {
        // this.$nextTick(() => {
        //     if (!this.$refs.shadow) return;
        //     // const width = this.$refs.shadow.offsetWidth!;
        //     // this.$refs.input.style.width = `${Math.min(width, 530)}px`;
        // });
    }

    handleBackspace() {
        if (this.value === '') {
            this.removeKatex();
        }
    }

    handleEscape() {
        if (this.value.trim() === '') {
            this.removeKatex();
            return;
        }
        this.handleBlur('end');
    }

    removeKatex() {
        this.canBlur = false;
        this.deleteNode();
        this.editor.commands.focus(this.getPos());
    }

    async mounted() {
        this.katex = await import('katex');
        const { new: _new, expression } = this.node.attrs;
        if (_new) {
            this.value = expression;
            this.shadowValue = expression || this.placeholder;
            this.open = true;
            this.recalculateWidth();
            this.$nextTick(() => {
                this.$refs?.input?.setFocus();
            });
            return;
        }
        this.value = expression;
        this.shadowValue =
            expression.length === 0 ? this.placeholder : expression;
        this.recalculateWidth();
    }
}
</script>

<style lang="scss" scoped>
.has-focus[data-node-view-wrapper] .ProseMirror-separator,
.has-focus[data-node-view-wrapper] {
    user-select: none;
}

.multiselect {
    background: var(--editor-extension-highlight-bg-color);
    border-radius: 0px !important;
}

.mobileselect {
    background: var(--editor-extension-highlight-bg-color);
    border-radius: 0px !important;
}

.inline-katex {
    position: relative;
    background: var(--editor-code-bg-color);
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: var(--editor-code-box-shadow);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        'Liberation Mono', 'Courier New', monospace;
    font-size: 13.6px;
    line-height: 20px;

    &--wrapper {
        line-height: 20px;
    }

    &:hover {
        visibility: visible;
    }

    &--shadow {
        position: absolute;
        visibility: hidden;
        white-space: pre;
        overflow: visible;
        font-size: 14px;
        font-family: monospace;
    }

    &--title-editor {
        outline: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
        font-size: 13.6px;
        line-height: 20px;
        padding: 6px 0;

        &::placeholder {
            color: var(--editor-code-placeholder-color);
        }
    }
}
</style>
