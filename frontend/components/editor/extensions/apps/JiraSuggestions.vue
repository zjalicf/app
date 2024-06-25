<template>
    <div class="inline-document-link--suggestions--wrapper">
        <div ref="popup" class="inline-document-link--suggestions">
            <div class="inline-document-link--suggestions--suggestion">
                <JiraSuggestion
                    v-for="(result, index) in results"
                    :key="index"
                    :small="true"
                    :entity-id="result.id"
                    :text="result.title"
                    :active="selectedIndex === index"
                    @mousedown.native="$emit('select', result)"
                    @mouseenter.native="$emit('select:index', index)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import JiraSuggestion from '@/components/editor/extensions/apps/JiraSuggestion.vue';

@Component({
    name: 'JiraSuggestions',
    components: {
        JiraSuggestion,
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
