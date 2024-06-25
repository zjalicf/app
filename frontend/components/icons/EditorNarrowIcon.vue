<template>
    <svg :width="size" :height="size" viewBox="0 0 56 52">
        <path
            fill="currentColor"
            d="M3.5-7.5h49A3.5,3.5,0,0,1,56-4h0A3.5,3.5,0,0,1,52.5-.5H3.5A3.5,3.5,0,0,1,0-4H0A3.5,3.5,0,0,1,3.5-7.5Z"
            transform="translate(0 22.5)"
        />
        <path
            fill="currentColor"
            d="M3.5,7.5h49A3.5,3.5,0,0,1,56,11h0a3.5,3.5,0,0,1-3.5,3.5H3.5A3.5,3.5,0,0,1,0,11H0A3.5,3.5,0,0,1,3.5,7.5Z"
            transform="translate(0 22.5)"
        />
        <path
            fill="currentColor"
            d="M3.5-22.5h49A3.5,3.5,0,0,1,56-19h0a3.5,3.5,0,0,1-3.5,3.5H3.5A3.5,3.5,0,0,1,0-19H0A3.5,3.5,0,0,1,3.5-22.5Z"
            transform="translate(0 22.5)"
        />
        <path
            fill="currentColor"
            d="M3.5,22.5h49A3.5,3.5,0,0,1,56,26h0a3.5,3.5,0,0,1-3.5,3.5H3.5A3.5,3.5,0,0,1,0,26H0A3.5,3.5,0,0,1,3.5,22.5Z"
            transform="translate(0 22.5)"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class EditorWidthIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
