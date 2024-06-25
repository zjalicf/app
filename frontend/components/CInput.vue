<template>
    <div class="c-input" :data-value="value" :class="{ grow }">
        <input
            :id="id"
            ref="input"
            type="text"
            :value="value"
            :placeholder="placeholder"
            :class="{
                grow,
                background,
                medium: size === 'medium',
                lighter,
                active,
            }"
            :size="grow ? 6 : null"
            :disabled="disabled"
            spellcheck="false"
            autocomplete="off"
            @input="handleInput($event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus')"
            @keydown.down="$emit('keydown:down', $event)"
            @keydown.up="$emit('keydown:up', $event)"
            @keydown="$emit('keydown', $event)"
            @keydown.enter="$emit('keydown.enter', $event)"
            @keydown.esc="$emit('keydown.esc', $event)"
            @keydown.tab="$emit('keydown.tab', $event)"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class CInput extends Vue {
    @Prop({
        default: '',
    })
    placeholder!: string;

    @Prop({
        default: false,
    })
    disabled!: boolean;

    @Prop({
        default: '',
    })
    value!: string;

    @Prop({
        default: '',
    })
    id!: string;

    @Prop({
        default: '',
    })
    size!: string;

    @Prop({
        default: false,
    })
    grow!: boolean;

    @Prop({
        default: false,
    })
    lighter!: boolean;

    @Prop({
        default: false,
    })
    background!: boolean;

    @Prop({
        default: false,
    })
    active!: boolean;

    $refs!: {
        input: HTMLInputElement;
    };

    handleInput($event: any) {
        this.$emit('input', $event.target.value);
    }

    setFocus() {
        this.$nextTick(() => {
            this.$refs.input.focus({ preventScroll: true });
        });
    }

    mounted() {
        this.$emit('ready');
    }
}
</script>

<style lang="scss" scoped>
.c-input {
    &.grow {
        &::after {
            content: attr(data-value) ' ';
            visibility: hidden;
            white-space: pre-wrap;
        }
    }
}
input {
    @include inputMetaStyles;
    display: block;
    width: 100%;
    height: 28px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 28px;
    padding: 0 6px 0px 6px;
    font-weight: 500;
    color: var(--c-input-text-color);

    &.medium {
        font-size: 15px;
    }

    &.background {
        background: var(--c-input-bg-color);
    }
    &.grow {
        display: inline-block;
    }

    &::placeholder {
        color: var(--c-input-placeholder-color);

        &.lighter {
            color: var(--c-input-placeholder-color__lighter);
        }
    }

    &.valid {
        border: 2px solid var(--accent-color);
        padding-left: 4px;
        background: var(--c-input-bg-color__active);
    }

    &.invalid {
        border: 2px solid var(--c-input-border-color__invalid);
        padding-left: 4px;
        background: var(--c-input-border-color__invalid);
    }

    &:hover {
        background: var(--c-input-bg-color__hover);
        color: var(--c-input-text-color__hover);

        &.lighter {
            background: var(--c-input-bg-color__hover__active);

            &::placeholder {
                color: var(--c-input-placeholder-color__hover__active);
            }
        }
    }

    &:focus,
    &.active {
        outline: none;
        color: var(--c-input-text-color__active);
        border: 2px solid var(--accent-color);
        padding-left: 4px;
        background: var(--c-input-bg-color__active);
    }

    @media (max-width: 500px) {
        max-width: none;
        height: 36px;
        line-height: 36px;
    }
}
</style>
