<template>
    <svg :width="size" :height="size" viewBox="0 0 8 8">
        <path
            d="M2.40199 0.083692C2.32027 0.0019784 2.19738 -0.0224661 2.09062 0.0217571C1.98386 0.06598 1.91425 0.170162 1.91425 0.285723V7.71429C1.91425 7.82983 1.98386 7.93406 2.09062 7.97829C2.19738 8.02246 2.32027 7.99806 2.40199 7.91634L5.91363 4.40468C5.96763 4.35303 6.01077 4.29109 6.04043 4.22249C6.07083 4.15226 6.08654 4.07654 6.08654 4.00001C6.08654 3.92348 6.07083 3.84776 6.04043 3.77753C6.01077 3.70893 5.96763 3.64699 5.91363 3.59534L2.40199 0.083692Z"
            fill="currentColor"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class AcreomArrowRight extends Vue {
    @Prop({ default: 8 }) readonly size: number | undefined;
}
</script>
