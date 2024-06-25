import { describe, expect, it } from 'vitest';
import { v4 } from 'uuid';
import { parse } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import {
    createRecurrentTaskNext,
    createTaskDateObject,
    dateIsWithinRange,
    getZonedEndOfDay,
    getZonedStartOfDay,
    parseRrule,
} from '~/helpers/date';
import { ITask } from '~/components/task/model';

const parseStringToDate = (date: string) =>
    parse(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date());

const convertBetweenTimezones = (date: Date, from: string, to: string) => {
    return utcToZonedTime(zonedTimeToUtc(date, from), to);
};

describe('date helper', () => {
    const task = {
        id: v4(),
        text: 'test',
        start: createTaskDateObject(
            getZonedStartOfDay(
                convertBetweenTimezones(
                    parseStringToDate('2023-10-30T12:00:00.000Z'),
                    'Europe/Berlin',
                    'America/New_York',
                ),
                'America/New_York',
            ),
            null,
            'America/New_York',
        ),
        end: createTaskDateObject(
            getZonedEndOfDay(
                convertBetweenTimezones(
                    parseStringToDate('2023-10-30T12:00:00.000Z'),
                    'Europe/Berlin',
                    'America/New_York',
                ),
                'America/New_York',
            ),
            null,
            'America/New_York',
        ),
        rrule: 'FREQ=WEEKLY;BYDAY=SU',
    } as ITask;

    it('should return next recurring exception', () => {
        const currentDate = convertBetweenTimezones(
            parseStringToDate('2023-10-29T12:00:00.000Z'),
            'Europe/Berlin',
            'America/New_York',
        );
        const instance = createRecurrentTaskNext(task, currentDate);
    });

    it('should parse rrule', () => {
        const rule = parseRrule(task);
        const currentDate = convertBetweenTimezones(
            parseStringToDate('2023-10-29T12:00:00.000Z'),
            'Europe/Berlin',
            'America/New_York',
        );
    });

    it('should filter events for day', () => {
        const events = [
            {
                id: 1,
                start: new Date('2021-10-30T12:00:00.000Z'),
                end: new Date('2021-10-30T13:00:00.000Z'),
            },
            {
                id: 2,
                start: new Date('2021-10-29T12:00:00.000Z'),
                end: new Date('2021-10-30T13:00:00.000Z'),
            },
            {
                id: 3,
                start: new Date('2021-10-28T12:00:00.000Z'),
                end: new Date('2021-10-30T13:00:00.000Z'),
            },
            {
                id: 4,
                start: new Date('2021-10-17T12:00:00.000Z'),
                end: new Date('2021-18-30T13:00:00.000Z'),
            },
        ];
        const date = new Date('2021-10-30T12:00:00.000Z');

        const filtered = events.filter(e => {
            return dateIsWithinRange(date, e);
        });
        expect(filtered).not.toContain(events[3]);
        expect(filtered.length).toEqual(3);
    });
});

it('should filter events for day 2', () => {
    const events = [
        {
            id: 1,
            start: new Date('2021-10-30T12:00:00.000Z'),
            end: new Date('2021-10-30T13:00:00.000Z'),
        },
        {
            id: 2,
            start: new Date('2021-10-29T12:00:00.000Z'),
            end: new Date('2021-10-30T13:00:00.000Z'),
        },
        {
            id: 3,
            start: new Date('2021-10-28T12:00:00.000Z'),
            end: new Date('2021-10-30T13:00:00.000Z'),
        },
        {
            id: 4,
            start: new Date('2021-10-17T12:00:00.000Z'),
            end: new Date('2021-18-30T13:00:00.000Z'),
        },
    ];
    const date = new Date('2021-10-29T12:00:00.000Z');

    const filtered = events.filter(e => {
        return dateIsWithinRange(date, e);
    });
    expect(filtered).not.toContain(events[3]);
    expect(filtered).not.toContain(events[0]);
    expect(filtered.length).toEqual(2);
});
