<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '720px',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        name="event-modal"
        v-on="$listeners"
    >
        <div class="event-modal">
            <tippy
                :content="$utils.tooltip.getRefText"
                :delay="[300, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                target=".has-tippy"
            />
            <div class="event-modal__header">
                <div class="event-modal__header__meta">
                    <button
                        v-if="eventData.htmlLink"
                        class="event-modal__header__meta__type has-tippy"
                        :data-tippy-content="`<div tabindex='-1' class='tooltip'>Show Event In External Calendar</div>`"
                        @click="openExternal"
                    >
                        {{ calendarType }}
                    </button>
                    <span v-else class="event-modal__header__meta__type">
                        {{ calendarType }}
                    </span>

                    <div class="event-modal__header__meta__actions">
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
                            Add New Page
                        </CButton>
                    </div>
                </div>
            </div>
            <div class="event-modal__body">
                <div class="event-modal__body__title">
                    {{ eventData.summary || 'Untitled' }}
                </div>
                <div class="event-modal__body__property">
                    <div class="event-modal__body__property__label">
                        CALENDAR
                    </div>
                    <div class="event-modal__body__property__value">
                        <EventCalendar />
                    </div>
                </div>
                <div class="event-modal__body__property">
                    <div class="event-modal__body__property__label">TIME</div>
                    <div class="event-modal__body__property__value">
                        <EventTime :event="eventData" :show-date="true" />
                    </div>
                </div>
                <div
                    v-if="
                        hasConferencing &&
                        eventData.calendarId !== defaultCalendar.id &&
                        eventData.integrationType !==
                            IntegrationType.ICS_CALENDAR
                    "
                    class="event-modal__body__property"
                >
                    <div class="event-modal__body__property__label">
                        CONFERENCING
                    </div>
                    <div
                        class="
                            event-modal__body__property__value
                            event-modal__body__property__value--conferencing
                        "
                    >
                        <button
                            class="
                                event-modal__body__property__value--conferencing__join
                            "
                            @click="joinMeeting"
                        >
                            Join Meeting
                        </button>
                        <div
                            class="
                                event-modal__body__property__value--conferencing__text
                            "
                        >
                            {{ conferencingName }}
                            <button
                                class="
                                    event-modal__body__property__value--conferencing__copy
                                "
                                @click="handleCopy"
                            >
                                <InterfaceFileDouble size="14" />
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    v-if="eventData.description && eventData.description.length"
                    class="event-modal__body__property"
                >
                    <div class="event-modal__body__property__label">
                        DESCRIPTION
                    </div>
                    <div class="event-modal__body__property__value">
                        <EventDescription
                            :description="eventData.description"
                        />
                    </div>
                </div>
                <div
                    v-if="showStatusPicker"
                    class="event-modal__body__property"
                >
                    <div class="event-modal__body__property__label">
                        MY STATUS
                    </div>
                    <div class="event-modal__body__property__value">
                        <EventStatusPicker :event="eventData" />
                    </div>
                </div>
                <div
                    v-if="canShowAttendees"
                    class="event-modal__body__property"
                >
                    <div class="event-modal__body__property__label">PEOPLE</div>
                    <div class="event-modal__body__property__value">
                        <EventAttendees
                            :attendees="eventAttendees"
                            :organizer="calendarOwnerEmail"
                            :can-invite-others="canInviteOthers"
                            :can-modify="canModify"
                            :can-see-others="canSeeOtherGuests"
                        />
                    </div>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import linkifyStr from 'linkify-html';
import has from 'lodash/has';
import copy from 'copy-to-clipboard';
import CButton from '~/components/CButton.vue';
import { IEvent, SafeElectronWindow } from '~/@types';
import InterfaceFileAdd from '~/components/streamline/InterfaceFileAdd.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';
import ASelect from '~/components/ASelect.vue';
import EventAttendees from '~/components/event/EventAttendees.vue';
import EventCalendar from '~/components/event/EventCalendar.vue';
import { CalendarSymbols } from '~/constants/symbols';
import EventTime from '~/components/event/EventTime.vue';
import EventDescription from '~/components/event/EventDescription.vue';
import EventStatusPicker from '~/components/event/EventStatusPicker.vue';
import InterfaceArrowsCornerUpRight from '~/components/streamline/InterfaceArrowsCornerUpRight.vue';
import { IntegrationType } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'EventModal',
    computed: {
        IntegrationType() {
            return IntegrationType;
        },
    },
    components: {
        InterfaceArrowsCornerUpRight,
        EventStatusPicker,
        EventDescription,
        EventTime,
        EventCalendar,
        EventAttendees,
        ASelect,
        InterfaceFileDouble,
        InterfaceLinkSquare,
        InterfaceFileAdd,
        CButton,
    },
})
export default class EventModal extends Vue {
    @Prop()
    event!: IEvent;

    eventData:
        | (Partial<IEvent> & {
              startObject: any;
              endObject: any;
          })
        | null = null;

    @Provide(CalendarSymbols.CALENDAR)
    get calendar() {
        return this.$store.getters['integration/getCalendarByEvent'](
            this.event,
        );
    }

    @Provide(CalendarSymbols.CAN_MODIFY)
    get canModify() {
        if (this.event.calendarId === this.defaultCalendar.id) return true;
        if (this.$accessControl.readOnlyAccess) return false;
        if (this.event.integrationType === 'ics_calendar') return false;
        if (this.isReader) return false;

        return this.event.guestsCanModify || !!this.event.organizer?.self;
    }

    @Provide(CalendarSymbols.CAN_UPDATE_ATTENDANCE)
    get canUpdateAttendance() {
        if (
            !this.eventData ||
            !this.eventData?.attendees ||
            !this.eventData.attendees.length
        ) {
            return false;
        }

        return this.eventData.attendees.some(
            ({ email }) => email === this.calendarOwnerEmail,
        );
    }

    get showStatusPicker() {
        return this.eventAttendees.length;
    }

    get responseStatus() {
        // self - either I am the creator, hence I am going,
        // or I am an attendee and I return the actual response
        return this.self?.responseStatus ?? 'accepted';
    }

    get self() {
        if (!this.eventAttendees.length) return this.event.creator;
        return this.eventAttendees.find(
            (a: any) =>
                (a.self || a.isCurrentUser) &&
                a.email === this.calendarOwnerEmail,
        );
    }

    get calendarType() {
        return (
            this.eventData?.integrationType?.split('_').join(' ') ?? 'Calendar'
        );
    }

    get conferencingName() {
        return (
            this.eventData?.conferenceData?.conferenceSolution?.name ??
            'No Link'
        );
    }

    get link() {
        return this.$utils.event.getEventLink(this.eventData);
    }

    get calendarOwnerEmail() {
        if (!this.eventData) return null;
        const integration = this.$store.getters['integration/byId'](
            this.eventData?.integrationId,
        );

        if (integration?.type === IntegrationType.GOOGLE_CALENDAR)
            return integration.data.googleAccountEmail;

        const currentUser = this.eventAttendees.find(
            attendee => attendee.isCurrentUser,
        );

        return currentUser?.email ?? null;
    }

    get eventAttendees() {
        // TODO: do not return only self. Probably just return null
        if (!this.eventData) return [];

        if (this.eventData.attendees) return this.eventData.attendees;

        return [];
    }

    get canShowAttendees() {
        const hasAttendees = this.eventAttendees.length > 1;
        return hasAttendees && this.canSeeOtherGuests;
    }

    get hasConferencing() {
        return (
            this.eventData?.conferenceData?.createRequest ||
            this.eventData?.conferenceData?.entryPoints
        );
    }

    get defaultCalendar() {
        return this.$store.getters['vaultSettings/defaultCalendar'];
    }

    get isReader() {
        const calendar = this.$store.getters['integration/getCalendarByEvent'](
            this.event,
        );

        if (!calendar) return true;

        return calendar.accessRole === 'reader';
    }

    get canInviteOthers() {
        if (this.isReader) return false;
        if (!this.eventData) {
            return false;
        }

        return (
            // @ts-ignore
            (!has(this.eventData, 'guestsCanInviteOthers') &&
                this.eventData.integrationType !==
                    IntegrationType.ICS_CALENDAR) ||
            this.eventData.guestsCanInviteOthers
        );
    }

    get canSeeOtherGuests() {
        if (!this.eventData) {
            return false;
        }

        return (
            // @ts-ignore
            (!has(this.eventData, 'guestsCanSeeOtherGuests') &&
                this.eventData.integrationType !==
                    IntegrationType.ICS_CALENDAR) ||
            this.eventData.guestsCanSeeOtherGuests
        );
    }

    get meetingNotes() {
        return this.$utils.event.getMeetingNotes(this.eventData!);
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

    async createMeetingNotes() {
        this.$vfm.hideAll();
        const id = await this.$utils.event.createMeetingNotes(this.eventData!);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.EVENT_CLIP_MODAL,
            entityId: id,
        });
    }

    openMeetingNotes() {
        this.$vfm.hideAll();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.EVENT_CLIP_MODAL,
        });
        this.$utils.event.openMeetingNotes(this.eventData!);
    }

    openExternal() {
        if (this.event.htmlLink) return;
        if (this.event.id.startsWith('apple_calendar')) {
            this.openInAppleCalendar();
            return;
        }
        window.open(this.event.htmlLink!);
    }

    openInAppleCalendar() {
        (window as SafeElectronWindow).electron.openExternal(
            this.event.htmlLink!,
        );
    }

    beforeMount() {
        const attendees = this.event.attendees || [];
        // @ts-ignore
        this.eventData = {
            ...this.event,
            attendees,
            linkedDocumentId: this.event?.linkedDocumentId ?? null,
        };

        const description = this.eventData!.description;

        if (!description) return;

        const htmlCheck = /<(?!http)[^>]+>/g;
        if (!htmlCheck.test(description)) {
            try {
                let content = description;
                const options = { defaultProtocol: 'https' };
                content = linkifyStr(content, options);
                content = content.replaceAll('\n', '<br>');
                this.eventData!.description = content;
            } catch (e) {
                this.eventData!.description = description.replaceAll(
                    '\n',
                    '<br>',
                );
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.event-modal {
    @include modal;
    @include scrollbar(104px, 6px);
    user-select: none;
    overflow-y: auto;
    height: 100%;

    &__header {
        position: sticky;
        top: 0;
        background: var(--jira-panel-header-bg-color);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--tab-divider-color);
        padding: 24px 32px 16px 40px;

        &__meta {
            @include font12-500;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &__type {
                text-transform: capitalize;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 8px;
                border-radius: 6px;

                &:hover {
                    background: var(--calendar-popup-button-background__hover);
                }
            }

            &__actions {
                display: flex;
                align-items: center;
                gap: 8px;

                :deep(.c-button) {
                    @include font12-600;
                    border-radius: 34px;
                }

                a {
                    color: var(--jira-panel-header-icon-color);
                    padding: 7px;
                    flex-shrink: 0;
                    border-radius: 4px;

                    &:hover {
                        color: var(--jira-panel-header-icon-color__hover);
                    }
                }
            }
        }

        &__calendar {
            @include font12-500;
            display: flex;
            align-items: center;

            &__color {
                width: 14px;
                height: 14px;
                border-radius: 4px;
                margin-right: 4px;
                display: inline-block;
            }
        }
    }

    &__body {
        padding: 12px 32px 0 48px;

        &__title {
            font-size: 22px;
            font-style: normal;
            font-weight: 700;
            line-height: 155.2%;
            color: var(--calendar-popup-title-color);
            margin-bottom: 20px;

            width: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
        }

        &__property {
            width: 100%;
            display: grid;
            grid-template-columns: 130px 1fr;
            justify-items: start;
            justify-content: start;
            align-items: baseline;
            margin-bottom: 18px;

            &__label {
                @include font10-700;
            }

            &__value {
                @include font12-500;
                width: 100%;

                &--conferencing {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    &__text {
                        @include font12-500;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    &__copy {
                        outline: none;
                        color: var(
                            --event-modal-conferencing-selector-button-text-color
                        );
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
                            background: var(
                                --calendar-popup-button-background__hover
                            );
                        }
                    }
                }
            }
        }
    }
}
</style>
