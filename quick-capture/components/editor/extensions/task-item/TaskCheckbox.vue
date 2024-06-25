<template>
    <button class="checkbox" @click.stop.prevent="onCheckboxClick">
        <div ref="check"></div>
    </button>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import checkInAnimation from '@/assets/checkIn.json';

@Component({
    name: 'TaskCheckbox',
})
export default class TaskCheckbox extends Vue {
    animation!: any;

    @Prop({ default: false })
    checked!: boolean;

    onCheckboxClick() {
        this.$emit('checked');
    }

    @Watch('checked')
    handleLocalCompleted(newValue: boolean, oldValue: boolean) {
        if (!!newValue === !!oldValue) return;
        if (!newValue) {
            this.animation.playSegments([30, 0], true);
        } else {
            this.animation.playSegments([0, 30], true);
        }
    }

    async mounted() {
        await this.$nextTick();
        const { default: lottie } = await import('lottie-web');

        this.animation = lottie.loadAnimation({
            // @ts-ignore
            container: this.$refs.check,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: checkInAnimation,
        });

        if (this.checked) {
            this.animation.goToAndStop(30, true);
        }
    }
}
</script>

<style lang="scss">
.checkbox.has-focus {
    svg {
        user-select: none;
        height: 20px !important;
        width: 20px !important;
        border: 2px solid var(--accent-color);
        border-radius: 6px;
        padding: 0px;
    }
}
</style>

<style scoped lang="scss">
.checkbox {
    outline: none !important;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.multiselect {
    background: var(--editor-extension-highlight-bg-color);
    border-radius: 0px !important;
}
</style>
