<template>
    <svg :width="size" :height="size" viewBox="0 0 8 8">
        <path
            d="M0.0840582 5.59841C0.00234459 5.68012 -0.0220999 5.80301 0.0221233 5.90978C0.0663462 6.01654 0.170528 6.08615 0.286089 6.08615L7.71465 6.08615C7.83019 6.08615 7.93442 6.01654 7.97865 5.90978C8.02282 5.80301 7.99842 5.68012 7.91671 5.59841L4.40505 2.08677C4.35339 2.03277 4.29145 1.98963 4.22285 1.95997C4.15262 1.92957 4.0769 1.91385 4.00037 1.91385C3.92385 1.91385 3.84813 1.92957 3.7779 1.95997C3.7093 1.98963 3.64735 2.03277 3.5957 2.08677L0.0840582 5.59841Z"
            fill="currentColor"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class AcreomArrowUp extends Vue {
    @Prop({ default: 8 }) readonly size: number | undefined;
}
</script>
