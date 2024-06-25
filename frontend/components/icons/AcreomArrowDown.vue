<template>
    <svg :width="size" :height="size" viewBox="0 0 8 8">
        <path
            d="M7.91667 2.40159C7.99839 2.31988 8.02283 2.19699 7.97861 2.09022C7.93439 1.98346 7.8302 1.91385 7.71464 1.91385L0.28608 1.91385C0.170537 1.91385 0.066309 1.98346 0.0220804 2.09022C-0.0220909 2.19699 0.00230883 2.31988 0.0840235 2.40159L3.59569 5.91323C3.64734 5.96723 3.70928 6.01037 3.77788 6.04003C3.84811 6.07043 3.92383 6.08615 4.00036 6.08615C4.07689 6.08615 4.15261 6.07043 4.22283 6.04003C4.29143 6.01037 4.35338 5.96723 4.40503 5.91323L7.91667 2.40159Z"
            fill="currentColor"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class AcreomArrowDown extends Vue {
    @Prop({ default: 8 }) readonly size: number | undefined;
}
</script>
