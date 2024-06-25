<template>
    <div class="inline-document-link--suggestions--wrapper">
        <div class="inline-document-link--suggestions">
            <EventSuggestion
                v-for="(suggestion, index) in eventSuggestions"
                :key="index"
                :text="suggestion.summary"
                :date="{
                    start: suggestion.start,
                    end: suggestion.end,
                    recurrence: suggestion.recurrence,
                }"
                :active="activeIndex === index"
                @mouseenter.native="$emit('select:index', index)"
                @mousedown.native="$emit('select', suggestion)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EventSuggestion from '@/components/suggestion/EventSuggestion.vue';
@Component({
    name: 'InlineEventSuggestions',
    components: {
        EventSuggestion,
    },
})
export default class InlineEventSuggestions extends Vue {
    @Prop()
    eventSuggestions!: any;

    @Prop()
    activeIndex!: number;
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
