import { v4 } from 'uuid';
import { add, format, isSameDay, parseISO, sub } from 'date-fns';
import { isString } from 'lodash';
import { RRule } from 'rrule';
import { IEvent } from '../../frontend/@types';
import { ITask, TaskDateObject } from '../../frontend/components/task/model';

const setDate = (dateObj: TaskDateObject, date: Date): TaskDateObject => {
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

        newDateObj.date = time;
    }
    return newDateObj;
};

const createRecurrentEvent = (
    recurringEventId: string,
    event: IEvent,
    date: Date,
) => {
    return {
        ...event,
        id: v4(),
        acreomRecurringId: recurringEventId,
        recurrence: null,
        recurringEventId: event.remoteId,
        remoteId: null,

        start: setDate(event.start, date),
        end: setDate(event.end, date),
        originalStartTime: setDate(event.start, date),
        shadowEvent: true,
        status: 'new',
    };
};

export const createRecurrent = (
    event: IEvent,
    range: any,
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
};

export const isAllDay = (taskDate): boolean => {
    if (taskDate) {
        return !!taskDate.date;
    }

    return false;
};

export const extractDate = (taskDate): Date => {
    // TODO: can return null
    return (taskDate?.date || taskDate?.dateTime) as Date;
};

export const isInRange = (
    task: ITask | IEvent,
    range: { start: Date; end: Date },
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

export const deserializeTaskDateObject = (taskDate: TaskDateObject) => {
    return taskDate
        ? {
              date: taskDate.date
                  ? taskDate.date instanceof Date
                      ? taskDate.date
                      : parseISO(taskDate.date)
                  : null,
              dateTime: taskDate.dateTime
                  ? taskDate.dateTime instanceof Date
                      ? taskDate.dateTime
                      : parseISO(taskDate.dateTime)
                  : null,
              timeZone: taskDate.timeZone || null,
          }
        : null;
};
