<template>
    <div class="view-icon" :style="{ width: `${size}px`, height: `${size}px` }">
        <component
            :is="$entities.view.getViewIcon(view.id)"
            v-if="iconType === 'icon'"
            class="icon"
            :size="size"
        />
        <span v-else :style="{ fontSize: `${fontSize}px` }">
            {{ $entities.view.getViewEmoji(view.id) }}
        </span>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'ViewIcon',
})
export default class ViewIcon extends Vue {
    @Prop({ required: true })
    id!: string;

    @Prop({ default: '14' })
    size!: string;

    @Prop({ default: '18' })
    fontSize!: string;

    get view() {
        return this.$entities.view.getViewById(this.id);
    }

    get iconType() {
        return this.view?.emoji ? 'emoji' : 'icon';
    }
}
</script>
<style scoped lang="scss">
.view-icon {
    width: 14px;
    height: 14px;
    position: relative;

    span {
        position: absolute;
        font-size: 18px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        text-align: center;
        text-align: -webkit-center;
        font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
            'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji', EmojiSymbols,
            serif;
    }
}
</style>
