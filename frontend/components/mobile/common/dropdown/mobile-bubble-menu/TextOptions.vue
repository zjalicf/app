<template>
    <div class="options">
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('paragraph')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingParagraph size="14" class="icon" />
                <p>Paragraph</p>
            </div>
            <div v-if="editor?.isActive('bold')" class="options--option--icon">
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('heading1')"
        >
            <div class="options--option--title">
                <Header1 size="16" class="icon" />
                <p>Heading 1</p>
            </div>
            <div
                v-if="editor?.isActive('heading', { level: 1 })"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('heading2')"
        >
            <div class="options--option--title">
                <Header2 size="16" class="icon" />
                <p>Heading 2</p>
            </div>
            <div
                v-if="editor?.isActive('heading', { level: 2 })"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('heading3')"
        >
            <div class="options--option--title">
                <Header3 size="16" class="icon" />
                <p>Heading 3</p>
            </div>
            <div
                v-if="editor?.isActive('heading', { level: 3 })"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('code')"
        >
            <div class="options--option--title">
                <ProgrammingScriptCode size="14" class="icon" />
                <p>Inline Code</p>
            </div>
            <div v-if="editor?.isActive('code')" class="options--option--icon">
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('superscript')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingSuperScript size="14" class="icon" />
                <p>Superscript</p>
            </div>
            <div
                v-if="editor?.isActive('superscript')"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('subscript')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingSubScript size="14" class="icon" />
                <p>Subscript</p>
            </div>
            <div
                v-if="editor?.isActive('subscript')"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceTextFormattingParagraph from '~/components/streamline/InterfaceTextFormattingParagraph.vue';
import Header1 from '~/components/icons/Header1.vue';
import Header2 from '~/components/icons/Header2.vue';
import Header3 from '~/components/icons/Header3.vue';
import ProgrammingScriptCode from '~/components/streamline/ProgrammingScriptCode.vue';
import InterfaceTextFormattingSuperScript from '~/components/streamline/InterfaceTextFormattingSuperScript.vue';
import InterfaceTextFormattingSubScript from '~/components/streamline/InterfaceTextFormattingSubScript.vue';

@Component({
    name: 'TextOptions',
    components: {
        InterfaceTextFormattingSubScript,
        InterfaceTextFormattingSuperScript,
        ProgrammingScriptCode,
        Header3,
        Header2,
        Header1,
        InterfaceTextFormattingParagraph,
        InterfaceValidationCheck,
    },
})
export default class TextOptions extends Vue {
    @Prop({ default: null })
    editor!: any;

    toggleAction(action: string) {
        this.$emit(action);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.options {
    @include mobileBubbleMenuDropdown;
}
</style>
