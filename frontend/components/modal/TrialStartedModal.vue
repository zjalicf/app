<template>
    <vue-final-modal
        v-slot="{ close }"
        name="upgrade-modal"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="false"
        :click-to-close="false"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '300px',
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
        <div class="upgrade-modal">
            <div class="upgrade-modal__content">
                <div class="upgrade-modal__content__badge">
                    <div
                        ref="animation"
                        class="upgrade-modal__content__animation"
                    ></div>
                </div>
                <h1 class="upgrade-modal__content__title">
                    You've got a free PRO on us!
                </h1>
                <p class="upgrade-modal__content__text">
                    Enjoy 30 days of PRO features. Don't worry, you'll be able
                    to access your content or continue using acreom in Personal
                    tier after the trial expires.
                </p>
            </div>
            <div class="upgrade-modal__footer">
                <div class="upgrade-modal__footer__actions">
                    <div tabindex="-1">
                        <CButton
                            type="primary"
                            size="full-width"
                            @click="modalAccept(close)"
                            >Continue</CButton
                        >
                    </div>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'TrialStartedModal',
    components: { CButton },
})
export default class TrialStartedModal extends Vue {
    $refs!: {
        animation: HTMLDivElement;
    };

    modalAccept(close: Function) {
        this.$store.dispatch('subscription/updateTrialOptions', {
            showTrialMessage: false,
        });
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.ACCEPT_PRO_MODAL,
        });
        close();
    }

    async mounted() {
        const { default: lottie } = await import('lottie-web');
        lottie.loadAnimation({
            // @ts-ignore
            container: this.$refs.animation,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/lottie/trial-gift.json',
            rendererSettings: {
                progressiveLoad: false,
                hideOnTransparent: true,
            },
        });
    }
}
</script>

<style scoped lang="scss">
.upgrade-modal {
    @include modal;
    user-select: none;
    width: 300px;
    padding: 16px;

    &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;

        &__animation {
            width: 94px;
            height: 94px;
            margin: 0 auto;
        }

        &__badge {
            margin: 0px 16px 20px;
            padding: 20px 0px 26px;
            width: 100%;
            background: var(--trial-started-modal-badge-bg-color);
            border-radius: 6px;
        }

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
            margin-bottom: 7px;
        }

        &__text {
            @include font12-500;
            padding: 0 13px;
            text-align: center;
            color: var(--modal-body-text-color);
        }
    }
    &__footer {
        display: flex;
        align-items: center;
        justify-content: center;

        &__actions {
            width: 100%;
            margin-top: 6px;
        }
    }
}
</style>
