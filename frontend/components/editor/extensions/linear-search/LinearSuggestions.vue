<template>
    <div class="inline-document-link--suggestions--wrapper">
        <div ref="popup" class="inline-document-link--suggestions">
            <div class="inline-document-link--suggestions--suggestion">
                <LinearSuggestion
                    v-for="(result, index) in results"
                    :key="result.id"
                    :entity="result"
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
import LinearSuggestion from '~/components/editor/extensions/linear-search/LinearSuggestion.vue';
@Component({
    name: 'LinearSuggestions',
    components: {
        LinearSuggestion,
    },
})
export default class LinearSuggestions extends Vue {
    @Prop()
    selectedIndex!: number;

    @Prop()
    results!: any;
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
