<template>
    <svg
        aria-label="High Priority"
        :width="size"
        :height="size"
        viewBox="0 0 16 16"
        fill="#858699"
    >
        <rect x="1" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6" y="5" width="3" height="9" rx="1"></rect>
        <rect x="11" y="2" width="3" height="12" rx="1"></rect>
    </svg>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class LinearCompletedIcon extends Vue {
    @Prop({ required: false, default: '16' })
    size!: string;
}
</script>
<style scoped lang="scss"></style>
