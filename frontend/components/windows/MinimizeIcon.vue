<template>
    <svg :width="size" :height="size" viewBox="0 0 10.2 1">
        <rect fill="currentColor" x="0" y="50%" width="10.2" height="1"></rect>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MinimizeIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
