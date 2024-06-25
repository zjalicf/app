<template>
    <svg :width="size" :height="size" viewBox="0 0 8 8">
        <path
            d="M5.59874 7.91632C5.68046 7.99804 5.80335 8.02248 5.91012 7.97826C6.01688 7.93404 6.08649 7.82985 6.08649 7.71429L6.08649 0.285729C6.08649 0.170187 6.01687 0.065958 5.91011 0.0217295C5.80335 -0.0224418 5.68046 0.00195793 5.59874 0.0836726L2.0871 3.59534C2.0331 3.64699 1.98996 3.70893 1.9603 3.77753C1.9299 3.84776 1.91419 3.92348 1.91419 4.00001C1.91419 4.07654 1.9299 4.15226 1.9603 4.22248C1.98996 4.29108 2.0331 4.35303 2.0871 4.40468L5.59874 7.91632Z"
            fill="currentColor"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class AcreomArrowLeft extends Vue {
    @Prop({ default: 8 }) readonly size: number | undefined;
}
</script>
