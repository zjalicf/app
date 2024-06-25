<template>
    <div class="mobile-auth-create">
        <MobileAuthHeader @back="back" />
        <div class="mobile-auth__title">Create Account</div>
        <div class="login-tab__wrapper">
            <div class="login-tab">
                <label for="emailSignup">
                    <p>Email</p>
                    <input
                        id="emailSignup"
                        v-model="form.register.email.value"
                        :disabled="loading"
                        spellcheck="false"
                        :class="{
                            error: form.register.email.error,
                            valid: form.register.email.valid,
                        }"
                        type="email"
                        placeholder="Email"
                        @blur="validateField('register', 'email')"
                    />
                </label>
                <label for="passwordSignup">
                    <p>Password</p>
                    <input
                        id="passwordSignup"
                        v-model="form.register.password.value"
                        :disabled="loading"
                        spellcheck="false"
                        :class="{
                            error: form.register.password.error,
                            valid: form.register.password.valid,
                        }"
                        type="password"
                        placeholder="Password"
                        @input="validateField('register', 'password')"
                        @blur="validateField('register', 'password')"
                        @keydown.enter="handleCreateAccount"
                    />
                    <p
                        :class="{ visible: form.register.password.error }"
                        class="hint"
                    >
                        Password must be at least 10 characters
                    </p>
                </label>
                <button
                    :disabled="!validRegistration || loading"
                    @click="handleCreateAccount"
                >
                    Sign Up
                </button>
                <p v-if="createAccountErrorMessage" class="error">
                    {{ createAccountErrorMessage }}
                </p>
            </div>
            <p class="mobile-auth__action">
                Already have an account? <span @click="login">Log in</span>
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
    name: 'MobileAuthCreate',
})
export default class MobileAuthCreate extends Vue {
    loading: boolean = false;
    createAccountErrorMessage = '';
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

    login() {
        this.$router.push('/mobile/auth/login');
    }

    get validRegistration() {
        const email = this.form.register.email.value;
        const password = this.form.register.password.value;

        return validateEmail(email) && validatePassword(password);
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

    async handleCreateAccount(event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (!this.validRegistration) return;

        this.createAccountErrorMessage = '';
        this.loading = true;

        const email = this.form.register.email.value;
        const password = this.form.register.password.value;

        const response = await this.$cloudService.Auth.register(
            email,
            password,
        );

        if (response.status !== StatusCodes.OK) {
            if (response.data.error === 'user exists') {
                this.createAccountErrorMessage =
                    'Account already exists. Please log in.';
            } else {
                this.createAccountErrorMessage =
                    'Error creating account. Try again later.';
            }

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
.mobile-auth-create {
    height: 100%;
    position: relative;
    background: var(--auth-mobile-bg-color);

    .mobile-auth__action {
        @include font12-500;
        padding: 18px 0px;
        text-align: center;
        font-style: normal;
        color: $blueGrey500;

        span {
            color: white;
        }
    }

    .mobile-auth__title {
        margin: 0 5vw;
        font-weight: 700;
        font-size: 32px;
        line-height: 39px;
        letter-spacing: -0.24px;
        color: $white;
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
            color: $white;
            text-align: center;
            margin-bottom: 16px;
        }

        h2 {
            font-style: normal;
            font-weight: 500;
            font-size: 15px;
            line-height: 155.2%;
            color: $blueGrey300;
            text-align: center;
            margin-bottom: 16px;
        }

        > p {
            margin-top: 10px;
            color: $blueGrey300;
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
                color: $white;

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
                color: $blueGrey500;
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
                background: #272d38;
                border-radius: 12px;
                width: 100%;
                outline: none;
                font-weight: 500;
                font-size: 14px;
                line-height: 22px;
                padding: 12px 18px;

                &.error {
                    padding: 10px 16px;
                    border: 2px solid $danger;
                }

                &.valid {
                    padding: 10px 16px;
                    border: 2px solid var(--accent-color);
                }

                &::placeholder {
                    font-size: 14px;
                    color: $blueGrey500;
                }
            }
        }

        button {
            @include animateBackgroundColor;
            @include font14-500;
            display: block;
            background: $white;
            box-shadow: var(--auth-button-box-shadow);
            border-radius: 12px;
            text-align: center;
            color: $blueGrey700;
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
