<template>
    <button class="event-attendees" @click="toggleExpand">
        <div
            v-if="summaryString && canSeeOthers"
            class="event-attendees__title"
            :class="{ collapsible }"
        >
            <p class="event-attendees__title__summary">
                {{ summaryString }}
            </p>
            <AcreomChevronDown v-if="!expanded && collapsible" class="icon" />
            <AcreomChevronUp v-else-if="collapsible" class="icon" />
        </div>
        <div
            v-if="expanded || !collapsible"
            class="event-attendees__attendees-wrapper"
        >
            <div
                v-for="attendee in sortedAttendees"
                :key="attendee.email"
                class="event-attendees__attendees"
            >
                <div
                    class="event-attendees__attendees__attendees-row"
                    :class="{ active: highlight }"
                >
                    <div
                        class="
                            event-attendees__attendees__attendees-row__status
                        "
                        :class="{ 'can-modify': canModify }"
                    >
                        <InterfaceValidationCheckCircle
                            v-if="
                                attendees.length === 1 ||
                                attendee.responseStatus === 'accepted'
                            "
                            class="status-accept"
                        />
                        <InterfaceHelpQuestionCircle
                            v-if="attendee.responseStatus === 'needsAction'"
                            class="status-unknown"
                        />
                        <InterfaceHelpQuestionCircle
                            v-if="attendee.responseStatus === 'tentative'"
                            class="status-tentative"
                        />
                        <InterfaceDeleteCircle
                            v-if="attendee.responseStatus === 'declined'"
                            class="status-declined"
                        />
                    </div>
                    <div
                        class="event-attendees__attendees__attendees-row__email"
                    >
                        {{ attendee.email }}
                        {{ attendee.organizer ? '(owner)' : '' }}
                    </div>
                </div>
            </div>
            <div v-if="organizerObject" class="event-attendees__attendees">
                <div
                    class="event-attendees__attendees__attendees-row"
                    :class="{ active: highlight }"
                >
                    <div
                        class="
                            event-attendees__attendees__attendees-row__status
                        "
                    >
                        <InterfaceValidationCheckCircle
                            v-if="organizerObject.responseStatus === 'accepted'"
                            class="status-accept"
                        />
                        <InterfaceHelpQuestionCircle
                            v-if="
                                organizerObject.responseStatus === 'needsAction'
                            "
                            class="status-unknown"
                        />
                        <InterfaceHelpQuestionCircle
                            v-if="
                                organizerObject.responseStatus === 'tentative'
                            "
                            class="status-tentative"
                        />
                        <InterfaceDeleteCircle
                            v-if="organizerObject.responseStatus === 'declined'"
                            class="status-declined"
                        />
                    </div>
                    <div
                        class="event-attendees__attendees__attendees-row__email"
                    >
                        {{ organizerObject.email }}
                        {{ organizerObject.organizer ? '(owner)' : '' }}
                    </div>
                </div>
            </div>
        </div>
    </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceHelpQuestionCircle from '~/components/streamline/InterfaceHelpQuestionCircle.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';
import AcreomChevronUp from '~/components/icons/AcreomChevronUp.vue';

@Component({
    name: 'EventAttendees',
    components: {
        AcreomChevronUp,
        AcreomChevronDown,
        InterfaceDeleteCircle,
        InterfaceHelpQuestionCircle,
        InterfaceValidationCheckCircle,
    },
})
export default class EventAttendees extends Vue {
    @Prop()
    attendees!: any[];

    @Prop()
    organizer!: string | null;

    @Prop()
    canInviteOthers!: boolean;

    @Prop()
    canModify!: boolean;

    @Prop()
    canSeeOthers!: boolean;

    @Prop({ default: false })
    collapsible!: boolean;

    highlight: boolean = false;
    searchTerm: string = '';

    expanded: boolean = false;

    get sortedAttendees() {
        return this.attendees
            .filter(a => a.email !== this.organizer)
            .sort((attendeeA: any, attendeeB: any) => {
                return attendeeA.responseStatus?.[0].localeCompare(
                    attendeeB.responseStatus?.[0],
                );
            });
    }

    get organizerObject() {
        return (
            this.attendees.find(
                ({ email }: { email: string }) => email === this.organizer,
            ) || null
        );
    }

    get self() {
        return this.attendees.find(a => a.self || a.isCurrentUser);
    }

    get summaryString() {
        const constructed = `${this.going}${this.notGoing}${this.tentative}${this.notResponded}`;
        return constructed
            ? constructed.substring(0, constructed.length - 2)
            : '';
    }

    get going() {
        const goingAmount = this.attendees.filter(
            a => a.responseStatus === 'accepted',
        ).length;
        return goingAmount > 0 ? String(goingAmount + ' going, ') : '';
    }

    get notGoing() {
        const notGoingAmount = this.attendees.filter(
            a => a.responseStatus === 'declined',
        ).length;
        return notGoingAmount > 0
            ? String(notGoingAmount + ' not going, ')
            : '';
    }

    get tentative() {
        const tentativeAmount = this.attendees.filter(
            a => a.responseStatus === 'tentative',
        ).length;
        return tentativeAmount > 0 ? String(tentativeAmount + ' maybe, ') : '';
    }

    get notResponded() {
        const notRespondedAmount = this.attendees.filter(
            a => a.responseStatus === 'needsAction',
        ).length;
        return notRespondedAmount > 0
            ? String(notRespondedAmount + ' awaiting, ')
            : '';
    }

    toggleExpand() {
        this.expanded = !this.expanded;
    }
}
</script>

<style lang="scss" scoped>
.event-attendees {
    user-select: none;
    width: 100%;

    &:hover {
        .icon {
            color: var(--event-modal-option-icon-color__hover);
        }
    }

    .icon {
        flex-shrink: 0;
        margin-right: 6px;
        color: var(--event-modal-option-icon-color);
    }

    &__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        font-size: 13px;
        font-style: normal;
        font-weight: 500;
        line-height: 155.2%; /* 20.176px */

        margin-bottom: 8px;

        &.collapsible {
            width: 100%;
        }

        &__summary {
            padding: 2px 0 0;
            color: var(--event-modal-attendees-summary-text-color);
        }
    }

    &__attendees {
        margin-bottom: 5px;

        &__attendees-row {
            overflow: hidden;
            position: relative;
            user-select: none;
            cursor: default;
            display: grid;
            grid-template-columns: 20px 1fr;
            justify-items: start;
            border-radius: 6px;
            align-items: center;
            gap: 6px;

            &__email {
                @include ellipsis;
                @include font12-500;
                color: var(--event-modal-attendees-row-email-color);

                > div {
                    font-size: 13px;
                    color: var(
                        --event-modal-attendees-row-email-color__highlight
                    );
                }
            }

            &__status {
                .status-accept {
                    color: var(
                        --event-modal-attendees-row-status-color__accept
                    );
                }

                .status-unknown {
                    color: var(
                        --event-modal-attendees-row-status-color__unknown
                    );
                }

                .status-tentative {
                    color: var(
                        --event-modal-attendees-row-status-color__tenative
                    );
                }

                .status-declined {
                    color: var(
                        --event-modal-attendees-row-status-color__declined
                    );
                }
            }
        }
    }
}
</style>
