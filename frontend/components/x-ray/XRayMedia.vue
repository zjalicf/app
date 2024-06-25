<template>
    <div class="x-ray-media">
        <div class="x-ray-media--images">
            <div
                v-for="image in media"
                :key="image"
                class="image"
                :style="{ backgroundImage: `url(${retrieveSource(image)})` }"
                @click="download(image)"
            >
                <div v-if="!isMobile" class="hover">
                    <DownloadIcon size="20" class="icon" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { saveAs } from 'file-saver';
import { DownloadIcon } from '@vue-hero-icons/solid';
import { ImageObject } from '~/@types';
import { isElectron } from '~/helpers/is-electron';

@Component({
    name: 'XRayMedia',
    components: {
        DownloadIcon,
    },
})
export default class XRayMedia extends Vue {
    @Prop({
        default: () => [],
    })
    media!: string[];

    @Prop({ default: false })
    isMobile!: boolean;

    getImage(id: string) {
        return this.$store.getters['image/byId'](id);
    }

    retrieveSource(id: string) {
        const image = this.$store.getters['image/byId'](id) as ImageObject;
        if (image?.filepath && isElectron() && image.isOnDisk) {
            return 'file://' + image.filepath;
        }
        if (image?.remoteUri) {
            const accessToken =
                this.$store.getters['user/credentials']?.accessToken;
            return image.remoteUri + `?token=${accessToken}`;
        }
        const vault = this.$store.getters['vault/active'];
        if (vault.type === 'remote' && !vault.filepath && image?.data) {
            return image.data;
        }
        return null;
    }

    download(id: string) {
        if (!this.isMobile) {
            const image = this.getImage(id);
            // const split = image.split('/');
            saveAs(this.retrieveSource(id), image.name);
        }
    }
}
</script>

<style lang="scss" scoped>
.x-ray-media {
    &--images {
        display: flex;
        flex-wrap: wrap;

        .image {
            display: block;
            border-radius: 8px;
            background-size: cover;
            width: 121px;
            height: 94px;
            margin-bottom: 10px;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.06),
                inset 0px 0px 0px 1px rgba(241, 241, 241, 0.02);

            .hover {
                @include animateBackgroundColor;
                transition: opacity 0.15s cubic-bezier(0.83, 0, 0.17, 1);
                opacity: 0;
                background: var(--x-ray-location-button-bg-color__hover);
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
            }

            &:hover {
                box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12),
                    inset 0px 0px 0px 1px rgba(241, 241, 241, 0.02);

                .hover {
                    opacity: 0.4;
                }
            }

            &:not(:last-of-type) {
                margin-right: 10px;
            }
        }
    }
}
</style>
