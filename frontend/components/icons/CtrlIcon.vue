<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="m5 12l1.41 1.41L12 7.83l5.59 5.58L19 12l-7-7z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class CtrlIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
