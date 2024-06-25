<template>
    <div class="login-buttons-desktop">
        <div v-if="tab === 'home'" class="login-tab">
            <div class="login-button-group">
                <a :href="$cloudService.Auth.googleUrl" @click="googleClick">
                    <GoogleIcon size="20" />
                </a>
                <a :href="$cloudService.Auth.githubUrl" @click="githubClick">
                    <GithubIcon size="20" />
                </a>
                <a :href="$cloudService.Auth.appleUrl" @click="appleClick">
                    <AppleIcon size="20" />
                </a>
            </div>
            <button class="email" @click="emailClick">
                Continue with Email
            </button>
        </div>
        <div v-if="tab === 'login'" class="login-tab">
            <h1>Log in</h1>
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
                    type="text"
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
                    @keydown.enter.prevent.stop="handleLogin"
                />
                <p class="forgot">
                    <span @click="goTo('reset')">Forgot password?</span>
                </p>
            </label>
            <button :disabled="!validLogin || loading" @click="handleLogin">
                Log In
            </button>
            <p v-if="loginErrorMessage" class="error">
                {{ loginErrorMessage }}
            </p>
            <p>
                <span @click="goTo('register')"
                    >Don't have an account? Sign up.</span
                >
            </p>
            <p class="back" @click="goTo('home')">Go back</p>
        </div>
        <div v-if="tab === 'register'" class="login-tab">
            <h1>Create account</h1>
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
                    type="text"
                    placeholder="Email"
                    @blur="validateField('register', 'email')"
                    @input="validateField('register', 'email')"
                    @keydown.enter.prevent.stop="handleCreateAccount"
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
            <p>
                <span @click="goTo('login')"
                    >Already have an account? Log in.</span
                >
            </p>
            <p class="back" @click="goTo('home')">Go back</p>
        </div>
        <div v-if="tab === 'reset'" class="login-tab">
            <h1>Reset Password</h1>
            <label v-if="!resetSuccess" for="emailSignup">
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
                v-if="!resetSuccess"
                :disabled="!validReset"
                @click="handlePasswordReset"
            >
                Reset Password
            </button>
            <p v-else class="reset-success">
                An email has been sent to {{ form.reset.email.value }} a with
                link to reset your password
            </p>
            <p class="back" @click="goTo('login')">Go back</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatusCodes } from 'http-status-codes';
import CInput from '~/components/CInput.vue';
import GoogleIcon from '~/components/icons/GoogleIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import AppleIcon from '~/components/icons/AppleIcon.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

const validateEmail = (email: string) => {
    const emailValidationRegExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailValidationRegExp.test(email);
};

const validatePassword = (pw: string) => {
    return pw.length >= 10;
};

@Component({
    components: { CInput, GoogleIcon, GithubIcon, AppleIcon },
})
export default class LoginButtonsDefault extends Vue {
    @Prop({
        required: true,
    })
    tab!: string;

    loading = false;
    resetSuccess = false;
    createAccountErrorMessage = '';
    loginErrorMessage = '';

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

    clearValidation(form: string, field: string) {
        this.form[form][field].error = false;
        this.form[form][field].valid = false;
    }

    get validRegistration() {
        const email = this.form.register.email.value;
        const password = this.form.register.password.value;

        return validateEmail(email) && validatePassword(password);
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

    clearForm() {
        this.loginErrorMessage = '';
        this.loginErrorMessage = '';
        this.resetSuccess = false;
        this.form = {
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
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GOOGLE,
    })
    googleClick() {}

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.GITHUB,
    })
    githubClick() {}

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.APPLE,
    })
    appleClick() {}

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOGIN,
        source: TrackingActionSource.EMAIL_AND_PASSWORD,
    })
    emailClick() {
        this.goTo('login');
    }

    async handleCreateAccount() {
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

    get validLogin() {
        const email = this.form.login.email.value;
        const password = this.form.login.password.value;

        return validateEmail(email) && password;
    }

    async handleLogin() {
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

    goTo(tab: string, clearForm: boolean = true) {
        this.$emit('update-tab', tab);
        if (!clearForm) return;

        this.clearForm();
    }
}
</script>

<style lang="scss" scoped>
.login-buttons-desktop {
    .login-button-group {
        display: flex;
        gap: 8px;

        a {
            display: flex;
            justify-content: center;
            color: var(--email-login-buttons-text-color);
            margin-bottom: 8px;
        }
    }

    button,
    a {
        width: 100%;
        outline: none;
        display: block;
        padding: 6px 0;
        background: var(--email-login-buttons-bg-color);
        border-radius: 6px;
        font-weight: 500;
        font-size: 13px;
        line-height: 20px;
        color: var(--email-login-buttons-text-color);
        text-align: center;

        &:hover {
            background: var(--email-login-buttons-bg-color__hover);
        }

        &:not(.email) {
            margin-bottom: 8px;
        }

        &.email {
            margin-bottom: 11px;
        }

        &:disabled {
            opacity: 0.65;
        }
    }
}

.login-tab {
    h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 17px;
        line-height: 26px;
        color: var(--email-login-heading-text-color);
        text-align: center;
        margin-bottom: 8px;
        margin-top: -8px;
    }

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
