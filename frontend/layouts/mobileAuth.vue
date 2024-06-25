<template>
    <div id="auth" :style="style">
        <Nuxt />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { animate, AnimationControls } from 'motion';
import { ThemeOptions } from '~/helpers/date';
import { APP_COLORS, Color } from '~/constants';

let runningAnimation: AnimationControls | null = null;

@Component({
    head() {
        return {
            htmlAttrs: {
                style: `--accent-color: ${
                    (this as any).accentColor
                }; --accent-color-triplet: ${(this as any).accentColorTriplet}`,
                class: [
                    'acreom-app',
                    this.$config.platform,
                    `theme-${this.$store.getters[
                        'appSettings/theme'
                    ].toLowerCase()}`,
                ],
            },
            bodyAttrs: {
                class: [
                    ...new Set([
                        'auth',
                        this.$config.platform,
                        this.$config.os,
                    ]),
                ].join(' '),
            },
        };
    },
})
export default class AuthLayout extends Vue {
    get keyboardWillShow() {
        return this.$utils.mobile.keyboardOpen;
    }

    style = {
        height: '100vh',
    };

    @Watch('keyboardWillShow')
    onWillShow(value: boolean) {
        if (this.$config.os === 'android') return;
        const fullHeight = window.innerHeight;
        const keyboardHeight = this.$store.getters['mobile/keyboardHeight'];
        if (runningAnimation) runningAnimation.stop();
        if (value) {
            runningAnimation = animate(
                (progress: number) => {
                    this.style.height = `${
                        fullHeight - progress * keyboardHeight
                    }px`;
                },
                { duration: 0.15 },
            );
        } else {
            runningAnimation = animate(
                (progress: number) => {
                    this.style.height = `${
                        fullHeight - (1 - progress) * keyboardHeight
                    }px`;
                },
                { duration: 0.15 },
            );
        }
    }

    get accentColor() {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];
        const appColor = this.$store.getters['appSettings/appColor'];

        if (
            !this.$accessControl.isProActive &&
            !this.$accessControl.isTrialActive
        ) {
            return APP_COLORS[Color.TURQUOISE][theme].COLOR;
        }

        return appColor.COLOR;
    }

    get accentColorTriplet() {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];
        const appColor = this.$store.getters['appSettings/appColor'];

        if (
            !this.$accessControl.isProActive &&
            !this.$accessControl.isTrialActive
        ) {
            return APP_COLORS[Color.TURQUOISE][theme].TRIPLET;
        }

        return appColor.TRIPLET;
    }
}
</script>

<style lang="scss" scoped>
#auth {
    position: relative;
}
</style>
