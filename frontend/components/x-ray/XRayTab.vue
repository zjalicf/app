<template>
    <div class="x-ray-tab">
        <slot />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
    name: 'XRayTab',
})
export default class XRayTab extends Vue {}
</script>

<style lang="scss" scoped>
.x-ray-tab {
    margin-bottom: 20px;
    user-select: none;

    h3 {
        color: var(--x-ray-heading-color);
        font-weight: bold;
        font-size: 16px;
        line-height: 175.2%;
        margin-bottom: 10px;
        margin-left: 6px;
        border-bottom: 1px solid var(--tab-divider-color);
        padding: 0px 0px 3px 1px;
        display: flex;
        align-items: center;
    }
}
</style>
