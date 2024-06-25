import { Context } from '@nuxt/types';
import {
    differenceInMinutes,
    endOfDay,
    format,
    isFirstDayOfMonth,
    parse,
    parseISO,
} from 'date-fns';
import { calendarDateRange, ThemeOptions, TimeFormat } from '~/helpers/date';
import { IEvent } from '~/@types';
import { hexToRGB } from '~/helpers';
import { APP_COLORS, Color, TabType } from '~/constants';
import { rgbaToSolid } from '~/helpers/colors';
import EventDropdown from '~/components/event/dropdown/EventDropdown.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export class CalendarUtils {
    private context: Context;

    intervalHeight: number = 40;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    isPast(date: string) {
        const d = parse(date, 'yyyy-MM-dd', new Date());
        return d < new Date();
    }

    isFuture(date: string) {
        const d = parse(date, 'yyyy-MM-dd', new Date());

        return d > new Date();
    }

    monthLabel(day: string) {
        const date = parseISO(day);
        return format(date, 'd');
    }

    firstDayOfMonth(day: string) {
        const date = parseISO(day);
        return isFirstDayOfMonth(date)
            ? format(date, 'MMM').toUpperCase()
            : null;
    }

    intervalTimeFormatter(time: string) {
        const timeFormat =
            this.context.store.getters['appSettings/dateTimeOptions']
                .timeFormat;
        const tFormat = timeFormat === TimeFormat.HOUR_24 ? 'HH:mm' : 'h aa';
        return format(parse(time, 'HH:mm', new Date()), tFormat);
    }

    getEventResponseStatus(event: IEvent) {
        let email: string | null = null;
        const integration = this.context.store.getters['integration/byId'](
            event.integrationId,
        );

        if (integration?.type === 'google_calendar') {
            email = integration.data.googleAccountEmail;
        }

        if (!email) return null;

        const attendees = event.attendees;
        if (!attendees || !attendees.length) return null;

        const attendee = attendees.find(
            ({ email: _email }) => _email === email,
        );
        if (!attendee) return null;

        return attendee.responseStatus;
    }

    getEventColorSolid(event: IEvent, alpha: number) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.context.store.getters['appSettings/theme'];
        const backgroundColor =
            theme === ThemeOptions.DARK
                ? { r: 38, g: 45, b: 57 }
                : { r: 255, g: 255, b: 255 };

        const vaultId = this.context.store.getters['vault/active'].id;
        const { calendarId, integrationId } =
            this.context.store.getters['vault/defaultCalendar'];
        const cal = this.context.store.getters['integration/calendarById'](
            calendarId,
            integrationId,
            vaultId,
        );

        let eventColor = cal.acreomColorId
            ? hexToRGB(APP_COLORS[cal.acreomColorId as Color][theme].COLOR)
            : hexToRGB(cal.color);

        const calendar =
            this.context.store.getters['integration/getCalendarByEvent'](event);

        if (calendar) {
            if (calendar.acreomColorId) {
                eventColor = hexToRGB(
                    APP_COLORS[calendar.acreomColorId as Color][theme].COLOR,
                );
            } else {
                eventColor = hexToRGB(calendar.color);
            }
        }

        const color = rgbaToSolid(eventColor, backgroundColor, alpha);

        return `rgb(${color.r}, ${color.g}, ${color.b}, 0.85)`;
    }

    getEventColorOpacity(event: IEvent, opacity: number) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.context.store.getters['appSettings/theme'];

        const vaultId = this.context.store.getters['vault/active'].id;
        const { calendarId, integrationId } =
            this.context.store.getters['vault/defaultCalendar'];
        // TODO: remove default calendar, it is no longer used
        const defaultCalendar =
            this.context.store.getters['vaultSettings/defaultCalendar'];
        const cal =
            this.context.store.getters['integration/calendarById'](
                calendarId,
                integrationId,
                vaultId,
            ) || defaultCalendar;

        let color = cal.acreomColorId
            ? hexToRGB(APP_COLORS[cal.acreomColorId as Color][theme].COLOR)
            : hexToRGB(cal.color);

        const calendar =
            this.context.store.getters['integration/getCalendarByEvent'](event);

        if (calendar) {
            color = calendar.acreomColorId
                ? hexToRGB(
                      APP_COLORS[calendar.acreomColorId as Color][theme].COLOR,
                  )
                : hexToRGB(calendar.color);
        }

        return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    }

    getTaskColorOpacity(opacity: number) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.context.store.getters['appSettings/theme'];
        const tasksInCalendarConfig =
            this.context.store.getters['vaultSettings/tasksInCalendarConfig'];
        const backgroundColor =
            theme === ThemeOptions.DARK
                ? { r: 38, g: 45, b: 57 }
                : { r: 255, g: 255, b: 255 };

        const color = hexToRGB(
            APP_COLORS[tasksInCalendarConfig.acreomColorId as Color][theme]
                .COLOR,
        );

        const solidColor = rgbaToSolid(color, backgroundColor, opacity);
        return `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, 0.85)`;
    }

    getPageColorOpacity(opacity: number) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.context.store.getters['appSettings/theme'];
        const pagesInCalendarConfig =
            this.context.store.getters['vaultSettings/pagesInCalendarConfig'];
        const backgroundColor =
            theme === ThemeOptions.DARK
                ? { r: 38, g: 45, b: 57 }
                : { r: 255, g: 255, b: 255 };

        const color = hexToRGB(
            APP_COLORS[pagesInCalendarConfig.acreomColorId as Color][theme]
                .COLOR,
        );
        const solidColor = rgbaToSolid(color, backgroundColor, opacity);
        return `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, 0.85)`;
    }

    getLineClamp(event: any) {
        const eventDurationInMinutes = differenceInMinutes(
            event.end,
            event.start,
        );

        const segments = Math.max(Math.floor(eventDurationInMinutes / 15), 2);

        const eventHeight = (this.intervalHeight / 4) * segments - (2 + 2 + 13);

        return Math.floor(eventHeight / 13);
    }

    endDate(event: any) {
        if (event.end === event.start) {
            return endOfDay(new Date(event.end));
        }
        if (event.end) {
            return new Date(event.end);
        }

        return 0;
    }

    getRange() {
        return calendarDateRange(
            this.context.store.getters['dailyDoc/calendarDate'],
            this.context.store.getters['panel/calendarType'],
            this.context.store.getters['appSettings/calendarOptions']
                .weekdayStart,
        );
    }

    onPageClick(event: any, mouseEvent: MouseEvent) {
        if (this.context.$utils.isMobile) {
            window.$nuxt.$pane.hide();
            window.$nuxt.$router.push(
                `/mobile/documents/${event.id}?level=${
                    +window.$nuxt.$route.query.level! + 1
                }`,
            );
            this.context.$tracking.trackEventV2(TrackingType.PAGE, {
                action: TrackingAction.OPEN,
                source: TrackingActionSource.MOBILE_TIMELINE,
            });
            return;
        }
        const doc = this.context.store.getters['document/byId'](event.id);
        const tab = this.context.$tabs.createNewTabObject(
            doc.id,
            TabType.DOCUMENT,
        );
        this.context.$tabs.openTabWithEvent(tab, mouseEvent);
    }

    async onEventClick(event: any) {
        if (this.context.$utils.isMobile) {
            await this.context.$pane.hide();
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url: event.htmlLink });
            return;
        }

        const newEvent = {
            ...event,
            // start: event.startObject,
            // end: event.endObject,
        };

        if (
            !['google_calendar', 'ics_calendar', 'apple_calendar'].includes(
                event.integrationType,
            )
        )
            return;
        const parent = document.getElementById(event.id);
        if (!parent) return;
        this.context.$dropdown.show({
            parent,
            component: EventDropdown,
            popperOptions: {
                placement: 'right',
            },
            bind: {
                event: newEvent,
            },
        });
    }

    myDaysWithContent() {
        return Object.entries(this.context.store.getters['document/dailyDocs'])
            .filter(([_key, value]) => {
                const doc = this.context.store.getters['document/byId'](value);

                return doc && !['<p></p>', ''].includes(doc.content);
            })
            .map(([key]) => key);
    }
}
