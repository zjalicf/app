<template>
    <div class="options">
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('bold')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingBold size="14" class="icon" />
                <p>Bold</p>
            </div>
            <div v-if="editor?.isActive('bold')" class="options--option--icon">
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('italic')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingItalic size="14" class="icon" />
                <p>Italic</p>
            </div>
            <div
                v-if="editor?.isActive('italic')"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('underline')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingUnderline size="14" class="icon" />
                <p>Underline</p>
            </div>
            <div
                v-if="editor?.isActive('underline')"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('strike')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingStrikeThrough size="14" class="icon" />
                <p>Strike</p>
            </div>
            <div
                v-if="editor?.isActive('strike')"
                class="options--option--icon"
            >
                <InterfaceValidationCheck size="12" />
            </div>
        </button>
        <button
            class="options--option"
            @mousedown.stop.prevent="toggleAction('clear')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingTextStrikeThrough
                    size="14"
                    class="icon"
                />
                <p>Clear Formatting</p>
            </div>
        </button>
        <button
            v-if="
                editor.isActive('listItem') &&
                !editingTask &&
                editor.can().liftListItem('listItem')
            "
            class="options--option"
            @mousedown.stop.prevent="toggleAction('decrease-level')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingIndentDecrease size="14" class="icon" />
                <p>Decrease Level</p>
            </div>
        </button>
        <button
            v-if="
                editor.isActive('listItem') &&
                !editingTask &&
                editor.can().sinkListItem('listItem')
            "
            class="options--option"
            @mousedown.stop.prevent="toggleAction('increase-level')"
        >
            <div class="options--option--title">
                <InterfaceTextFormattingIndentIncrease size="14" class="icon" />
                <p>Increase Level</p>
            </div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceTextFormattingBold from '~/components/streamline/InterfaceTextFormattingBold.vue';
import InterfaceTextFormattingItalic from '~/components/streamline/InterfaceTextFormattingItalic.vue';
import InterfaceTextFormattingUnderline from '~/components/streamline/InterfaceTextFormattingUnderline.vue';
import InterfaceTextFormattingStrikeThrough from '~/components/streamline/InterfaceTextFormattingStrikeThrough.vue';
import InterfaceTextFormattingTextStrikeThrough from '~/components/streamline/InterfaceTextFormattingTextStrikeThrough.vue';
import InterfaceTextFormattingIndentDecrease from '~/components/streamline/InterfaceTextFormattingIndentDecrease.vue';
import InterfaceTextFormattingIndentIncrease from '~/components/streamline/InterfaceTextFormattingIndentIncrease.vue';
import { INLINE_TASK_NODE_NAME } from '~/components/editor/extensions/task-item';

@Component({
    name: 'FormattingOptions',
    components: {
        InterfaceTextFormattingIndentIncrease,
        InterfaceTextFormattingIndentDecrease,
        InterfaceTextFormattingTextStrikeThrough,
        InterfaceTextFormattingStrikeThrough,
        InterfaceTextFormattingUnderline,
        InterfaceTextFormattingItalic,
        InterfaceTextFormattingBold,
        InterfaceValidationCheck,
    },
})
export default class FormattingOptions extends Vue {
    @Prop({ default: null })
    editor!: any;

    get editingTask() {
        return this.editor.isActive(INLINE_TASK_NODE_NAME);
    }

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
