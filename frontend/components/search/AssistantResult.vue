<template>
    <div class="assistant-result">
        {{ text }}
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

@Component
export default class AssistantResult extends Vue {
    @Prop({ default: '' })
    text!: string;
}
</script>

<style scoped lang="scss">
.assistant-result {
    @include font-body;
    width: 100%;
    margin-bottom: 16px;
    color: var(--search-modal-assistant-result-color);
}
</style>
