import {
    add,
    compareAsc,
    differenceInSeconds,
    endOfMonth,
    endOfWeek,
    formatRelative,
    getDayOfYear,
    getYear,
    isBefore,
    isEqual,
    isSameDay,
    isSameYear,
    setDayOfYear,
    setYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    sub,
    parse,
    isAfter,
    isSameMonth,
    setHours,
    setMinutes,
    setSeconds,
    endOfDay,
    differenceInDays,
} from 'date-fns';
import {
    format,
    formatInTimeZone,
    utcToZonedTime,
    zonedTimeToUtc,
} from 'date-fns-tz';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { datetime, RRule } from 'rrule';
import ENGLISH from 'rrule/dist/esm/nlp/i18n';
import { v4 } from 'uuid';
import { enUS } from 'date-fns/esm/locale';
import { ITask, TaskDateObject } from '~/components/task/model';
import { IEvent } from '~/@types';
import { deserializeTaskDateObject } from '~/store/tasks';
import { IDocument } from '~/components/document/model';
import { IntegrationType } from '~/constants';

export enum TimeFormat {
    HOUR_12 = 'HOUR_12',
    HOUR_24 = 'HOUR_24',
}

export enum ThemeOptions {
    DARK = 'DARK',
    LIGHT = 'LIGHT',
    OS = 'OS',
}

export enum DateFormat {
    US = 'US',
    EU = 'EU',
}

export type DateTimeOptions = {
    timeFormat: TimeFormat;
    dateFormat: DateFormat;
    showMeridiem?: boolean;
    isSameMonth?: boolean;
    showYear?: boolean;
    isNear?: boolean;
};

export const CANCELLED_EXCEPTION_TYPE = 'exception_cancelled';

export const localizedRelativeFormat = (
    date: Date,
    baseDate: Date,
    timeFormat: TimeFormat = TimeFormat.HOUR_12,
) => {
    const tFormat = timeFormat === TimeFormat.HOUR_24 ? 'H:mm' : 'h:mm aa';

    const formatRelativeLocale: Record<string, string> = {
        lastWeek: `'last' eeee 'at' ${tFormat}`,
        yesterday: `'yesterday at' ${tFormat}`,
        today: `'today at' ${tFormat}`,
        tomorrow: `'tomorrow at' ${tFormat}`,
        nextWeek: `eeee 'at' ${tFormat}`,
        other: 'P', // localized date
    };

    return formatRelative(date, baseDate, {
        locale: {
            ...enUS,
            formatRelative: (token: string) => formatRelativeLocale[token],
        },
    });
};

export const formatDailyDoc = (dailyDoc: string) => {
    return format(
        parse(dailyDoc, 'yyyy-MM-dd', new Date()),
        'EEEE, LLL d, yyyy',
    );
};

export const getNewCount = (event: IEvent, dateUntil: Date): number => {
    const rruleString = event
        .recurrence!.find(rule => {
            if (!isString(rule)) return false;
            return rule.toLowerCase().startsWith('rrule:');
        })
        ?.replace('RRULE:', '');
    if (!rruleString) return 0;
    const rule = RRule.fromString(rruleString);
    const start = extractDate(event.start);
    const originalCount = rule.options.count!;
    return originalCount - rule.between(start, dateUntil, true).length;
};

export const createRecurrentTaskId = (parentId: string, date: Date): string => {
    return `${parentId}__${format(
        add(date, { minutes: date.getTimezoneOffset() }),
        'yyyy-MM-dd',
        {
            timeZone: 'UTC',
        },
    )}`;
};

export const getDateInDailyDocFormat = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

export const getDateAsDailyDocTitle = (date: Date): string => {
    return format(date, 'EEEE, LLL d, yyyy');
};

export const getDateFromId = (id: string): Date | null => {
    const [_, stringDate] = id.split('__');
    if (!stringDate) return null;
    const date = parse(stringDate, 'yyyy-MM-dd', new Date());
    return utcToZonedTime(date, currentTimezone());
};

export const dailyDocToDate = (dailyDoc: string): Date => {
    return parse(dailyDoc, 'yyyy-MM-dd', new Date());
};

export const createRecurrentTaskNext = (
    task: ITask,
    date: Date,
): ITask | null => {
    const utcDate = datetime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
    );
    if (!task.rrule || !task.start) {
        return null;
    }
    const rule = parseRrule(task);
    if (!rule) return null;
    const utcDateAfter: Date | null = rule.after(utcDate, true);
    if (!utcDateAfter) return null;

    return createRecurrentTaskObject(task, utcDateAfter!);
};

export const parseRrule = (task: ITask) => {
    let rrule = task.rrule;
    if (!rrule || rrule.startsWith('EXDATE')) {
        return null;
    }
    rrule = rrule.replace('RRULE:', '');

    rrule = `DTSTART=${format(extractDate(task.start), 'yyyyMMdd')}\n${rrule}`;
    if (rrule.includes('YEARLY')) {
        rrule = rrule
            .split(';')
            .filter((part: string) => !part.includes('BY'))
            .join(';');
    }
    return RRule.fromString(rrule);
};

export const createRecurrentTaskBefore = (
    task: ITask,
    date: Date,
): ITask | null => {
    const utcDate = datetime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
    );
    if (!task.rrule || !task.start) {
        return null;
    }
    const rule = parseRrule(task);
    if (!rule) return null;
    const utcDateAfter = rule.before(utcDate, true);
    if (!utcDateAfter) return null;
    return createRecurrentTaskObject(task, utcDateAfter);
};

export const createRecurrentTaskRange = (
    task: ITask,
    range: {
        start: Date;
        end: Date;
    },
) => {
    if (!task.rrule || !task.start) {
        return [];
    }

    const startTimezoned = sub(new Date(range.start), { days: 1 }); // 24.4 00:00:00
    const endTimezoned = add(new Date(range.end), { days: 1 }); // 26.4 59:59:999999
    const start = datetime(
        startTimezoned.getFullYear(),
        startTimezoned.getMonth() + 1,
        startTimezoned.getDate(),
    );
    const end = datetime(
        endTimezoned.getFullYear(),
        endTimezoned.getMonth() + 1,
        endTimezoned.getDate(),
    );
    const rule = parseRrule(task);
    if (!rule) return [];
    return rule
        .between(start, end, true)
        .map((date: Date) => {
            return createRecurrentTaskObject(task, date);
        })
        .filter((t: ITask | null) => !!t);
};

export const createRecurrentTaskObject = (task: ITask, date: Date): ITask => {
    return {
        ...task,
        id: createRecurrentTaskId(task.id, date),
        recurrentId: createRecurrentTaskId(task.id, date),
        rrule: null,
        start: setDate(task.start, date),
        end: task.end ? setDate(task.end, date, true) : null,
        status: 'new',
        canModify: true,
        filepath: undefined,
    };
};

export const createRecurrent = (
    event: IEvent,
    range: {
        start: Date;
        end: Date;
    },
    recurrentIds: {
        id: string;
        acreomRecurringId: string | null;
        originalStartTime: TaskDateObject;
    }[] = [],
) => {
    if (!event.recurrence || event.recurrence.length === 0 || !event.start) {
        return [];
    }
    const start = sub(new Date(range.start), { days: 1 }); // 24.4 00:00:00
    const end = add(new Date(range.end), { days: 1 }); // 26.4 59:59:999999
    const date = new Date(extractDate(event.start));
    let rrule = event.recurrence.find(rule => {
        if (!isString(rule)) return false;
        return rule.toLowerCase().startsWith('rrule:');
    });
    if (!rrule || rrule.startsWith('EXDATE')) {
        return [];
    }
    rrule = rrule.replace('RRULE:', '');

    rrule = `DTSTART=${format(date, 'yyyyMMdd')}\n${rrule}`;
    if (rrule.includes('YEARLY')) {
        rrule = rrule
            .split(';')
            .filter(part => !part.includes('BY'))
            .join(';');
    }
    const rule = RRule.fromString(rrule);

    const idBase = event.id;
    if (!isAllDay(event.start)) {
        return rule
            .between(start, end, true)
            .map((date: Date) => {
                date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
                const recurrentTask = createRecurrentEvent(
                    idBase as string,
                    event,
                    date,
                );
                if (
                    recurrentIds.some(({ originalStartTime }) => {
                        return isSameDay(
                            extractDate(
                                deserializeTaskDateObject(
                                    recurrentTask.originalStartTime,
                                ),
                            ),
                            extractDate(
                                deserializeTaskDateObject(originalStartTime),
                            ),
                        );
                    })
                ) {
                    return null;
                }
                return recurrentTask;
            })
            .filter((t: any) => !!t);
    }
    const eventDuration = differenceInDays(
        extractDate(event.end),
        extractDate(event.start),
    );
    const rangesOverlap = (rangeLeft: any, rangeRight: any) => {
        // startLeft <= EndRight && EndLeft >= StartRight == !(StartLeft > EndRight) && !(EndLeft < StartRight)
        return (
            !isBefore(rangeRight.end, rangeLeft.start) &&
            !isAfter(rangeRight.start, rangeLeft.end)
        );
    };

    const relevantRecurrences = rule
        //  assuming you cant have the event begin again within its own duration
        .between(
            sub(new Date(range.start), { days: eventDuration }),
            sub(end, { days: 1 }),
        )
        .filter((date: Date) => {
            const occurrenceRange = {
                start: startOfDay(date),
                end: add(endOfDay(date), { days: eventDuration - 1 }),
            };
            return rangesOverlap(occurrenceRange, range);
        });

    return relevantRecurrences
        .map((date: Date) => {
            date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
            const recurrentTask = createRecurrentEvent(
                idBase as string,
                event,
                date,
                eventDuration - 1,
            );
            if (
                recurrentIds.some(({ originalStartTime }) => {
                    return isSameDay(
                        extractDate(
                            deserializeTaskDateObject(
                                recurrentTask.originalStartTime,
                            ),
                        ),
                        extractDate(
                            deserializeTaskDateObject(originalStartTime),
                        ),
                    );
                })
            ) {
                return null;
            }
            return recurrentTask;
        })
        .filter((t: any) => !!t);
};

const createRecurringSuffix = (date: TaskDateObject): string => {
    if (date?.date) {
        return format(date.date, 'yyyyMMdd');
    }
    if (date?.dateTime) {
        return formatInTimeZone(date.dateTime, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
    }
    return '';
};

export const parseRecurringSuffix = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    return dateStr.includes('T')
        ? parse(dateStr, "yyyyMMdd'T'HHmmss'Z'", new Date())
        : parse(dateStr, 'yyyyMMdd', new Date());
};

export const createRecurrentEvent = (
    recurringEventId: string,
    event: IEvent,
    date: Date,
    duration: number = 0,
) => {
    // const date = setDate(event.start, date);
    let id = v4();
    if (event.integrationType === IntegrationType.GOOGLE_CALENDAR) {
        const recurringIdSuffix = createRecurringSuffix(
            setEventDate(event.start, date),
        );
        id = `${event.id}_${recurringIdSuffix}`;
        return {
            ...event,
            id,
            acreomRecurringId: recurringEventId,
            recurrence: null,
            recurringEventId: event.remoteId,
            remoteId: null,
            start: setEventDate(event.start, date),
            end: setEventDate(event.end, date, duration + 1),
            originalStartTime: setEventDate(event.start, date),
            status: 'new',
        };
    }
    return {
        ...event,
        id,
        acreomRecurringId: recurringEventId,
        recurrence: null,
        recurringEventId: event.remoteId,
        remoteId: null,
        start: setDate(event.start, date),
        end: setDate(event.end, date, true),
        originalStartTime: setDate(event.start, date),
        status: 'new',
    };
};

export const setDate = (
    dateObj: TaskDateObject,
    date: Date,
    addDay = false,
): TaskDateObject => {
    if (!dateObj) return dateObj;
    const newDateObj = {
        ...dateObj,
    };
    if (dateObj.dateTime) {
        const time = new Date(dateObj.dateTime);
        time.setFullYear(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
        );

        newDateObj.dateTime = time;
    }
    if (dateObj.date) {
        const time = new Date(dateObj.date);
        time.setFullYear(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
        );

        newDateObj.date = addDay ? add(time, { days: 1 }) : time;
    }
    return newDateObj;
};

const setEventDate = (
    dateObj: TaskDateObject,
    date: Date,
    addDays: number = 0,
): TaskDateObject => {
    if (!dateObj) return dateObj;
    const newDateObj = {
        ...dateObj,
    };
    if (dateObj.dateTime) {
        const time = new Date(dateObj.dateTime);
        time.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

        newDateObj.dateTime = time;
    }
    if (dateObj.date) {
        const time = new Date(dateObj.date);
        time.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

        newDateObj.date = add(time, { days: addDays });
    }
    return newDateObj;
};

export const createRecurrentId = (parentId: string, date: Date): string => {
    return `${parentId}_${format(date, "yyyyMMdd'T'HHmmss")}`;
};

export const toUTCTimestamp = (time: string | Date): Date => {
    return zonedTimeToUtc(time, currentTimezone());
};

export const currentTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const extractDate = (taskDate: TaskDateObject): Date => {
    // TODO: can return null
    return (taskDate?.date || taskDate?.dateTime) as Date;
};

export const hasDateTime = (taskDate: TaskDateObject): boolean => {
    if (taskDate) {
        return !!taskDate.dateTime;
    }

    return false;
};

export const setToDate = (target: Date, date: Date): Date => {
    let output = target;
    output = setYear(output, getYear(date));
    output = setDayOfYear(output, getDayOfYear(date));
    return output;
};

export const setToTime = (target: Date, time: Date) => {
    let output = target;
    output = setHours(output, time.getHours());
    output = setMinutes(output, time.getMinutes());
    output = setSeconds(output, time.getSeconds());
    return output;
};

export const isAllDay = (taskDate: TaskDateObject): boolean => {
    if (taskDate) {
        return !!taskDate.date;
    }

    return false;
};

export const diffInDays = (a: Date, b: Date): number => {
    if (isSameDay(a, b)) return 0;
    return Math.ceil(differenceInSeconds(a, b) / 86_400);
};

export const sortTimedTasks = (
    a: ITask | IEvent | IDocument,
    b: ITask | IEvent | IDocument,
) => {
    return compareAsc(extractDate(a.start), extractDate(b.start));
};

export const isTimed = (task: ITask | IEvent | IDocument): boolean => {
    if (
        task.start &&
        task.end &&
        extractDate(task.start).getDate() !== extractDate(task.end).getDate()
    ) {
        return false;
    } else {
        return !isAllDay(task.start);
    }
};

export const isValidDate = (date: any) => {
    return date instanceof Date && !isNaN(date as any);
};

export const createTaskDateObject = (
    date: Date | null,
    dateTime: Date | null,
    timezone?: string,
) => {
    if (!date && !dateTime) return null;

    return {
        date: isValidDate(date) ? date : null,
        dateTime: isValidDate(dateTime) ? dateTime : null,
        timeZone: timezone ?? currentTimezone(),
    };
};

export const isInRange = (
    task: ITask | IEvent,
    range: {
        start: Date;
        end: Date;
    },
): boolean => {
    const start = extractDate(task.start);
    const end = task.end ? extractDate(task.end) : start;

    if (!start) return false;
    return (
        (start <= range.start && end >= range.end) ||
        (start >= range.start && start < range.end) ||
        (end <= range.end && end > range.start)
    );
};

export const formatRelativeToDate = (
    task: ITask | IEvent | IDocument,
    pointInTime: Date = new Date(),
    _dayName: boolean = true,
    dateTimeOptions: DateTimeOptions = {
        timeFormat: TimeFormat.HOUR_12,
        dateFormat: DateFormat.EU,
    },
): string => {
    task = { ...task };
    return wrapper(task, pointInTime, dateTimeOptions);
};

export const getTaskTimes = (
    task: ITask | IEvent,
    timeFormat: TimeFormat = TimeFormat.HOUR_12,
) => {
    const tFormat = timeFormat === TimeFormat.HOUR_24 ? 'H:mm' : 'hh:mmaa';
    if (task.start?.dateTime && task.end?.dateTime) {
        const start = format(task.start!.dateTime, tFormat);
        const end = format(task.end!.dateTime, tFormat);
        if (start === end) {
            return start;
        }
        return `${start} - ${end}`;
    }

    if (!isNil(task.start?.dateTime)) {
        return format(task.start!.dateTime, tFormat);
    }

    return '';
};

export const getRRuleFormatted = (rrule: string): string => {
    const CUSTOM_ENGLISH = {
        ...ENGLISH,
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
    };

    return RRule.fromString(rrule).toText(id => {
        return id.toString();
    }, CUSTOM_ENGLISH as any);
};

export const wrapper = (
    task: ITask | IEvent | IDocument,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    if (
        // @ts-ignore
        (task.recurrence && task.recurrence.length > 0) ||
        !isNil((task as ITask).rrule)
    ) {
        // @ts-ignore
        return formatRecurrent(task, pointInTime, dateTimeOptions);
    }

    /* format tasks */
    if (!isNil(task.start?.date) && isNil(task.end?.date)) {
        return formatAllDay(task.start!.date, pointInTime, dateTimeOptions);
    }

    if (!isNil(task.start?.dateTime) && isNil(task.end?.dateTime)) {
        return formatStart(task.start!.dateTime, pointInTime, dateTimeOptions);
    }

    /* format events */
    if (!isNil(task.start?.date) && !isNil(task.end?.date)) {
        return formatAllDayRange(
            task.start!.date,
            sub(task.end!.date, { days: 1 }),
            pointInTime,
            dateTimeOptions,
        );
    }

    if (!isNil(task.start?.dateTime) && !isNil(task.end?.dateTime)) {
        return formatRange(
            { start: task.start!.dateTime, end: task.end!.dateTime! },
            pointInTime,
            dateTimeOptions,
        );
    }

    return '';
};

const formatRecurrent = (
    task: ITask | IEvent,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
) => {
    if (!task.start) return '';
    let rrule = '';
    if (!isNil((task as ITask).rrule)) {
        rrule = (task as ITask).rrule!;
    }
    const recurringBase = getRRuleFormatted(rrule);
    if (!isAllDay(task.start)) {
        const start = extractDate(task.start);
        const end = extractDate(task.end || task.start);
        const showBothMeridiems = format(start, 'aa') !== format(end, 'aa');
        const timeStart = getFormattedTime(start, {
            ...dateTimeOptions,
            showMeridiem: showBothMeridiems,
        });
        const timeEnd = getFormattedTime(end, {
            ...dateTimeOptions,
            showMeridiem: true,
        });
        if (isEqual(start, end)) {
            return [timeEnd, recurringBase].join(' ');
        }
        const combinedTimes = [timeStart, timeEnd].join('-');
        return [combinedTimes, recurringBase].join(' ');
    }
    return [recurringBase].join(' ');
};

const formatAllDayRange = (
    start: Date,
    end: Date,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    const showYear = !isSameYear(start, end);
    const options = {
        ...dateTimeOptions,
        showYear,
        isNear: isDateNear(start, pointInTime),
    };

    if (
        isSameDay(start, end) &&
        isSameYear(start, end) &&
        isSameMonth(start, end)
    ) {
        return getFormattedDate(start, pointInTime, options);
    }

    if (
        isSameMonth(start, end) &&
        isSameYear(start, end) &&
        isSameYear(start, pointInTime) &&
        !getRelativeDateText(start, pointInTime) &&
        options.isNear
    ) {
        if (options.dateFormat === 'EU') {
            const startDate = format(start, 'd', {
                timeZone: currentTimezone(),
            });
            const formattedEndDate = getFormattedDate(end, pointInTime, {
                ...options,
                isSameMonth: true,
            });
            return [startDate, formattedEndDate].join('-');
        }
        const endDate = format(end, 'd', { timeZone: currentTimezone() });

        const formattedStartDate = getFormattedDate(start, pointInTime, {
            ...options,
            isSameMonth: true,
        });
        return [formattedStartDate, endDate].join('-');
    }

    const formattedStartDate = getFormattedDate(start, pointInTime, options);
    const formattedEndDate = getFormattedDate(end, pointInTime, options);

    return [formattedStartDate, '-', formattedEndDate].join(' ');
};

const formatAllDay = (
    time: Date,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    return getFormattedDate(time, pointInTime, dateTimeOptions);
};

const formatStart = (
    startTime: Date,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    const options = {
        ...dateTimeOptions,
        showMeridiem: true,
    };
    const formattedDate = getFormattedDate(startTime, pointInTime, options);
    const timeStart = getFormattedTime(startTime, options);
    return [formattedDate, timeStart].join(' ');
};

const formatRange = (
    range: {
        start: Date;
        end: Date;
    },
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    const showYear = !isSameYear(range.start, range.end);
    dateTimeOptions = {
        ...dateTimeOptions,
        isNear: isDateNear(range.start, pointInTime),
    };
    if (
        isSameDay(range.start, range.end) &&
        isSameYear(range.start, range.end) &&
        isSameMonth(range.start, range.end)
    ) {
        const formattedDate = getFormattedDate(range.start, pointInTime, {
            ...dateTimeOptions,
            showYear,
        });
        const showBothMeridiems =
            format(range.start, 'aa') !== format(range.end, 'aa');

        const timeStart = getFormattedTime(range.start, {
            ...dateTimeOptions,
            showMeridiem: showBothMeridiems,
        });
        const timeEnd = getFormattedTime(range.end, {
            ...dateTimeOptions,
            showMeridiem: true,
        });
        if (isEqual(range.start, range.end)) {
            return [formattedDate, timeEnd].join(' ');
        }
        const combinedTimes = [timeStart, timeEnd].join('-');
        return [formattedDate, combinedTimes].join(' ');
    }

    const formattedStartDate = getFormattedDate(range.start, pointInTime, {
        ...dateTimeOptions,
        showYear,
    });
    const formattedEndDate = getFormattedDate(range.end, pointInTime, {
        ...dateTimeOptions,
        showYear,
    });
    const formattedStartTime = getFormattedTime(range.start, {
        ...dateTimeOptions,
        showMeridiem: true,
    });
    const formattedEndTime = getFormattedTime(range.end, {
        ...dateTimeOptions,
        showMeridiem: true,
    });

    return [
        formattedStartDate,
        formattedStartTime,
        '-',
        formattedEndDate,
        formattedEndTime,
    ].join(' ');
};

const getRelativeDateText = (time: Date, pointInTime: Date): string => {
    const pitAfter: Date = add(pointInTime, { days: 1 });
    const pitBefore: Date = sub(pointInTime, { days: 1 });

    if (isSameDay(time, pointInTime)) return 'today';
    if (isSameDay(time, pitAfter)) return 'tomorrow';
    if (isSameDay(time, pitBefore)) return 'yesterday';
    return '';
};

const isDateNear = (date: Date, pointInTime: Date): boolean => {
    return (
        !isAfter(date, add(pointInTime, { weeks: 2 })) &&
        !isBefore(date, startOfDay(pointInTime))
    );
};

const getFormattedDate = (
    date: Date,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    const relativeDateName = getRelativeDateText(date, pointInTime);
    if (relativeDateName) {
        return relativeDateName;
    }

    const showYear = dateTimeOptions.showYear
        ? dateTimeOptions.showYear
        : !isSameYear(pointInTime, date);

    if (dateTimeOptions.dateFormat === DateFormat.EU) {
        return format(date, `d MMM${showYear ? ' yyyy' : ''}`, {
            timeZone: currentTimezone(),
        });
    }
    return format(date, `MMM d${showYear ? ', yyyy' : ''}`, {
        timeZone: currentTimezone(),
    });
};

const getTimeFormat = (
    date: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    if (dateTimeOptions.timeFormat === TimeFormat.HOUR_24) {
        return 'H:mm';
    }

    const showMinutes = format(date, 'mm') !== '00';
    return [
        'h',
        showMinutes ? ':mm' : '',
        dateTimeOptions.showMeridiem ? 'aa' : '',
    ].join('');
};

const getFormattedTime = (
    date: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
    const timeFormat = getTimeFormat(date, dateTimeOptions);
    return format(date, timeFormat, { timeZone: 'Etc/GMT0' });
};

export const calendarDateRange = (
    currentDate: Date,
    calendarType: string,
    weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined = 0,
) => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    let output = {
        start,
        end,
    };

    switch (calendarType) {
        case 'day':
            output = {
                start: new Date(start),
                end: new Date(end),
            };
            break;
        case '4day':
            output = {
                start: new Date(start),
                end: add(new Date(end), { days: 3 }),
            };
            break;
        case 'week':
            output = {
                start: startOfWeek(new Date(start), {
                    weekStartsOn: weekStart,
                }),
                end: endOfWeek(new Date(end), {
                    weekStartsOn: weekStart,
                }),
            };
            break;
        case 'month':
            output = {
                start: startOfWeek(startOfMonth(new Date(start)), {
                    weekStartsOn: weekStart,
                }),
                end: endOfWeek(endOfMonth(new Date(start)), {
                    weekStartsOn: weekStart,
                }),
            };
            break;
        default:
            break;
    }
    return output;
};

export const deserializeDates = (entity: any): Record<string, any> => {
    return {
        ...entity,
        start: entity.start ? deserializeTaskDateObject(entity.start) : null,
        end: entity.end ? deserializeTaskDateObject(entity.end) : null,
        updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : new Date(),
        createdAt: entity.createdAt ? new Date(entity.createdAt) : new Date(),
    };
};

const calcZonedDate = (
    date: Date,
    timeZone: string,
    fn: (
        date: Date,
        options?: Record<string, any> | null,
    ) => string | number | Date,
    options: Record<string, any> | null = null,
) => {
    const inputZoned = utcToZonedTime(date, timeZone);
    const fnZoned = options ? fn(inputZoned, options) : fn(inputZoned);
    return zonedTimeToUtc(fnZoned, timeZone);
};

export const getZonedEndOfDay = (date: Date, timeZone: string) => {
    return calcZonedDate(date, timeZone, endOfDay);
};

export const getZonedStartOfDay = (date: Date, timeZone: string) => {
    return calcZonedDate(date, timeZone, startOfDay);
};

export const convertBetweenTimezones = (
    date: Date,
    from: string,
    to: string,
) => {
    return utcToZonedTime(zonedTimeToUtc(date, from), to);
};

export const dateIsWithinRange = (
    date: Date,
    range: { start: Date | null; end: Date | null },
) => {
    if (!range.start) return null;
    if (!range.end) {
        return isSameDay(date, range.start);
    }

    return (
        isSameDay(date, range.start) ||
        isSameDay(date, range.end) ||
        (isAfter(date, range.start) && isBefore(date, range.end))
    );
};
