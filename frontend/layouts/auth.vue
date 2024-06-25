<template>
    <div id="auth">
        <div v-if="isMac" class="traffic-lights drag">
            <TrafficLights />
        </div>
        <div v-else-if="isWindows || isLinux" class="auth-header">
            <TopBar />
        </div>
        <Nuxt />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrafficLights from '@/components/mac/TrafficLights.vue';

@Component({
    components: {
        TrafficLights,
        TopBar: () => import('~/components/windows/TopBar.vue'),
    },
    head() {
        return {
            htmlAttrs: {
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
    get isMac() {
        return this.$config.os === 'mac';
    }

    get isWindows() {
        return this.$config.os === 'windows';
    }

    get isLinux() {
        return this.$config.os === 'linux';
    }
}
</script>

<style lang="scss" scoped>
.auth-header {
    width: 100%;
    height: 52px;
    padding: 0 12px;
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
}

#auth {
    :deep(.vfm__container) {
        display: flex;
        padding: 15vh 0px;
        justify-content: space-around;
        align-items: center;
        max-height: calc(var(--viewport-height));
        overflow-y: auto;
    }
}

.traffic-lights {
    width: 100%;
    padding: 8px 16px;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
