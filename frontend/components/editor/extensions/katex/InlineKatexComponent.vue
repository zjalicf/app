<template>
    <node-view-wrapper as="span" style="white-space: nowrap">
        <img class="ProseMirror-separator" /><span
            v-if="!editor.isEditable || (!selected && !open)"
            v-html="expression"
        ></span
        ><span v-else class="inline-katex"
            ><span class="inline-katex--wrapper"
                ><span
                    ref="shadow"
                    class="inline-katex--shadow"
                    style="max-width: 473px !important; overflow: hidden"
                    >{{ shadowValue }}</span
                ><input
                    ref="input"
                    type="text"
                    :value="value"
                    style="width: 0; max-width: 473px !important"
                    :placeholder="placeholder"
                    @keydown.left.stop="handleKeyLeft"
                    @keydown.right.stop="handleKeyRight"
                    @keydown.backspace="handleBackspace"
                    @keydown.esc.prevent="handleEsc"
                    @input="handleInput($event.target.value)"
                    @keydown.enter.prevent="handleEnter"
                    @keydown.tab.prevent="handleEnter"
                    @blur="handleBlur" /></span></span
        ><img class="ProseMirror-separator" />
    </node-view-wrapper>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import 'katex/dist/katex.css';

@Component({
    name: 'InlineKaTeXComponent',
    components: {
        NodeViewWrapper,
    },
    props: nodeViewProps,
})
export default class InlineKaTeXComponent extends Vue {
    open: boolean = false;
    node!: Node;
    getPos!: any;
    editor!: any;
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
        input: HTMLInputElement;
        katex: HTMLDivElement;
        shadow: HTMLSpanElement;
    };

    get expression() {
        if (!this.katex) return '<div></div>';

        return this.katex.default.renderToString(
            String.raw`${this.node?.attrs.expression}`,
            this.options,
        );
    }

    get options(): { throwOnError: boolean; output: 'html' } {
        return {
            throwOnError: false,
            output: 'html',
        };
    }

    @Watch('selected')
    handleSelected(value: boolean) {
        if (value) {
            this.canBlur = true;
            this.$nextTick(() => {
                this.recalculateWidth();
                this.$refs?.input?.focus({
                    preventScroll: true,
                });
            });
        }
    }

    handleBlur(pos = 'end') {
        if (!this.canBlur) return;
        this.open = false;
        this.canBlur = false;
        if (this.value.trim().length === 0) {
            return this.removeKatex();
        }
        this.$refs.input.blur();
        if (this.value.trim() !== this.node?.attrs.expression) {
            this.updateAttributes({
                expression: this.value,
            });
        }
        const mod = pos === 'end' ? 1 : 0;
        this.editor.commands.focus(this.getPos() + mod);
    }

    handleKeyLeft() {
        this.prevSelectionEnd = -1;
        this.prevSelectionStart = -1;
        if (this.$refs.input.selectionStart === 0) {
            this.handleBlur('start');
        }
    }

    handleKeyRight() {
        this.prevSelectionEnd = -1;
        this.prevSelectionStart = -1;
        if (this.$refs.input?.selectionEnd! >= this.value.length) {
            this.handleBlur('end');
        }
    }

    handleKeyUp() {
        if (
            this.prevSelectionStart === -1 &&
            this.$refs.input.selectionEnd === 0
        ) {
            return this.handleBlur('start');
        }
        if (
            this.prevSelectionStart !== -1 &&
            this.$refs.input.selectionEnd === 0
        ) {
            return this.handleBlur('start');
        }
        this.prevSelectionStart = this.$refs.input.selectionEnd!;
    }

    handleKeyDown() {
        if (
            this.prevSelectionEnd === -1 &&
            this.$refs.input.selectionEnd! >= this.value.length
        ) {
            return this.handleBlur('end');
        }
        if (
            this.prevSelectionEnd >= this.value.length &&
            this.$refs.input.selectionEnd! >= this.value.length
        ) {
            return this.handleBlur('end');
        }
        this.prevSelectionEnd = this.$refs.input.selectionEnd!;
    }

    handleEnter(event: KeyboardEvent) {
        if (event.isComposing && !this.$utils.isMobile) return;
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
        this.$nextTick(() => {
            if (!this.$refs.shadow) return;
            const width = this.$refs.shadow.offsetWidth!;
            this.$refs.input.style.width = `${Math.min(width, 473)}px`;
        });
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
            this.open = true;
            this.value = expression;
            this.shadowValue = expression || this.placeholder;
            this.recalculateWidth();
            this.$nextTick(() => {
                this.$refs.input.focus({
                    preventScroll: true,
                });
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

.inline-katex {
    position: relative;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 3px 3px 3px 3px;
    cursor: default;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;

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
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
        font-size: 13.6px;
        line-height: 20px;
    }

    input {
        outline: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
        font-size: 13.6px;
        line-height: 20px;

        &::placeholder {
            color: var(--editor-code-placeholder-color);
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                'Liberation Mono', 'Courier New', monospace;
            font-size: 13.6px;
            line-height: 20px;
        }
    }
}
</style>
