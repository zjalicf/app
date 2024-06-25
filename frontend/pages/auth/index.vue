<template>
    <div class="auth-wrapper">
        <div class="auth-wrapper__header" :class="{ visible: showLogin }">
            <div v-if="!loggedIn" class="auth-wrapper__header__login no-drag">
                <nuxt-link tag="button" to="/auth/login">Log In</nuxt-link>
            </div>
            <div v-else class="auth-wrapper__header__login no-drag">
                <button
                    ref="authButton"
                    :class="{ active: authDropdownOpen }"
                    @click="openAuthDropdown"
                >
                    {{ user }}
                </button>
            </div>
            <TopBar v-if="isWindows || isLinux" />
        </div>
        <canvas ref="canvas" :class="{ play: showVideo }"></canvas>
        <div class="auth-wrapper--route">
            <div
                v-show="animationVisible"
                ref="animationWrapper"
                class="animation-wrapper"
            >
                <div ref="animation" class="animation"></div>
            </div>
            <div ref="routeWrapper" class="route">
                <NuxtChild />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { animate, timeline } from 'motion';
import AuthDropdown from '~/components/dropdown/AuthDropdown.vue';
import { ThemeOptions } from '~/helpers/date';

const clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);

@Component({
    components: {
        TopBar: () => import('~/components/windows/TopBar.vue'),
    },
    layout: 'localAuth',
    name: 'AuthLocalIndex',
    async asyncData(ctx) {
        await ctx.$serviceRegistry.waitForEssentialServices();
        const route = ctx.route.name;

        const isLoggedIn = ctx.store.getters['auth/loggedIn'];
        const vaults = ctx.store.getters['vault/list'];

        if (vaults.length !== 0) {
            if (ctx.route.query?.onboarding) {
                return;
            }
            await ctx.redirect('/');
            return;
        }

        if (isLoggedIn) {
            if (
                route !== 'auth-index-vault' &&
                route !== 'auth-index-vault-setup'
            ) {
                if (ctx.$config.platform === 'web') {
                    await ctx.redirect(`/auth/vault-setup`);
                    return;
                }

                await ctx.redirect(`/auth/vault`);
            }
        } else if (route === 'auth-reset-index') {
        } else if (route !== 'auth-index-login') {
            await ctx.redirect(`/auth/login`);
        }
    },
})
export default class AuthLocalIndex extends Vue {
    allowVideo: boolean = true;
    showVideo: boolean = false;
    animation: any = null;
    loaded: boolean = false;
    showLogin: boolean = false;
    animationVisible: boolean = true;
    windowWidth: number = 0;
    windowHeight: number = 0;
    authDropdownOpen: boolean = false;

    private step1: string = 'auth-index-login';
    private step2: string = 'auth-index-vault';
    private step3: string = 'auth-index-vault-setup';
    private step4: string = 'auth-index-jira';
    private step5: string = 'auth-index-calendar';

    get isWindows() {
        return this.$config.os === 'windows';
    }

    get isLinux() {
        return this.$config.os === 'linux';
    }

    $refs!: {
        canvas: HTMLCanvasElement;
        animation: HTMLDivElement;
        animationWrapper: HTMLDivElement;
        routeWrapper: HTMLDivElement;
        authButton: HTMLButtonElement;
    };

    openAuthDropdown() {
        this.authDropdownOpen = true;

        this.$dropdown.show({
            parent: this.$refs.authButton,
            component: AuthDropdown,
            popperOptions: {
                placement: 'bottom-end',
            },
            onClose: () => {
                this.authDropdownOpen = false;
            },
        });
    }

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    get user() {
        return this.$store.getters['auth/user']?.email ?? '';
    }

    @Watch('$route')
    onRouteChange(newValue: any, oldValue: any) {
        const newRoute = newValue.name;
        const oldRoute = oldValue.name;
        // step1 => step2 (login -> vault)
        if (oldRoute === this.step1 && newRoute === this.step2) {
            this.showLogin = true;
            animate(
                this.$refs.animation,
                { transform: 'scale(0.5)' },
                { duration: 0.5 },
            );
            this.showVideo = false;
            this.animation.addEventListener('complete', this.playSegment1);
            const frame = this.animation.currentFrame;
            this.animation.setSpeed(5);
            this.animation.loop = false;
            this.animation.playSegments([[Math.ceil(frame), 120]], true);
        }
        // (* -> jira) || (* -> calendar)
        if (
            newRoute === this.step3 ||
            newRoute === this.step4 ||
            newRoute === this.step5
        ) {
            this.animationVisible = false;
        }

        // // step2 => step1
        if (oldRoute === this.step2 && newRoute === this.step1) {
            this.showLogin = false;
            this.showVideo = true;
            animate(
                this.$refs.animation,
                { transform: 'scale(1)' },
                { duration: 0.5 },
            );
            this.animation.setSpeed(2);
            this.animation.playSegments([[180, 120]], true);
        }
    }

    playSegment1() {
        this.animation.removeEventListener('complete', this.playSegment1);
        this.animation.setSpeed(1);
        this.animation.playSegments([120, 180], true);
    }

    async videoCanPlay() {
        if (this.loaded || !this.allowVideo) return;
        this.startStarAnimation();
        const { default: lottie } = await import('lottie-web');
        const loginSequence = await import('~/assets/login-sequence-v2.json');
        this.animation = lottie.loadAnimation({
            // @ts-ignore
            container: this.$refs.animation,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: loginSequence,
        });
        this.animation.addEventListener('DOMLoaded', () => {
            if (this.loaded) return;
            this.loaded = true;
            this.showVideo = true;
            animate(
                this.$refs.animation,
                { transform: 'scale(1)' },
                { duration: 0.5 },
            );
            const sequence = [
                [
                    this.$refs.animationWrapper,
                    { top: 'calc(50% - 270px)' },
                    { duration: 0.5 },
                ],
                [this.$refs.routeWrapper, { opacity: 1 }, { duration: 1 }],
            ] as any;
            timeline(sequence, { delay: 0.5 });
        });
        this.animation.playSegments([[0, 120]], true);
    }

    setCanvasExtents() {
        const w = document.body.clientWidth;
        const h = document.body.clientHeight;
        this.$refs.canvas.width = w;
        this.$refs.canvas.height = h;
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.setCanvasExtents);
    }

    startStarAnimation() {
        const setCanvasExtents = () => {
            this.windowWidth = document.body.clientWidth;
            this.windowHeight = document.body.clientHeight;
            this.$refs.canvas.width = this.windowWidth;
            this.$refs.canvas.height = this.windowHeight;
        };

        setCanvasExtents();

        const c = this.$refs.canvas.getContext('2d');

        window.addEventListener('resize', this.setCanvasExtents);

        const makeStars = (count: number) => {
            const out = [];
            for (let i = 0; i < count; i++) {
                const s = {
                    x: Math.random() * 1600 - 800,
                    y: Math.random() * 900 - 450,
                    z: Math.random() * 1000,
                };
                out.push(s);
            }
            return out;
        };

        const stars = makeStars(1000);

        const clear = () => {
            c!.fillStyle =
                this.$store.getters['appSettings/theme'] === ThemeOptions.DARK
                    ? 'black'
                    : 'black'; // 'white'
            c!.fillRect(
                0,
                0,
                this.$refs.canvas?.width,
                this.$refs.canvas?.height,
            );
        };

        const putPixel = (x: number, y: number, brightness: number) => {
            const intensity =
                this.$store.getters['appSettings/theme'] === ThemeOptions.DARK
                    ? brightness * 255
                    : brightness * 255; // (1 - brightness) * 255;
            const rgb =
                'rgb(' + intensity + ',' + intensity + ',' + intensity + ')';
            c!.beginPath();
            c!.arc(x, y, clamp(2 * brightness, 0, 100), 0, Math.PI * 2, true);
            c!.fillStyle = rgb;
            c!.fill();
            c!.closePath();
        };

        const moveStars = (distance: number) => {
            const count = stars.length;
            for (let i = 0; i < count; i++) {
                const s = stars[i];
                s.z -= distance;
                while (s.z <= 1) {
                    s.z += 1000;
                }
            }
        };

        let prevTime: number;
        const init = (time: number) => {
            prevTime = time;
            requestAnimationFrame(tick);
        };

        const tick = (time: number) => {
            const elapsed = time - prevTime;
            prevTime = time;

            moveStars(elapsed * 0.05);

            clear();

            const w = this.windowWidth;
            const h = this.windowHeight;

            const cx = w / 2;
            const cy = h / 2;

            const count = stars.length;
            for (let i = 0; i < count; i++) {
                const star = stars[i];

                const x = cx + star.x / (star.z * 0.001);
                const y = cy + star.y / (star.z * 0.001);

                if (x < 0 || x >= w || y < 0 || y >= h) {
                    continue;
                }

                const d = star.z / 1000.0;
                const b = 1 - d * d;

                putPixel(x, y, b);
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(init);
    }

    async mounted() {
        localStorage.setItem('skeleton-loader', 'false');
        const route = this.$route.name;

        if (route === 'auth-index-vault') {
            this.allowVideo = false;
            this.showLogin = true;
            const sequence = [
                [
                    this.$refs.animation,
                    { transform: 'scale(0.5)' },
                    { duration: 0 },
                ],
                [
                    this.$refs.animationWrapper,
                    { top: 'calc(50% - 240px)' },
                    { duration: 0 },
                ],
                [this.$refs.routeWrapper, { opacity: 1 }, { duration: 0 }],
            ] as any;
            timeline(sequence, { delay: 0 });
            const { default: lottie } = await import('lottie-web');
            const loginSequence = await import(
                '~/assets/login-sequence-v2.json'
            );
            this.animation = lottie.loadAnimation({
                // @ts-ignore
                container: this.$refs.animation,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: loginSequence,
            });
            this.animation.goToAndStop(180, true);
        }

        if (
            route === 'auth-index-calendar' ||
            route === 'auth-index-vault-setup'
        ) {
            this.animationVisible = false;
            this.allowVideo = false;
            this.showLogin = true;
            const sequence = [
                [
                    this.$refs.animation,
                    { transform: 'scale(0.5)' },
                    { duration: 0 },
                ],
                [
                    this.$refs.animationWrapper,
                    { top: 'calc(50% - 240px)' },
                    { duration: 0 },
                ],
                [this.$refs.routeWrapper, { opacity: 1 }, { duration: 0 }],
            ] as any;
            timeline(sequence, { delay: 0 });
            const { default: lottie } = await import('lottie-web');
            const loginSequence = await import(
                '~/assets/login-sequence-v2.json'
            );
            this.animation = lottie.loadAnimation({
                // @ts-ignore
                container: this.$refs.animation,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: loginSequence,
            });
            this.animation.goToAndStop(240, true);
        }

        if (route === 'auth-index-login') {
            this.videoCanPlay();
        }
    }
}
</script>

<style lang="scss" scoped>
.auth-wrapper {
    height: 100vh;
    width: 100vw;
    position: relative;
    user-select: none;

    &__header {
        width: 100%;
        height: 52px;
        padding: 0px 17px 0px 0px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        transition: opacity 1s;
        cursor: default;

        .mac &,
        .windows &,
        .linux & {
            @include drag;
        }

        &__login {
            @include font12-500;
            opacity: 0;

            .visible & {
                opacity: 1;
            }

            .windows & {
                margin-right: 15px;
            }

            button {
                outline: none;
                margin-bottom: 15px;
                padding: 2px 6px;
                border-radius: 6px;

                &:hover,
                &.active {
                    background: $blueGrey300-13;
                }
            }
        }
    }

    &--route {
        height: 100vh;
        width: 100vw;
        position: relative;

        @include scrollbar;
        overflow-y: overlay;

        .animation-wrapper {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            @media (max-height: 740px) {
                top: 100px !important;
            }
        }

        .animation {
            transform: scale(0);
            transition: scale 0.5s;
            height: 200px;
            width: 200px;
        }

        .route {
            opacity: 0;
        }
    }

    canvas {
        position: absolute;
        min-width: 100%;
        min-height: 100%;
        top: 0px;
        right: 0;
        bottom: 0;
        object-fit: cover;
        opacity: 0;
        transition: opacity 1s;

        &.play {
            opacity: 1;
        }
    }

    video {
        position: absolute;
        min-width: 100%;
        min-height: 100%;
        top: 0px;
        right: 0;
        bottom: 0;
        object-fit: cover;
        opacity: 0;
        transition: opacity 1s;

        &.play {
            opacity: 1;
        }
    }
}
</style>
