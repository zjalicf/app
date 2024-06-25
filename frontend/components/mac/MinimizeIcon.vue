<template>
    <svg aria-hidden="false" :width="size" :height="size" viewBox="0 0 12 12">
        <rect
            fill="#975500"
            width="8"
            height="2"
            x="2"
            y="5"
            fill-rule="evenodd"
        ></rect>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MinimizeIcon extends Vue {
    @Prop({ default: 12 }) readonly size: number | undefined;
}
</script>
