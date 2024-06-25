<template>
    <svg :width="size" :height="size" viewBox="0 0 10 10">
        <path fill="currentColor" d="M0,0v10h10V0H0z M9,9H1V1h8V9z"></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MaximizeIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
