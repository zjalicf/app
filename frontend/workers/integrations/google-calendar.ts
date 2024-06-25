import {
    add,
    areIntervalsOverlapping,
    endOfDay,
    getOverlappingDaysInIntervals,
    max,
    min,
    startOfDay,
    sub,
} from 'date-fns';
import type { calendar_v3 } from 'googleapis';
import { v4 } from 'uuid';
import {
    BaseIntegration,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { WorkerContext, CloudResponse } from '~/@types/app';
import {
    DatabaseServiceAction,
    GoogleCalendarIntegrationAction,
    IntegrationType,
    ServiceKey,
} from '~/constants';

type DateRange = { start: Date; end: Date };

type GoogleCalendarConfig = {
    calendars: any[];
};

/*
const integrationCalendarSyncToken = {
    '412321...asd': {
        'denis@acreom.com': {
            intervals: [{start, end}],
            syncToken: 'syncToken1'
        }
        'martin@acreom.com': {
            intervals: [{start, end}],
            syncToken: 'syncToken2'
        }
    }
}

 */

const integrationCalendarSyncToken: Record<
    string,
    Record<string, { intervals: DateRange[]; syncToken: string }>
> = {};

const sessionId = v4();

export class GoogleCalendarIntegration extends BaseIntegration<any> {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        super();
        // refresh watch every 7 days;
        // this.runInterval = 7 * 24 * 60 * 60 * 1000;
        this.runInterval = 60 * 1000;
        this.context = ctx;
    }

    isInitial(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
    ) {
        return !integrationCalendarSyncToken?.[config.id]?.[calendarId];
    }

    async retrieveEvents(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
        range: DateRange | null,
    ) {
        if (range) {
            range = {
                start: startOfDay(range.start),
                end: add(endOfDay(range.end), { seconds: 1 }),
            };
        }
        const syncToken = getSyncToken(config.id, calendarId, range);

        let response;
        let pageToken;
        const promises = [];
        do {
            response = await this.fetchEvents(
                config,
                calendarId,
                range,
                syncToken,
                pageToken || null,
            );
            pageToken = response.data?.nextPageToken;
            promises.push(
                this.saveEvents(config, calendarId, response.data?.items || []),
            );
        } while (pageToken);
        await Promise.all(promises);
        if (response.data?.nextSyncToken) {
            if (!calendarQueried(config.id, calendarId)) {
                this.deleteOldEvents(config, calendarId);
                this.registerWatch(config, calendarId);
            }
            setSyncToken(config.id, calendarId, response.data?.nextSyncToken);
        }
    }

    private fetchEvents(
        config: IntegrationConfig<any>,
        calendarId: string,
        range: DateRange | null,
        syncToken: string | null,
        pageToken?: string | null,
    ): Promise<CloudResponse<calendar_v3.Schema$Events>> {
        return this.context.invoke<CloudResponse<calendar_v3.Schema$Events>>(
            ServiceKey.CLOUD,
            GoogleCalendarIntegrationAction.GET_EVENTS,
            {
                integrationId: config.id,
                vaultId: config.vaultId,
                calendarId,
                range,
                syncToken,
                pageToken,
                callerContext: 'google-calendar.ts/fetchEvents',
            },
        );
    }

    private async saveEvents(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
        events: calendar_v3.Schema$Event[],
    ) {
        if (!events.length) return;
        await this.context.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'googleCalendarEvents',
                vaultId: config.vaultId,
                payload: {
                    vaultId: config.vaultId,
                    entity: this.processEvents(config, calendarId, events),
                    meta: {
                        clientId: v4(),
                    },
                },
                callerContext: 'google-calendar.ts/saveEvents',
            },
        );
    }

    unmaskUUID(id: string): string {
        const uuidV4Positions = [8, 13, 18, 23];
        return id
            .split('')
            .map((v, i) => {
                if (uuidV4Positions.includes(i) && v === 'g') return '-';
                return v;
            })
            .join('');
    }

    private processEvents(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
        events: calendar_v3.Schema$Event[],
    ) {
        return events.map(event => {
            const processedEvent = {
                ...event,
                integrationId: config.id,
                id: `${IntegrationType.GOOGLE_CALENDAR}/${
                    config.id
                }/${calendarId}/${this.unmaskUUID(event.id!)}`,
                integrationType: IntegrationType.GOOGLE_CALENDAR,
                sessionId,
                vaultId: config.vaultId,
                calendarId,
            };
            if (processedEvent.recurringEventId) {
                processedEvent.recurringEventId = `${
                    IntegrationType.GOOGLE_CALENDAR
                }/${config.id}/${calendarId}/${this.unmaskUUID(
                    processedEvent.recurringEventId,
                )}`;
            }
            if ((processedEvent as any).remoteId) {
                (processedEvent as any).remoteId = `${
                    IntegrationType.GOOGLE_CALENDAR
                }/${config.id}/${calendarId}/${this.unmaskUUID(
                    (processedEvent as any).remoteId,
                )}`;
            }
            if ((processedEvent as any).acreomRecurringId) {
                (processedEvent as any).acreomRecurringId = `${
                    IntegrationType.GOOGLE_CALENDAR
                }/${config.id}/${calendarId}/${this.unmaskUUID(
                    (processedEvent as any).acreomRecurringId,
                )}`;
            }
            return processedEvent;
        });
    }

    private deleteOldEvents(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
    ) {
        this.context.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DELETE_BATCH,
            {
                table: 'googleCalendarEvents',
                payload: {
                    vaultId: config.vaultId,
                    query: {
                        integrationId: {
                            eq: config.id,
                        },
                        integrationType: {
                            eq: IntegrationType.GOOGLE_CALENDAR,
                        },
                        sessionId: {
                            neq: sessionId,
                        },
                        calendarId: {
                            eq: calendarId,
                        },
                    },
                    meta: {
                        clientId: v4(),
                    },
                },
            },
        );
    }

    registerWatch(
        config: IntegrationConfig<GoogleCalendarConfig>,
        calendarId: string,
    ): void {
        this.context.emit(
            ServiceKey.CLOUD,
            GoogleCalendarIntegrationAction.CREATE_WATCH,
            {
                integrationId: config.id,
                vaultId: config.vaultId,
                calendarId,
            },
        );
    }
}

const calendarQueried = (
    integrationId: string,
    calendarId: string,
): boolean => {
    return !!integrationCalendarSyncToken?.[integrationId]?.[calendarId];
};

const getSyncToken = (
    integrationId: string,
    calendarId: string,
    range: DateRange | null,
): string | null => {
    if (!integrationCalendarSyncToken?.[integrationId]?.[calendarId])
        return null;

    if (!range)
        return integrationCalendarSyncToken[integrationId][calendarId]
            .syncToken;

    const { intervals } =
        integrationCalendarSyncToken?.[integrationId]?.[calendarId];

    let fullyIncluded = false;
    let processed = false;

    const mergeInterval = (
        first: DateRange,
        second: DateRange,
    ): DateRange | null => {
        const start = sub(second.start, { days: 1 });
        const end = add(second.end, { days: 1 });
        if (
            areIntervalsOverlapping(first, { start, end }, { inclusive: true })
        ) {
            return {
                start: min([first.start, second.start]),
                end: max([first.end, second.end]),
            };
        }

        return null;
    };

    integrationCalendarSyncToken[integrationId][calendarId].intervals =
        intervals.reduce((acc, interval) => {
            // if interval overlaps new range, merge them
            const merge = !processed && mergeInterval(interval, range);
            if (merge) {
                processed = true;
                const overlap = getOverlappingDaysInIntervals(interval, range);
                const duration = getOverlappingDaysInIntervals(range, range);

                if (overlap === duration) {
                    fullyIncluded = true;
                }
                return [...acc, merge];
            }
            // if new range end is lover than interval start, insert it into array;
            if (!processed && range.end.getTime() < interval.start.getTime()) {
                processed = true;
                return [...acc, range, interval];
            }
            // try merging previous and current interval
            if (acc.length) {
                const backwardMerge = mergeInterval(
                    acc[acc.length - 1],
                    interval,
                );
                if (backwardMerge) {
                    return [...acc.slice(0, acc.length - 1), backwardMerge];
                }
            }
            return [...acc, interval];
        }, [] as DateRange[]);
    if (!processed) {
        integrationCalendarSyncToken[integrationId][calendarId].intervals.push(
            range,
        );
    }

    return (
        (fullyIncluded &&
            integrationCalendarSyncToken[integrationId][calendarId]
                .syncToken) ||
        null
    );
};

const setSyncToken = (
    integrationId: string,
    calendarId: string,
    syncToken: string,
) => {
    if (!integrationCalendarSyncToken[integrationId]) {
        integrationCalendarSyncToken[integrationId] = {};
    }
    if (!integrationCalendarSyncToken[integrationId][calendarId]) {
        integrationCalendarSyncToken[integrationId][calendarId] = {
            intervals: [],
            syncToken: '',
        };
    }
    integrationCalendarSyncToken[integrationId][calendarId].syncToken =
        syncToken;
};
