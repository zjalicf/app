<template>
    <div class="notifications-google-calendar-setting">
        <div
            class="notifications-google-calendar-setting__title"
            :title="integration.data.googleAccountEmail"
        >
            <p>{{ integration.data.googleAccountEmail }}</p>
        </div>
        <a
            href="https://calendar.google.com/calendar/r/settings"
            target="_blank"
            class="notifications-google-calendar-setting__external-link"
        >
            Google calendar settings
            <ExternalLinkIcon class="icon" size="20" />
        </a>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { ExternalLinkIcon } from '@vue-hero-icons/solid';
@Component({
    name: 'NotificationsGoogleCalendarSetting',
    components: {
        ExternalLinkIcon,
    },
})
export default class NotificationsGoogleCalendarSetting extends Vue {
    @Prop()
    integration!: any;
}
</script>

<style lang="scss" scoped>
.notifications-google-calendar-setting {
    display: grid;
    grid-template-columns: 265px 195px;
    align-items: center;

    &__title {
        @include font12-500;
        color: var(--settings-modal-title-color);

        p {
            @include ellipsis;
        }
    }

    &__external-link {
        @include animateBackgroundColor;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 13px;
        line-height: 18px;
        color: var(--settings-modal-notifications-external-link-color);
        padding: 4px;

        .icon {
            margin-left: 6px;
        }

        &:hover {
            color: var(
                --settings-modal-notifications-external-link-color__hover
            );
        }
    }
}
</style>
