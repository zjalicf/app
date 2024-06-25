import type ICAL from 'ical.js';
import { differenceInDays } from 'date-fns';
import { v4 } from 'uuid';
import merge from 'lodash/merge';
import { zonedTimeToUtc } from 'date-fns-tz';
import {
    BaseIntegration,
    IntegrationConfig,
    IntegrationStatus,
} from '~/workers/integrations/base';
import { createTaskDateObject, currentTimezone } from '~/helpers/date';
import { IEvent } from '~/@types';
import {
    Color,
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import { WorkerContext } from '~/@types/app';
import { WINDOWS_TO_IANA } from '~/workers/integrations/windowsToIana';

type IcsData = {
    url: string;
    calendar: {
        name: string;
        description: string;
        timezone: string;
        displayName: string | null;
        displayColor: string | null;
        color: string | null;
        acreomColorId: Color | null;
        state: 'hidden' | 'visible';
    };
    defaultReminders: {
        method: string;
        minutes: number;
    }[];
};

const ICS_RUN_INTERVAL = 3 * 60 * 1000;
const ICS_URI_REGEXP = /^(http|https|webcal):\/\/[^ "]+$/i;

export class IcsIntegration extends BaseIntegration<IcsData> {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        super();
        this.name = IntegrationType.ICS_CALENDAR;
        this.runInterval = ICS_RUN_INTERVAL;
        this.context = ctx;
    }

    static isValidURI(uri: string) {
        return ICS_URI_REGEXP.test(uri);
    }

    shouldRun(config: IntegrationConfig<IcsData>) {
        return (
            Date.now() - (config.lastRunTimestamp || 0) >
            Math.min(config.runInterval || this.runInterval, this.runInterval)
        );
    }

    createObject(vaultId: string, url: string): IntegrationConfig<IcsData> {
        const baseIntegrationObject = super.createObject(vaultId);
        const sanitizedUrl = url.trim();

        return {
            ...baseIntegrationObject,
            data: {
                url: sanitizedUrl,
                calendar: {
                    name: 'New ICS',
                    displayName: null,
                    color: null,
                    acreomColorId: Color.SKY,
                    state: 'visible',
                },
                defaultReminders: [{ method: 'popup', minutes: 10 }],
            },
        } as IntegrationConfig<IcsData>;
    }

    static getCalendarName(component: ICAL.Component): string {
        return (
            component.getFirstPropertyValue<string>('x-wr-calname') ??
            'ICS Calendar'
        );
    }

    static getCalendarDescription(component: ICAL.Component): string {
        return component.getFirstPropertyValue<string>('x-wr-caldesc') ?? '';
    }

    static getCalendarTimezone(component: ICAL.Component): string {
        return (
            component.getFirstPropertyValue<string>('x-wr-timezone') ??
            currentTimezone()
        );
    }

    manualExecute(config: IntegrationConfig<IcsData>): Promise<void> {
        return this._execute(config);
    }

    execute(config: IntegrationConfig<IcsData>) {
        if (!this.shouldRun(config)) return Promise.resolve();
        return this._execute(config);
    }

    private async _execute(config: IntegrationConfig<IcsData>) {
        const { vaultId, data } = config;
        await this.context.invoke<IEvent[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                vaultId,
                payload: {
                    vaultId,
                    entity: {
                        id: config.id,
                        status: IntegrationStatus.PROCESSING,
                    },
                    meta: {
                        clientId: v4(),
                    },
                },
                callerContext: 'ics.ts/_execute',
            },
        );
        try {
            if (!data.url) return;
            const response = await this.fetch(data.url);
            if (!response) return;
            const { events, calendar } = response;
            const { toAdd, toUpdate, toDelete } = await this.processRawEvents(
                vaultId,
                config,
                calendar,
                events,
            );

            await Promise.all([
                ...toUpdate.map((event: IEvent) =>
                    this.context.invoke<IEvent>(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.SAVE,
                        {
                            table: 'events',
                            payload: {
                                vaultId,
                                entity: event,
                                meta: {
                                    clientId: v4(),
                                },
                            },
                            callerContext: 'ics.ts/_execute',
                        },
                    ),
                ),
                ...toDelete.map((event: IEvent) =>
                    this.context.invoke<IEvent>(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.DELETE,
                        {
                            table: 'events',
                            payload: {
                                vaultId,
                                entity: event,
                                meta: {
                                    clientId: v4(),
                                },
                            },
                            callerContext: 'ics.ts/_execute',
                        },
                    ),
                ),
                this.context.invoke<IEvent>(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.SAVE_BULK,
                    {
                        table: 'events',
                        payload: {
                            vaultId,
                            entity: toAdd,
                            meta: {
                                clientId: v4(),
                            },
                        },
                        callerContext: 'ics.ts/_execute',
                    },
                ),
            ]);

            const mergedData = merge(config.data, { calendar });

            await this.context.invoke<IEvent[]>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.SAVE,
                {
                    table: 'integrations',
                    payload: {
                        vaultId,
                        entity: {
                            id: config.id,
                            lastRunTimestamp: Date.now(),
                            data: mergedData,
                            status: IntegrationStatus.SLEEP,
                        },
                        meta: {
                            clientId: v4(),
                        },
                    },
                    callerContext: 'ics.ts/_execute',
                },
            );
        } catch (err) {
            await this.context.invoke<IEvent[]>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.SAVE,
                {
                    table: 'integrations',
                    payload: {
                        vaultId,
                        entity: {
                            id: config.id,
                            status: IntegrationStatus.ERROR,
                        },
                        meta: {
                            clientId: v4(),
                        },
                    },
                    callerContext: 'ics.ts/_execute',
                },
            );

            this.context.emit(ServiceKey.SENTRY, 'trackError', err);
            console.log(err);
        }
    }

    private async fetch(url: string) {
        const sanitizedUrl = url?.replace(/^webcal/i, 'https');
        if (!sanitizedUrl) return null;
        let response: Response | null;
        if (this.context.$config.platform !== 'desktop') {
            const url = `${
                this.context.$config.baseUrl
            }/api/integrations/ics/proxy?url=${encodeURIComponent(
                sanitizedUrl,
            )}`;
            response = await fetch(url, {
                method: 'GET',
                credentials: 'omit',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'content-type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                },
            }).catch(e => {
                console.log(e);
                return null;
            });
        } else {
            response = await fetch(sanitizedUrl, {
                method: 'GET',
                credentials: 'omit',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'content-type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                },
            }).catch(e => {
                console.log(e);
                return null;
            });
        }
        if (!response) return null;

        const ICAL = require('ical.js');
        try {
            const jcalData = ICAL.parse(await response.text());
            const calendarComponent = new ICAL.Component(jcalData);
            const calendar = {
                name: IcsIntegration.getCalendarName(calendarComponent),
                description:
                    IcsIntegration.getCalendarDescription(calendarComponent),
                timezone: IcsIntegration.getCalendarTimezone(calendarComponent),
            };
            const eventComponents =
                calendarComponent.getAllSubcomponents('vevent');
            return {
                events: this.filterValidEvents(
                    eventComponents.map(
                        (vevent: ICAL.Component) => new ICAL.Event(vevent),
                    ),
                ),
                calendar,
            };
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    private filterValidEvents(events: ICAL.Event[]): ICAL.Event[] {
        return events.filter(event => {
            const date = event.endDate.toJSDate();
            const recur = event.isRecurring()
                ? (event.component.getFirstPropertyValue('rrule') as ICAL.Recur)
                : null;
            return (
                differenceInDays(date, new Date()) > -90 ||
                (recur &&
                    (!recur.until ||
                        differenceInDays(recur.until.toJSDate(), new Date()) >
                            -90))
            );
        });
    }

    private async processRawEvents(
        vaultId: string,
        config: IntegrationConfig<IcsData>,
        calendar: any,
        events: ICAL.Event[],
    ): Promise<any> {
        const oldEvents = await this.context.invoke<IEvent[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'events',
                payload: {
                    query: {
                        type: 'list integration events',
                        data: { type: this.name, id: config.id },
                    },
                    vaultId,
                },
                callerContext: 'ics.ts/processRawEvents',
            },
        );

        const oldEventsMap = oldEvents.reduce((acc, event) => {
            acc[event.remoteId!] = event;
            return acc;
        }, {} as Record<string, IEvent>);
        const eventIds = events.map(event => event.uid);
        const eventsToAdd = events.filter(event => !oldEventsMap[event.uid]);
        const eventsToDelete = oldEvents.filter(
            event => !eventIds.includes(event.remoteId!),
        );
        const eventsToUpdate = events.filter(
            event =>
                !!oldEventsMap[event.uid] &&
                oldEventsMap[event.uid].sequence <
                    event.component.getFirstPropertyValue('sequence'),
        );

        return {
            toAdd: eventsToAdd.map(event =>
                this.ICSEventToAppEvent(config, calendar, event),
            ),
            toUpdate: eventsToUpdate.map(event =>
                this.ICSEventToAppEvent(
                    config,
                    calendar,
                    event,
                    oldEventsMap[event.uid].id,
                ),
            ),
            toDelete: eventsToDelete,
        };
    }

    private ICSEventToAppEvent(
        config: IntegrationConfig<IcsData>,
        calendar: any,
        event: ICAL.Event,
        _id?: string,
    ) {
        let id = `ics_calendar/${event.uid}`;
        const recurrenceId =
            event.component.getFirstPropertyValue('recurrence-id');
        let acreomRecurringId = null;
        let originalStartTime = null;
        const isAllDay = event.startDate.icaltype === 'date';
        const created = event.component.getFirstPropertyValue('created');
        const updated =
            event.component.getFirstPropertyValue('last-mod') ||
            event.component.getFirstPropertyValue('last-modified');
        const organizer = event.component.getFirstPropertyValue('organizer')
            ? event.component
                  .getFirstPropertyValue('organizer')
                  .replace('mailto:', '')
            : null;

        if (recurrenceId) {
            acreomRecurringId = id;
            originalStartTime = createTaskDateObject(
                isAllDay ? recurrenceId.toJSDate() : null,
                isAllDay ? null : recurrenceId.toJSDate(),
                recurrenceId.timezone,
            );

            id = `${id}_${recurrenceId.toString()}`;
        }
        const convertToRegularDate = (time: ICAL.Time): Date => {
            const windowsDate =
                WINDOWS_TO_IANA[time.timezone] ??
                WINDOWS_TO_IANA[time.zone.tzid];
            const isWindowsDate = !!windowsDate;
            const isUtc = [time.zone.tzid, time.timezone].includes('UTC');

            if (isUtc) return time.toJSDate();
            if (isWindowsDate) {
                return zonedTimeToUtc(time.toJSDate(), windowsDate);
            }
            return time.toJSDate();
        };

        return {
            id,
            acreomRecurringId,
            originalStartTime,
            integrationType: this.name,
            integrationId: config.id,
            vaultId: config.vaultId,
            remoteId: event.uid,
            calendarId: calendar.name,
            summary: event.summary,
            description: event.description,
            sequence: event.component.getFirstPropertyValue('sequence') || 0,
            transparency: event.component
                .getFirstPropertyValue('transp')
                ?.toLowerCase(),
            start: createTaskDateObject(
                isAllDay ? convertToRegularDate(event.startDate) : null,
                isAllDay ? null : convertToRegularDate(event.startDate),
            ),
            end: createTaskDateObject(
                isAllDay ? convertToRegularDate(event.endDate) : null,
                isAllDay ? null : convertToRegularDate(event.endDate),
            ),
            recurrence: event.isRecurring() ? this.getRecurrence(event) : null,
            htmlLink: event.component.getFirstPropertyValue('url') ?? null,
            location: event.location,
            organizer: {
                email: organizer,
            },
            attendees: this.parseAttendees(
                event.attendees,
                calendar,
                organizer,
            ),
            conferenceData: {
                entryPoints: [
                    {
                        uri: event.component.getFirstPropertyValue(
                            'x-google-conference',
                        ),
                    },
                ],
            },
            recurringEventId: event.isRecurring()
                ? event.component.getFirstPropertyValue('recurrence-id')
                : null,
            status: event.component
                .getFirstPropertyValue('status')
                ?.toLowerCase(),
            attachments: event.component
                .getAllProperties('attach')
                .map((prop: any) => prop.getFirstValue()),
            createdAt: created ? created.toJSDate() : new Date(),
            updatedAt: updated ? updated.toJSDate() : new Date(),
        };
    }

    private getRecurrence(event: ICAL.Event): string[] {
        const rrule = event.component.getFirstPropertyValue('rrule').toString();
        return [`RRULE:${rrule}`];
    }

    private parseAttendees(
        attendees: ICAL.Property[],
        calendar: any,
        organizer: any,
    ) {
        return attendees.map(attendee => {
            const attendeeArray = attendee.toJSON() as any[];
            const attendeeComponent = attendeeArray.includes('attendee')
                ? attendeeArray[attendeeArray.indexOf('attendee') + 1]
                : null;
            return {
                responseStatus: attendeeComponent.partstat?.toLowerCase(),
                optional: attendeeComponent.role !== 'REQ-PARTICIPANT',
                cutype: attendeeComponent.cutype?.toLowerCase(),
                email: attendeeComponent.cn,
                organizer: organizer?.email === attendeeComponent.cn,
                self: attendeeComponent.cn === calendar.name,
            };
        });
    }
}
