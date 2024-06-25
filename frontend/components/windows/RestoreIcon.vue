<template>
    <svg :width="size" :height="size" viewBox="0 0 10.2 10.1">
        <path
            fill="currentColor"
            d="M2.1,0v2H0v8.1h8.2v-2h2V0H2.1z M7.2,9.2H1.1V3h6.1V9.2z M9.2,7.1h-1V2H3.1V1h6.1V7.1z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class RestoreIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
