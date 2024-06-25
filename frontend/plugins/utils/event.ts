import { Context } from '@nuxt/types';
import {
    differenceInMinutes,
    format,
    getMinutes,
    intervalToDuration,
    isSameDay,
} from 'date-fns';
import { rrulestr } from 'rrule';
import { v4 } from 'uuid';
import {
    DateFormat,
    extractDate,
    isAllDay,
    ThemeOptions,
    TimeFormat,
} from '~/helpers/date';
import { APP_COLORS, Color, TabType } from '~/constants';
import { IEvent } from '~/@types';
import { createMeetingNotes } from '~/helpers/templates';
import { PostprocessingMap } from '~/@types/app';
import { IDocument } from '~/components/document/model';

export class EventUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    getEventDuration({ start, end }: any) {
        if (isAllDay(start)) return null;
        const startDate = new Date(extractDate(start));
        const endDate = new Date(extractDate(end));
        const duration = intervalToDuration({
            start: startDate,
            end: endDate,
        });
        const result = [];
        if (duration.years) {
            result.push(`${duration.years}yr`);
        }
        if (duration.months) {
            result.push(`${duration.months}mo`);
        }
        if (duration.days) {
            result.push(`${duration.days}d`);
        }
        if (duration.hours) {
            result.push(`${duration.hours}hr`);
        }
        if (duration.minutes) {
            result.push(`${duration.minutes}min`);
        }
        return result.join(' ');
    }

    getEventFormattedTime({ start, end }: any, showDate: boolean = false) {
        if (isAllDay(start)) {
            return {
                type: 'allday',
                text: 'All Day',
            };
        }
        const tFormat =
            this.context.store.getters['appSettings/dateTimeOptions']
                .timeFormat;
        const dFormat =
            this.context.store.getters['appSettings/dateTimeOptions']
                .dateFormat;
        const startDate = extractDate(start);
        const endDate = extractDate(end);
        const diff = differenceInMinutes(endDate, startDate);
        const dateFormat = dFormat === DateFormat.EU ? 'd MMM' : 'MMM d';
        const dateString = showDate ? `${format(startDate, dateFormat)} ` : '';
        if (tFormat === TimeFormat.HOUR_24) {
            if (diff >= 15) {
                if (!isSameDay(startDate, endDate)) {
                    return {
                        type: 'duration',
                        text: `${format(
                            startDate,
                            `${dateFormat} H:mm`,
                        )} - ${format(endDate, `${dateFormat} H:mm`)}`,
                    };
                }
                return {
                    type: 'duration',
                    text:
                        dateString +
                        `${format(startDate, 'H:mm')} - ${format(
                            endDate,
                            'H:mm',
                        )}`,
                };
            }
            return {
                type: 'start',
                text: dateString + format(startDate, 'H:mm'),
            };
        }
        const showMinutes =
            getMinutes(startDate) > 0 || getMinutes(endDate) > 0;
        if (diff >= 15) {
            const showBothMeridiems =
                format(startDate, 'aa') !== format(endDate, 'aa');
            const startFormat = `h${showMinutes ? ':mm' : ''}${
                showBothMeridiems ? ' aa' : ''
            }`;
            const endFormat = `h${showMinutes ? ':mm' : ''} aa`;
            if (!isSameDay(startDate, endDate)) {
                return {
                    type: 'duration',
                    text: `${format(
                        startDate,
                        `${dateFormat} ${startFormat}`,
                    )} - ${format(endDate, `${dateFormat} ${endFormat}`)}`,
                };
            }
            return {
                type: 'duration',
                text:
                    dateString +
                    `${format(startDate, startFormat)} - ${format(
                        endDate,
                        endFormat,
                    )}`,
            };
        }
        const timeFormat = `h${showMinutes ? ':mm' : ''} aa`;
        return {
            type: 'start',
            text: dateString + format(startDate, timeFormat),
        };
    }

    getEventRruleText(event: any) {
        const recurrentEvent = this.context.store.getters['event/byId'](
            event.recurringEventId,
        );
        if (!recurrentEvent) return null;
        const rrule = recurrentEvent.recurrence;
        if (!rrule) return null;

        const rruleStr = rrulestr(rrule.join('\n'));

        // TODO: sometimes return yearly but shouldn't
        return rruleStr.toText();
    }

    getEventLink(event: any) {
        return (
            event.conferenceData.entryPoints.find(
                (e: any) => e.entryPointType === 'video',
            )?.uri ?? event.hangoutLink
        );
    }

    getMeetingNotes(event: Partial<IEvent>) {
        const linkedPage = this.context.store.getters['document/byEventId'](
            event.id!,
        );
        if (!linkedPage) return null;
        return linkedPage.id;
    }

    async createMeetingNotes(event: Partial<IEvent>) {
        const id = v4();
        const payload = {
            id,
            title: `Meeting notes: ${event?.summary || ''}`,
            content: createMeetingNotes(
                event as IEvent,
                this.context.store.getters['appSettings/dateTimeOptions'],
            ),
            status: 'new',
            updatedAt: new Date(),
            createdAt: new Date(),
        };

        await this.context.store.dispatch('document/new', payload);
        await this.context.store.dispatch('document/update', payload);
        const tab = this.context.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.context.$tabs.openTab(tab);
        return id;
    }

    openMeetingNotes(event: Partial<IEvent>) {
        const linkedPage = this.context.store.getters['document/byEventId'](
            event.id,
        );
        if (!linkedPage) return null;
        const tab = this.context.$tabs.createNewTabObject(
            linkedPage.id,
            TabType.DOCUMENT,
        );
        this.context.$tabs.openTab(tab);
    }

    computeColorHex(color: Color) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.context.store.getters['appSettings/theme'];
        return APP_COLORS[color][theme].COLOR;
    }

    postprocessEvents(
        map: {
            pageId: string;
            oldData: Partial<PostprocessingMap>;
            data: Partial<PostprocessingMap>;
        },
        page: IDocument,
    ) {
        const oldEvents: string[] = (map.oldData.events as string[]) ?? [];
        const newEvents: string[] = (map.data.events as string[]) ?? [];

        const addedEvents = newEvents.filter(
            (event: string) => !oldEvents.includes(event),
        );
        const removedEvents = oldEvents.filter(
            (event: string) => !newEvents.includes(event),
        );
        // TODO: events get deleted on update
        if (!addedEvents.length && !removedEvents.length) return;

        if (addedEvents.length) {
            this.context.store.commit('document/addToEventMap', {
                events: addedEvents,
                page,
            });
        }
        if (removedEvents.length) {
            this.context.store.commit('document/removeFromEventMap', {
                events: removedEvents,
                page,
            });
        }
    }
}
