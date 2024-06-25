<template>
    <svg :width="size" :height="size" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ItalicIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
