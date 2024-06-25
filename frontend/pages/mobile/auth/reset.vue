<template>
    <div class="mobile-auth-login">
        <MobileAuthHeader @back="back" />
        <div class="mobile-auth__title">Reset Password</div>
        <div class="login-tab__wrapper">
            <div class="login-tab">
                <div v-if="!resetSuccess">
                    <label for="emailSignup">
                        <p>Email</p>
                        <input
                            id="emailSignup"
                            v-model="form.reset.email.value"
                            :disabled="loading"
                            spellcheck="false"
                            :class="{
                                error: form.reset.email.error,
                                valid: form.reset.email.valid,
                            }"
                            type="text"
                            placeholder="Email"
                        />
                    </label>
                    <button
                        :disabled="!validReset"
                        @click="handlePasswordReset"
                    >
                        Reset Password
                    </button>
                </div>
                <div v-else class="reset-success">
                    <InterfaceValidationCheckCircle size="36" class="icon" />
                    <p class="reset-success">
                        An email has been sent to {{ form.reset.email.value }}
                        with link to reset your password.
                    </p>
                    <button @click="login">Back to Log In</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { StatusCodes } from 'http-status-codes';
import MobileAuthHeader from '~/components/mobile/auth/Header.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';

const validateEmail = (email: string) => {
    const emailValidationRegExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailValidationRegExp.test(email);
};

const validatePassword = (pw: string) => {
    return pw.length >= 10;
};

@Component({
    components: { InterfaceValidationCheckCircle, MobileAuthHeader },
    layout: 'mobileAuth',
    name: 'MobileAuthLogin',
})
export default class MobileAuthLogin extends Vue {
    resetSuccess = false;
    loading: boolean = false;
    form: any = {
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
        this.$router.push('/mobile/auth/login');
    }

    reset() {
        this.$router.push('/mobile/auth/reset');
    }

    login() {
        this.$router.push('/mobile/auth/login');
    }

    async handlePasswordReset() {
        if (!this.validReset) return;

        const email = this.form.reset.email.value;
        const response = await this.$cloudService.Auth.resetPassword(email);

        if (response.status === StatusCodes.OK) {
            this.resetSuccess = true;
        }
    }

    get validReset() {
        const email = this.form.reset.email.value;
        return validateEmail(email);
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
        color: var(--reset-password-label-color);

        span {
            color: var(--reset-password-text-span-color);
        }
    }

    .reset-success {
        display: flex;
        flex-direction: column;
        gap: 30px;

        .icon {
            color: var(--auth-mobile-icon-color);
            margin: 10px auto 0px;
        }

        p {
            @include font14-500;
            text-align: center;
            color: var(--reset-password-text-span-color);
            max-width: 200px;
            margin: 0 auto;
        }

        button {
            background: rgba(255, 255, 255, 0.1) !important;
            box-shadow: var(--auth-button-box-shadow) !important;
            color: var(--auth-heading-color) !important;
        }
    }

    .mobile-auth__title {
        margin: 0 5vw;
        font-weight: 700;
        font-size: 32px;
        line-height: 39px;
        letter-spacing: -0.24px;
        color: var(--auth-heading-color);
    }

    .login-tab {
        &__wrapper {
            position: absolute;
            width: calc(100% - 10vw);
            left: 5vw;
            bottom: 30px;
        }
        padding: 22px 20px 20px;
        background: var(--auth-wrapper-bg-color);
        border-radius: 20px;

        > p {
            margin-top: 10px;
            color: var(--reset-password-text-color);
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
                color: var(--reset-password-text-span-color);

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
                color: var(--reset-password-label-color);
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
                display: block;
                background: var(--auth-input-text-color);
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
                    color: var(--auth-input-placeholder-color);
                }
            }
        }

        button {
            @include animateBackgroundColor;
            @include font14-600;
            display: block;
            background: var(--auth-button-bg-color);
            box-shadow: var(--auth-button-box-shadow);
            border-radius: 12px;
            text-align: center;
            color: var(--auth-button-text-color);
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
