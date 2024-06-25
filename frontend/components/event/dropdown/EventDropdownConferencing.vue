<template>
    <div class="event-dropdown-conferencing">
        <div class="event-dropdown-conferencing__text">
            {{ conferencingName }}
            <button
                class="event-dropdown-conferencing__copy"
                @click="handleCopy"
            >
                <InterfaceFileDouble size="14" />
            </button>
        </div>
        <button class="event-dropdown-conferencing__join" @click="joinMeeting">
            Join Meeting
        </button>
    </div>
</template>
<script lang="ts">
import { Component, InjectReactive, Vue } from 'vue-property-decorator';
import copy from 'copy-to-clipboard';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import { CalendarSymbols } from '~/constants/symbols';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';

@Component({
    components: {
        InterfaceFileDouble,
        InterfaceLink,
    },
})
export default class EventDropdownConferencing extends Vue {
    @InjectReactive(CalendarSymbols.EVENT)
    event!: any;

    @InjectReactive(CalendarSymbols.DEFAULT_CALENDAR)
    defaultCalendar!: any;

    @InjectReactive(CalendarSymbols.HAS_CONFERENCING)
    hasConferencing!: boolean;

    get conferencingName() {
        return this.event.conferenceData.conferenceSolution?.name ?? 'No Link';
    }

    get link() {
        return (
            this.event.conferenceData.entryPoints.find(
                (e: any) => e.entryPointType === 'video',
            )?.uri ?? this.event.hangoutLink
        );
    }

    handleCopy() {
        try {
            const success = copy(this.link);
            this.$notification.show({
                component: () =>
                    import('~/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: success
                        ? 'Link copied to clipboard'
                        : 'There was a problem with clipboard',
                },
            });
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    joinMeeting() {
        window.open(this.link);
    }
}
</script>
<style lang="scss" scoped>
.event-dropdown-conferencing {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__text {
        @include font12-500;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    &__copy {
        outline: none;
        color: var(--event-modal-conferencing-selector-button-text-color);
        padding: 6px;
        border-radius: 6px;

        &:hover,
        &:focus {
            background: var(
                --event-modal-conferencing-selector-button-bg-color__hover
            );
            color: var(
                --event-modal-conferencing-selector-button-text-color__hover
            );
        }
    }

    &__join {
        @include font12-600;
        padding: 4px 16px;
        color: var(--calendar-popup-button-color);
        background: var(--calendar-popup-button-background);
        border-radius: 6px;

        &:hover {
            color: var(--calendar-popup-button-color__hover);
            background: var(--calendar-popup-button-background__hover);
        }
    }
}
</style>
