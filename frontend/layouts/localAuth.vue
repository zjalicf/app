<template>
    <div id="auth">
        <div v-if="isMac" class="traffic-lights drag">
            <TrafficLights v-if="isMac" />
        </div>
        <Nuxt />
        <ModalsContainer></ModalsContainer>
        <DropdownContainer />
        <NotificationContainer />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrafficLights from '~/components/mac/TrafficLights.vue';
import { ThemeOptions } from '~/helpers/date';
import { APP_COLORS, Color } from '~/constants';

@Component({
    components: { TrafficLights },
    head() {
        return {
            htmlAttrs: {
                style: `--accent-color: ${
                    (this as any).accentColor
                }; --accent-color-triplet: ${(this as any).accentColorTriplet}`,
                class: ['acreom-app', 'theme-dark'],
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
    get isMac() {
        return this.$config.os === 'mac';
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
.traffic-lights {
    position: absolute;
    left: 0;
    top: 0;
    padding: 8px 16px;
    width: 100%;
    z-index: 1;
}

#auth {
    position: relative;
    --viewport-height: 100vh;

    :deep(.vfm__container) {
        display: flex;
        padding: 15vh 0px;
        justify-content: space-around;
        align-items: center;
        max-height: calc(100vh);
        overflow-y: auto;
    }
}
</style>
