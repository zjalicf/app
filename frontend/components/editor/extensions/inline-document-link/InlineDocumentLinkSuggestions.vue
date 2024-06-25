<template>
    <div class="inline-document-link--suggestions--wrapper">
        <div ref="popup" class="inline-document-link--suggestions">
            <div class="inline-document-link--suggestions--suggestion">
                <DocumentSuggestion
                    v-for="(result, index) in results"
                    :key="index"
                    :text="
                        result.id === 'new'
                            ? template
                                ? 'Go to templates'
                                : `Create: ${result.title}`
                            : result.title
                    "
                    :active="selectedIndex === index"
                    :is-new="result.id === 'new'"
                    :is-template="template"
                    :is-daily-doc="result.dailyDoc"
                    :document="result"
                    @mousedown.native="$emit('select', result)"
                    @mouseenter.native="$emit('select:index', index)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DocumentSuggestion from '@/components/suggestion/DocumentSuggestion.vue';

@Component({
    name: 'InlineDocumentLinkSuggestions',
    components: {
        DocumentSuggestion,
    },
})
export default class InlineDocumentLinkSuggestions extends Vue {
    @Prop()
    selectedIndex!: number;

    @Prop()
    results!: any;

    @Prop({ default: false })
    template!: boolean;
}
</script>

<style lang="scss" scoped>
.inline-document-link {
    &--suggestions {
        @include frostedGlassBackground;
        border-radius: 8px;
        width: 355px;
    }
}
</style>
