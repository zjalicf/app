<template>
    <div class="debug-context-menu">
        <button @click="onDownload('png')">Download as PNG</button>
        <button @click="onDownload('svg')">Download as SVG</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ExclamationIcon } from '@vue-hero-icons/solid';

@Component({
    name: 'MermaidDownloadDropdown',
    components: {
        ExclamationIcon,
    },
})
export default class MermaidDownloadDropdown extends Vue {
    onDownload(type: string) {
        this.$emit('close');
        this.$emit(`download-${type}`);
    }
}
</script>

<style lang="scss" scoped>
.debug-context-menu {
    @include contextMenu(135px);
    @include frostedGlassBackground;
}
</style>
