<template>
    <div
        v-if="
            localDocument && localDocument.id && localDocument.id !== 'no_page'
        "
        class="document-icon"
    >
        <div
            v-if="localDocument.icon"
            class="document-icon--icon icon"
            :style="{
                width: `${iconSize || size}px`,
                height: `${iconSize || size}px`,
            }"
        >
            <span :style="{ 'font-size': fontSize + 'px' }">{{
                localDocument.icon
            }}</span>
        </div>
        <component :is="iconComponent" v-else class="icon" :size="`${size}`" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceFileRemoveAlternate from '~/components/streamline/InterfaceFileRemoveAlternate.vue';
import { IDocument } from '~/components/document/model';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';

@Component({
    name: 'DocumentIcon',
    components: {
        InterfaceFileRemoveAlternate,
        InterfaceContentFileAlternate,
    },
})
export default class DocumentIcon extends Vue {
    @Prop({ default: null })
    document!: IDocument | null;

    @Prop({ default: null })
    entityId!: string | null;

    @Prop({ default: 14 })
    size!: number;

    @Prop({ default: null })
    iconSize!: number;

    @Prop({ default: 12 })
    fontSize!: number;

    get isPlainDocument() {
        return this.localDocument && !this.localDocument.clip;
    }

    get localDocument() {
        if (this.entityId) {
            const doc = this.$entities.page.byId(this.entityId);
            return doc;
        }

        return this.document;
    }

    get iconComponent() {
        // TODO: resolver too specific
        if (this.localDocument?.dailyDoc) return InterfaceFavoriteStar;
        return InterfaceContentFileAlternate;
    }
}
</script>
<style scoped lang="scss">
.document-icon {
    &--icon {
        position: relative;

        span {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            text-align: center;
            text-align: -webkit-center;
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
                'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
                EmojiSymbols, serif;
        }
    }

    .icon {
        flex-shrink: 0;
    }
}
</style>
