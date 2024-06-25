<template>
    <div class="help-dropdown">
        <button
            v-if="updateAvailable"
            class="sidebar-menu__option"
            @click="updateAndRestart"
        >
            <RefreshIcon size="20" class="icon" />
            Restart & Update
            <span class="dot"></span>
        </button>
        <button
            v-else-if="$config.platform === 'desktop'"
            class="sidebar-menu__option"
            @click="checkForUpdates"
        >
            <RefreshIcon size="20" class="icon" />
            Check for Updates
        </button>
        <a
            href="https://acreom.com/change-log"
            target="_blank"
            class="sidebar-menu__option"
            @click="
                $tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.HELP_MENU_ACTION,
                    source: TrackingActionSource.WHATS_NEW,
                })
            "
        >
            <GiftIcon size="20" class="icon" />
            What's New
        </a>
        <a
            href="https://acreom.com/user-guide"
            target="_blank"
            class="sidebar-menu__option"
            @click="
                $tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.HELP_MENU_ACTION,
                    source: TrackingActionSource.USER_GUIDE,
                })
            "
        >
            <BookOpenIcon size="20" class="icon" />
            User Guide
        </a>
        <button class="sidebar-menu__option" @click="showCheatSheet">
            <EyeIcon size="20" class="icon" />
            Keyboard Shortcuts
        </button>
        <a
            href="https://discord.gg/RS9ThmHhQp"
            target="_blank"
            class="sidebar-menu__option"
            @click="
                $tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.HELP_MENU_ACTION,
                    source: TrackingActionSource.JOIN_DISCORD,
                })
            "
        >
            <DiscordIcon size="20" class="icon" />
            Join our Discord</a
        >
        <a
            href="https://twitter.com/acreom"
            target="_blank"
            class="sidebar-menu__option"
            @click="
                $tracking.trackEventV2(TrackingType.SIDEBAR, {
                    action: TrackingAction.HELP_MENU_ACTION,
                    source: TrackingActionSource.FOLLOW_US_ON_TWITTER,
                })
            "
        >
            <TwitterIcon size="20" class="icon" />
            Follow us on Twitter</a
        >
        <button class="sidebar-menu__option" @click="openShareFeedbackModal">
            <ChatAltIcon size="20" class="icon" />
            Support and feedback
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
    BookOpenIcon,
    ChatAltIcon,
    EyeIcon,
    GiftIcon,
    RefreshIcon,
} from '@vue-hero-icons/solid';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import { DiscordIcon, TwitterIcon } from '~/components/icons';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'HelpDropdown',
    components: {
        RefreshIcon,
        DiscordIcon,
        ChatAltIcon,
        BookOpenIcon,
        EyeIcon,
        TwitterIcon,
        GiftIcon,
        InterfaceEditPencil,
    },
})
export default class HelpDropdown extends Vue {
    get TrackingType() {
        return TrackingType;
    }

    get TrackingActionSource() {
        return TrackingActionSource;
    }

    get TrackingAction() {
        return TrackingAction;
    }

    @TrackEvent(TrackingType.SIDEBAR, {
        action: TrackingAction.HELP_MENU_ACTION,
        source: TrackingActionSource.UPDATE_AND_RESTART,
    })
    updateAndRestart() {
        this.$entities.autoUpdater.updateAndRestart();
    }

    get updateAvailable() {
        return this.$store.getters['autoUpdater/updateAvailable'];
    }

    @TrackEvent(TrackingType.SIDEBAR, {
        action: TrackingAction.HELP_MENU_ACTION,
        source: TrackingActionSource.KEYBOARD_SHORTCUTS,
    })
    showCheatSheet() {
        this.$emit('close');
        this.$store.commit('openCheatsheet');
    }

    @TrackEvent(TrackingType.SIDEBAR, {
        action: TrackingAction.HELP_MENU_ACTION,
        source: TrackingActionSource.SUPPORT_AND_FEEDBACK,
    })
    openShareFeedbackModal() {
        this.$emit('close');
        this.$vfm.show({
            component: () =>
                import('@/components/modal/ShareFeedbackModal.vue'),
        });
    }

    @TrackEvent(TrackingType.SIDEBAR, {
        action: TrackingAction.HELP_MENU_ACTION,
        source: TrackingActionSource.CHECK_FOR_UPDATE,
    })
    checkForUpdates() {
        this.$emit('close');
        this.$entities.autoUpdater.checkForUpdates();
    }
}
</script>
<style lang="scss" scoped>
.help-dropdown {
    @include frostedGlassBackground;
    @include contextMenu;

    .sidebar-menu__option {
        position: relative;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-color);
        position: absolute;
        right: 10px;
    }
}
</style>
