import { Map } from 'js-sdsl';
import { add, sub } from 'date-fns';
import { Notification } from 'electron';
import type { MapType } from 'js-sdsl/dist/cjs/Map/Map';
import { IEvent } from '../../frontend/@types';
import {
    DatabaseChangeType,
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from '../driver/notification';
import { ITask } from '../../frontend/components/task/model';
import {
    extractDate,
    createRecurrent,
    deserializeTaskDateObject,
    isAllDay,
    isInRange,
} from '../helpers/date';
import { IntegrationType } from '../constants/electron-constants';
import { appWindows } from './windows';
const schedule = require('node-schedule');
const DEFAULT_CALENDAR_TIMEOUT = [{ method: 'popup', minutes: 10 }];
const DEFAULT_TASK_TIMEOUT = [{ method: 'popup', minutes: 10 }];

export const sendTestNotification = () => {
    const payload: any = {
        title: 'acreom notification',
        body: 'This is how you will be notified.',
        silent: false,
    };

    const notification = new Notification(payload);

    notification.show();
};

class NotificationManager {
    eventMap: MapType<string, any>;
    timeoutMap: any;
    range: any;

    constructor() {
        this.eventMap = new Map<string, any>();
        this.timeoutMap = {};
        this.range = {
            start: new Date(),
            end: add(new Date(), { months: 1 }),
        };
    }

    initialize(payload: {
        vaultId: string;
        integrations: any;
        localConfig: any;
    }) {
        const vaultId = payload.vaultId;
        this.updateLocalConfig({ vaultId, change: payload.localConfig });

        for (const integration of payload.integrations) {
            this.updateIntegration({
                vaultId,
                change: {
                    type: DatabaseChangeType.Create,
                    obj: integration,
                },
            });
        }
    }

    scheduleEvents(payload: (ITask | IEvent)[]) {
        const normalEvents = [];
        const recurringEvents = [];

        for (const event of payload) {
            const isRecurring = event.recurrence && event.recurrence.length;
            if (isRecurring) {
                recurringEvents.push(event);
            } else {
                normalEvents.push(event);
            }
        }

        for (const event of normalEvents) {
            this.scheduleEvent(event);
        }

        for (const event of recurringEvents) {
            this.scheduleRecurringEvent(event);
        }
    }

    createJobs(event: IEvent | ITask) {
        if (event.status && event.status === 'cancelled') return []; // do not schedule recurring exceptions that are cancelled
        const vaultId = event.vaultId;
        let defaultReminders = [];
        const jobs = [];
        // eslint-disable-next-line no-prototype-builtins
        const isTask = event.hasOwnProperty('text');

        if (isTask) {
            defaultReminders = this.timeoutMap[`${vaultId}-task`]?.filter(
                ({ method }) => method === 'popup',
            );
        } else {
            const calendarId = (event as IEvent).calendarId;
            const integrationType =
                (event as IEvent).integrationType || 'local';
            const integrationId = (event as IEvent).integrationId;
            const timeoutKey = `${vaultId}-${integrationType}-${
                integrationType === IntegrationType.ICS_CALENDAR
                    ? integrationId
                    : calendarId
            }`;

            if (!this.timeoutMap[timeoutKey]) {
                return [];
            }

            defaultReminders = this.timeoutMap[timeoutKey]?.filter(
                ({ method }) => method === 'popup',
            );

            if (
                (event as IEvent).reminders &&
                (event as IEvent).reminders.overrides &&
                !(event as IEvent).reminders.useDefault &&
                Object.keys((event as IEvent).reminders.overrides).length
            ) {
                defaultReminders = Object.values(
                    (event as IEvent).reminders.overrides,
                );
            }
        }

        for (const reminder of defaultReminders) {
            let date = sub(extractDate(event.start), {
                minutes: reminder.minutes,
            });

            jobs.push(
                schedule.scheduleJob(date, () => {
                    const message = `${isTask ? 'Due' : 'Starts'} ${
                        reminder.minutes === 0
                            ? 'now'
                            : `in ${reminder.minutes} minutes`
                    }`;

                    const element = this.eventMap.getElementByKey(event.id);
                    const eventObj = element.event;

                    const payload: any = {
                        title:
                            (eventObj as IEvent).summary ||
                            (eventObj as ITask).text ||
                            'Untitled',
                        body: message,
                        silent: false,
                        timeoutType: 'never',
                    };

                    const notification = new Notification(payload);

                    notification.on('click', () => {
                        appWindows.main?.show();
                        const action = isTask ? 'open-task' : 'open-event';

                        appWindows.main?.webContents.send(action, {
                            id: event.id,
                            vaultId: event.vaultId,
                        });
                    });

                    notification.show();
                }),
            );
        }

        return jobs.filter(job => !!job) || [];
    }

    scheduleRecurringEventByParentId(id: string) {
        try {
            const eventFromMap = this.eventMap.getElementByKey(id);
            this.scheduleRecurringEvent(eventFromMap.event);
        } catch (_) {}
    }

    scheduleRecurringEvent(parentEvent: IEvent) {
        // delete or recurrent instances first
        // create instances again (without exceptions for now)
        const existingShadowEvents = [];
        const exceptions = [];
        this.eventMap.setElement(parentEvent.id, {
            event: parentEvent,
            jobs: [],
        });

        this.eventMap.forEach(entry => {
            const event = entry.value.event;
            if (
                event.acreomRecurringId &&
                event.acreomRecurringId === parentEvent.id &&
                event.shadowEvent
            ) {
                existingShadowEvents.push(event.id);
            }

            if (
                (!event.shadowEvent &&
                    event.acreomRecurringId &&
                    (!event.recurrence || event.recurrence.length === 0)) ||
                (!event.start &&
                    !event.end &&
                    !!event.acreomRecurringId &&
                    !event.shadowEvent)
            ) {
                exceptions.push({
                    id: event.id,
                    acreomRecurringId: event.acreomRecurringId,
                    originalStartTime: event.originalStartTime,
                });
            }
        });

        for (const shadowEvent of existingShadowEvents) {
            this.descheduleEventById(shadowEvent);
        }

        const recurrentEvents = createRecurrent(
            parentEvent,
            this.range,
            exceptions,
        );

        for (const ev of recurrentEvents) {
            this.eventMap.setElement(ev.id, {
                event: ev,
                jobs: this.createJobs(ev),
            });
        }
    }

    scheduleEvent(event: IEvent | ITask) {
        if (event.status && event.status === 'cancelled') {
            this.descheduleEventById(event.id);
            this.eventMap.setElement(event.id, {
                event,
                jobs: [],
            });

            return;
        }

        const deserializedEvent = {
            ...event,
            start: deserializeTaskDateObject(event.start),
            end: deserializeTaskDateObject(event.end),
        };

        if (
            isAllDay(deserializedEvent.start) ||
            !isInRange(deserializedEvent, this.range)
        ) {
            return;
        }

        const id = deserializedEvent.id;
        let element: any = null;
        let isSameDate = false;
        try {
            element = this.eventMap.getElementByKey(id);
            const previousTask = element.event;

            isSameDate =
                extractDate(previousTask.start) ===
                extractDate(deserializedEvent.start);

            if (!isSameDate) {
                this.descheduleEventById(id);
            }
        } catch (_) {}

        this.eventMap.setElement(id, {
            event,
            jobs: isSameDate
                ? element.jobs
                : this.createJobs(deserializedEvent),
        });
    }

    descheduleEventById(id: string) {
        try {
            const eventFromMap = this.eventMap.getElementByKey(id);
            this.descheduleEvent(eventFromMap);
        } catch (_) {}
    }

    descheduleEvent(mapEntry: any) {
        const event = mapEntry.event;
        const jobs = mapEntry.jobs;
        const id = event.id;

        for (const job of jobs) {
            job.cancel();
        }
        this.eventMap.eraseElementByKey(id);
    }

    updateEvent(payload: { vaultId: string; change: IDatabaseChange }) {
        try {
            let change = null;
            switch (payload.change.type) {
                case DatabaseChangeType.Create:
                    change = payload.change as ICreateChange;

                    if (
                        (!!change.obj.acreomRecurringId &&
                            (!change.obj.recurrence ||
                                change.obj.recurrence.length === 0)) ||
                        (!change.obj.start &&
                            !change.obj.end &&
                            !!change.obj.acreomRecurringId)
                    ) {
                        this.scheduleEvent(change.obj);
                        this.scheduleRecurringEventByParentId(
                            change.obj.acreomRecurringId,
                        );
                    } else if (
                        change.obj.recurrence &&
                        change.obj.recurrence.length
                    ) {
                        this.scheduleRecurringEvent(change.obj);
                    } else {
                        this.scheduleEvent(change.obj);
                    }

                    break;
                case DatabaseChangeType.Update:
                    change = payload.change as IUpdateChange;
                    this.scheduleEvent(change.obj as IEvent);

                    if (
                        (!!change.obj.acreomRecurringId &&
                            (!change.obj.recurrence ||
                                change.obj.recurrence.length === 0)) ||
                        (!change.obj.start &&
                            !change.obj.end &&
                            !!change.obj.acreomRecurringId)
                    ) {
                        this.scheduleEvent(change.obj);
                        this.scheduleRecurringEventByParentId(
                            change.obj.acreomRecurringId,
                        );
                    } else if (
                        change.obj.recurrence &&
                        change.obj.recurrence.length
                    ) {
                        this.scheduleRecurringEvent(change.obj);
                    } else {
                        this.scheduleEvent(change.obj);
                    }

                    break;
                case DatabaseChangeType.Delete:
                    change = payload.change as IDeleteChange;

                    try {
                        const eventFromMap = this.eventMap.getElementByKey(
                            change.key,
                        );

                        const event = eventFromMap.event;
                        this.descheduleEventById(change.key);

                        if (event.recurrence && event.recurrence.length) {
                            // if it is recurring event then we need to delete all shadow events
                            const shadowEvents = [];

                            this.eventMap.forEach(entry => {
                                const ev = entry.value.event;

                                if (
                                    ev.acreomRecurringId &&
                                    ev.acreomRecurringId === event.id &&
                                    ev.shadowEvent
                                ) {
                                    shadowEvents.push(ev.id);
                                }
                            });

                            for (const id of shadowEvents) {
                                this.descheduleEventById(id);
                            }
                        }
                    } catch (e) {}

                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    clearGcalIntegrationTimeout(vaultId: string, calendars: any) {
        const prefix = `${vaultId}-${IntegrationType.GOOGLE_CALENDAR}`;

        for (const calendar of calendars) {
            delete this.timeoutMap[`${prefix}-${calendar.id}`];
        }
    }

    clearIcsIntegrationTimeout(vaultId: string, id: string) {
        const prefix = `${vaultId}-${IntegrationType.ICS_CALENDAR}-${id}`;
        for (const key in this.timeoutMap) {
            if (key.startsWith(prefix)) {
                delete this.timeoutMap[key];
            }
        }
    }

    addIntegrationToTimeoutMap(vaultId: string, integration: any) {
        if (integration.type === IntegrationType.ICS_CALENDAR) {
            this.clearIcsIntegrationTimeout(vaultId, integration.id);

            const defaultReminders = integration.defaultReminders || null;
            this.timeoutMap[
                `${vaultId}-${IntegrationType.ICS_CALENDAR}-${integration.id}`
            ] = defaultReminders || DEFAULT_CALENDAR_TIMEOUT;
        } else if (integration.type === IntegrationType.GOOGLE_CALENDAR) {
            const calendars = integration.data.calendars;
            const prefix = `${vaultId}-${IntegrationType.GOOGLE_CALENDAR}`;

            this.clearGcalIntegrationTimeout(vaultId, calendars);

            for (const calendar of calendars) {
                const id = calendar.id;
                if (calendar.defaultReminders) {
                    this.timeoutMap[`${prefix}-${id}`] = Object.values(
                        calendar.defaultReminders,
                    );
                }
            }
        }

        const integrationId = integration.id;

        this.eventMap.forEach(entry => {
            if (entry.value.event.integrationId !== integrationId) return;
            if (!entry.value.jobs) return;

            const deserializedEvent = {
                ...entry.value.event,
                start: deserializeTaskDateObject(entry.value.event.start),
                end: deserializeTaskDateObject(entry.value.event.end),
            };

            for (const job of entry.value.jobs) {
                job.cancel();
            }

            entry.value.jobs = this.createJobs(deserializedEvent);
        });
    }

    updateIntegration(payload: {
        vaultId: string;
        change: Partial<IDatabaseChange>;
    }) {
        let change = null;
        switch (payload.change.type) {
            case DatabaseChangeType.Create:
                change = payload.change as ICreateChange;
                this.addIntegrationToTimeoutMap(payload.vaultId, change.obj);
                break;
            case DatabaseChangeType.Update:
                change = payload.change as IUpdateChange;
                this.addIntegrationToTimeoutMap(payload.vaultId, change.obj);
                break;
            case DatabaseChangeType.Delete:
                change = payload.change as IDeleteChange;
                if (!change.oldObj) return;

                if (change.oldObj.type === IntegrationType.ICS_CALENDAR) {
                    this.clearIcsIntegrationTimeout(
                        payload.vaultId,
                        change.key,
                    );
                } else if (
                    change.oldObj.type === IntegrationType.GOOGLE_CALENDAR
                ) {
                    const calendars = change.oldObj.data.calendars;
                    this.clearGcalIntegrationTimeout(
                        payload.vaultId,
                        calendars,
                    );
                }

                // eslint-disable-next-line no-case-declarations
                const eventsToCancel = [];

                this.eventMap.forEach(entry => {
                    const event = entry.value.event;
                    if (event.integrationId === change.key)
                        eventsToCancel.push(event.id);
                });

                for (const id of eventsToCancel) {
                    this.descheduleEventById(id);
                }

                break;
        }
    }

    updateLocalConfig(payload: { vaultId: string; change: any }) {
        const taskTimeout = payload.change.find(
            ({ id }) => id === 'tasksInCalendarConfig',
        );

        if (!taskTimeout) {
            this.timeoutMap[`${payload.vaultId}-task`] = DEFAULT_TASK_TIMEOUT;
        } else {
            this.timeoutMap[`${payload.vaultId}-task`] =
                taskTimeout.defaultReminders || DEFAULT_TASK_TIMEOUT;
        }

        const defaultCalendarTimeout = payload.change.find(
            ({ id }) => id === 'defaultCalendar',
        );

        if (!defaultCalendarTimeout) {
            this.timeoutMap[`${payload.vaultId}-local-acreom`] =
                DEFAULT_CALENDAR_TIMEOUT;
        } else {
            this.timeoutMap[`${payload.vaultId}-local-acreom`] =
                defaultCalendarTimeout.defaultReminders ||
                DEFAULT_CALENDAR_TIMEOUT;
        }

        this.eventMap.forEach(entry => {
            // eslint-disable-next-line no-prototype-builtins
            const isTask = entry.value.event.hasOwnProperty('text');

            if (!isTask) {
                if (entry.value.event.calendarId !== 'acreom') return;
                if (!entry.value.jobs) return;
            }

            const deserializedEvent = {
                ...entry.value.event,
                start: deserializeTaskDateObject(entry.value.event.start),
                end: deserializeTaskDateObject(entry.value.event.end),
            };

            for (const job of entry.value.jobs) {
                job.cancel();
            }

            entry.value.jobs = this.createJobs(deserializedEvent);
        });
    }
}

export const notificationManager = new NotificationManager();
