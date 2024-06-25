<template>
    <div ref="myDayPanelListContent" class="my-day-panel-list">
        <VirtualCollection
            ref="virtualCollection"
            :cell-size-and-position-getter="cellSizeAndPositionGetterList"
            :collection="flatMyDayListData"
            :width="listWidth"
            :height="retrieveHeight"
            :header-slot-height="0"
            class="my-day-panel-list__wrapper"
            :container-padding-bottom="15"
            :scroll-to-bottom-range="retrieveHeight"
            :scroll-top-threshold="88"
            @scrolled-to-bottom="onScrolledBottom"
            @scrolled-to-bottom-range="onScrolledBottom"
            @scrolled-to-top="onScrolledTop"
            @scrolled-to-top-threshold="onScrolledTop"
            @scroll="onScroll"
        >
            <div slot="cell" :ref="`vmdl-${props.data.ref}`" slot-scope="props">
                <MyDayPanelDayHeader
                    v-if="props.data.dayHeader"
                    :day="props.data.day"
                    @open-day="openDay"
                />
                <MyDayPanelTask
                    v-else-if="props.data.type === 'task'"
                    :task="props.data"
                    :now="now"
                    @task:scroll="scrollCalendarTaskIntoView(props.data.ref)"
                    @entity-click="onClick(props.data, $event)"
                />
                <MyDayPanelPage
                    v-else-if="props.data.type === 'page'"
                    :page="props.data"
                    :now="now"
                    @entity-click="onClick(props.data, $event)"
                />
                <MyDayPanelEvent
                    v-else-if="props.data.type === 'event'"
                    :event="props.data"
                    :now="now"
                    @entity-click="onClick(props.data, $event)"
                />
            </div>
        </VirtualCollection>
        <transition name="slide-fade">
            <CButton
                v-if="!selectedDayInView"
                type="primary"
                class="my-day-panel-list__today"
                @click="scrollTodayIntoView"
            >
                <ComputerKeyboardReturn2 class="return-icon" />
                Go To Current Day
            </CButton>
        </transition>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Vue,
    Watch,
} from 'vue-property-decorator';
import {
    add,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    endOfDay,
    format,
    isAfter,
    isBefore,
    isSameDay,
    startOfDay,
    sub,
} from 'date-fns';
import scrollIntoView from 'scroll-into-view';
import { dateIsWithinRange, extractDate, isAllDay } from '~/helpers/date';
import { TabSymbols } from '~/constants/symbols';
import MyDayPanelTask from '~/components/entities/my-day/panel/list/MyDayPanelTask.vue';
import MyDayPanelPage from '~/components/entities/my-day/panel/list/MyDayPanelPage.vue';
import MyDayPanelEvent from '~/components/entities/my-day/panel/list/MyDayPanelEvent.vue';
import { TabType } from '~/constants';
import EventDropdown from '~/components/event/dropdown/EventDropdown.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import MyDayPanelDayHeader from '~/components/entities/my-day/panel/list/MyDayPanelDayHeader.vue';
import { VirtualMyDayHeight } from '~/components/entities/my-day/panel/list/constants';
import { throttle } from '~/helpers';
import MyDayPanelHeader from '~/components/entities/my-day/panel/list/MyDayPanelHeader.vue';
import CButton from '~/components/CButton.vue';
import ComputerKeyboardReturn2 from '~/components/streamline/ComputerKeyboardReturn2.vue';
import { ITask } from '~/components/task/model';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MyDayPanelList',
    components: {
        ComputerKeyboardReturn2,
        CButton,
        MyDayPanelHeader,
        MyDayPanelDayHeader,
        AcreomChevronRight,
        InterfaceFavoriteStar,
        MyDayPanelEvent,
        MyDayPanelPage,
        MyDayPanelTask,
    },
})
export default class MyDayPanelList extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @InjectReactive(TabSymbols.TAB_DATA)
    tabData!: Record<string, any>;

    @Inject(TabSymbols.SET_SCROLL_POSITION)
    setScrollPositions!: (position: number, label?: string) => void;

    @Inject(TabSymbols.GET_SCROLL_POSITION)
    getScrollPosition!: (label?: string) => number;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    $refs!: {
        calendarList: HTMLElement;
        myDayPanelListContent: HTMLElement;
    } & Record<string, any>;

    now: Date = new Date();
    interval: any = null;
    listWidth: number = 0;
    height: number = 0;
    width: number = 0;
    throttledByFps: any = throttle(requestAnimationFrame);
    myDayListResizeObserver: any;
    highlightEntity: string | null = null;
    rangeDate = {
        start: startOfDay(sub(new Date(), { weeks: 1 })),
        end: endOfDay(add(new Date(), { weeks: 4 })),
    };

    scrollDate: Date | null = null;
    currentY: number = 0;

    get selectedDay() {
        return this.flatMyDayListData.find(
            ({ data }: any) => 'day' in data && data.day.isSelected,
        )?.data;
    }

    get selectedDayInView() {
        if (!this.selectedDay) return false;
        return (
            this.selectedDay.y > this.currentY - this.selectedDay.height &&
            this.selectedDay.y < this.currentY + this.height
        );
    }

    get daysInView() {
        return this.flatMyDayListData.filter(
            ({ data }: any) =>
                data.dayHeader &&
                data.y > this.currentY &&
                data.y < this.currentY + this.height,
        );
    }

    get monthInView() {
        const days = this.daysInView;
        const initDay = days[0] ?? null;
        const closestHeader = days.reduce((prev: any, curr: any) => {
            return Math.abs(curr?.data.y ?? this.height - this.currentY) <
                Math.abs(prev?.data.y ?? this.height - this.currentY)
                ? curr
                : prev;
        }, initDay);
        return closestHeader?.data?.day.date ?? new Date();
    }

    get retrieveHeight() {
        return this.height;
    }

    get flatMyDayListData() {
        const data = this.flattenedMyDayList ?? [];

        return data.map((data: any, index: number) => {
            data.index = index;
            return { data };
        });
    }

    get flattenedMyDayList() {
        const dayHeaderHeight = VirtualMyDayHeight.DAY_HEADER;
        const entityHeight = VirtualMyDayHeight.ENTITY;

        const getHeight = (item: any) => {
            if (item.dayHeader) return dayHeaderHeight;
            return entityHeight;
        };

        const eventsByDate = this.eventsByDate;
        const flatStructure: any[] = [];
        for (const day of this.daysInRange) {
            flatStructure.push({
                id: day.id,
                dayHeader: true,
                day,
                ref: day.id,
            });
            const daysEvents = eventsByDate[day.id] ?? [];
            for (const event of daysEvents) {
                const isUpcoming = this.isUpcomingEvent(event);
                let upcomingDelta = null;
                let upcomingDeltaText = null;
                if (isUpcoming) {
                    upcomingDelta = differenceInHours(
                        extractDate(event.startObject),
                        new Date(),
                    );
                    if (upcomingDelta < 1) {
                        upcomingDelta = differenceInMinutes(
                            extractDate(event.startObject),
                            new Date(),
                        );
                        upcomingDeltaText = `in ${upcomingDelta} minute${
                            upcomingDelta !== 1 ? 's' : ''
                        }`;
                    } else {
                        upcomingDeltaText = `in ${upcomingDelta} hour${
                            upcomingDelta !== 1 ? 's' : ''
                        }`;
                    }
                }
                const ref = `${event.id}-${format(day.date, 'yyyy-MM-dd')}`;
                flatStructure.push({
                    id: event.id,
                    ...event,
                    upcomingDelta: upcomingDeltaText,
                    highlight: this.highlightEntity === ref,
                    ref,
                });
            }
        }
        let currentHeight = 0;
        return flatStructure.map((item: any) => {
            const height = getHeight(item);
            const output = {
                height,
                y: currentHeight,
            };
            currentHeight += height;
            return {
                ...item,
                ...output,
            };
        });
    }

    get calendarDate() {
        return startOfDay(this.tabData.date);
    }

    get range() {
        return this.rangeDate;
    }

    get calendarEvents() {
        const tasksVisible =
            this.$store.getters['vaultSettings/tasksInCalendarConfig'].visible;
        const pagesVisible =
            this.$store.getters['vaultSettings/pagesInCalendarConfig'].visible;
        const events = this.$store.getters['event/calendarEventList'](
            this.range,
        ).filter(
            (event: any) =>
                !this.$accessControl.readOnlyAccess ||
                event.integrationType !== 'google_calendar',
        );
        let tasks = [];
        if (tasksVisible) {
            tasks = this.$store.getters['tasks/calendarTaskList'](this.range);
        }
        let pages = [];
        if (pagesVisible) {
            pages = this.$store.getters['document/byRange'](this.range);
        }

        if (!this.tabData?.taskData?.id) {
            const draftingTask = tasks.find(
                (task: any) => task.id === this.tabData.taskData.id,
            );
            if (draftingTask) {
                tasks = tasks.filter(
                    (task: any) => task.id !== draftingTask.id,
                );
                tasks.push({ ...draftingTask, ...this.tabData.taskData });
            }
        }

        return [...events, ...tasks, ...pages];
    }

    get dailyDocsWithContent() {
        return this.$store.getters['document/dailyDocsWithContent'];
    }

    get daysInRange() {
        const dates = [];
        let currentDate = this.range.start;
        while (isBefore(currentDate, this.range.end)) {
            dates.push(currentDate);
            currentDate = add(currentDate, { days: 1 });
        }
        return dates.map(date => {
            const id = format(date, 'yyyy-MM-dd');
            const dailyDocId =
                this.$store.getters['document/dailyDocs'][id] ?? null;
            const dailyDocExists = this.dailyDocsWithContent.find(
                (docDate: string) => docDate === id,
            );
            const dailyDoc = dailyDocExists
                ? this.$store.getters['document/byId'](dailyDocId)
                : null;
            let tasks = {
                completed: 0,
                total: 0,
            };
            if (dailyDoc && dailyDoc.id) {
                const dailyDocTasks = this.$entities.page.getPostprocessingMap(
                    dailyDoc.id,
                ).tasks;
                const completed = dailyDocTasks
                    .map((id: string) => this.$store.getters['tasks/byId'](id))
                    .filter((task: any) => task?.completed ?? false);
                tasks = {
                    completed: completed.length,
                    total: dailyDocTasks.length,
                };
            }
            return {
                date,
                id,
                isSelected: isSameDay(date, this.calendarDate),
                isPast: isBefore(date, startOfDay(new Date())),
                isFuture: isAfter(date, endOfDay(new Date())),
                isToday: isSameDay(date, new Date()),
                hasContent: !!dailyDoc,
                tasks,
            };
        });
    }

    get todaySortedEvents() {
        const todayEvents = this.eventsForDay(this.now).filter(
            event =>
                !isAllDay(event.startObject) &&
                isAfter(extractDate(event.startObject), this.now),
        );
        return todayEvents.sort((a: any, b: any) => {
            const deltaA = differenceInMinutes(
                extractDate(a.startObject),
                this.now,
            );
            const deltaB = differenceInMinutes(
                extractDate(b.startObject),
                this.now,
            );
            return deltaA - deltaB;
        });
    }

    get eventsByDate() {
        const eventsByDate = this.calendarEvents.reduce((acc, event) => {
            const start = extractDate(event.startObject);
            const end = event.endObject
                ? isAllDay(event.startObject)
                    ? sub(extractDate(event.endObject), { days: 1 })
                    : extractDate(event.endObject)
                : null;
            if (!end) {
                const date = format(start, 'yyyy-MM-dd');
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(event);
                return acc;
            }
            const isTheSameDay = isSameDay(start, end);
            if (isTheSameDay) {
                const date = format(start, 'yyyy-MM-dd');
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(event);
                return acc;
            }
            const days = differenceInDays(end, start);
            for (let i = 0; i <= days; i++) {
                const date = format(add(start, { days: i }), 'yyyy-MM-dd');
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(event);
            }
            return acc;
        }, {} as Record<string, any[]>);

        const days = Object.keys(eventsByDate);
        for (const day of days) {
            eventsByDate[day].sort((a: any, b: any) => {
                const startA = extractDate(a.startObject);
                const startB = extractDate(b.startObject);
                if (isAllDay(a.startObject) && isAllDay(b.startObject)) {
                    return 0;
                }
                if (isAllDay(a.startObject) && !isAllDay(b.startObject)) {
                    return -1;
                }
                if (isAllDay(b.startObject) && !isAllDay(a.startObject)) {
                    return 1;
                }
                return isAfter(startA, startB) ? 1 : -1;
            });
        }
        return eventsByDate;
    }

    @Watch('monthInView')
    onMonthChanged(newValue: Date) {
        this.$emit('month-changed', newValue);
    }

    @Watch('flatMyDayListData', { immediate: true })
    onFlatMyDayListDataChanged() {
        if (!this.scrollDate) return;
        const dayId = format(this.scrollDate, 'yyyy-MM-dd');
        const dayOffsetTop = this.calculateDayOffset(dayId);
        if (!dayOffsetTop && dayOffsetTop !== 0) {
            return;
        }
        this.scrollDate = null;
        this.$nextTick(() => {
            this.$refs.virtualCollection.$el.scrollTop =
                this.calculateDayOffset(dayId);
        });
    }

    scrollTodayIntoView() {
        if (!this.selectedDay.y) return;
        this.$refs.virtualCollection.$el.scrollTop = this.selectedDay.y;
    }

    // TODO: maybe throttle this for performance
    onScroll() {
        this.currentY = this.$refs.virtualCollection?.$el?.scrollTop ?? 0;
        this.setScrollPositions(this.currentY, 'my-day-timeline-offset');
    }

    isUpcomingEvent(event: any) {
        const now = new Date();
        const start = extractDate(event.startObject);
        if (!isSameDay(start, now) || isAllDay(event.startObject)) return false;
        return this.todaySortedEvents[0]?.id === event.id;
    }

    eventsForDay(date: Date) {
        return this.calendarEvents
            .filter(event => {
                const start = extractDate(event.startObject);
                const end = extractDate(event.endObject);

                const isAllDayEvent = isAllDay(event.startObject);

                return dateIsWithinRange(date, {
                    start,
                    end: isAllDayEvent ? sub(end, { days: 1 }) : end,
                });
            })
            .sort((a, b) => {
                const startA = extractDate(a.startObject);
                const startB = extractDate(b.startObject);
                if (isAllDay(a.startObject) && isAllDay(b.startObject)) {
                    return 0;
                }
                if (isAllDay(a.startObject) && !isAllDay(b.startObject)) {
                    return -1;
                }
                if (isAllDay(b.startObject) && !isAllDay(a.startObject)) {
                    return 1;
                }
                return isAfter(startA, startB) ? 1 : -1;
            });
    }

    onPageClick(pageId: string, event: MouseEvent) {
        const page = this.$store.getters['document/byId'](pageId);
        const tab = this.$tabs.createNewTabObject(page.id, TabType.DOCUMENT);
        this.$tabs.openTabWithEvent(tab, event);
    }

    onEventClick(event: any) {
        this.highlightEntity = event.ref;
        this.$dropdown.show({
            parent: this.$refs[`vmdl-${event.ref}`],
            component: EventDropdown,
            popperOptions: {
                placement: 'left',
            },
            bind: {
                event,
            },
            onClose: () => {
                this.highlightEntity = null;
            },
        });
    }

    onTaskClick(task: ITask) {
        this.$entities.task.showInContext(task, TrackingActionSource.TIMELINE);
    }

    onClick(entity: any, event: MouseEvent) {
        this.$tracking.trackEventV2(TrackingType.TIMELINE, {
            action: TrackingAction.OPEN_ENTITY,
            source:
                entity.type === 'page'
                    ? TrackingActionSource.PAGE
                    : entity.type === 'event'
                    ? TrackingActionSource.EVENT
                    : TrackingActionSource.TASK,
        });
        if (entity.type === 'page') {
            this.$tracking.trackEventV2(TrackingType.PAGE, {
                action: TrackingAction.OPEN,
                source: TrackingActionSource.TIMELINE,
            });
            this.onPageClick(entity.id, event);
            return;
        }
        if (entity.type === 'event') {
            this.onEventClick(entity);
            return;
        }
        if (entity.type === 'task') {
            this.onTaskClick(entity);
        }
    }

    @TrackEvent(TrackingType.MY_DAY, {
        action: TrackingAction.CHANGE_DAY,
        source: TrackingActionSource.TIMELINE,
    })
    openDay(date: Date) {
        this.updateTabData({
            date,
        });
        this.$store.dispatch('integration/calendarRangeChange', {
            date,
            calendarType: 'week',
        });
    }

    scrollCalendarTaskIntoView(ref: string | null) {
        if (ref && this.$refs[`vmdl-${ref}`]) {
            scrollIntoView(this.$refs[`vmdl-${ref}`], {
                time: 100,
                validTarget: (target: any) => {
                    return (
                        target !== window &&
                        target?.matches('.my-day-panel-list__wrapper')
                    );
                },
            });
        }
    }

    calculateDayOffset(day: string) {
        const targetDay = this.flatMyDayListData.find(
            item => item.data.id === day,
        );
        const scrollOffset = targetDay?.data?.y ?? null;
        return scrollOffset;
    }

    cellSizeAndPositionGetterList(item: any, index: number) {
        const itemHeight = VirtualMyDayHeight.ENTITY;
        const width = this.width;

        const gutter = 32;

        return {
            width: width - gutter,
            height: item.data.height ?? itemHeight,
            x: 0,
            y: item.data.y ?? index * itemHeight,
            style: {
                'padding-left': item.data.type ? '41px' : '0px',
            },
        };
    }

    resizeListener() {
        return new Promise<void>((resolve, _reject) => {
            this.throttledByFps(() => {
                if (!this.$refs.myDayPanelListContent) return;
                const myDayPanelListWidth =
                    this.$refs.myDayPanelListContent.offsetWidth;
                this.width = myDayPanelListWidth;
                this.listWidth = myDayPanelListWidth;
                this.height = this.$refs.myDayPanelListContent.offsetHeight;
                resolve();
            });
        });
    }

    onScrolledBottom() {
        this.rangeDate.end = add(this.rangeDate.end, { weeks: 1 });
        this.setScrollPositions(
            this.rangeDate.end.getTime(),
            'my-day-timeline-end',
        );
        this.$store.dispatch('integration/calendarRangeChange', {
            date: this.rangeDate.end,
            calendarType: 'week',
        });
    }

    onScrolledTop() {
        const oldScrollTop = this.$refs.virtualCollection.$el.scrollTop;
        const oldScrollHeight = this.$refs.virtualCollection.$el.scrollHeight;
        this.rangeDate.start = sub(this.rangeDate.start, { weeks: 1 });
        this.setScrollPositions(
            this.rangeDate.start.getTime(),
            'my-day-timeline-start',
        );
        this.$nextTick(() => {
            this.$refs.virtualCollection.$el.scrollTop =
                oldScrollTop +
                (this.$refs.virtualCollection.$el.scrollHeight -
                    oldScrollHeight);
        });
        this.$store.dispatch('integration/calendarRangeChange', {
            date: this.rangeDate.start,
            calendarType: 'week',
        });
    }

    minDatesToRender() {
        if (!this.$refs.myDayPanelListContent) {
            return 28;
        }
        return (
            Math.ceil(
                this.$refs.myDayPanelListContent.offsetHeight /
                    VirtualMyDayHeight.DAY_HEADER,
            ) + 7
        );
    }

    resolveDefaultScrollPosition() {
        this.rangeDate = {
            start: startOfDay(this.calendarDate ?? new Date()),
            end: endOfDay(
                add(this.calendarDate ?? new Date(), {
                    days: this.minDatesToRender(),
                }),
            ),
        };
        this.setScrollPositions(
            this.rangeDate.start.getTime(),
            'my-day-timeline-start',
        );
        this.setScrollPositions(
            this.rangeDate.end.getTime(),
            'my-day-timeline-end',
        );
        this.scrollToDay(this.calendarDate ?? new Date());
        setTimeout(() => {
            this.setRange(this.calendarDate ?? new Date());
            this.scrollToDay(this.calendarDate ?? new Date());
        }, 300);
    }

    resolveStoredScrollPosition() {
        const scrollTop = this.getScrollPosition('my-day-timeline-offset');
        const start = this.getScrollPosition('my-day-timeline-start');
        const end = this.getScrollPosition('my-day-timeline-end');

        this.rangeDate = {
            start: new Date(start),
            end: new Date(end),
        };

        const timelineObserver = new MutationObserver((mutations, observer) => {
            const addNodeMutation = mutations.find(
                mutation =>
                    mutation.type === 'childList' &&
                    mutation.addedNodes.length > 0,
            );
            if (!addNodeMutation) return;
            this.$refs.virtualCollection.$el.scrollTop = scrollTop;
            observer.disconnect();
        });

        timelineObserver.observe(this.$refs.myDayPanelListContent, {
            childList: true,
            subtree: true,
        });
    }

    resolveScrollPosition() {
        const scrollTop = this.getScrollPosition('my-day-timeline-offset');
        const start = this.getScrollPosition('my-day-timeline-start');
        const end = this.getScrollPosition('my-day-timeline-end');

        if (!scrollTop && !start && !end) {
            return this.resolveDefaultScrollPosition();
        }
        this.resolveStoredScrollPosition();
    }

    scrollToDay(date: Date) {
        this.scrollDate = date;
    }

    registerCalendarDateListener() {
        const key = `${this.tabId}-calendar-date-changed`;
        this.$nuxt.$on(key, (date: Date) => {
            this.setRange(date);
            this.scrollToDay(date);
        });
    }

    setRange(date: Date) {
        this.rangeDate = {
            start: startOfDay(sub(date, { days: 2 })),
            end: endOfDay(
                add(date, {
                    days: this.minDatesToRender(),
                }),
            ),
        };
    }

    beforeDestroy() {
        if (this.myDayListResizeObserver) {
            this.myDayListResizeObserver.disconnect();
        }
    }

    mounted() {
        this.resizeListener();
        this.registerCalendarDateListener();
        this.myDayListResizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.myDayPanelListContent) {
            this.myDayListResizeObserver.observe(
                this.$refs.myDayPanelListContent,
            );
        }

        this.resolveScrollPosition();

        if (!this.calendarDate) return;
        this.$nuxt.$on('new-day', () => {
            this.now = new Date();
        });
        if (this.interval) return;
        this.interval = setInterval(() => {
            this.now = new Date();
        }, 1 * 60 * 1000); // every minute
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-list {
    width: 100%;
    height: calc(100% - 40px);
    position: relative;

    &__wrapper {
        @include scrollbar(0px, 0px, 0px !important, 0px);
        overflow-x: hidden;
        position: relative;
        padding: 0;

        :deep(.vue-virtual-collection-container) {
            margin: 0 auto;
        }
    }

    &__today {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 24px;

        .return-icon {
            transform: scaleY(-1);
        }
    }
}
</style>
