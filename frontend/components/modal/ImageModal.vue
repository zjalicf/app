<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        overlay-transition="fade"
        :esc-to-close="true"
        :click-to-close="true"
        :content-style="{
            maxWidth: 'max-content',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="image-modal">
            <img :src="src" />
            <button class="image-modal__close no-drag" @click="close">
                <XIcon size="40" class="icon" />
            </button>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
@Component({
    name: 'ImageModal',
    components: {
        XIcon,
    },
})
export default class ImageModal extends Vue {
    @Prop()
    src!: string;
}
</script>

<style scoped lang="scss">
.image-modal {
    img {
        display: block;
    }
    &__close {
        position: fixed;
        top: 20px;
        right: 20px;
        outline: none;
    }
}
</style>
