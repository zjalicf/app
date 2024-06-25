<template>
    <div class="error-page">
        <div class="error-page__header">
            <TrafficLights v-if="isMac" />
            <TopBar v-if="isWindows || isLinux" />
        </div>
        <div class="error-page__message">
            <div class="error-page__message__title">
                An unexpected error occurred
            </div>
            <div class="error-page__message__text">
                <p>
                    Your changes were saved, but acreom encountered and
                    unexpected error.
                </p>
                <p>
                    If the issue keeps happening contact us at
                    <a href="mailto:team@acreom.com" target="_blank"
                        >team@acreom.com</a
                    >.
                </p>
            </div>
            <div class="error-page__message__actions">
                <c-button @click="reload" size="small">Reload acreom</c-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { reloadApp } from '~/helpers/app';

@Component({
    components: {
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
<style scoped lang="scss">
.error-page {
    width: 100vw;
    height: 100vh;

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
            display: flex;
            justify-content: flex-start;
        }
    }
}
</style>
