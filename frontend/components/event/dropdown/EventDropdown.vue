<template>
    <div class="event-dropdown">
        <div class="event-dropdown__title-wrapper">
            <div class="event-dropdown__title-wrapper__title">
                {{ event.name || event.summary || 'Untitled' }}
            </div>
            <button
                class="event-dropdown__title-wrapper__icon"
                @click="openModal"
            >
                <InterfaceArrowsExpand3Alternate size="14" class="icon" />
            </button>
        </div>
        <EventCalendar />
        <hr />
        <EventTime :event="event" />
        <hr v-if="event.description && event.description.length" />
        <EventDescription
            v-if="event.description && event.description.length"
            :description="event.description"
            :scrollable="true"
        />
        <hr v-if="showStatusPicker" />
        <div v-if="showStatusPicker" class="event-dropdown__my-status">
            My Status
            <EventStatusPicker :event="event" />
        </div>
        <hr v-if="canShowAttendees" />
        <EventAttendees
            v-if="canShowAttendees"
            :attendees="eventAttendees"
            :organizer="calendarOwnerEmail"
            :can-invite-others="canInviteOthers"
            :can-modify="canModify"
            :can-see-others="canSeeOtherGuests"
            :collapsible="true"
        />
        <hr v-if="hasConferencing" />
        <EventDropdownConferencing
            v-if="hasConferencing && event.integrationType !== 'ics_calendar'"
            :event-id="event.id"
        />
        <div class="event-dropdown__footer">
            <CButton
                v-if="meetingNotes"
                type="primary"
                size="full-width"
                @click="openMeetingNotes"
                >Open Page
            </CButton>
            <CButton
                v-else
                type="primary"
                size="full-width"
                @click="createMeetingNotes"
            >
                <InterfaceAdd1 class="icon" />
                Add Page
            </CButton>
        </div>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Prop,
    Provide,
    ProvideReactive,
    Vue,
} from 'vue-property-decorator';
import has from 'lodash/has';
import { add, format } from 'date-fns';
import { IEvent, SafeElectronWindow } from '~/@types';
import CButton from '~/components/CButton.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import EventDropdownConferencing from '~/components/event/dropdown/EventDropdownConferencing.vue';
import { CalendarSymbols } from '~/constants/symbols';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceArrowsExpand3Alternate from '~/components/streamline/InterfaceArrowsExpand3Alternate.vue';
import EventCalendar from '~/components/event/EventCalendar.vue';
import EventTime from '~/components/event/EventTime.vue';
import EventDescription from '~/components/event/EventDescription.vue';
import EventStatusPicker from '~/components/event/EventStatusPicker.vue';
import EventAttendees from '~/components/event/EventAttendees.vue';
import { extractDate } from '~/helpers';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'EventDropdown',
    components: {
        EventAttendees,
        EventStatusPicker,
        EventDescription,
        EventTime,
        EventCalendar,
        InterfaceArrowsExpand3Alternate,
        InterfaceAdd1,
        EventDropdownConferencing,
        InterfaceLinkSquare,
        CButton,
    },
})
export default class EventDropdown extends Vue {
    @Prop({ required: true })
    @ProvideReactive(CalendarSymbols.EVENT)
    event!: Partial<IEvent> & {
        startObject: any;
        endObject: any;
    };

    get showStatusPicker() {
        return this.attendees.length;
    }

    get attendees() {
        const attendees = this.event.attendees;
        if (!attendees) {
            return '';
        }
        return attendees.map(attendee => {
            if (attendee.displayName) {
                return attendee.displayName;
            }
            if (attendee.email) {
                return attendee.email;
            }
            return '';
        });
    }

    @Provide(CalendarSymbols.CALENDAR)
    get calendar() {
        return this.$store.getters['integration/getCalendarByEvent'](
            this.event,
        );
    }

    @ProvideReactive(CalendarSymbols.HAS_CONFERENCING)
    get hasConferencing() {
        return (
            this.event?.conferenceData?.createRequest ||
            this.event?.conferenceData?.entryPoints
        );
    }

    @ProvideReactive(CalendarSymbols.DEFAULT_CALENDAR)
    get defaultCalendar() {
        return this.$store.getters['vaultSettings/defaultCalendar'];
    }

    @ProvideReactive(CalendarSymbols.IS_READER)
    get isReader() {
        const calendar = this.$store.getters['integration/getCalendarByEvent'](
            this.event,
        );

        if (!calendar) return true;

        return calendar.accessRole === 'reader';
    }

    @ProvideReactive(CalendarSymbols.CAN_MODIFY)
    get canModify() {
        if (this.event.calendarId === this.defaultCalendar.id) return true;
        if (this.$accessControl.readOnlyAccess) return false;
        if (this.event.integrationType === 'ics_calendar') return false;
        if (this.isReader) return false;

        return this.event.guestsCanModify || !!this.event.organizer?.self;
    }

    @ProvideReactive(CalendarSymbols.EVENT_ATTENDEES)
    get eventAttendees() {
        return this.event?.attendees ?? [];
    }

    @ProvideReactive(CalendarSymbols.CAN_INVITE_OTHERS)
    get canInviteOthers() {
        if (this.isReader) return false;
        if (!this.event) {
            return false;
        }

        return (
            // @ts-ignore
            (!has(this.event, 'guestsCanInviteOthers') &&
                this.event.integrationType !== 'ics_calendar') ||
            this.event.guestsCanInviteOthers
        );
    }

    @ProvideReactive(CalendarSymbols.CAN_SEE_OTHER_GUESTS)
    get canSeeOtherGuests() {
        if (!this.event) {
            return false;
        }

        return (
            // @ts-ignore
            (!has(this.event, 'guestsCanSeeOtherGuests') &&
                this.event.integrationType !== 'ics_calendar') ||
            this.event.guestsCanSeeOtherGuests
        );
    }

    @ProvideReactive(CalendarSymbols.CALENDAR_OWNER_EMAIL)
    get calendarOwnerEmail() {
        if (!this.event) return null;
        const integration = this.$store.getters['integration/byId'](
            this.event?.integrationId,
        );

        if (integration?.type === 'google_calendar')
            return integration.data.googleAccountEmail;

        const currentUser = this.eventAttendees.find(
            attendee => attendee.isCurrentUser,
        );

        return currentUser?.email ?? null;
    }

    @ProvideReactive(CalendarSymbols.CAN_UPDATE_ATTENDANCE)
    get canUpdateAttendance() {
        if (
            !this.event ||
            !this.event?.attendees ||
            !this.event.attendees.length
        ) {
            return false;
        }

        return this.event.attendees.some(
            ({ email }) => email === this.calendarOwnerEmail,
        );
    }

    get canShowAttendees() {
        const hasAttendees = this.eventAttendees.length > 1;
        return hasAttendees && this.canSeeOtherGuests;
    }

    get meetingNotes() {
        return this.$utils.event.getMeetingNotes(this.event);
    }

    async createMeetingNotes() {
        this.$emit('close');
        const id = await this.$utils.event.createMeetingNotes(this.event);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.EVENT_CLIP_DROPDOWN,
            entityId: id,
        });
    }

    openMeetingNotes() {
        this.$emit('close');
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.EVENT_CLIP_DROPDOWN,
        });
        this.$utils.event.openMeetingNotes(this.event);
    }

    openModal() {
        this.$emit('close');
        this.$vfm.show({
            component: () => import('~/components/event/modal/EventModal.vue'),
            bind: {
                event: this.event,
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.event-dropdown {
    @include frostedGlassBackground;
    padding: 10px;
    border-radius: 12px;
    min-width: 270px;
    max-width: 270px;
    user-select: none;
    overflow: hidden;

    hr {
        margin: 8px auto;
        border-color: var(--calendar-popup-hr-color);
    }

    &__title-wrapper {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;

        &__title {
            @include font14-500;
            color: var(--calendar-popup-title-color);
        }

        &__icon {
            padding: 4px;
            //border-radius: 6px;
            color: var(--calendar-popup-expand-button-color);
            //background: var(--calendar-popup-button-background);

            &:hover {
                color: var(--calendar-popup-button-color__hover);
                //background: var(--calendar-popup-button-background__hover);
            }
        }
    }

    &__my-status {
        @include font12-500;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__footer {
        margin-top: 14px;
    }
}
</style>
