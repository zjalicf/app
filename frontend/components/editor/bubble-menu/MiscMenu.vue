<template>
    <div class="misc-menu">
        <button
            class="mark-button"
            :class="{ 'is-active': editor.isActive('superscript') }"
            @click="handleSuperscript"
        >
            <span>X<sup>2</sup></span>
        </button>
        <button
            class="mark-button"
            :class="{ 'is-active': editor.isActive('subscript') }"
            @click="handleSubscript"
        >
            <span>X<sub>2</sub></span>
        </button>
        <button
            class="mark-button"
            :class="{ 'is-active': editor.isActive('kbd') }"
            @click="handleKbd"
        >
            <span>kbd</span>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Editor } from '@tiptap/core';
@Component({
    components: {},
    name: 'MiscMenu',
})
export default class MiscMenu extends Vue {
    @Prop({
        default: null,
    })
    editor!: Editor;

    handleKbd() {
        this.$emit('kbd');
        this.$emit('close');
    }

    handleSuperscript() {
        this.$emit('superscript');
        this.$emit('close');
    }

    handleSubscript() {
        this.$emit('subscript');
        this.$emit('close');
    }
}
</script>

<style lang="scss">
.misc-menu {
    @include frostedGlassBackground;
    @include contextMenu(40px);
}
</style>
