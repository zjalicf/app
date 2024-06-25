<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M11 7h2v10h-2v-4H7v4H5V7h2v4h4V7zm6.57 0A4.742 4.742 0 0 1 15 9v1h2v7h2V7h-1.43z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Header1 extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
