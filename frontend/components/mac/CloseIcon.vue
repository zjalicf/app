<template>
    <svg aria-hidden="false" :width="size" :height="size" viewBox="0 0 12 12">
        <path
            stroke="#4c0000"
            fill="none"
            d="M8.5,3.5 L6,6 L3.5,3.5 L6,6 L3.5,8.5 L6,6 L8.5,8.5 L6,6 L8.5,3.5 Z"
        ></path>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class CloseIcon extends Vue {
    @Prop({ default: 12 }) readonly size: number | undefined;
}
</script>
