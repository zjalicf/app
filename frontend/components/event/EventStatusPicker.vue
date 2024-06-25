<template>
    <div class="event-status-picker">
        <ASelect
            :items="responseStatuses"
            :value="responseStatus"
            check-placement="end"
            :width="146"
            :readonly="true"
        />
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import InterfaceHelpQuestionCircle from '~/components/streamline/InterfaceHelpQuestionCircle.vue';
import { IEvent } from '~/@types';
import { CalendarSymbols } from '~/constants/symbols';

@Component({
    name: 'EventStatusPicker',
    components: { ASelect },
})
export default class EventStatusPicker extends Vue {
    @Prop({ required: true })
    event!: Partial<IEvent> & {
        startObject: any;
        endObject: any;
    };

    @Inject(CalendarSymbols.CAN_MODIFY)
    canModify!: boolean;

    @Inject(CalendarSymbols.CAN_UPDATE_ATTENDANCE)
    canUpdateAttendance!: boolean;

    get responseStatuses() {
        const statuses = [
            {
                id: 'accepted',
                label: 'Going',
                icon: {
                    icon: InterfaceValidationCheckCircle,
                    color: 'var(--event-modal-attendees-row-status-color__accept)',
                },
            },
            {
                id: 'declined',
                label: 'Not Going',
                icon: {
                    icon: InterfaceDeleteCircle,
                    color: 'var(--event-modal-attendees-row-status-color__declined)',
                },
            },
            {
                id: 'tentative',
                label: 'Maybe',
                icon: {
                    icon: InterfaceHelpQuestionCircle,
                    color: 'var(--event-modal-attendees-row-status-color__tenative)',
                },
            },
        ];
        if (
            !this.organizerObject ||
            this.organizerObject?.responseStatus === 'needsAction'
        ) {
            statuses.push({
                id: 'needsAction',
                label: 'Not Responded',
                icon: {
                    icon: InterfaceHelpQuestionCircle,
                    color: 'var(--event-modal-attendees-row-status-color__unknown)',
                },
            });
        }
        return statuses;
    }

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

    get eventAttendees() {
        // TODO: do not return only self. Probably just return null
        if (!this.event) return [];

        if (this.event.attendees) return this.event.attendees;

        return [];
    }

    get organizerObject() {
        return (
            this.eventAttendees.find(
                ({ email }: Record<string, any>) =>
                    email === this.calendarOwnerEmail,
            ) || null
        );
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
}
</script>
<style lang="scss" scoped></style>
