<template>
    <div
        class="linear-issue-view__label--color"
        :style="{ '--label-color': color }"
    ></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'LinearLabelIcon',
})
export default class LinearLabelIcon extends Vue {
    @Prop({ default: 'blue' })
    color!: string;
}
</script>
<style lang="scss" scoped>
.linear-issue-view__label--color {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background-color: var(--label-color);
}
</style>
