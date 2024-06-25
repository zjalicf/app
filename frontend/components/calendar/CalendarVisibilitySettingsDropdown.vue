<template>
    <div class="calendar-visibility-settings">
        <div class="calendar-visibility-settings__wrapper">
            <div class="calendar-visibility-settings__body">
                <CalendarVisibilitySettings
                    :vault="vault"
                    :source="TrackingActionSource.TIMELINE_CALENDAR_DROPDOWN"
                />
            </div>

            <div class="calendar-visibility-settings__footer">
                <button
                    v-if="$utils.isElectron()"
                    tabindex="-1"
                    @click="openPreferences('notifications')"
                >
                    <BellIcon size="20" class="icon" />
                    Notification Settings
                </button>
                <button tabindex="-1" @click="openPreferences('calendars')">
                    <CogIcon size="20" class="icon" />
                    Calendar Settings
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { CogIcon, BellIcon } from '@vue-hero-icons/solid';
import CalendarVisibilitySettings from '~/components/calendar/CalendarVisibilitySettings.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'CalendarVisibilitySettingsDropdown',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: { CalendarVisibilitySettings, CogIcon, BellIcon },
})
export default class CalendarVisibilitySettingsDropdown extends Vue {
    get vault() {
        return this.$store.getters['vault/active'];
    }

    openPreferences(pane: string) {
        this.$dropdown.hideAll();
        this.$utils.navigation.openSettings(
            pane,
            TrackingActionSource.TIMELINE_CALENDAR_DROPDOWN,
        );
    }
}
</script>

<style lang="scss" scoped>
.calendar-visibility-settings {
    @include frostedGlassBackground;
    @include scrollbar;
    max-width: 255px;
    border-radius: 12px;
    width: 255px;
    padding: 13px 0 11px;
    user-select: none;
    max-height: 480px;
    overflow-y: auto;

    &__body {
        padding: 0 18px;
    }

    &__footer {
        padding: 14px 11px 0 11px;
    }

    button {
        outline: none;
        display: flex;
        width: 100%;
        align-items: center;
        font-weight: 500;
        font-size: 13px;
        line-height: 155.2%;
        color: var(--calendar-visibility-dropdown-button-color);
        padding: 3px 13px 3px 6px;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--calendar-visibility-dropdown-button-color__hover);

            .icon {
                color: var(
                    --calendar-visibility-dropdown-button-icon-color__hover
                );
            }
        }

        .icon {
            color: var(--calendar-visibility-dropdown-button-icon-color);
            margin-right: 13px;
        }
    }
}
</style>
