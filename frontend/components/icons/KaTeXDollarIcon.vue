<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M4 5v2h2v12h2V7h6v9a3 3 0 0 0 3 3a3 3 0 0 0 3-3h-2a1 1 0 0 1-1 1a1 1 0 0 1-1-1V7h2V5"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ImageIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
