<template>
    <div
        class="event-description"
        :class="{ scrollable }"
        v-html="description"
    ></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'EventDescription',
})
export default class EventDescription extends Vue {
    @Prop({ required: true })
    description!: string;

    @Prop({ default: false })
    scrollable!: boolean;
}
</script>
<style lang="scss" scoped>
.event-description {
    @include font14-500;
    margin: 15px 0;
    word-break: break-word;

    :deep(a) {
        color: var(--accent-color);
    }

    &.scrollable {
        @include scrollbar();
        max-height: 200px;
        overflow-y: overlay;
    }
}
</style>
