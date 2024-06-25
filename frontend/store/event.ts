import { Context } from '@nuxt/types';
import { format, isAfter, isSameDay, sub } from 'date-fns';
import isArray from 'lodash/isArray';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';

import isEmpty from 'lodash/isEmpty';
import { v4, validate } from 'uuid';
import { IEvent } from '~/@types';
import {
    createRecurrent,
    extractDate,
    getNewCount,
    isAllDay,
    isInRange,
} from '~/helpers/date';
import { deserializeTaskDateObject } from '~/store/tasks';
import { TaskDateObject } from '~/components/task/model';
import { IntegrationType } from '~/constants';

const EOD_DATE = new Date();
EOD_DATE.setHours(23, 59, 59, 0);
const EOD_STRING = format(EOD_DATE, 'HHmmss');

interface AppState {
    events: IEvent[];
    mobileEventDetail: IEvent | null;
}

export const state = (): AppState => ({
    events: [],
    mobileEventDetail: null,
});

export const getters = {
    mobileEventDetail: (state: AppState) => {
        return state.mobileEventDetail;
    },
    byId: (state: AppState) => (_id: string) => {
        return (
            state.events.find(({ id }: { id: string }) => id === _id) || null
        );
    },
    byParentId: (state: AppState) => (id: string) => {
        return state.events.filter(event => event.acreomRecurringId === id);
    },
    eventList:
        (state: AppState, _getters: any, _rootState: any, rootGetters: any) =>
        (range: { start: Date; end: Date }) => {
            const events = [
                ...state.events,
                ...rootGetters['integrationData/byType']('apple_calendar'),
            ]; // does not include phantom instances

            // get all NON recurring events by filtering out recurring parent events.
            let output = events.filter(
                event =>
                    (!event.recurrence || event.recurrence.length === 0) &&
                    isInRange(event, range),
            );

            // find all recurring parents
            const parentEvents = events.filter(
                event => event.recurrence && event.recurrence.length > 0,
            );

            const recurrentIds = events
                .filter(
                    event =>
                        (isInRange(event, range) &&
                            !!event.acreomRecurringId && // exceptions modified
                            (!event.recurrence ||
                                event.recurrence.length === 0)) ||
                        (!event.start &&
                            !event.end &&
                            !!event.acreomRecurringId), // exception deleted
                )
                .map(({ id, acreomRecurringId, originalStartTime }) => ({
                    id,
                    acreomRecurringId,
                    originalStartTime,
                }));

            parentEvents.forEach(event => {
                // TODO: resolve this, needs data model for recurrent events
                // @ts-ignore
                output = [
                    ...output,
                    ...createRecurrent(
                        event,
                        range,
                        recurrentIds.filter(
                            ({ acreomRecurringId }) =>
                                acreomRecurringId === event.id,
                        ),
                    ),
                ];
            });

            return output.map(event => ({ ...event }));
        },
    calendarEventList:
        (_state: AppState, getters: any, _rootState: any, rootGetters: any) =>
        (range: { start: Date; end: Date }) => {
            const defaultCalendar =
                rootGetters['vaultSettings/defaultCalendar'];
            const events = getters.eventList(range) as IEvent[];
            return events
                .filter((event: IEvent) => {
                    if (
                        event.calendarId === defaultCalendar.id ||
                        event.calendarId === 'defaultCalendar'
                    ) {
                        return false;
                    }

                    const calendar =
                        rootGetters['integration/getCalendarByEvent'](event);
                    return calendar?.selected || calendar?.visible;
                })
                .filter(({ start, status }) => start && status !== 'cancelled') // recurring single exceptions must have status cancelled
                .map(event => {
                    const calendarEvent = { ...event, type: 'event' } as any;
                    calendarEvent.name = event.summary;
                    if (calendarEvent.start) {
                        if (
                            event.start &&
                            event.end &&
                            new Date(extractDate(event.start)).getDate() !==
                                new Date(extractDate(event.end)).getDate()
                        ) {
                            calendarEvent.timed = false;
                        } else {
                            calendarEvent.timed = !isAllDay(event.start);
                        }

                        calendarEvent.startObject = event.start
                            ? { ...event.start }
                            : null;
                        calendarEvent.endObject = event.end
                            ? { ...event.end }
                            : null;
                        calendarEvent.start = extractDate(
                            event.start,
                        ).getTime();

                        calendarEvent.startTime = extractDate(event.start);

                        if (isAllDay(event.start) && isAllDay(event.end)) {
                            const endDate = sub(extractDate(event.end), {
                                days: 1,
                            });
                            calendarEvent.end = extractDate(event.end)
                                ? endDate.getTime()
                                : calendarEvent.start;

                            calendarEvent.endTime = extractDate(event.end)
                                ? endDate
                                : calendarEvent.startTime;
                        } else {
                            calendarEvent.end = extractDate(event.end)
                                ? extractDate(event.end).getTime()
                                : calendarEvent.start;

                            calendarEvent.endTime = event.end
                                ? extractDate(event.end)
                                : calendarEvent.startTime;
                        }
                    }
                    return calendarEvent;
                });
        },
    list: (state: AppState) => {
        return [...state.events];
    },
};

export const mutations = {
    initialize: (state: AppState, events: IEvent[]) => {
        state.events = events.map(event => ({
            ...event,
            start: deserializeTaskDateObject(event.start),
            end: deserializeTaskDateObject(event.end),
        }));
    },
    clear: (state: AppState) => {
        state.events = [];
        state.mobileEventDetail = null;
    },
    update: (state: AppState, event: IEvent) => {
        const exists = state.events.find(({ id }) => id === event.id);
        const timeObject: any = {}; // TODO: fix type

        if (event.start) {
            timeObject.start = deserializeTaskDateObject(event.start);
        }

        if (event.end) {
            timeObject.end = deserializeTaskDateObject(event.end);
        }

        // create event
        if (!exists) {
            state.events = [
                ...state.events,
                {
                    ...event,
                    ...timeObject,
                },
            ];
            return;
        }

        state.events = state.events.map(_event => {
            if (_event.id === event.id) {
                return {
                    ..._event,
                    ...event,
                    ...timeObject,
                };
            }
            return _event;
        });
    },
    delete: (state: AppState, event: IEvent) => {
        state.events = state.events.filter(_event => {
            return _event.id !== event.id;
        });
    },
};

export const actions = {
    async refresh(this: Context, { dispatch }: any) {
        await dispatch('initialize');
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
        this.$utils.refreshCalendarData();
    },
    async initialize(this: Context, { commit, rootGetters }: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;
        const events = await this.$workers.database?.Events.list(
            rootGetters['vault/active'].id,
            'events',
        );
        commit('initialize', events);
        this.$utils.refreshCalendarData();
    },
    async update(this: Context, { commit, rootGetters }: any, event: IEvent) {
        if (!this.$workers.database) return;

        delete event._status;
        commit('update', event);
        const vaultId = rootGetters['vault/active'].id;

        const timeObject: any = {}; // TODO: fix type

        if (event.start) {
            timeObject.start = serializeTaskDateObject(event.start);
        }

        if (event.end) {
            timeObject.end = serializeTaskDateObject(event.end);
        }

        if (event.originalStartTime) {
            timeObject.originalStartTime = serializeTaskDateObject(
                event.originalStartTime,
            );
        }

        const payload = {
            ...event,
            ...timeObject,
        } as IEvent;

        if (
            payload.integrationType === IntegrationType.GOOGLE_CALENDAR &&
            validate(payload.id)
        ) {
            commit('delete', payload);
            const newId = [
                payload.integrationType,
                payload.integrationId,
                payload.calendarId,
                payload.id,
            ].join('/');

            commit('update', { ...payload, id: newId });
        }

        this.$utils.refreshCalendarData();
        await this.$workers.database.Events.save<IEvent>(vaultId, payload);
    },
    async delete(
        this: Context,
        { commit, dispatch, rootGetters }: any,
        event: IEvent,
    ) {
        if (!this.$workers.database) return;
        commit('delete', event);
        this.$utils.refreshCalendarData();
        if (event.integrationType === IntegrationType.GOOGLE_CALENDAR) {
            await dispatch('update', {
                ...event,
                status: 'cancelled',
                updatedAt: new Date(),
                start: null,
                end: null,
            });
            return;
        }
        const vaultId = rootGetters['vault/active'].id;
        await this.$workers.database.Events.delete<IEvent>(vaultId, event);
    },
    indexedDBUpdate(
        this: Context,
        { commit, getters }: any,
        events: IEvent | IEvent[],
    ) {
        events = isArray(events) ? events : [events];
        // first update content
        for (const event of events) {
            if (event.integrationType === IntegrationType.GOOGLE_CALENDAR) {
                const oldEvent = getters.byId(event.id.split('/').pop());
                if (oldEvent) {
                    commit('delete', oldEvent);
                }
            }
            commit('update', {
                ...event,
                start: deserializeTaskDateObject(event.start),
                end: deserializeTaskDateObject(event.end),
            });
        }
        this.$utils.refreshCalendarData();
    },
    indexedDBDelete(this: Context, { commit }: any, ids: string | string[]) {
        ids = isArray(ids) ? ids : [ids];
        // first update content
        for (const id of ids) {
            commit('delete', { id });
        }
        this.$utils.refreshCalendarData();
    },
};

export const serializeTaskDateObject = (taskDate: TaskDateObject) => {
    if (!taskDate || isEmpty(taskDate)) return null;

    let date = null;
    if (taskDate.date && isString(taskDate.date)) date = taskDate.date;
    if (taskDate.date && isDate(taskDate.date))
        date = format(taskDate.date, 'yyyy-MM-dd');

    let dateTime = null;
    if (taskDate.dateTime && isString(taskDate.dateTime))
        dateTime = taskDate.dateTime;
    if (taskDate.dateTime && isDate(taskDate.dateTime))
        dateTime = taskDate.dateTime.toISOString();

    return {
        date,
        dateTime,
        timeZone: taskDate.timeZone || null,
    };
};
