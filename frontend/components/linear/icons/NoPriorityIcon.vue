<template>
    <svg
        aria-label="No Priority"
        class=""
        :width="size"
        :height="size"
        viewBox="0 0 16 16"
        fill="#858699"
    >
        <rect
            x="1"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
        ></rect>
        <rect
            x="6"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
        ></rect>
        <rect
            x="11"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
        ></rect>
    </svg>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class NoPriorityIcon extends Vue {
    @Prop({ required: false, default: '16' })
    size!: string;
}
</script>
<style scoped lang="scss"></style>
