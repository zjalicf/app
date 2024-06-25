<template>
    <div class="mobile-account-settings">
        <div v-if="loggedIn" class="mobile-account-settings__wrapper">
            <div class="mobile-account-settings__wrapper__meta">
                <div class="mobile-account-settings__wrapper__meta__image">
                    <div
                        v-if="!image || showLetter"
                        class="
                            mobile-account-settings__wrapper__meta__image__letter
                        "
                    >
                        {{ letter }}
                    </div>
                    <img v-else :src="image" :alt="email" @error="imageError" />
                </div>
                <div
                    v-if="$accessControl.hasProAccess"
                    class="mobile-account-settings__wrapper__meta__badge"
                >
                    <p class="pro-badge">PRO</p>
                </div>
            </div>
            <MobileSettingsSection>
                <template #title>User</template>
                <template #buttons>
                    <MobileSettingsButton class="disabled">
                        <div class="mobile-settings-button__title">Name</div>
                        <div class="mobile-settings-button__value">
                            {{ username }}
                        </div>
                    </MobileSettingsButton>
                    <MobileSettingsButton class="disabled">
                        <div class="mobile-settings-button__title">Email</div>
                        <div class="mobile-settings-button__value">
                            {{ email }}
                        </div>
                    </MobileSettingsButton>
                </template>
            </MobileSettingsSection>
            <MobileSettingsSection>
                <template #buttons>
                    <MobileSettingsButton class="center" @click="logOut">
                        <div class="mobile-settings-button__title">Log Out</div>
                    </MobileSettingsButton>
                </template>
            </MobileSettingsSection>
            <MobileSettingsSection>
                <template #title>Danger Zone</template>
                <template #buttons>
                    <MobileSettingsButton class="danger" @click="deleteAccount">
                        <div class="mobile-settings-button__title">
                            Delete Account and its Data
                        </div>
                    </MobileSettingsButton>
                </template>
            </MobileSettingsSection>
        </div>
        <div v-else class="mobile-account-settings__wrapper logged-out">
            <div class="mobile-account-settings__wrapper__log-in-text">
                Sign In
            </div>
            <div class="mobile-account-settings__wrapper__log-in-subtext">
                Sign in to access cloud vaults and sync your data with other
                devices.
            </div>
            <div class="mobile-account-settings__wrapper__login-buttons">
                <LoginButtons
                    :tab="tab"
                    :disable-no-account="true"
                    :use-modal="true"
                    @update-tab="tab = $event"
                />
            </div>
        </div>
        <div class="mobile-account-settings__version-wrapper">
            <div class="mobile-account-settings__version-wrapper__version">
                version:
                <span
                    ref="version"
                    v-longpress.prevent.hapticstart.hapticend="
                        handleDebugContextMenu
                    "
                >
                    {{ $store.getters.latest }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginButtons from '@/components/auth/login-buttons';
import DebugPane from '~/components/mobile/preferences/panes/DebugPane.vue';
import MobileSettingsSection from '~/components/mobile/preferences/navigation/MobileSettingsSection.vue';
import MobileSettingsButton from '~/components/mobile/preferences/navigation/MobileSettingsButton.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'MobileAccountPreferences',
    components: {
        MobileSettingsButton,
        MobileSettingsSection,
        LoginButtons,
    },
})
export default class MobileAccountPreferences extends Vue {
    showLetter: boolean = false;
    tab: any = 'home';

    $refs!: {
        version: HTMLElement;
    };

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get email() {
        return this.user?.email ?? '';
    }

    get username() {
        return this.user?.name;
    }

    get image() {
        if (this.user) {
            return this.user.picture;
        }

        return null;
    }

    get letter() {
        if (this.user) {
            if (this.user.email) return this.user.email[0].toUpperCase();
            else return this.user.name[0].toUpperCase();
        }

        return '#';
    }

    handleDebugContextMenu() {
        this.$pane.show({
            component: DebugPane,
            type: 'dropdown',
        });
    }

    imageError() {
        this.showLetter = true;
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOG_OUT,
    })
    async logOut() {
        await this.$vfm.hideAll();
        await this.$store.dispatch('auth/logout');
    }

    deleteAccount() {
        this.$vfm.show({
            component: () =>
                import('@/components/modal/AccountDeleteModal.vue'),
        });
    }
}
</script>

<style lang="scss" scoped>
.mobile-account-settings {
    &__wrapper {
        &.logged-out {
            margin-top: 50%;
        }

        &__meta {
            user-select: none;
            width: 100%;

            &__image {
                display: flex;
                justify-content: center;
                margin-top: 54px;

                &__letter {
                    max-width: 76px;
                    background: var(
                        --settings-modal-my-account-letter-bg-color
                    );
                    width: 76px;
                    height: 76px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                img {
                    max-width: 76px;
                    display: block;
                    border-radius: 50%;
                }
            }

            &__badge {
                display: flex;
                justify-content: center;
                margin-top: 18px;

                .pro-badge {
                    @include proBadge;
                    font-size: 16px;
                    padding: 3px 6px;
                    border-radius: 6px;
                }
            }
        }

        &__login-buttons {
            padding: 20px;
            border-radius: 12px;
            margin: 0 auto;
            max-width: 280px;
            width: 100%;
        }

        &__log-in-text {
            @include font14-600;
            display: flex;
            justify-content: center;
            color: var(--settings-modal-title-color);
        }

        &__log-in-subtext {
            @include font12-500;
            color: var(--modal-body-text-color);
            max-width: 220px;
            margin: 20px auto 0;
            text-align: center;
        }
    }

    &__version-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 45px;

        &__version {
            user-select: none;
            @include font12-500;
            text-align: center;
            color: var(--settings-modal-my-account-version-color);
        }
    }
}
</style>
