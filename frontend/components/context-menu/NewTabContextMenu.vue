<template>
    <div class="new-tab-context-menu">
        <slot name="tab-options" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'NewTabContextMenu',
    components: {},
})
export default class NewTabContextMenu extends Vue {}
</script>

<style lang="scss" scoped>
.new-tab-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
