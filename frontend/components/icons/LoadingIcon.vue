<template>
    <div class="loading-icon" :style="computedStyle"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class LoadingIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;

    get computedStyle() {
        return {
            width: `${this.size}px`,
            height: `${this.size}px`,
        };
    }
}
</script>

<style lang="scss" scoped>
.loading-icon {
    position: relative;

    &::after {
        content: ' ';
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        border: 2px solid currentColor;
        border-color: currentColor currentColor transparent;
        animation: rotate 1.2s linear infinite;
        border-radius: 50%;
    }
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
