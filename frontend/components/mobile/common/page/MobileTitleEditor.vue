<template>
    <div class="mobile-title-wrapper">
        <div class="mobile-title-wrapper--container">
            <pre ref="dummy" class="mobile-title-wrapper--hidden">{{
                value
            }}</pre>
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
                @click="handleClick"
                @blur="handleBlur"
                @input="handleInput($event)"
                @keydown.enter.prevent="handleTitleEnter"
                @resize="recalculateHeight"
            ></textarea>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
    name: 'MobileTitleEditor',
})
export default class MobileTitleEditor extends Vue {
    @Prop({
        default() {
            return '';
        },
    })
    readonly value!: string;

    @Prop({ default: null })
    documentId!: string | null;

    $refs!: {
        textarea: HTMLTextAreaElement;
        dummy: HTMLElement;
    };

    @Watch('value')
    handleValueChange() {
        this.$nextTick(() => {
            this.recalculateHeight();
        });
    }

    recalculateHeight() {
        if (this.$refs.textarea?.style) {
            this.$refs.textarea.style.height = 'auto';
            this.$refs.textarea.style.height = ''.concat(
                `${this.$refs.textarea.scrollHeight}`,
                'px',
            );
        }
    }

    handleTitleEnter(event: KeyboardEvent) {
        if (event.isComposing) return;
        this.$emit('keyDown', event);
    }

    handleFocus() {
        this.$emit('focus');
    }

    handleClick(event: MouseEvent) {
        this.$emit('click', event);
    }

    handleBlur() {
        this.$emit('blur');
    }

    handleInput(event: any) {
        this.$emit('change', event.target.value);
        this.$nextTick(() => {
            this.recalculateHeight();
        });
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

    mounted() {
        this.$nextTick(() => {
            this.recalculateHeight();
        });
    }
}
</script>

<style lang="scss" scoped>
.mobile-title-wrapper {
    padding: 0 15px;
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
            @include font-title;
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
}
</style>
