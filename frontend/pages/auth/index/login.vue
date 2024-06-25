<template>
    <div class="login">
        <h2>Welcome</h2>
        <div class="login__description">
            Capture notes, track your progress, create a knowledge base
        </div>
        <div class="login-wrapper" :class="[`tab-${tab}`]">
            <LoginButtons :tab="tab" @update-tab="tab = $event" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginButtons from '@/components/auth/login-buttons';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    layout: 'auth',
    transition: 'fade',
    components: {
        LoginButtons,
    },
})
export default class LocalLogIn extends Vue {
    tab: string = 'home';

    async mounted() {
        this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
            action: TrackingAction.START,
        });
        await this.$utils.onboarding.clearNewVault();
    }
}
</script>

<style lang="scss" scoped>
.login {
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;

    @media (max-height: 680px) {
        height: auto;
        padding-top: 180px;
    }

    h2 {
        font-weight: 500;
        font-size: 24px;
        line-height: 37px;
        text-align: center;
        color: var(--auth-heading-color);
        margin-bottom: 6px;
    }

    &__description {
        font-weight: 500;
        font-size: 15px;
        line-height: 23px;
        text-align: center;
        color: var(--onboarding-description-text-color);
        max-width: 270px;
        margin: 0 auto 25px;
    }

    .mobile & {
        display: flex;
        justify-content: flex-end;
    }

    .login-wrapper {
        background: var(--auth-wrapper-bg-color);
        padding: 23px 20px 12px;
        border-radius: 12px;
        max-width: 293px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        justify-content: center;

        .desktop & {
            &.tab-home {
                margin-bottom: 77px;
            }

            &.tab-login {
                margin-bottom: -59px;
            }

            &.tab-register {
                margin-bottom: -59px;
            }

            &.tab-reset {
                margin-bottom: 38px;
            }
        }

        .web & {
            &.tab-home {
                margin-bottom: 106px;
            }

            &.tab-login {
                margin-bottom: -59px;
            }

            &.tab-register {
                margin-bottom: -59px;
            }

            &.tab-reset {
                margin-bottom: 38px;
            }
        }

        .mobile & {
            background: var(--auth-mobile-bg-color);
            padding: 0 0 15vw;
            max-width: 100%;
        }
    }
}
</style>
