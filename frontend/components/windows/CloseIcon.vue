<template>
    <svg :width="size" :height="size" viewBox="0 0 10 10">
        <polygon
            fill="currentColor"
            points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"
        ></polygon>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class CloseIcon extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
