<template>
    <div class="timeline" :class="{ mobile }">
        <div
            v-if="mobile"
            class="timeline--overlay"
            @click.prevent.stop="$emit('open')"
        ></div>
        <div v-if="allDayEntities.length" class="timeline--allday">
            <TimelineAllDay
                v-for="event in allDayEntities"
                :key="event.id"
                :event="event"
                :mobile="mobile"
            />
        </div>
        <div v-if="timedEntities.length" class="timeline--timed">
            <TimelineTimed
                v-for="event in timedEntities"
                :key="event.id"
                :event="event"
                :mobile="mobile"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { extractDate, isTimed, sortTimedTasks } from '~/helpers/date';
import { IEvent } from '~/@types';
import { ITask } from '~/components/task/model';
import TimelineAllDay from '~/components/mobile/common/TimelineAllDay.vue';
import TimelineTimed from '~/components/mobile/common/TimelineTimed.vue';
import { IDocument } from '~/components/document/model';

@Component({
    name: 'TodayTimeline',
    components: {
        TimelineTimed,
        TimelineAllDay,
    },
})
export default class TodayTimeline extends Vue {
    @Prop({
        default: () => [],
    })
    events!: IEvent[];

    @Prop({
        default: () => [],
    })
    tasks!: ITask[];

    @Prop({
        default: () => [],
    })
    pages!: IDocument[];

    @Prop({
        default: true,
    })
    mobile!: boolean;

    get allDayEntities() {
        // sort by enity.start ascending
        return [...this.allDayEvents, ...this.allDayTasks, ...this.allDayPages];
    }

    get timedEntities() {
        return [
            ...this.timedEvents,
            ...this.timedTasks,
            ...this.timedEPages,
        ].sort((a, b) => {
            const aDate = extractDate(a.start);
            const bDate = extractDate(b.start);
            if (aDate < bDate) return -1;
            if (aDate > bDate) return 1;
            return 0;
        });
    }

    get allDayEvents() {
        return this.events.filter(t => !isTimed(t));
    }

    get allDayPages() {
        if (!this.$store.getters['vaultSettings/pagesInCalendarConfig'].visible)
            return [];
        return this.pages.filter(p => !isTimed(p));
    }

    get allDayTasks() {
        if (!this.$store.getters['vaultSettings/tasksInCalendarConfig'].visible)
            return [];
        return this.tasks.filter(t => !isTimed(t));
    }

    get timedEvents() {
        return this.events.filter(isTimed).sort(sortTimedTasks);
    }

    get timedEPages() {
        return this.pages.filter(isTimed).sort(sortTimedTasks);
    }

    get timedTasks() {
        if (!this.$store.getters['vaultSettings/tasksInCalendarConfig'].visible)
            return [];
        return this.tasks.filter(isTimed).sort(sortTimedTasks);
    }
}
</script>

<style lang="scss" scoped>
.timeline {
    position: relative;
    overflow-y: hidden;

    &--overlay {
        height: 100%;
        width: 100%;
        z-index: 100;
        position: absolute;
        top: 0;
        left: 0;
    }

    &--allday {
        :not(.mobile &) {
            margin-bottom: 6px;
        }
    }

    &--timed {
        :not(.mobile &) {
            margin-bottom: 6px;
        }
    }
}
</style>
