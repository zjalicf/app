<template>
    <div class="mermaid-wizard-dropdown">
        <textarea
            ref="textarea"
            v-model="query"
            rows="10"
            placeholder="Describe your diagram here..."
        ></textarea>
        <button
            :disabled="query === ''"
            class="mermaid-wizard-dropdown__generate"
            @click="generate"
        >
            Generate
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'MermaidWizardDropdown',
})
export default class MermaidWizardDropdown extends Vue {
    query: string = '';
    $refs!: {
        textarea: HTMLTextAreaElement;
    };

    mounted() {
        setTimeout(() => {
            this.$refs.textarea.focus({
                preventScroll: true,
            });
        }, 50);
    }

    generate() {
        if (this.query === '') return;
        this.$emit('close');
        this.$emit('generate', this.query);
    }
}
</script>

<style lang="scss" scoped>
.emoji-dropdown:not(.is-mobile) {
    @include frostedGlassBackground;
}

.mermaid-wizard-dropdown {
    @include frostedGlassBackground;
    padding: 5px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    max-width: 300px;
    width: 300px;

    textarea {
        @include inputMetaStyles;
        @include font12-500;
        @include scrollbar;
        min-height: 36px;
        display: block;
        background: var(--vault-settings-input-bg-color);
        color: var(--vault-settings-input-text-color);
        border-radius: 5px;
        width: 100%;
        outline: none;
        padding: 5px 8px;

        &::placeholder {
            color: var(--vault-settings-input-placeholder-color);
        }
    }

    &__generate {
        @include font12-500;
        margin-top: 5px;
        padding: 5px 0;
        border-radius: 6px;

        &:disabled {
            color: var(--vault-settings-input-placeholder-color);
        }

        &:hover:not(:disabled) {
            @include frostedGlassButton;
            color: var(--dropdown-emoji-clear-color_hover);
        }
    }
}
</style>
