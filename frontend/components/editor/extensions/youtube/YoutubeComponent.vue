<template>
    <node-view-wrapper
        as="div"
        class="youtube--wrapper"
        data-youtube-video
        :class="{ open: attrs.open, selected: selected }"
    >
        <div class="youtube--header" @click="handleClick">
            <div class="youtube--header--title">
                <div class="youtube--header--title--icon">
                    <InterfaceYoutube size="18" />
                </div>
                <a
                    v-if="$config.platform === 'web'"
                    class="youtube--header--title__text"
                    :href="readableSrc"
                    >{{ readableSrc }}</a
                >
                <div
                    v-else
                    class="youtube--header--title__text"
                    @click.stop.prevent="openLink"
                >
                    {{ readableSrc }}
                </div>
            </div>
            <div class="youtube--header--icon" :class="{ selected: selected }">
                <AcreomChevronRight v-if="!attrs.open" size="12" />
                <AcreomChevronDown v-else size="12" />
            </div>
        </div>
        <div v-if="attrs.open" class="youtube--content">
            <iframe
                :hidden="!attrs.open"
                class="youtube--iframe"
                :height="attrs.height"
                :width="attrs.width"
                :src="src"
                allowfullscreen="true"
            ></iframe>
        </div>
    </node-view-wrapper>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import {
    NodeViewWrapper,
    NodeViewContent,
    nodeViewProps,
    NodeViewProps,
} from '@tiptap/vue-2';
import { getEmbedUrlFromYoutubeUrl } from '@tiptap/extension-youtube/src/utils';
import InterfaceYoutube from '~/components/streamline/InterfaceYoutube.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';

@Component({
    name: 'YoutubeComponent',
    components: {
        AcreomChevronRight,
        AcreomChevronDown,
        NodeViewWrapper,
        NodeViewContent,
        InterfaceYoutube,
    },
    props: nodeViewProps,
})
export default class YoutubeComponent extends Vue {
    node!: NodeViewProps['node'];
    updateAttributes!: NodeViewProps['updateAttributes'];
    editor!: NodeViewProps['editor'];
    getPos!: NodeViewProps['getPos'];
    selected!: NodeViewProps['selected'];

    get readableSrc() {
        if (this.attrs.src?.includes('embed')) {
            const match = /.*\/embed\/([^?]+)/g.exec(this.attrs.src);
            if (!match) {
                return this.attrs.src;
            }

            return `https://www.youtube.com/watch?v=${match[1]}`;
        }

        return this.attrs.src ?? '';
    }

    get attrs() {
        return this.node.attrs;
    }

    findNode(node: any, predicate: any): { child: any; pos: number | null } {
        let found: { child: any; pos: number | null } = {
            child: null,
            pos: null,
        };
        node?.descendants((child: any, pos: number) => {
            if (predicate(child)) found = { child, pos };
            if (found) return false;
        });
        return found;
    }

    openLink() {
        this.$utils.navigation.openExternalLink(this.attrs.src);
    }

    updateNodeAttrs(
        attrs: Record<string, any>,
        predicate: (node: any) => boolean,
    ) {
        const { pos, child } = this.findNode(this.editor.state.doc, predicate);
        if (pos === null) return;
        this.editor.view.dispatch(
            this.editor.state.tr.setNodeMarkup(pos, null, {
                ...child.attrs,
                ...attrs,
            }),
        );
    }

    get src() {
        if (!this.attrs?.src) return;
        const embedUrl = getEmbedUrlFromYoutubeUrl({
            allowFullscreen: true,
            autoplay: false,
            ccLanguage: undefined,
            ccLoadPolicy: undefined,
            controls: true,
            disableKBcontrols: false,
            enableIFrameApi: false,
            endTime: 0,
            interfaceLanguage: undefined,
            ivLoadPolicy: 0,
            loop: false,
            modestBranding: false,
            nocookie: false,
            origin: '',
            playlist: '',
            progressBarColor: undefined,
            ...this.attrs,
            url: this.attrs.src,
        });
        return embedUrl ?? undefined;
    }

    handleClick() {
        const open = !this.attrs.open;
        this.updateAttributes({
            open,
        });
    }
}
</script>

<style lang="scss" scoped>
.youtube {
    &--wrapper {
        background: var(--youtube-extension-background);
        border-radius: 8px;
        padding: 2px;
        overflow: hidden;
        width: 100%;
        max-width: 800px;

        &:hover {
            background: var(--youtube-extension-background__hover);

            .youtube--header--icon {
                display: block;
            }
        }

        &.selected {
            box-shadow: var(--youtube-extension-box-shadow);
            background: var(--youtube-extension-background__hover);

            .youtube--header--icon {
                display: block;
            }
        }
    }

    &--header {
        display: flex;
        align-items: center;
        width: 100%;

        padding: 1px 10px 0 6px;
        justify-content: space-between;
        border-radius: 6px;

        .open & {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }

        &--title {
            @include ellipsis;
            display: flex;
            align-items: center;
            margin-right: 12px;

            &__text {
                color: var(--youtube-extension-title-text-color);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;

                &:hover {
                    color: var(--youtube-extension-title-text-color__hover);
                }
            }

            &--icon {
                padding-top: 2px;
                margin-right: 4px;
            }
        }

        &--icon {
            color: var(--youtube-extension-title-icon-color);
            display: none;
        }
    }

    &--iframe {
        width: 100%;
        max-width: 800px;
        height: 450px;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;

        .narrow-editor & {
            height: 287px;
            max-width: 510px;
        }
    }
}
</style>
