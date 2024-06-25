import { add, differenceInHours, sub } from 'date-fns';
import { v4 } from 'uuid';
import linkifyStr from 'linkify-string';
import defaultsDeep from 'lodash/defaultsDeep';
import {
    BaseIntegration,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { JiraIntegrationConfig } from '~/workers/integrations/jira/controller';
import { IEvent } from '~/@types';
import { createNewEventObject } from '~/helpers/event';
import { isInRange } from '~/helpers/date';

type AppleCalendarData = {
    calendars: any[];
    name: string;
    access: number;
    isWatch?: boolean;
};

enum AppleCalendarActions {
    GET_CALENDARS = 'appleCalendarSync:calendars',
    GET_EVENTS = 'appleCalendarSync:events',
    ACCESS_STATUS = 'appleCalendarSync:getAccessStatus',
}

type DateRange = { start: Date; end: Date };
const integrationDateRanges: Record<string, DateRange> = {};

export class AppleCalendarIntegration extends BaseIntegration<AppleCalendarData> {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        super();
        this.name = 'apple_calendar';
        this.runInterval = 10 * 60 * 1000;
        this.context = ctx;
    }

    registerWatchListener() {
        this.context.on('apple-calendar-watch', config => {
            this.handleWatch(config);
        });
    }

    shouldRun(config: IntegrationConfig<AppleCalendarData>) {
        return (
            Date.now() - (config.lastRunTimestamp || 0) >
            Math.min(config.runInterval || this.runInterval, this.runInterval)
        );
    }

    manualExecute(
        config: IntegrationConfig<AppleCalendarData>,
        range?: DateRange,
    ): Promise<void> {
        const previousRange = integrationDateRanges[config.id];
        if (range) {
            if (!integrationDateRanges[config.id]) {
                integrationDateRanges[config.id] = range;
            } else {
                integrationDateRanges[config.id] = {
                    start: new Date(
                        Math.min(
                            integrationDateRanges[config.id].start.getTime(),
                            range.start.getTime(),
                        ),
                    ),
                    end: new Date(
                        Math.max(
                            integrationDateRanges[config.id].end.getTime(),
                            range.end.getTime(),
                        ),
                    ),
                };
            }
        }
        if (
            previousRange &&
            previousRange?.start?.getTime() ===
                integrationDateRanges[config.id]?.start?.getTime() &&
            previousRange?.end?.getTime() ===
                integrationDateRanges[config.id]?.end?.getTime()
        ) {
            return Promise.resolve();
        }

        return this._execute(config, range);
    }

    handleWatch(config: IntegrationConfig<AppleCalendarData>) {
        return this._execute(config, integrationDateRanges[config.id]);
    }

    execute(config: IntegrationConfig<AppleCalendarData>) {
        if (!this.shouldRun(config)) return Promise.resolve();
        return this._execute(config);
    }

    private async _execute(
        config: IntegrationConfig<AppleCalendarData>,
        range?: DateRange,
    ) {
        range = defaultsDeep(
            range ?? {},
            integrationDateRanges[config.id] ?? {},
            {
                start: sub(new Date(), { days: 7 }),
                end: add(new Date(), { days: 14 }),
            },
        ) as DateRange;
        const accessStatus = await this.getAccessStatus();
        if (accessStatus !== config.data.access) {
            config.data.access = accessStatus;
            await this.updateIntegration(config, {
                access: accessStatus,
            });
        }
        if (accessStatus !== 3) {
            return;
        }

        const calendars = await this.getCalendars();
        const calendarMap = config.data.calendars.reduce((acc, calendar) => {
            acc[calendar.id] = calendar;
            return acc;
        }, {} as Record<string, any>);
        await this.updateIntegration(config, {
            calendars: calendars.map(calendar => ({
                ...(calendarMap[calendar.id] ?? {}),
                ...calendar,
            })),
        });

        const events = await this.getEvents(range.start, range.end);
        await this.processEvents(config, events, range);
    }

    private async processEvents(
        config: IntegrationConfig<AppleCalendarData>,
        events: any[],
        range: DateRange,
    ) {
        const acreomEvents = events.map(event => {
            const eventObj = createNewEventObject(
                config.vaultId,
                event.calendarId,
            );
            if (event.description) {
                eventObj.description = linkifyStr(event.description, {
                    target: '_blank',
                });
                const links = eventObj.description.matchAll(
                    /<a href="([^"]+)"[^>]*>[^<]*<\/a>/g,
                );
                eventObj.conferenceData = {};
                for (const match of links) {
                    const link = match[1];
                    let conferenceName = '';
                    if (link.includes('meet.google.com')) {
                        conferenceName = 'Google meet';
                    }
                    if (link.includes('facetime.apple.com')) {
                        conferenceName = 'Facetime';
                    }
                    if (link.includes('zoom.us')) {
                        conferenceName = 'Zoom';
                    }

                    if (conferenceName) {
                        eventObj.conferenceData.conferenceSolution = {
                            name: conferenceName,
                        };
                        if (!eventObj.conferenceData.entryPoints) {
                            eventObj.conferenceData.entryPoints = [];
                        }
                        eventObj.conferenceData.entryPoints.push({
                            entryPointType: 'video',
                            uri: link,
                            label: conferenceName,
                        });
                    }
                }
            }
            return {
                ...eventObj,
                id: this.createId(config, event),
                integrationType: this.name,
                integrationId: config.id,
                attendees: event.attendees ?? [],
                summary: event.title,
                start: this.createDateTimeObject(
                    event.start,
                    event.allDay,
                    event.timeZone,
                ),
                htmlLink: event.icalUri,
                end: this.createDateTimeObject(
                    event.end,
                    event.allDay,
                    event.timeZone,
                ),
                status: event.status,
            } as IEvent;
        });

        const dbEvents = await this.context.invoke<IEvent[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_QUERY,
            {
                table: 'integrationsData',
                vaultId: config.vaultId,
                payload: {
                    vaultId: config.vaultId,
                    query: {
                        integrationId: {
                            eq: config.id,
                        },
                        integrationType: {
                            eq: this.name,
                        },
                    },
                },
                callerContext: 'apple-calendar.ts/processEvents',
            },
        );

        const dbEventsMap = dbEvents.reduce((acc, event) => {
            acc[event.id] = event;
            return acc;
        }, {} as Record<string, any>);
        const eventsToCreate = acreomEvents.filter(
            event => !dbEventsMap[event.id],
        );
        const eventsToUpdate = acreomEvents.filter(
            event => dbEventsMap[event.id],
        );
        const eventsToDelete = dbEvents
            .filter(e => isInRange(e, range))
            .filter(event => !acreomEvents.find(e => e.id === event.id));

        await Promise.all([
            this.deleteIntegrationData(config, eventsToDelete),
            this.saveIntegrationData(config, [
                ...eventsToCreate,
                ...eventsToUpdate,
            ]),
        ]);
    }

    createDateTimeObject(date: number, allDay: boolean, timeZone: string) {
        if (allDay) {
            return {
                date: new Date(date),
                dateTime: null,
                timeZone,
            };
        }
        return {
            date: null,
            dateTime: new Date(date),
            timeZone,
        };
    }

    createId(config: IntegrationConfig<AppleCalendarData>, event: any): string {
        return [
            this.name,
            config.id,
            event.calendarId,
            event.id,
            event.occurenceDate,
        ]
            .filter(v => !!v)
            .join('/');
    }

    private getAccessStatus() {
        return this.context.invoke<number>(
            ServiceKey.DEVICE,
            AppleCalendarActions.ACCESS_STATUS,
            { callerContext: 'apple-calendar.ts/getAccessStatus' },
        );
    }

    private getCalendars() {
        return this.context.invoke<any[]>(
            ServiceKey.DEVICE,
            AppleCalendarActions.GET_CALENDARS,
            { callerContext: 'apple-calendar.ts/getCalendars' },
        );
    }

    private getEvents(start: Date, end: Date) {
        const from = differenceInHours(start, new Date());
        const to = differenceInHours(end, new Date());

        return this.context.invoke<any[]>(
            ServiceKey.DEVICE,
            AppleCalendarActions.GET_EVENTS,
            {
                from,
                to,
                callerContext: 'apple-calendar.ts/getEvents',
            },
        );
    }

    private updateIntegration(
        integration: IntegrationConfig<AppleCalendarData>,
        data: any,
    ) {
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: integration.vaultId,
                    entity: {
                        ...integration,
                        data: {
                            ...integration.data,
                            ...data,
                        },
                    },
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'apple-calendar.ts/updateIntegration',
            },
        );
    }

    public deleteIntegrationData(
        integration: IntegrationConfig<AppleCalendarData>,
        data: any[],
    ) {
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DELETE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'apple-calendar.ts/deleteIntegrationData',
            },
        );
    }

    public saveIntegrationData(
        integration: IntegrationConfig<AppleCalendarData>,
        data: any[],
    ) {
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'apple-calendar.ts/saveIntegrationData',
            },
        );
    }
}
