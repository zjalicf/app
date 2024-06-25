<template>
    <div class="document-card-context-menu">
        <button @click="openImage">
            <ImagePhotoFocusFrame class="icon" size="14" />
            Open
        </button>
        <button @click="downloadImage">
            <InterfaceDownloadButton2 class="icon" size="14" />
            Download
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { DownloadIcon } from '@vue-hero-icons/solid';
import { saveAs } from 'file-saver';

import InterfaceDownloadButton2 from '~/components/streamline/InterfaceDownloadButton2.vue';
import ImagePhotoFocusFrame from '~/components/streamline/ImagePhotoFocusFrame.vue';

@Component({
    name: 'ImageContextMenu',
    components: {
        DownloadIcon,
        InterfaceDownloadButton2,
        ImagePhotoFocusFrame,
    },
})
export default class ImageContextMenu extends Vue {
    @Prop()
    src!: string;

    openImage() {
        this.$vfm.show({
            component: () => import('@/components/modal/ImageModal.vue'),
            bind: {
                src: this.src,
            },
        });
        this.$emit('close');
    }

    downloadImage() {
        saveAs(this.src);
        this.$emit('close');
    }
}
</script>

<style lang="scss" scoped>
.document-card-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>
