<template>
    <svg :width="size" :height="size" viewBox="0 0 32 32">
        <path
            fill="currentColor"
            d="M21 28H11a2.002 2.002 0 0 1-2-2V16H4a1 1 0 0 1-.707-1.707l12-12a1 1 0 0 1 1.414 0l12 12A1 1 0 0 1 28 16h-5v10a2.003 2.003 0 0 1-2 2ZM6.414 14H11v12h10V14h4.586L16 4.414Z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ShiftIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
