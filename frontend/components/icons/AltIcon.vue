<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M15 5h6v2h-6zM9 5H3v2h4.85l6.92 12H21v-2h-5.07z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class AltIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
