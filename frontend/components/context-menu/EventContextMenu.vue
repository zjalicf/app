<template>
    <div class="event-context-menu">
        <div v-if="organizerObject">
            <div class="event-context-menu__attendance">Going?</div>
            <button
                :class="{
                    active: organizerObject.responseStatus === 'accepted',
                }"
                class="secondary"
                @click="updateAttendace('accepted')"
            >
                <InterfaceValidationCheck class="icon" size="14" />
                Yes
            </button>
            <button
                :class="{
                    active: organizerObject.responseStatus === 'declined',
                }"
                class="secondary"
                @click="updateAttendace('declined')"
            >
                <InterfaceValidationCheck class="icon" size="14" />
                No
            </button>
            <button
                :class="{
                    active: organizerObject.responseStatus === 'tentative',
                }"
                class="secondary"
                @click="updateAttendace('tentative')"
            >
                <InterfaceValidationCheck class="icon" size="14" />
                Maybe
            </button>
            <hr />
        </div>
        <a
            v-if="event.hangoutLink"
            :href="event.hangoutLink"
            target="_blank"
            @click="$emit('close')"
        >
            <InterfaceLink class="icon" size="14" />
            Join meeting</a
        >
        <button v-if="meetingNotes" @click="openMeetingNotes">
            <InterfaceContentFileAlternate class="icon" size="14" />
            Open Page
        </button>
        <button v-else @click="createMeetingNotes">
            <InterfaceContentFileAlternate class="icon" size="14" />
            Add Page
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IntegrationType } from '~/constants';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';

@Component({
    name: 'EventContextMenu',
    components: {
        InterfaceDeleteBin1,
        InterfaceValidationCheck,
        InterfaceLink,
        InterfaceContentFileAlternate,
    },
})
export default class EventContextMenu extends Vue {
    @Prop()
    event!: any;

    @Prop()
    canModify!: boolean;

    get calendarOwnerEmail() {
        if (!this.event) return null;
        const integration = this.$store.getters['integration/byId'](
            this.event?.integrationId,
        );

        if (integration?.type === IntegrationType.GOOGLE_CALENDAR)
            return integration.data.googleAccountEmail;

        return null;
    }

    get organizerObject() {
        return (
            this.event.attendees?.find(
                ({ email }: any) => email === this.calendarOwnerEmail,
            ) || null
        );
    }

    updateAttendace(action: string) {
        const attendees = this.event.attendees?.map((attendee: any) => {
            if (attendee.email === this.calendarOwnerEmail) {
                return { ...attendee, responseStatus: action };
            }

            return attendee;
        });
        this.$emit('close');

        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Response sent',
            },
        });

        this.$store.dispatch('event/update', { id: this.event.id, attendees });
    }

    get meetingNotes() {
        return this.$utils.event.getMeetingNotes(this.event);
    }

    async createMeetingNotes() {
        this.$emit('close');
        await this.$utils.event.createMeetingNotes(this.event);
    }

    openMeetingNotes() {
        this.$emit('close');
        this.$utils.event.openMeetingNotes(this.event);
    }
}
</script>

<style lang="scss" scoped>
.event-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
    user-select: none;
    cursor: default;

    &__attendance {
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
        color: var(--context-menu-section-title);
    }

    button,
    a {
        &.secondary {
            padding-left: 32px;

            .icon {
                display: none;
            }

            &.active {
                padding-left: 4px;

                .icon {
                    display: block;
                }
            }
        }
    }
}
</style>
