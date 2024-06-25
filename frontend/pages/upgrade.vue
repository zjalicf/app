<template>
    <div v-if="$config.platform === 'desktop'" class="error-page">
        <tippy
            :content="getRefText"
            :delay="[20, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="error-page__header">
            <TrafficLights v-if="isMac" />
            <TopBar v-if="isWindows || isLinux" />
        </div>
        <div class="error-page__message">
            <div class="error-page__message__title">
                Your app is out of date
            </div>
            <div class="error-page__message__text">
                <p>Upgrade to a newer version to continue using acreom.</p>
            </div>
            <div class="error-page__message__actions">
                <button
                    class="button"
                    :disabled="loading"
                    :class="{ loading, 'has-tippy': loading }"
                    :data-tippy-content="`<div class='tooltip'>Downloading Update</div>`"
                    @click="updateAndRestart"
                >
                    <LoadingIcon v-if="loading" class="icon" />
                    <span>Restart & Update</span>
                </button>
                <span>or</span>
                <button class="link" @click="downloadFromWeb">
                    download from web
                </button>
            </div>
        </div>
    </div>
    <div
        v-else-if="$config.platform === 'mobile'"
        class="error-page error-page__mobile"
    >
        <div ref="animation" class="animation"></div>
        <h1>Your app is out of date</h1>
        <h2>Upgrade to a newer version to continue using acreom.</h2>
        <button @click="openAppStore">Update Now</button>
    </div>
    <div v-else></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { reloadApp } from '~/helpers/app';
import { SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    components: {
        LoadingIcon,
        CButton: () => import('~/components/CButton.vue'),
        TopBar: () => import('~/components/windows/TopBar.vue'),
        TrafficLights: () => import('~/components/mac/TrafficLights.vue'),
    },
    layout: 'errorLayout',
    head() {
        return {
            htmlAttrs: {
                class: [
                    this.$config.platform,
                    `theme-${this.$store.getters[
                        'appSettings/theme'
                    ].toLowerCase()}`,
                ],
            },
        };
    },
})
export default class ErrorLayout extends Vue {
    @Prop()
    error!: any;

    reload() {
        reloadApp();
    }

    animation: any;
    revealed: boolean = false;

    get isMac() {
        return this.$config.os === 'mac';
    }

    get isWindows() {
        return this.$config.os === 'windows';
    }

    get isLinux() {
        return this.$config.os === 'linux';
    }

    async mounted() {
        this.$store.dispatch('hideSplashScreen');

        if (this.$config.platform === 'mobile') {
            const { default: lottie } = await import('lottie-web');
            const loginSequence = await import(
                '~/assets/login-sequence-v2.json'
            );
            this.animation = lottie.loadAnimation({
                // @ts-ignore
                container: this.$refs.animation,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                animationData: loginSequence,
            });
            this.animation.playSegments([[0, 120]], true);
        }

        this.$entities.autoUpdater._checkForUpdates();
    }

    getRefText(reference: any) {
        return reference.getAttribute('data-tippy-content') ?? '';
    }

    beforeDestroy() {
        if (this.animation) {
            this.animation.destroy();
        }
    }

    get progress() {
        return this.$store.getters['autoUpdater/updateProgress'];
    }

    get checking() {
        return this.$store.getters['autoUpdater/updateChecking'];
    }

    get downloading() {
        return this.$store.getters['autoUpdater/updateDownloading'];
    }

    get loading() {
        return (
            this.revealed &&
            (this.downloading || this.checking || this.progress > 0)
        );
    }

    get available() {
        return this.$store.getters['autoUpdater/updateAvailable'];
    }

    @Watch('available')
    handleAvailableChange() {
        if (this.available && this.revealed) {
            setTimeout(() => {
                this.$entities.autoUpdater.updateAndRestart();
            }, 500);
        }
    }

    downloadFromWeb() {
        this.$utils.navigation.openExternalLink('https://acreom.com/downloads');
    }

    updateAndRestart() {
        if (this.available) {
            this.$entities.autoUpdater.updateAndRestart();
            return;
        }

        if (!this.loading) {
            this.$entities.autoUpdater._checkForUpdates();
        }

        this.revealed = true;
    }

    openAppStore() {
        this.$entities.autoUpdater.openAppStore();
    }
}
</script>
<style scoped lang="scss">
.error-page {
    width: 100vw;
    height: 100vh;

    &__mobile {
        user-select: none;
        background: $black;
        padding: 40px 40px 80px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        .animation {
            width: 200px;
            height: 200px;
            margin: 0 auto 50px;
        }

        h1 {
            color: $white;
            font-size: 42px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
            letter-spacing: -0.24px;
            margin-bottom: 15px;
        }

        h2 {
            color: $blueGrey300;
            font-size: 18px;
            font-style: normal;
            font-weight: 500;
            line-height: 30px;
            margin-bottom: 40px;
        }

        button {
            display: block;
            text-align: center;
            background: $white;
            color: $black;
            border-radius: 12px;
            outline: none;
            font-size: 15.83px;
            font-style: normal;
            font-weight: 600;
            line-height: 22px;
            padding: 12px 24px;
            width: 100%;
        }
    }

    &__header {
        @include drag;
        height: 53px;
        width: 100%;
        padding: 15px 12px;
    }

    &__message {
        @include frostedGlassBackground;
        max-width: 530px;
        margin: 150px auto 0;
        border-radius: 8px;
        padding: 15px;

        &__title {
            @include font14-600;
            font-size: 18px;
            color: var(--error-heading-text-color);
        }

        &__text {
            @include font14-500;
            margin: 12px 0px;
            p a {
                color: var(--accent-color);
            }
        }

        &__actions {
            gap: 10px;

            span,
            button {
                @include font14-500;
            }

            .button {
                padding: 5px 24px;
                background: var(--c-button-primary-bg-color);
                border-radius: 6px;
                color: var(--c-button-primary-text-color);

                &:hover {
                    color: var(--c-button-primary-text-color);
                    background: var(--c-button-primary-bg-color__hover);
                }

                &.loading {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 5px 24px 5px 10px;
                    background: var(--c-button-primary-bg-color__hover);

                    .icon {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                    }

                    span {
                        opacity: 0;
                    }
                }
            }

            .link {
                color: var(--error-heading-text-color);

                &:hover {
                    text-decoration: underline;
                }
            }

            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
    }
}
</style>
