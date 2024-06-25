<template>
    <div class="mobile-auth-login">
        <MobileAuthHeader @back="back" />
        <div class="mobile-auth__title">Welcome back!</div>
        <div class="login-tab__wrapper">
            <div class="login-tab">
                <label for="emailLogin">
                    <p>Email</p>
                    <input
                        id="emailLogin"
                        v-model="form.login.email.value"
                        :disabled="loading"
                        spellcheck="false"
                        :class="{
                            error: form.login.email.error,
                        }"
                        type="email"
                        placeholder="Email"
                    />
                </label>
                <label for="passwordLogin">
                    <p>Password</p>
                    <input
                        id="passwordLogin"
                        v-model="form.login.password.value"
                        :disabled="loading"
                        spellcheck="false"
                        type="password"
                        placeholder="Password"
                        @keydown.enter="handleLogin"
                    />
                    <p class="forgot">
                        <span @click="reset">Forgot password?</span>
                    </p>
                </label>
                <button :disabled="!validLogin || loading" @click="handleLogin">
                    Log In
                </button>
                <p v-if="loginErrorMessage" class="error">
                    {{ loginErrorMessage }}
                </p>
            </div>
            <p class="mobile-auth__action">
                Don't have an account? <span @click="create">Sign up</span>
            </p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { StatusCodes } from 'http-status-codes';
import MobileAuthHeader from '~/components/mobile/auth/Header.vue';

const validateEmail = (email: string) => {
    const emailValidationRegExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailValidationRegExp.test(email);
};

const validatePassword = (pw: string) => {
    return pw.length >= 10;
};

@Component({
    components: { MobileAuthHeader },
    layout: 'mobileAuth',
    name: 'MobileAuthLogin',
})
export default class MobileAuthLogin extends Vue {
    loading: boolean = false;
    loginErrorMessage = '';
    form: Record<string, any> = {
        login: {
            email: {
                value: '',
                error: false,
                valid: false,
            },
            password: {
                value: '',
            },
        },
        register: {
            email: {
                value: '',
                error: false,
                valid: false,
            },
            password: {
                value: '',
                error: false,
                valid: false,
            },
        },
        reset: {
            email: {
                value: '',
                error: false,
                valid: false,
            },
        },
    };

    back() {
        this.$router.push('/auth/login');
    }

    reset() {
        this.$router.push('/mobile/auth/reset');
    }

    create() {
        this.$router.push('/mobile/auth/create');
    }

    get validLogin() {
        const email = this.form.login.email.value;
        const password = this.form.login.password.value;

        return validateEmail(email) && password;
    }

    clearValidation(form: string, field: string) {
        this.form[form][field].error = false;
        this.form[form][field].valid = false;
    }

    validateField(form: string, field: string) {
        const val = this.form[form][field].value;

        if (val === '') {
            this.clearValidation(form, field);
            return;
        }

        if (field === 'email') {
            const valid = validateEmail(val);
            this.form[form][field].error = !valid;
            this.form[form][field].valid = valid;
        }

        if (field === 'password') {
            const valid = validatePassword(val);
            this.form[form][field].error = !valid;
            this.form[form][field].valid = valid;
        }
    }

    async handleLogin(event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (!this.validLogin) return;
        this.loginErrorMessage = '';
        this.loading = true;

        const email = this.form.login.email.value;
        const password = this.form.login.password.value;

        const response = await this.$cloudService.Auth.login(email, password);

        if (response.status !== StatusCodes.OK) {
            this.loginErrorMessage = 'Invalid email or password.';
            this.form.login.password.value = '';
            this.loading = false;
            return;
        }

        await this.$router.push(
            `/auth/validate?access_token=${encodeURIComponent(
                response.data.accessToken,
            )}&refresh_token=${encodeURIComponent(response.data.refreshToken)}`,
        );

        this.loading = false;
    }
}
</script>
<style lang="scss" scoped>
.mobile-auth-login {
    height: 100%;
    position: relative;
    background: var(--auth-mobile-bg-color);

    .mobile-auth__action {
        @include font12-500;
        padding: 18px 0px;
        text-align: center;
        font-style: normal;
        color: var(--mobile-auth-action-text-color);

        span {
            color: var(--mobile-auth-heading-color);
        }
    }

    .mobile-auth__title {
        margin: 0 5vw;
        font-weight: 700;
        font-size: 32px;
        line-height: 39px;
        letter-spacing: -0.24px;
        color: var(--mobile-auth-heading-color);
    }

    .login-tab {
        &__wrapper {
            position: absolute;
            width: calc(100% - 10vw);
            left: 5vw;
            bottom: var(--ion-safe-area-bottom);
        }
        padding: 22px 20px 20px;
        background: var(--auth-wrapper-bg-color);
        border-radius: 20px;

        h1 {
            font-style: normal;
            font-weight: 700;
            font-size: 26px;
            line-height: 155.2%;
            color: var(--mobile-auth-heading-color);
            text-align: center;
            margin-bottom: 16px;
        }

        h2 {
            font-style: normal;
            font-weight: 500;
            font-size: 15px;
            line-height: 155.2%;
            color: var(--mobile-auth-subheading-color);
            text-align: center;
            margin-bottom: 16px;
        }

        > p {
            margin-top: 10px;
            color: var(--mobile-auth-subheading-color);
            font-size: 13px;
            font-weight: 500;
            line-height: 155.2%;
            text-align: center;

            &.error {
                color: var(--danger-color);
                font-size: 11px;
                margin-top: 4px;
            }

            span {
                color: var(--mobile-auth-heading-color);

                &:hover {
                    text-decoration: underline;
                }
            }
        }

        label {
            margin-bottom: 8px;
            display: block;

            p {
                font-style: normal;
                font-weight: 500;
                font-size: 13px;
                line-height: 155.2%;
                color: var(--mobile-auth-label-color);
                margin-bottom: 3px;

                &.hint {
                    @include animateOpacity;
                    font-size: 11px;
                    color: var(--danger-color);
                    opacity: 0;

                    &.visible {
                        opacity: 1;
                    }
                }

                &.forgot {
                    margin-top: 5px;
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
                border-radius: 12px;
                width: 100%;
                outline: none;
                font-weight: 500;
                font-size: 14px;
                line-height: 22px;
                padding: 12px 18px;

                &.error {
                    padding: 10px 16px;
                    border: 2px solid var(--danger-color);
                }

                &.valid {
                    padding: 10px 16px;
                    border: 2px solid var(--accent-color);
                }

                &::placeholder {
                    font-size: 14px;
                    color: var(--email-login-input-placeholder-color);
                }
            }
        }

        button {
            @include animateBackgroundColor;
            @include font14-600;
            display: block;
            background: var(--email-login-buttons-bg-color);
            box-shadow: var(--auth-button-box-shadow);
            border-radius: 12px;
            text-align: center;
            color: var(--email-login-buttons-text-color);
            padding: 12px 0px;
            width: 100%;

            &:disabled {
                opacity: 0.4;
            }

            &:not(:last-of-type) {
                margin-bottom: 10px;
            }
        }
    }
}
</style>
