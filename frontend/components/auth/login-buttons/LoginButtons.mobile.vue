<template>
    <div class="mobile-login">
        <div class="login-buttons-mobile">
            <div class="login-button-group">
                <button
                    :disabled="loading"
                    :class="{ disabled: googleLoading }"
                    @click="google"
                >
                    <GoogleIcon size="20" />
                </button>
                <button
                    :disabled="loading"
                    :class="{ disabled: githubLoading }"
                    @click="github"
                >
                    <GithubIcon size="20" />
                </button>
                <button
                    :disabled="loading"
                    :class="{ disabled: appleLoading }"
                    @click="apple"
                >
                    <AppleIcon size="20" />
                </button>
            </div>
            <button :disabled="loading" @click="mobileLogin">
                Continue with Email
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GoogleIcon from '~/components/icons/GoogleIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import AppleIcon from '~/components/icons/AppleIcon.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    components: { AppleIcon, GithubIcon, GoogleIcon },
})
export default class LoginButtonsMobile extends Vue {
    appleLoading: boolean = false;
    googleLoading: boolean = false;
    githubLoading: boolean = false;

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.EMAIL_AND_PASSWORD,
    })
    mobileLogin() {
        this.$router.push('/mobile/auth/create');
    }

    get loading() {
        return this.appleLoading || this.googleLoading || this.githubLoading;
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.APPLE,
    })
    async apple() {
        this.appleLoading = true;

        if (this.$config.os === 'android') {
            try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({
                    url: `${this.$cloudService.Auth.appleUrl}-device`,
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const { SignInWithApple } = await import(
                    '@capacitor-community/apple-sign-in'
                );

                const baseUrl = this.$config.baseUrl;

                const options = {
                    clientId: 'com.acreom.app',
                    redirectURI: `${baseUrl}/api/auth/apple/callback`,
                    scopes: 'email name',
                };

                const { response }: any = await SignInWithApple.authorize(
                    options,
                );
                const { accessToken, refreshToken }: any =
                    await this.$cloudService.Auth.validateAppleIdentityToken(
                        response.identityToken,
                    );

                await this.$router.push({
                    path: '/auth/validate',
                    query: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }

        this.appleLoading = false;
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GOOGLE,
    })
    async google() {
        this.googleLoading = true;

        try {
            const { GoogleAuth } = await import(
                '@codetrix-studio/capacitor-google-auth'
            );
            await GoogleAuth.initialize();

            const {
                authentication: { accessToken: googleAccessToken },
            } = await GoogleAuth.signIn();

            const { accessToken, refreshToken }: any =
                await this.$cloudService.Auth.validateAccessToken(
                    googleAccessToken,
                );

            await this.$router.push({
                path: '/auth/validate',
                query: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
            });
        } catch (error) {
            console.log(error);
        }

        this.googleLoading = false;
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GITHUB,
    })
    async github() {
        this.githubLoading = true;

        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({
                url: `${this.$cloudService.Auth.githubUrl}-device`,
            });
        } catch (error) {
            console.log(error);
        }

        this.githubLoading = false;
    }
}
</script>

<style lang="scss" scoped>
.login-buttons-mobile {
    max-width: 311px;
    margin: 0 auto;

    .login-button-group {
        display: flex;

        button {
            display: flex;
            justify-content: center;
            color: var(--email-login-buttons-text-color);
            margin-bottom: 8px;

            &:not(:last-of-type) {
                margin-right: 8px;
            }
        }
    }

    button {
        background: var(--email-login-buttons-bg-color);
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        text-align: center;
        color: var(--email-login-buttons-text-color);
        width: 100%;
        height: 46px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        font-size: 15.83px;
        line-height: 22px;
        justify-content: center;

        &.disabled {
            opacity: 0.8;
        }

        &:not(:last-of-type) {
            margin-bottom: 8px;
        }
    }
}
</style>
