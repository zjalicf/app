<template>
    <div class="my-day-context-menu">
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'MyDayContextMenu',
    components: {},
})
export default class MyDayContextMenu extends Vue {}
</script>

<style lang="scss" scoped>
.my-day-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
