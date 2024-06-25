<template>
    <div class="user-profile-button">
        <button
            v-if="loggedIn"
            class="no-drag user-profile-button--user"
            @click="openUserSettings"
        >
            <div class="user-profile-button--user--inner">
                <InterfaceUserCircle
                    v-if="!image || showLetter"
                    class="no-user-icon"
                    size="20"
                />
                <img v-else :src="image" :alt="email" @error="imageError" />
            </div>
        </button>
        <button
            v-else
            class="no-drag user-profile-button--user"
            @click="openUserSettings"
        >
            <InterfaceUserCircle class="no-user-icon" size="20" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrafficLights from '~/components/mac/TrafficLights.vue';
import SidebarControls from '~/components/header/app-header/SidebarControls.vue';
import SearchButton from '~/components/header/app-header/TabInfo.vue';
import WorkspaceSelector from '~/components/header/app-header/WorkspaceSelector.vue';
import InterfaceUserProfileFocus from '~/components/streamline/InterfaceUserProfileFocus.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';

@Component({
    name: 'UserProfileButton',
    components: {
        InterfaceUserCircle,
        InterfaceUserProfileFocus,
        WorkspaceSelector,
        SearchButton,
        SidebarControls,
        TrafficLights,
    },
})
export default class UserProfileButton extends Vue {
    showLetter: boolean = false;

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    openUserSettings() {
        this.$utils.navigation.openSettings('myAccount');
    }

    get image() {
        if (this.user) {
            return this.user.picture;
        }

        return null;
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    imageError() {
        this.showLetter = true;
    }

    get letter() {
        if (this.user) {
            if (this.user.email) return this.user.email[0].toUpperCase();
            else return this.user.name[0].toUpperCase();
        }

        return '#';
    }

    get email() {
        if (this.user) {
            if (this.user.email) return this.user.email;
            else return this.user.name;
        }

        return '';
    }
}
</script>
<style lang="scss" scoped>
.user-profile-button {
    user-select: none;

    &--user {
        background: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        padding: 3px;

        &:hover {
            background: var(--app-bg-icon-bg-color__hover);
            filter: brightness(120%);

            .no-user-icon {
                color: var(--app-bg-icon-color__hover);
            }
        }

        &--inner {
            max-width: 22px;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;

            img {
                max-width: 22px;
                display: block;
                border-radius: 50%;
            }
        }

        .no-user-icon {
            color: var(--app-bg-icon-color);
        }
    }
}
</style>
