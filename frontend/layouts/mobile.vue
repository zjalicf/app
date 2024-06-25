<template>
    <div id="app" ref="app" :style="{ ...style, ...cssProps }">
        <div id="app-panel" ref="appBody" class="app-body">
            <SyncStatus />
            <div class="app-content">
                <Nuxt />
            </div>
            <BottomBar v-if="showBottomBar" />
        </div>
        <DropdownContainer />
        <ModalsContainer />
        <PaneContainer :os="$config.os" />
        <div id="popper-container"></div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { animate, AnimationControls } from 'motion';
import SyncStatus from '~/components/mobile/SyncStatus.vue';
import BottomBar from '~/components/mobile/common/BottomBar.vue';
import {
    APP_COLORS,
    Color,
    SearchServiceAction,
    ServiceKey,
} from '~/constants';
import { ThemeOptions } from '~/helpers/date';

let runningAnimation: AnimationControls | null = null;

@Component({
    middleware: 'hasVaults',
    components: {
        SyncStatus,
        BottomBar,
    },
    head() {
        return {
            htmlAttrs: {
                style: `--accent-color: ${
                    (this as any).accentColor
                }; --accent-color-triplet: ${(this as any).accentColorTriplet}`,
                class: [
                    'acreom-app',
                    'theme-dark',
                    // TODO: mobile - implement this to make theme switch work
                    // this.$config.platform,
                    // `theme-${this.$store.getters[
                    //     'appSettings/theme'
                    // ].toLowerCase()}-mobile`,
                ],
            },
        };
    },
})
export default class MobileLayout extends Vue {
    $refs!: {
        app: HTMLElement;
        appBody: HTMLElement;
    };

    bottomBarHeight: { value: number } = { value: 60 };

    @Watch('$route')
    handleRouteChange(to: any, from: any) {
        this.registerInteraction(to, from);
        this.handleBottomBarVisibility(to);
    }

    get showBottomBar() {
        return !this.$route.name?.includes('preferences');
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
                { duration: 0.35 },
            );
        } else {
            runningAnimation = animate(
                (progress: number) => {
                    this.style.height = `${
                        fullHeight - (1 - progress) * keyboardHeight
                    }px`;
                },
                { duration: 0.01 },
            );
        }
    }

    get cssProps() {
        return {
            '--bottom-bar-height': `${this.bottomBarHeight.value}px`,
            '--bubble-menu-height': '52px',
            '--viewport-height': '100vh',
        };
    }

    async handleBottomBarVisibility(to: any) {
        const { SafeArea } = await import('capacitor-plugin-safe-area');
        const offsets = await SafeArea.getSafeAreaInsets();
        if (to?.name.includes('preferences')) {
            this.bottomBarHeight.value =
                this.$config.os === 'ios' ? offsets.insets.bottom : 0;
            return;
        }
        this.bottomBarHeight.value =
            this.$config.os === 'ios' ? 60 + offsets.insets.bottom : 60;
    }

    registerInteraction(_to: any, from: any) {
        if (from.name === 'mobile-documents-id') {
            const documentId = from.params.id;
            const vaultId = this.$store.getters['vault/active'].id;
            const document = this.$store.getters['document/byId'](documentId);
            this.$serviceRegistry.emit(
                ServiceKey.SEARCH,
                SearchServiceAction.INDEX_INTERACTION,
                {
                    vaultId,
                    entity: document,
                },
            );
            return;
        }
        if (from.name === 'mobile') {
            const document = this.$store.getters['document/byDailyDoc'](
                this.$store.getters['dailyDoc/get'],
            );
            if (!document) return;
            const vaultId = this.$store.getters['vault/active'].id;
            this.$serviceRegistry.emit(
                ServiceKey.SEARCH,
                SearchServiceAction.INDEX_INTERACTION,
                {
                    vaultId,
                    entity: document,
                },
            );
        }
    }

    async mounted() {
        this.$tracking.activityPing('mobile.vue');
        const { SafeArea } = await import('capacitor-plugin-safe-area');
        const offsets = await SafeArea.getSafeAreaInsets();
        this.bottomBarHeight.value =
            this.$config.os === 'ios' ? 60 + offsets.insets.bottom : 60;

        let touchstartX = 0;
        let touchstartY = 0;
        let touchendX = 0;
        let touchendY = 0;
        function handleGesture(
            touchstartX: number,
            touchstartY: number,
            touchendX: number,
            touchendY: number,
        ) {
            const delx = touchendX - touchstartX;
            const dely = touchendY - touchstartY;
            if (Math.abs(delx) > Math.abs(dely)) {
                if (delx > 70) return 'right';
                if (delx < -70) return 'left';
            } else if (Math.abs(delx) < Math.abs(dely)) {
                if (dely > 90) return 'down';
                else return 'up';
            } else return 'tap';
        }

        const gestureZone = this.$refs.appBody;
        gestureZone.addEventListener(
            'touchstart',
            function (event) {
                touchstartX = event.changedTouches[0].screenX;
                touchstartY = event.changedTouches[0].screenY;
            },
            false,
        );

        gestureZone.addEventListener(
            'touchend',
            event => {
                touchendX = event.changedTouches[0].screenX;
                touchendY = event.changedTouches[0].screenY;
                const gesture = handleGesture(
                    touchstartX,
                    touchstartY,
                    touchendX,
                    touchendY,
                );

                if (gesture === 'right') {
                    const routes = ['mobile-sidebar', 'mobile'];
                    if (routes.includes(this.$route.name as string)) return;
                    if (this.$store.getters.editorFocused) return;
                    this.$router.back();
                }
            },
            false,
        );
    }
}
</script>
<style lang="scss" scoped>
#app {
    position: relative;
    width: 100vw;
    //TODO: Theme
    background: $blueGrey950;

    .app-body {
        height: 100%;
    }

    .app-content {
        z-index: 1;
        position: relative;
        padding-top: var(--ion-safe-area-top);
        height: 100%;
    }
}
</style>

<style lang="scss">
.pane {
    @include mobilePane;
}
</style>
