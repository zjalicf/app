<template>
    <button
        class="my-day-panel-event"
        :class="{ overdue: eventInPast, highlight: event.highlight }"
        :style="styles"
        @click="$emit('entity-click')"
    >
        <MyDayPanelEntity>
            <template #title>
                <InterfaceCalendar class="icon" />
                <div class="my-day-panel-entity__title__text">
                    {{ event.name || event.summary || 'Untitled' }}
                </div>
            </template>
            <template #time>
                <div class="time-wrapper">
                    <div
                        class="pill"
                        :style="{
                            background: `${pillColor}`,
                        }"
                        :class="[eventResponseStatus]"
                    ></div>
                    <span
                        :style="{
                            color: `${eventColorSolid}`,
                        }"
                        >{{ formattedTime.text }}
                        {{ duration ? `(${duration})` : '' }}</span
                    >
                </div>
            </template>
            <template v-if="event.upcomingDelta" #upcoming>
                {{ event.upcomingDelta }}
            </template>
        </MyDayPanelEntity>
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isAfter } from 'date-fns';
import { IEvent } from '~/@types';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import MyDayPanelEntity from '~/components/entities/my-day/panel/list/MyDayPanelEntity.vue';

@Component({
    name: 'MyDayPanelEvent',
    components: { MyDayPanelEntity, InterfaceCalendar },
})
export default class MyDayPanelEvent extends Vue {
    @Prop({ required: true })
    event!: Partial<IEvent> & {
        startObject: any;
        endObject: any;
        upcomingDelta: any;
        highlight: boolean;
    };

    @Prop({ default: () => new Date() })
    now!: Date;

    get styles() {
        return {
            '--background': this.$utils.calendar.getEventColorSolid(
                this.event as IEvent,
                1,
            ),
            '--background-declined': this.$utils.calendar.getEventColorSolid(
                this.event as IEvent,
                0.5,
            ),
        };
    }

    get eventResponseStatus() {
        return this.$utils.calendar.getEventResponseStatus(
            this.event as IEvent,
        );
    }

    get pillColor() {
        const needsAction = ['needsAction', 'declined', 'tentative'].includes(
            this.eventResponseStatus,
        );
        return needsAction
            ? null
            : this.$utils.calendar.getEventColorSolid(this.event as IEvent, 1);
    }

    get eventColorSolid() {
        return this.$utils.calendar.getEventColorSolid(this.event as IEvent, 1);
    }

    get eventInPast() {
        return isAfter(this.now, this.$utils.calendar.endDate(this.event));
    }

    get duration() {
        return this.$utils.event.getEventDuration({
            start: this.event.startObject,
            end: this.event.endObject,
        });
    }

    get formattedTime() {
        return this.$utils.event.getEventFormattedTime(
            {
                start: this.event.startObject,
                end: this.event.endObject,
            },
            false,
        );
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-event {
    width: 100%;
    padding: 8px 16px;
    margin-bottom: 4px;
    border-radius: 8px;
    background: var(--my-day-panel-entity-background);

    &.overdue {
        opacity: 0.4;
    }

    &:hover,
    &.highlight {
        background: var(--my-day-panel-entity-background__hover);
    }

    height: 100%;
    cursor: default;
    user-select: none;

    .pill {
        height: 12px;
        width: 3px;
        border-radius: 10px;

        &.needsAction,
        &.tentative {
            background: none;
            border: 1px solid var(--background);
        }

        &.declined {
            background: none;
            border: 1px solid var(--background-declined);
        }
    }

    .time-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}
</style>
