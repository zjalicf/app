import {
    add,
    differenceInHours,
    differenceInMinutes,
    endOfDay,
    format,
    formatISO,
    isEqual,
    nextFriday,
    nextMonday,
    nextSaturday,
    nextSunday,
    nextThursday,
    nextTuesday,
    nextWednesday,
    parse,
    roundToNearestMinutes,
    startOfDay,
} from 'date-fns';
import { v4 } from 'uuid';
import { EntityController } from '~/plugins/entities/controller';
import { ITask } from '~/components/task/model';
import { IDocument } from '~/components/document/model';
import { PostprocessingMap } from '~/@types/app';
import {
    createTaskDateObject,
    extractDate,
    isAllDay,
    setToDate,
    setToTime,
    TimeFormat,
} from '~/helpers/date';
import { TaskDateObject } from '~/@types';
import { TabType, TaskActions } from '~/constants';
import { fullPageBacklinkRegex } from '~/plugins/entities/page';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export const taskRegex =
    /<div data-type=['"]taskItemContent['"][^>]+?>(.*?)<\/div>/g;

const listItemRegexp = `<li><div data-type=['"]taskItemContent['"] id=['"]{taskId}['"][^>]+?>(.*?)</div>`;

const getTaskRegExp = (id: string, includeGlobal: boolean) => {
    const regexpBase = listItemRegexp.replace('{taskId}', id).trim();
    return new RegExp(regexpBase, includeGlobal ? 'g' : '');
};

const getProperty = (text: string, property: string) => {
    const match = text.match(new RegExp(`${property}=['"](.*?)['"]`));
    return match?.[1] ?? null;
};

export class TaskController extends EntityController<ITask> {
    protected storeEntity: string = 'tasks';

    byId(id: string) {
        return this.context.store.getters['tasks/byId'](id);
    }

    getPageMap(): {
        [key: string]: string[];
    } {
        return this.context.store.getters['tasks/pageMap'];
    }

    taskRegex(task: Partial<ITask>, includeGlobal: boolean = true) {
        return getTaskRegExp(task.id!, includeGlobal);
    }

    formatStoredDate(date: TaskDateObject) {
        if (!date) return null;
        if (date.date) {
            return `date:${date.date.getTime()}`;
        }
        if (date.dateTime) {
            return `datetime:${date.dateTime.getTime()}`;
        }
        return null;
    }

    parseProperties(match: RegExpMatchArray) {
        const fullMatch = match[0];
        const propertiesMatch =
            fullMatch.match(
                /<div data-type=['"]taskItemContent['"][^>]+?>/,
            )?.[0] ?? '';

        const text = match[1];

        const completed = getProperty(propertiesMatch, 'completed') === 'true';
        const id = getProperty(propertiesMatch, 'id');
        const start = this.context.$entities.task.parseStoredDate(
            getProperty(propertiesMatch, 'start'),
        );
        const end = this.context.$entities.task.parseStoredDate(
            getProperty(propertiesMatch, 'end'),
        );
        const rrule = getProperty(propertiesMatch, 'rrule');

        return {
            id: id || v4(),
            completed,
            start,
            end,
            text,
            rrule,
        };
    }

    createFromProperties(properties: any) {
        const { id, completed, start, end, text, rrule } = properties;
        const task = [
            `<li><div data-type="taskItemContent" id="${id}" completed="${completed}"`,
        ];
        if (start) {
            task.push(`start="${this.formatStoredDate(start)}"`);
        }
        if (end) {
            task.push(`end="${this.formatStoredDate(end)}"`);
        }
        if (rrule) {
            task.push(`rrule="${rrule}"`);
        }
        return task.join(' ') + `>${text}</div></li>`;
    }

    addTaskToContent(content: string, taskHtml: string): string {
        if (content.startsWith('<ul>') || content.startsWith('<ol>')) {
            return content.replace(/(<(?:ul>)|(?:ol>))/, `$1${taskHtml}`);
        }
        return `<ul>${taskHtml}</ul>${content}`;
    }

    toNodeAttributes(task: Partial<ITask>): any {
        const attributes: any = {
            id: task.id,
            completed: task.completed,
        };
        if ('start' in task) {
            attributes.start = this.parseDateToAttribute(task.start!);
        }
        if ('end' in task) {
            attributes.end = this.parseDateToAttribute(task.end!);
        }
        if ('rrule' in task) {
            attributes.rrule = task.rrule;
        }
        return attributes;
    }

    parseDateToAttribute(dateObj: TaskDateObject): string | null {
        if (!dateObj || !extractDate(dateObj)) return null;
        if (dateObj.date) {
            return `date:${extractDate(dateObj).getTime()}`;
        }
        return `dateTime:${extractDate(dateObj).getTime()}`;
    }

    parseStoredDate(date: string | null) {
        if (!date) return null;
        const [type, value] = date.split(':');
        if (type === 'date') {
            return createTaskDateObject(new Date(parseInt(value)), null);
        }
        return createTaskDateObject(null, new Date(parseInt(value)));
    }

    isRecurrentException(task: Partial<ITask>) {
        return task.id?.includes('__');
    }

    updateTask(task: Partial<ITask>) {
        this.context.store.dispatch('tasks/update', task);
        if (this.isRecurrentException(task)) {
            this.context.$entities.page.updateRecurringException(task);
            return;
        }
        const updateProperties = [
            'completed',
            'localCompleted',
            'start',
            'end',
            'rrule',
        ];
        const shouldUpdatePage = updateProperties.some(key => key in task);
        if (!shouldUpdatePage) return;
        this.updateTaskInPage(task);
    }

    updateTaskInPage(task: Partial<ITask>) {
        const pageId = this.getPageMap()[task.id!]?.[0];
        if (!pageId) return;
        const propertiesMap = {
            id: task.id,
        };
        for (const key of Object.keys(task)) {
            // @ts-ignore
            propertiesMap[key] = task[key];
        }
        return this.updatePageWithTask(pageId, propertiesMap);
    }

    updatePageWithTask(pageId: string, properties: any) {
        const page = this.context.$entities.page.byId(pageId);
        if (!page || !page.content) return;
        const selector = this.taskRegex(properties, false);
        const match = page.content.match(selector);
        if (!match) return;
        const parsedProperties = this.parseProperties(match);
        const mergedProperties = { ...parsedProperties, ...properties };

        return this.context.$entities.page.writeTaskToPage(
            page,
            mergedProperties,
        );
    }

    createTaskHtml(id: string) {
        return `<ul><li><div data-type="taskItemContent" id="${id}"></div></li></ul>`;
    }

    postprocessTasks(
        map: {
            pageId: string;
            oldData: Partial<PostprocessingMap>;
            data: Partial<PostprocessingMap>;
        },
        page: IDocument,
    ) {
        const oldTasks: string[] = (map.oldData.tasks as string[]) ?? [];
        const newTasks: string[] = (map.data.tasks as string[]) ?? [];

        const addedTasks = newTasks.filter(
            (task: string) => !oldTasks.includes(task),
        );
        const removedTasks = oldTasks.filter(
            (task: string) => !newTasks.includes(task),
        );
        const updatedTasks =
            oldTasks.filter(
                task =>
                    oldTasks.includes(task) &&
                    newTasks.includes(task) &&
                    this.context.$entities.task.byId(task)?.hash !==
                        map.data.fullTasks![task]?.hash,
            ) ?? [];

        if (!addedTasks.length && !updatedTasks.length && !removedTasks.length)
            return;

        if (updatedTasks.length) {
            updatedTasks.forEach(task => {
                this.saveToStore(map.data.fullTasks![task]);
            });
        }

        if (addedTasks.length) {
            addedTasks.forEach(task => {
                const taskObj = map.data.fullTasks![task];
                this.saveToStore(taskObj);
                this.context.store.commit('document/addToTaskMap', {
                    tasks: [task],
                    doc: page,
                });
                this.context.store.commit('tasks/addToPageMap', {
                    tasks: [task],
                    page,
                });
            });
        }

        if (removedTasks.length) {
            this.context.store.commit('document/removeFromTaskMap', {
                tasks: removedTasks,
                doc: page,
            });
            this.context.store.commit('tasks/removeFromPageMap', {
                tasks: removedTasks,
                page,
            });

            // TODO: remove only tasks that do not have any entries in tasks/pageMap.
            const tasksToDelete = removedTasks.filter((id: string) => {
                const pages = this.getPageMap()[id];
                return !pages?.length;
            });

            this.context.store.commit('tasks/delete', tasksToDelete);
        }
    }

    setToDate(task: Partial<ITask>, newDate: Date): Partial<ITask> {
        const allDay = isAllDay(task.start!);
        const dateTimeObj: {
            start: TaskDateObject;
            end: TaskDateObject;
        } = {
            start: createTaskDateObject(newDate, null),
            end: null,
        };
        if (task.start) {
            const date = setToDate(extractDate(task.start), newDate);
            const taskObj = allDay
                ? createTaskDateObject(date, null)
                : createTaskDateObject(null, date);
            dateTimeObj.start = {
                ...task.start,
                ...taskObj,
            };
        }
        if (task.end) {
            const minutes = differenceInMinutes(
                extractDate(task.end),
                extractDate(task.start!),
            );
            const date = add(setToDate(extractDate(task.start!), newDate), {
                minutes,
            });
            const taskObj = allDay
                ? createTaskDateObject(date, null)
                : createTaskDateObject(null, date);
            dateTimeObj.end = {
                ...task.end,
                ...taskObj,
            };
        }

        return {
            ...task,
            ...dateTimeObj,
        };
    }

    moveToDate(task: Partial<ITask> | null, newDate: Date, data: any = {}) {
        if (!task) return;
        const dateTimeObj = this.setToDate(task, newDate);
        this.updateTask({
            ...task,
            id: task.id,
            ...dateTimeObj,
        });

        this.context.$tracking.trackEvent('task', { action: 'schedule' });

        if (this.context.$config.platform === 'mobile') return;

        window.$nuxt.$notification.show({
            component: () =>
                import('@/components/notifications/TaskNotification.vue'),
            bind: {
                task: { ...task, ...dateTimeObj },
                action: TaskActions.SCHEDULE,
            },
        });
    }

    createDateTimeObject(
        task: Partial<ITask>,
        {
            start,
            end,
        }: {
            start: Date | null;
            end: Date | null;
        },
    ): {
        start: TaskDateObject | null;
        end: TaskDateObject | null;
    } {
        const taskStart = task.start ? extractDate(task.start) : null;
        if (!taskStart)
            return {
                start: createTaskDateObject(null, start),
                end: createTaskDateObject(null, end),
            };
        const dateTimeObj: {
            start: TaskDateObject;
            end: TaskDateObject | null;
        } = {
            start: createTaskDateObject(taskStart, null),
            end: null,
        };
        if (start) {
            const newStart = setToTime(taskStart, start);
            dateTimeObj.start = createTaskDateObject(null, newStart);
        }
        if (end) {
            const newEnd = setToTime(taskStart, end);
            dateTimeObj.end = createTaskDateObject(null, newEnd);
        }
        return dateTimeObj;
    }

    clearDateTime(task: Partial<ITask>): {
        start: TaskDateObject | null;
        end: TaskDateObject | null;
    } {
        const taskStart = task.start
            ? startOfDay(extractDate(task.start))
            : null;
        return {
            start: taskStart ? createTaskDateObject(taskStart, null) : null,
            end: null,
        };
    }

    setTime(
        task: Partial<ITask>,
        {
            start,
            end,
        }: {
            start: Date | null;
            end: Date | null;
        },
        data: any = {},
    ) {
        const dateTimeObj = this.createDateTimeObject(task, { start, end });
        this.updateTask({
            ...task,
            id: task.id,
            ...dateTimeObj,
        });
        this.context.$tracking.trackEvent('task', {
            action: 'set-time',
            origin: data.origin,
            tabType: data.tabType,
        });
    }

    getRecurringExceptions(id: string) {
        return this.context.store.getters['tasks/recurringExceptionsById'](id);
    }

    setRecurrence(task: Partial<ITask>, rrule: string | null) {
        if (rrule === null) {
            const recurringExceptions = this.getRecurringExceptions(task.id!);
            this.context.store.commit(
                'tasks/delete',
                recurringExceptions.map((t: Partial<ITask>) => t.id),
            );
            this.context.$entities.page.removeFromExceptions(
                recurringExceptions,
            );
            this.context.$tracking.trackEvent('task', {
                action: 'recurrence-remove',
            });
        } else {
            this.context.$tracking.trackEvent('task', {
                action: 'recurrence-add',
            });
        }
        this.updateTask({
            ...task,
            id: task.id,
            rrule,
        });
    }

    clearDate(task: Partial<ITask>, data: any = {}) {
        this.updateTask({
            ...task,
            id: task.id,
            start: null,
            end: null,
            rrule: null,
        });
        this.context.$tracking.trackEvent('task', {
            action: 'clear-date',
            origin: data.origin,
            tabType: data.tabType,
        });
    }

    clearTime(task: Partial<ITask>, data: any = {}) {
        const dateTimeObj = this.clearDateTime(task);
        this.updateTask({
            ...task,
            id: task.id,
            ...dateTimeObj,
        });
        this.context.$tracking.trackEvent('task', {
            action: 'clear-time',
            origin: data.origin,
            tabType: data.tabType,
        });
    }

    setToday(task: Partial<ITask>, data: any = {}) {
        const date = new Date();
        this.moveToDate(task, date);
        if (data.origin) {
            this.context.$tracking.trackEvent('task', {
                action: 'reschedule',
                origin: data.origin,
                tabType: data.tabType,
            });
        }
    }

    setTomorrow(task: Partial<ITask>, data: any = {}) {
        const date = new Date();
        const tomorrow = add(date, { days: 1 });
        this.moveToDate(task, tomorrow);
        if (data.origin) {
            this.context.$tracking.trackEvent('task', {
                action: 'reschedule',
                origin: data.origin,
                tabType: data.tabType,
            });
        }
    }

    setDateToNextWeek(task: Partial<ITask>) {
        const starts = [
            nextSunday,
            nextMonday,
            nextTuesday,
            nextWednesday,
            nextThursday,
            nextFriday,
            nextSaturday,
        ];
        const nextWeek = starts[
            this.context.store.getters['appSettings/calendarOptions']
                .weekdayStart
        ](new Date());
        return this.setToDate(task, nextWeek);
    }

    setNextWeek(task: Partial<ITask>, data: any = {}) {
        const starts = [
            nextSunday,
            nextMonday,
            nextTuesday,
            nextWednesday,
            nextThursday,
            nextFriday,
            nextSaturday,
        ];
        const date = new Date();
        const nextWeek =
            starts[
                this.context.store.getters['appSettings/calendarOptions']
                    .weekdayStart
            ](date);
        this.moveToDate(task, nextWeek);
        if (data.origin) {
            this.context.$tracking.trackEvent('task', {
                action: 'reschedule',
                origin: data.origin,
                tabType: data.tabType,
            });
        }
    }

    setDate(task: Partial<ITask>, date: Date, data: any = {}) {
        this.moveToDate(task, date, data);
        if (data.origin) {
            this.context.$tracking.trackEvent('task', {
                action: 'reschedule',
                origin: data.origin,
                tabType: data.tabType,
            });
        }
    }

    getTaskPage(task: Partial<ITask>): IDocument | null {
        let id = task.id!;
        let date = null;
        if (this.isRecurrentException(task)) {
            [id, date] = task.recurrentId!.split('__');

            if (date) return { dailyDoc: date } as any;
        }

        const isMyDayTask =
            this.context.store.getters['document/dailyDocsByTaskId'](id);

        if (isMyDayTask.length) {
            return this.context.$entities.page.byId(
                isMyDayTask[0].id,
            ) as IDocument | null;
        }
        return this.context.$entities.page.byId(
            this.context.store.getters['document/taskMap'][id!],
        ) as IDocument | null;
    }

    async showInContextMobile(task: Partial<ITask>) {
        const page = this.getTaskPage(task);
        if (!page) return;
        const myDayDate = page.dailyDoc;
        if (!page && !myDayDate) return;
        await window.$nuxt.$pane.hideAll();
        if (myDayDate) {
            await window.$nuxt.$router.push({
                path: `/`,
            });
            this.context.store.commit('dailyDoc/setFromString', myDayDate);
            setTimeout(() => {
                window.$nuxt.$emit(`focus-task:${task.id}`);
            }, 200);
            return;
        }
        await window.$nuxt.$router.push({
            path: `/mobile/documents/${page.id}`,
            query: {
                focus: task.id,
            },
        });
    }

    showInContextDesktop(task: Partial<ITask>) {
        const page = this.getTaskPage(task);
        if (!page) return;
        this.context.$dropdown.hideAll();

        const myDayDate = page.dailyDoc;
        if (!page && !myDayDate) return;

        if (myDayDate) {
            const activeTab = this.context.$utils.navigation.activeTab;
            const myDayActive = activeTab?.type === TabType.MY_DAY;
            const panelOpen = myDayActive && activeTab?.data?.panelOpen;
            this.context.$tracking.trackEventV2(TrackingType.MY_DAY, {
                source: TrackingActionSource.FOCUS_TASK,
                action: TrackingAction.OPEN,
            });
            return this.context.$entities.myDay.open({
                data: {
                    date: parse(myDayDate, 'yyyy-MM-dd', new Date()),
                    focus: task.id,
                    panelOpen,
                },
            });
        }

        const tab = this.context.$tabs.createNewTabObject(
            page.id,
            TabType.DOCUMENT,
            {
                focus: task.id,
            },
        );
        this.context.$tabs.openTab(tab);
    }

    showInContext(task: Partial<ITask>, trackingSource?: TrackingActionSource) {
        if (!task || !task.id) return;

        this.context.$tracking.trackEventV2(TrackingType.TASK, {
            action: TrackingAction.FOCUS,
            source: trackingSource,
        });

        if (this.context.$utils.isMobile) {
            this.showInContextMobile(task);
            return;
        }
        this.showInContextDesktop(task);
    }

    timeFormat() {
        const tFormat =
            this.context.store.getters['appSettings/dateTimeOptions']
                .timeFormat;

        return tFormat === TimeFormat.HOUR_24 ? 'H:mm' : 'h:mmaa';
    }

    getClosestValidTime() {
        return formatISO(
            roundToNearestMinutes(new Date(), {
                nearestTo: 15,
            }),
        );
    }

    getStartTimes() {
        const getLabel = (time: Date) => {
            if (isEqual(time, startOfDay(time))) return 'Start of Day';
            if (isEqual(time, endOfDay(time))) return 'End of Day';
            return format(time, this.timeFormat());
        };
        const startTime = new Date();
        startTime.setHours(0, 0, 0, 0); // Set to 12:00 am
        const endTime = new Date();
        endTime.setHours(23, 45, 0, 0); // Set to 11:45 pm
        // Calculate t-he number of increments
        const numIncrements =
            Math.ceil(
                ((endTime as unknown as number) -
                    (startTime as unknown as number)) /
                    (15 * 60 * 1000),
            ) + 1;
        // Generate the date increments
        const dateIncrements = [];
        for (let i = 0; i < numIncrements; i++) {
            const incrementTime = new Date(
                startTime.getTime() + i * 15 * 60 * 1000,
            );
            dateIncrements.push({
                id: formatISO(incrementTime),
                label: getLabel(incrementTime),
            });
        }
        dateIncrements.push({
            id: formatISO(endOfDay(startTime)),
            label: getLabel(endOfDay(startTime)),
        });
        return dateIncrements;
    }

    getEndTimes(startTime: Date) {
        const getLabel = (time: Date) => {
            if (isEqual(time, startOfDay(time))) return 'Start of Day';
            if (isEqual(time, endOfDay(time))) return 'End of Day';
            return format(time, this.timeFormat());
        };
        const updateIncrements = (
            startTime: Date,
            incrementTime: Date,
            increments: any[],
        ) => {
            const startDeltaHours = differenceInHours(incrementTime, startTime);
            const startDeltaMinutes =
                differenceInMinutes(incrementTime, startTime) % 60;
            const startDeltaString = [];
            if (startDeltaHours > 0) {
                startDeltaString.push(
                    `${startDeltaHours}hr${startDeltaHours > 1 ? 's' : ''}`,
                );
            }
            if (startDeltaMinutes > 0) {
                startDeltaString.push(`${startDeltaMinutes}mins`);
            }
            increments.push({
                id: formatISO(incrementTime),
                label: `${getLabel(incrementTime)} — ${startDeltaString.join(
                    ' ',
                )}`,
            });
        };
        const endTime = endOfDay(startTime);
        // Calculate the number of increments
        const numIncrements =
            Math.ceil(
                ((endTime as unknown as number) -
                    (startTime as unknown as number)) /
                    (30 * 60 * 1000),
            ) + 1;
        // Generate the date increments
        const dateIncrements: any[] = [];
        for (let i = 1; i < 4; i++) {
            const incrementTime = new Date(
                startTime.getTime() + i * 15 * 60 * 1000,
            );
            updateIncrements(startTime, incrementTime, dateIncrements);
        }
        for (let i = 2; i < numIncrements - 1; i++) {
            const incrementTime = new Date(
                startTime.getTime() + i * 30 * 60 * 1000,
            );
            updateIncrements(startTime, incrementTime, dateIncrements);
        }
        updateIncrements(startTime, endOfDay(startTime), dateIncrements);
        return dateIncrements;
    }

    getSanitizedTaskText(htmlText: string) {
        htmlText = htmlText.replace(
            fullPageBacklinkRegex,
            (_match: string, id: string) => {
                return this.context.$entities.page.displayTitle(id);
            },
        );

        const parser = new DOMParser();
        const html = parser.parseFromString(htmlText, 'text/html');
        const text = html.body.textContent || 'Untitled';
        return text.trim();
    }

    openRecurrentParent(task: ITask) {
        const [id] = task.recurrentId!.split('__');
        const parent = this.context.$entities.task.byId(id);
        if (!parent) return;
        this.showInContext(parent);
    }

    async onCompletedToggle(task: Partial<ITask>, delay?: boolean) {
        if (
            (!this.context.store.getters['tasks/byId'](
                task.recurrentId ?? task.id,
            ) ||
                task.status === 'new') &&
            task.recurrentId
        ) {
            await this.context.store.dispatch('tasks/update', {
                ...task,
            });
        }

        const taskObj: Partial<ITask> = {
            id: task.id,
        };

        const status = !task.completed;

        this.updateTask({ ...taskObj, completed: status });
        this.context.$utils.haptics.light();

        if (delay) {
            this.context.store.dispatch('tasks/queueStatus', {
                id: taskObj.id,
                status,
            });
        } else {
            this.updateTask({
                ...taskObj,
                completed: status,
            });
        }
    }
}
