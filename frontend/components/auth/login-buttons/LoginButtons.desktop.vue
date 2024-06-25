<template>
    <div class="login-buttons-desktop">
        <div v-if="tab === 'home'" class="login-tab">
            <div class="login-button-group">
                <button @click="loginWithGoogle">
                    <GoogleIcon size="20" />
                </button>
                <button @click="loginWithGithub">
                    <GithubIcon size="20" />
                </button>
                <button @click="loginWithApple">
                    <AppleIcon size="20" />
                </button>
            </div>
            <button @click="continueWithEmail">Continue with Email</button>
            <button
                v-if="!disableNoAccount"
                data-e2e="no-account"
                class="no-account"
                @click="loginWithNoAccount"
            >
                Continue without account
            </button>
        </div>
        <EmailLogin :tab="tab" @update-tab="$emit('update-tab', $event)" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SafeElectronWindow } from '~/@types';
import CInput from '~/components/CInput.vue';
import GoogleIcon from '~/components/icons/GoogleIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import AppleIcon from '~/components/icons/AppleIcon.vue';
import EmailLogin from '~/components/auth/EmailLogin.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    components: { EmailLogin, AppleIcon, GithubIcon, GoogleIcon, CInput },
})
export default class LoginButtonsDesktop extends Vue {
    @Prop({
        required: true,
    })
    tab!: string;

    @Prop({
        default: false,
    })
    disableNoAccount!: boolean;

    @Prop({
        default: false,
    })
    useModal!: boolean;

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.EMAIL_AND_PASSWORD,
    })
    continueWithEmail() {
        if (this.useModal) {
            this.$vfm.show({
                component: () =>
                    import('@/components/modal/EmailLoginModal.vue'),
            });
            return;
        }

        this.$emit('update-tab', 'register');
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GOOGLE,
    })
    loginWithGoogle() {
        if (this.$config.os === 'linux') {
            (window as SafeElectronWindow).electron.openExternalLogin(
                this.$cloudService.Auth.googleUrl,
            );
            return;
        }

        this.$utils.navigation.openExternalLink(
            this.$cloudService.Auth.googleUrl,
        );
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GITHUB,
    })
    loginWithGithub() {
        if (this.$config.os === 'linux') {
            (window as SafeElectronWindow).electron.openExternalLogin(
                this.$cloudService.Auth.githubUrl,
            );
            return;
        }

        this.$utils.navigation.openExternalLink(
            this.$cloudService.Auth.githubUrl,
        );
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.APPLE,
    })
    loginWithApple() {
        if (this.$config.os === 'linux') {
            (window as SafeElectronWindow).electron.openExternalLogin(
                this.$cloudService.Auth.appleUrl,
            );
            return;
        }

        this.$utils.navigation.openExternalLink(
            this.$cloudService.Auth.appleUrl,
        );
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.NO_ACCOUNT,
    })
    loginWithNoAccount() {
        this.$router.push('/auth/vault');
    }
}
</script>

<style lang="scss" scoped>
.login-buttons-desktop {
    .login-button-group {
        display: flex;
        gap: 8px;

        button {
            display: flex;
            justify-content: center;
            color: var(--email-login-buttons-text-color);
            margin-bottom: 8px;
        }
    }

    button,
    a {
        @include font12-500;
        line-height: 20px;
        width: 100%;
        outline: none;
        display: block;
        padding: 6px 0;
        background: var(--email-login-buttons-bg-color);
        border-radius: 6px;
        color: var(--email-login-buttons-text-color);
        text-align: center;

        &:hover {
            background: var(--email-login-buttons-bg-color__hover);
        }

        &:not(:last-of-type) {
            margin-bottom: 8px;
        }

        &.no-account {
            @include font12-500;
            background: none;
            color: var(--email-login-sub-text-color);

            &:hover {
                background: none;
                color: var(--email-login-sub-text-color__hover);
            }
        }

        &:disabled {
            opacity: 0.65;
        }
    }
}

.login-tab {
    h2 {
        font-style: normal;
        font-weight: 500;
        font-size: 15px;
        line-height: 23px;
        color: var(--email-login-subheading-text-color);
        text-align: center;
        margin-bottom: 16px;
    }

    > p {
        margin-top: 10px;
        color: var(--email-login-subheading-text-color);
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
        text-align: center;

        &.error {
            color: var(--danger-color);
            font-size: 11px;
            margin-top: 4px;
        }

        span {
            color: var(--email-login-subheading-action-text-color);

            &:hover {
                text-decoration: underline;
            }
        }

        .no-account {
            margin-bottom: 0px;
        }

        &.back {
            margin-top: 0px;
        }
    }

    label {
        margin-bottom: 8px;
        display: block;

        p {
            font-style: normal;
            font-weight: 500;
            font-size: 13px;
            line-height: 20px;
            color: var(--email-login-label-text-color);

            &.hint {
                @include animateOpacity;
                font-size: 11px;
                line-height: 17px;
                color: var(--danger-color);
                opacity: 0;

                &.visible {
                    opacity: 1;
                }
            }

            &.forgot {
                line-height: 17px;
                text-align: right;
            }
        }

        &:last-of-type {
            margin-bottom: 15px;
        }

        input {
            @include inputMetaStyles;
            display: block;
            background: var(--email-login-input-bg-color);
            border-radius: 5px;
            width: 100%;
            outline: none;
            font-weight: 500;
            font-size: 14px;
            line-height: 22px;
            padding: 4px 6px;

            &.error {
                padding: 2px 4px;
                border: 2px solid var(--danger-color);
            }

            &.valid {
                padding: 2px 4px;
                border: 2px solid var(--accent-color);
            }

            &::placeholder {
                font-size: 14px;
                color: var(--email-login-input-placeholder-color);
            }
        }
    }
}
</style>
