<template>
    <div class="title-wrapper">
        <div class="title-wrapper--container">
            <pre ref="dummy" class="title-wrapper--hidden">{{ value }}</pre>
            <textarea
                ref="textarea"
                placeholder="Untitled"
                :value="value"
                rows="1"
                :spellcheck="
                    $store.getters['appSettings/editorOptions'].spellcheck
                "
                autocomplete="off"
                data-e2e="page-title-editor"
                @focus="handleFocus"
                @blur="handleBlur"
                @input="handleInput($event)"
                @keydown.enter.prevent="handleTitleEnter"
                @keydown.tab.prevent="handleTitleEnter"
                @keydown.down="onDown"
                @keydown.esc.prevent="handleEscape()"
                @resize="recalculateOptionsPlacement"
                @click="handleClick"
                @paste="handlePaste"
            ></textarea>
            <button
                ref="options"
                data-e2e="page-title-options"
                tabindex="-1"
                class="title-wrapper--options"
                :class="{ active: dropdownOpen, wrapped: shouldWrapOptions }"
                @click="openMenu"
            >
                <InterfaceSettingMenuHorizontal />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Prop,
    Vue,
    Watch,
} from 'vue-property-decorator';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import { throttle } from '~/helpers';
import { TabSymbols } from '~/constants/symbols';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    components: {
        InterfaceSettingMenuHorizontal,
    },
    name: 'TitleEditor',
})
export default class TitleEditor extends Vue {
    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Prop({
        default() {
            return '';
        },
    })
    readonly value!: string;

    @Prop({ default: null })
    documentId!: string | null;

    @InjectReactive({ from: TabSymbols.IS_ACTIVE, default: true })
    isActive?: boolean;

    $refs!: {
        textarea: HTMLTextAreaElement;
        options: HTMLButtonElement;
        dummy: HTMLElement;
    };

    dropdownOpen: boolean = false;
    titleResizeObserver: any = null;

    shouldWrapOptions: boolean = false;

    throttledByFps = throttle(requestAnimationFrame);

    handlePaste(event: ClipboardEvent) {
        if (event.clipboardData?.types.includes('text/plain')) {
            const text = event.clipboardData.getData('text/plain');
            const firstNewLine = text.indexOf('\n');
            if (firstNewLine === -1) return;
            event.preventDefault();
            event.stopPropagation();
            const firstLine = text.substring(0, firstNewLine);
            const rest = text.substring(firstNewLine + 1);
            event.clipboardData.setData('text/plain', rest);
            this.$refs.textarea.value = firstLine;
            this.$emit('change', firstLine);
            this.$emit('paste:multiline', event);
        }

        if (event.clipboardData?.types.includes('text/html')) {
            event.preventDefault();
            event.stopPropagation();
            const htmlData = event.clipboardData.getData('text/html');
            const tag = htmlData.substring(1, htmlData.indexOf('>'));
            const newHTMLContent = htmlData.substring(
                htmlData.indexOf('<', htmlData.indexOf('</' + tag + '>') + 2),
            );
            event.clipboardData.setData('text/html', newHTMLContent);
        }
    }

    @Watch('isActive')
    handleIsActive(val: boolean) {
        if (val) return;
        const isFocused = document.activeElement === this.$refs.textarea;
        if (!isFocused) return;
        this.$refs.textarea.blur();
    }

    handleClick(event: MouseEvent) {
        if (event.button === 0) {
            event.stopPropagation();
            this.$store.commit('userForcedBlur', true);
            this.$emit('focus-tab');
        }
        if (event.button > 2) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    openMenu() {
        this.dropdownOpen = true;
        this.$dropdown.show({
            component: () =>
                import('@/components/context-menu/DocumentContextMenu.vue'),
            bind: {
                id: this.documentId,
                invokeFrom: 'header',
                tabId: this.tabId,
                source: TrackingActionSource.PAGE,
            },
            parent: this.$refs.options,
            onClose: () => {
                this.$nextTick(() => {
                    this.$dropdown.hideAll();
                });
                this.dropdownOpen = false;
            },
        });
    }

    recalculateOptionsPlacement() {
        if (this.$refs.textarea?.style) {
            this.$refs.textarea.style.height = 'auto';
            this.$refs.textarea.style.height = ''.concat(
                `${this.$refs.textarea.scrollHeight}`,
                'px',
            );
        }
        const textInput = this.$refs.textarea;
        const extraElement = this.$refs.options;
        const dummyPre = this.$refs.dummy;
        if (!textInput || !extraElement || !dummyPre || !dummyPre.firstChild)
            return;

        let text = textInput.value;
        const containerRect = textInput.getBoundingClientRect();

        if (text.length === 0) {
            dummyPre.textContent = 'Untitled';
            text = 'Untitled';
        } else {
            dummyPre.textContent = text;
        }

        const range = document.createRange();
        range.setStart(dummyPre.firstChild, text.length);
        range.setEnd(dummyPre.firstChild, text.length);
        const lastCharRect = range.getBoundingClientRect();

        this.shouldWrapOptions =
            lastCharRect.left - containerRect.left >=
            textInput.clientWidth - 38;

        if (this.shouldWrapOptions) {
            this.$refs.textarea.style.height = ''.concat(
                `${this.$refs.textarea.scrollHeight + 40}`,
                'px',
            );
        }

        const left = this.shouldWrapOptions
            ? 0
            : lastCharRect.left - containerRect.left;
        const top = this.shouldWrapOptions
            ? lastCharRect.top - containerRect.top + 40
            : lastCharRect.top - containerRect.top;

        extraElement.style.top = `${top}px`;
        extraElement.style.left = `${left}px`;
    }

    @Watch('value')
    handleValueChange() {
        this.$nextTick(() => {
            this.recalculateOptionsPlacement();
        });
    }

    handleTitleEnter(event: KeyboardEvent) {
        if (event.isComposing) return;
        this.$emit('keyDown', event);
    }

    handleFocus() {
        this.$store.commit('bottomBarVisible', false);
    }

    handleBlur() {
        this.$emit('blur');
    }

    handleInput(event: any) {
        this.$emit('change', event.target.value);
        this.$nextTick(() => {
            this.recalculateOptionsPlacement();
        });
    }

    handleEscape() {
        this.$refs.textarea.blur();
    }

    onDown() {
        if (!this.value) {
            this.$emit('keyDown');
            return;
        }
        const selection = this.$refs.textarea.selectionStart;
        const length = this.value.length;
        if (selection === length) {
            this.$emit('keyDown');
        }
    }

    setFocusEnd() {
        try {
            if (!this.$refs.textarea) return;
            if (!this.value) {
                this.$refs.textarea?.setSelectionRange(0, 0);
                this.$refs.textarea?.focus({ preventScroll: true });
                return;
            }
            this.$refs.textarea?.setSelectionRange(
                Number(this.value.length),
                Number(this.value.length),
            );
            this.$refs.textarea?.focus({ preventScroll: true });
        } catch (error) {
            // @ts-ignore
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    setFocusStart() {
        if (!this.$refs.textarea) return;
        this.$refs.textarea.setSelectionRange(0, 0);
        this.$refs.textarea.focus({ preventScroll: true });
    }

    resizeListener() {
        this.throttledByFps(() => {
            this.recalculateOptionsPlacement();
        });
    }

    beforeDestroy() {
        if (this.titleResizeObserver) {
            this.titleResizeObserver.disconnect();
        }
    }

    mounted() {
        this.titleResizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.textarea) {
            this.titleResizeObserver.observe(this.$refs.textarea);
        }
        this.$nextTick(() => {
            this.resizeListener();
        });
        this.$nuxt.$on(`focus-title-${this.tabId}`, (position: string) => {
            position === 'start' ? this.setFocusStart() : this.setFocusEnd();
        });
    }
}
</script>

<style lang="scss" scoped>
.title-wrapper {
    &--hidden {
        @include font-inter;
        @include inputMetaStyles;
        position: absolute;
        border: none;
        outline: none;
        font-weight: bold;
        font-size: 26px;
        line-height: 40px;
        width: 100%;
        margin-bottom: 5px;
        resize: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        visibility: hidden;
    }

    &--container {
        position: relative;
        overflow: hidden;

        textarea {
            @include inputMetaStyles;
            overflow: hidden;
            border: none;
            outline: none;
            font-weight: bold;
            font-size: 26px;
            line-height: 40px;
            width: 100%;
            margin-bottom: 5px;
            color: var(--tab-title-text-color);
            resize: none;

            &::placeholder {
                color: var(--tab-document-title-placeholder-color);
            }
        }
    }

    &--options {
        position: absolute;
        transform: translateX(10px) translateY(3px);
        padding: 7px;
        border-radius: 6px;
        color: var(--tab-controls-icon-color);

        &.wrapped {
            transform: translateX(0) translateY(3px);
        }

        &:hover,
        &.active {
            color: var(--tab-controls-icon-color__hover);
            background: var(--tab-controls-bg-color__hover);
        }
    }
}
</style>
