<template>
    <div class="login">
        <div class="login-wrapper">
            <div v-if="!invalidLink && !success" class="login-tab">
                <h1>Reset Password</h1>
                <label>
                    <p>New Password</p>
                    <input
                        v-model="password1"
                        spellcheck="false"
                        :class="{ error: !password1valid }"
                        type="password"
                    />
                    <p :class="{ visible: !password1valid }" class="hint">
                        Password must be at least 10 characters
                    </p>
                </label>
                <label>
                    <p>Confirm New Password</p>
                    <input
                        v-model="password2"
                        spellcheck="false"
                        :class="{ error: !password2valid }"
                        type="password"
                    />
                    <p :class="{ visible: !password2valid }" class="hint">
                        Passwords must match
                    </p>
                </label>
                <button
                    :disabled="!validPasswords"
                    @click="handlePasswordReset"
                >
                    Reset password
                </button>
            </div>
            <div v-else-if="invalidLink && !success" class="invalid-link">
                Password Reset Link Expired
            </div>
            <div v-else-if="success" class="success">
                <p>Password Reset Successful</p>
                <p>
                    <nuxt-link to="/auth/login">Continue to Log In</nuxt-link>
                </p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getSaltAndVerifier } from '~/helpers';

const validatePassword = (pw: string) => {
    return pw.length >= 10;
};
@Component({
    name: 'ResetPassword',
    layout: 'homepage',
    transition: 'fade',
})
export default class ResetPassword extends Vue {
    passwordValidate!: string;
    password!: string;
    message!: string;
    password1: string = '';
    password2: string = '';
    token = '';
    email: string = '';
    invalidLink: boolean = false;
    user: any = null;
    success: boolean = false;
    retrieveUser() {
        try {
            return this.$cloudService.User.retrieve(this.token).then(
                ({ data }) => data,
            );
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
            this.invalidLink = true;
        }
    }

    async mounted() {
        this.token = this.$route.query.token as string;
        this.email = this.$route.query.email as string;
        if (!this.token || !this.email) {
            this.invalidLink = true;
            return;
        }
        this.user = await this.retrieveUser();
    }

    get password1valid() {
        if (this.password1 === '') return true;
        return validatePassword(this.password1);
    }

    get password2valid() {
        if (this.password2 === '') return true;
        return this.password1valid && this.password1 === this.password2;
    }

    get validPasswords() {
        if (this.password1 === '' || this.password2 === '') return false;
        return this.password2valid;
    }

    async handlePasswordReset() {
        if (!this.user) return;
        if (!this.validPasswords) return;
        try {
            const { salt, verifier } = await getSaltAndVerifier(
                this.email,
                this.password1,
            );
            await this.$cloudService.User.save(
                {
                    id: this.user.id,
                    salt,
                    verifier,
                } as any,
                { create: false },
                undefined,
                this.token,
            );
            this.success = true;
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
            this.invalidLink = true;
        }
    }
}
</script>

<style lang="scss" scoped>
.login-tab {
    h1 {
        margin-top: -15px;
        font-style: normal;
        font-weight: 700;
        font-size: 26px;
        line-height: 155.2%;
        color: var(--reset-password-heading1-color);
        text-align: center;
        margin-bottom: 16px;
    }
    h2 {
        font-style: normal;
        font-weight: 500;
        font-size: 15px;
        line-height: 155.2%;
        color: var(--reset-password-heading2-color);
        text-align: center;
        margin-bottom: 16px;
    }
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
        &.back {
            margin-bottom: -20px;
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
            color: var(--auth-label-color);
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
                text-align: right;
            }
        }
        &:last-of-type {
            margin-bottom: 15px;
        }
        input {
            display: block;
            background: var(--auth-input-text-color);
            border-radius: 5px;
            width: 100%;
            outline: none;
            font-weight: 500;
            font-size: 14px;
            line-height: 155.2%;
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
                color: var(--auth-input-placeholder-color);
            }
        }
    }
}
.invalid-link {
    color: var(--reset-password-message-text-color);
    text-align: center;
    font-weight: 500;
    font-size: 14px;
}
.success {
    color: var(--reset-password-message-text-color);
    text-align: center;
    font-weight: 500;
    font-size: 14px;
}
.login {
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    .login-wrapper {
        margin-top: 30px;
        background: var(--auth-wrapper-bg-color);
        padding: 45px 40px;
        border-radius: 12px;
        max-width: 293px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        justify-content: center;
        button,
        a {
            @include animateBackgroundColor;
            width: 100%;
            outline: none;
            display: block;
            margin: 5px 0px;
            padding: 6px 0px;
            background: var(--auth-button-bg-color);
            border-radius: 6px;
            font-weight: 500;
            font-size: 13px;
            line-height: 155.2%;
            color: var(--auth-button-text-color);
            text-align: center;
            &:hover {
                background: var(--auth-button-bg-color__hover);
            }
            &:not(:last-of-type) {
                margin-bottom: 12px;
            }
            &:disabled {
                opacity: 0.6;
            }
        }
    }
}
</style>
