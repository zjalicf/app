<template>
    <div class="overview page">
        <MobileOverviewHeader
            :show-today="!isToday"
            :is-today="isToday"
            @click:today="onTodayHandler"
            @click:next="onNextDateHandler"
            @click:previous="onPreviousDateHandler"
        />
        <MobileEditor v-if="document.id" :page-id="document.id">
            <template #page-properties>
                <div class="overview__heading">
                    <StarIcon v-if="isToday" class="icon" size="24" />
                    <h2
                        ref="heading is-mobile"
                        :class="{
                            'is-today': isToday,
                            'is-past': isPast,
                        }"
                    >
                        {{ dailyDocTitle }}
                    </h2>
                </div>
                <div
                    v-if="
                        todayTasks.length ||
                        todayEvents.length ||
                        todayPages.length
                    "
                    ref="calendar"
                    class="overview__calendar-wrapper"
                >
                    <TodayTimeline
                        :events="todayEvents"
                        :tasks="todayTasks"
                        :pages="todayPages"
                        @open="toggleTimelinePane"
                    />
                </div>
            </template>
        </MobileEditor>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { differenceInDays, endOfDay, isSameDay, startOfDay } from 'date-fns';

import { isInRange } from '~/helpers/date';
import { IEvent } from '~/@types';
import { transition } from '@/helpers/util';
import StarIcon from '~/components/icons/StarIcon.vue';
import MobileOverviewHeader from '~/components/mobile/common/headers/MobileOverviewHeader.vue';
import { IntegrationType } from '~/constants';
import MobileEditor from '~/components/mobile/common/MobileEditor.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'Overview',
    components: {
        MobileEditor,
        TimelineCurrentView: () =>
            import('~/components/mobile/common/TimelineCurrentView.vue'),
        TodayTimeline: () =>
            import('~/components/mobile/common/TodayTimeline.vue'),
        StarIcon,
        MobileOverviewHeader,
        TaskReview: () => import('~/components/overview/TaskReview.vue'),
    },
    transition,
    head() {
        const title = this.$store.getters['dailyDoc/title'];
        return {
            title: `${title} - My Day - acreom`,
        };
    },
    layout: 'mobile',
})
export default class Overview extends Vue {
    now: Date = new Date();
    interval: any = null;

    $refs!: {
        calendar: HTMLDivElement;
        taskReview: any;
        heading: HTMLElement;
    };

    async toggleTimelinePane() {
        await this.$utils.mobile.closeKeyboard();

        await this.$pane.show({
            component: () =>
                import('~/components/mobile/common/my-day/TimelinePane.vue'),
            bind: {},
            type: 'fullscreen',
            options: {
                initialBreak: 'top',
                dragBy: ['.draggable'],
                showDraggable: false,
                buttonDestroy: true,
                handleKeyboard: false,
                topperOverflow: false,
            },
            on: {},
            onDestroy: () => {
                this.$tracking.trackEventV2(TrackingType.MY_DAY, {
                    action: TrackingAction.CLOSE_TIMELINE,
                    source: TrackingActionSource.MOBILE_BUTTON,
                });
            },
        });

        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.OPEN_TIMELINE,
            source: TrackingActionSource.MOBILE,
        });
    }

    get dailyDocTitle() {
        const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
        const title = this.$store.getters['dailyDoc/title'];
        return width > 250 ? title : title.split(',').slice(0, 2).join(', ');
    }

    get overviewDate() {
        return this.$store.getters['dailyDoc/date'];
    }

    @Watch('overviewDate', { immediate: true })
    onOverviewDateChange(value: Date) {
        this.$store.dispatch('integration/calendarRangeChange', {
            date: value,
            calendarType: '1day',
        });
    }

    get isPast() {
        return (
            differenceInDays(
                startOfDay(this.now),
                startOfDay(this.overviewDate),
            ) > 0
        );
    }

    get isToday() {
        return isSameDay(this.now, this.overviewDate);
    }

    get range() {
        return {
            start: startOfDay(this.overviewDate),
            end: endOfDay(this.overviewDate),
        };
    }

    get showTasks() {
        return this.$store.getters['vaultSettings/tasksInCalendarConfig']
            .visible;
    }

    get showPages() {
        return this.$store.getters['vaultSettings/pagesInCalendarConfig']
            .visible;
    }

    get todayPages() {
        if (!this.showPages) return [];
        return this.$store.getters[`document/agenda`](this.overviewDate).map(
            (page: any) => ({
                ...page,
                type: 'page',
            }),
        );
    }

    get todayTasks() {
        if (!this.showTasks) return [];
        return this.$store.getters[`tasks/agenda`](this.overviewDate).map(
            (task: any) => ({
                ...task,
                type: 'task',
            }),
        );
    }

    get todayEvents() {
        const events = this.$store.getters['event/calendarEventList'](
            this.range,
        )
            .filter(
                (event: any) =>
                    !this.$accessControl.readOnlyAccess ||
                    event.integrationType !== IntegrationType.GOOGLE_CALENDAR,
            )
            .map((event: any) => {
                event.start = event.startObject;
                event.end = event.endObject;

                return event;
            })
            .filter((event: IEvent) => {
                return !event.recurrence || event.recurrence.length === 0;
            })
            .filter((event: any) => {
                return isInRange(
                    {
                        start: event.startObject,
                        end: event.endObject,
                    } as any,
                    this.range,
                );
            })
            .filter((event: any) => {
                const calendar =
                    this.$store.getters['integration/getCalendarByEvent'](
                        event,
                    );
                return !!calendar?.visible || !!calendar?.selected;
            });
        return events;
    }

    get viewDate() {
        return this.$store.getters['dailyDoc/get']; // "YYYY-MM-DD"
    }

    get document() {
        const document = this.$store.getters['document/byDailyDoc'](
            this.viewDate,
        );
        return document || {};
    }

    @Watch('viewDate', { immediate: true })
    onViewDateChange(value: string) {
        const title = this.$store.getters['dailyDoc/title'];
        this.$store.dispatch('document/dailyDoc', { dailyDoc: value, title });
        this.$nuxt.$emit('editor:clear-history');
    }

    onTodayHandler() {
        this.$store.commit('dailyDoc/today');
        this.$store.dispatch(
            'dailyDoc/calendarSetDate',
            new Date(this.$store.getters['dailyDoc/date']),
        );
        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.TODAY,
            source: TrackingActionSource.MOBILE_BUTTON,
        });
    }

    onNextDateHandler() {
        this.$store.commit('dailyDoc/next');
        this.$store.dispatch(
            'dailyDoc/calendarSetDate',
            new Date(this.$store.getters['dailyDoc/date']),
        );
        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.NEXT_DAY,
            source: TrackingActionSource.MOBILE_BUTTON,
        });
    }

    onPreviousDateHandler() {
        this.$store.commit('dailyDoc/previous');
        this.$store.dispatch(
            'dailyDoc/calendarSetDate',
            new Date(this.$store.getters['dailyDoc/date']),
        );
        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.PREVIOUS_DAY,
            source: TrackingActionSource.MOBILE_BUTTON,
        });
    }

    beforeDestroy() {
        this.$nuxt.$off('new-day');
    }

    mounted() {
        if (this.interval) return;
        this.$store.dispatch(
            'dailyDoc/calendarSetDate',
            new Date(this.$store.getters['dailyDoc/date']),
        );

        this.$nuxt.$on('new-day', () => {
            this.now = new Date();
        });

        this.interval = setInterval(() => {
            this.now = new Date();
        }, 5 * 60 * 1000); // every 5 minutes
    }
}
</script>
<style lang="scss" scoped>
.overview {
    height: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 56px calc(100% - 56px);

    &__heading {
        padding: 0 15px;
        display: flex;
        align-items: center;
        user-select: none;
        margin-bottom: 11px;

        h2 {
            @include font-title;
            position: relative;
            font-weight: bold;
            font-size: 20px;
            line-height: 40px;
            color: var(--mobile-pages-header-color);

            &.is-past {
                color: var(--mobile-overview-is-past-text-color);
            }
        }

        .icon {
            margin-right: 8px;
            flex-shrink: 0;
            color: var(--mobile-pages-header-color);
        }
    }

    &__calendar-wrapper {
        background: var(--mobile-overview-bg-color);
        border-radius: 8px;
        padding: 12px 12px;
        margin: 0 15px 16px;
    }

    &__upcoming {
        background: var(--mobile-overview-bg-color);
        position: absolute;
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */
        top: 0;
        left: 0;
        width: 100vw;
        z-index: 1000;
        padding: 8px 32px;
    }
}
</style>
