<template>
    <svg :width="size" :height="size" viewBox="0 0 14 14" fill="none">
        <circle
            id="Ellipse 489"
            cx="7"
            cy="7"
            r="6"
            stroke="currentColor"
            stroke-width="2"
        />
        <path
            id="Ellipse 491"
            d="M7 3C8.06087 3 9.07828 3.42143 9.82843 4.17157C10.5786 4.92172 11 5.93913 11 7C11 8.06087 10.5786 9.07828 9.82843 9.82843C9.07828 10.5786 8.06087 11 7 11L7 7L7 3Z"
            fill="currentColor"
        />
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class InProgressIcon extends Vue {
    @Prop({ default: 14 }) readonly size: number | undefined;
}
</script>
