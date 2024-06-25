<template>
    <div class="title-editor-wrapper">
        <TitleEditor
            :key="document.id"
            ref="title"
            :document-id="document.id"
            :value="title"
            @change="title = $event"
            @blur="onDocumentTitleChange"
            @keyDown="onKeyDown"
            @paste:multiline="$emit('paste:multiline', $event)"
            @focus-tab="$emit('focus-tab')"
        />
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import TitleMixin from '~/components/title/TitleMixin.vue';
import TitleEditor from '~/components/editor/TitleEditor.vue';

@Component({
    components: { TitleEditor },
    name: 'TitleEditorWrapper',
})
export default class TitleEditorWrapper extends TitleMixin {
    title: string = '';

    @Watch('document.title')
    handleDocumentTitleChange(val: string) {
        this.title = val;
    }

    onKeyDown() {
        this.$nuxt.$emit(`title-keydown-${this.tabId}`);
    }

    onDocumentTitleChange() {
        if (
            (this.title === '' && this.document.status === 'new') ||
            (this.title === '' && this.document.content === '<p></p>') ||
            this.title === this.document.title
        ) {
            return;
        }

        const id = this.entityId;
        this.$store.dispatch('document/update', {
            id,
            title: this.title,
            updatedAt: new Date(),
        });
    }

    mounted() {
        if (this.document) {
            this.title = this.document.title;
        }
    }
}
</script>
