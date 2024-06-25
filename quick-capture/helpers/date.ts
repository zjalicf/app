import {
    add,
    formatRelative,
    isBefore,
    isEqual,
    isSameDay,
    isSameYear,
    startOfDay,
    sub,
    parse,
    isAfter,
    isSameMonth,
} from 'date-fns';
import { format } from 'date-fns-tz';
import isNil from 'lodash/isNil';
import { enUS } from 'date-fns/esm/locale';

export enum TimeFormat {
    HOUR_12 = 'HOUR_12',
    HOUR_24 = 'HOUR_24',
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

export const formatRelativeToDate = (
    task: any,
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

export const currentTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const extractDate = (taskDate: any): Date => {
    // TODO can return null
    return (taskDate?.date || taskDate?.dateTime) as Date;
};

export const isAllDay = (taskDate: any): boolean => {
    if (taskDate) {
        return !!taskDate.date;
    }

    return false;
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

export const wrapper = (
    task: any,
    pointInTime: Date,
    dateTimeOptions: DateTimeOptions,
): string => {
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
    range: { start: Date; end: Date },
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
