<template>
    <div>
        <ResizeAuto ref="resizeAuto" :size="20">
            <template #default="{ resize }">
                <textarea
                    ref="textarea"
                    :placeholder="placeholder"
                    :value="value"
                    rows="1"
                    spellcheck="false"
                    autocomplete="off"
                    :readonly="!editable"
                    @keydown="$emit('keydown', $event)"
                    @input="handleInput($event, resize)"
                    @blur="$emit('blur')"
                    @focus="$emit('focus')"
                ></textarea>
            </template>
        </ResizeAuto>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import ResizeAuto from '@/components/util/ResizeAuto.vue';
@Component({
    components: {
        ResizeAuto,
    },
    name: 'ResizeableTextarea',
})
export default class ResizeableTextarea extends Vue {
    @Prop({
        default() {
            return '';
        },
    })
    readonly value!: string;

    @Prop({
        default: true,
    })
    editable!: boolean;

    @Prop({
        default: '',
    })
    placeholder!: string;

    $refs!: {
        textarea: HTMLTextAreaElement;
        resizeAuto: any;
    };

    @Watch('value')
    handleValueChange() {
        this.$nextTick(() => {
            this.$refs.resizeAuto.resize({
                target: this.$refs.textarea,
            } as any);
        });
    }

    handleInput(event: any, resize: any) {
        this.$emit('change', event.target.value);
        resize(event);
    }

    setFocus() {
        this.$refs?.textarea?.focus({
            preventScroll: true,
        });
    }

    setBlur() {
        this.$refs?.textarea?.blur();
    }
}
</script>

<style lang="scss" scoped>
textarea {
    @include inputMetaStyles;
    border: none;
    outline: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        'Liberation Mono', 'Courier New', monospace;
    font-size: 13.6px;
    line-height: 20px;
    color: var(--editor-text-color);
    resize: none;
    display: block;
    width: 100%;

    &::placeholder {
        color: var(--editor-code-placeholder-color);
    }
}
</style>
