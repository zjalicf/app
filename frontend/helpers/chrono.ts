import { add, startOfDay } from 'date-fns';
import * as chrono from 'chrono-node';
import has from 'lodash/has';
import { createTaskDateObject } from '@/helpers';
import { labelsFromText } from '~/plugins/entities/label';
import { labelRegexp } from '~/constants/regexp';

const custom = chrono.casual.clone();

custom.refiners.push({
    refine: (_: any, results: any) => {
        results.forEach((result: any) => {
            if (
                result.end &&
                !result.start.isCertain('meridiem') &&
                result.end.isCertain('meridiem')
            ) {
                result.start.assign('meridiem', result.end.get('meridiem'));
            }
        });
        return results;
    },
});

const createChronoMeta = (result: any) => {
    return {
        index: result.index,
        text: result.text,
        from: result.index,
        to: result.index + result.text.length,
    };
};

const chronoParse = (data: string, ts: Date = new Date()) => {
    const results = custom.parse(data, ts, { forwardDate: true });
    if (results.length) {
        const [result] = results;
        const start = result.start;
        const end = result.end;
        if (
            start &&
            end &&
            has(start.knownValues, 'hour') &&
            has(start.knownValues, 'minute') &&
            has(end.knownValues, 'hour') &&
            has(end.knownValues, 'minute')
        ) {
            const title = data
                .replace(result.text, '')
                .replaceAll(labelRegexp, '');
            return {
                title: title || data,
                start: createTaskDateObject(null, start.date()),
                end: createTaskDateObject(null, end.date()),
                recurrence: null,
                labels: labelsFromText(data),
                chronoMeta: createChronoMeta(result),
            };
        }

        if (
            start &&
            end &&
            has(start.knownValues, 'day') &&
            has(end.knownValues, 'day')
        ) {
            const title = data
                .replace(result.text, '')
                .replaceAll(labelRegexp, '');
            return {
                title: title || data,
                start: createTaskDateObject(startOfDay(start.date()), null),
                end: createTaskDateObject(
                    add(startOfDay(end.date()), { days: 1 }),
                    null,
                ),
                recurrence: null,
                labels: labelsFromText(data),
                chronoMeta: createChronoMeta(result),
            };
        }

        if (
            start &&
            !end &&
            has(start.knownValues, 'hour') &&
            has(start.knownValues, 'minute')
        ) {
            const title = data
                .replace(result.text, '')
                .replaceAll(labelRegexp, '');
            return {
                title: title || data,
                start: createTaskDateObject(null, start.date()),
                end: createTaskDateObject(null, start.date()),
                recurrence: null,
                labels: labelsFromText(data),
                chronoMeta: createChronoMeta(result),
            };
        }

        if (start && !end && has(start.knownValues, 'day')) {
            const title = data
                .replace(result.text, '')
                .replaceAll(labelRegexp, '');
            return {
                title: title || data,
                start: createTaskDateObject(startOfDay(start.date()), null),
                end: createTaskDateObject(
                    add(startOfDay(start.date()), { days: 1 }),
                    null,
                ),
                recurrence: null,
                labels: labelsFromText(data),
                chronoMeta: createChronoMeta(result),
            };
        }
    }

    return {
        title: data.replaceAll(labelRegexp, ''),
        labels: labelsFromText(data),
    };
};

export default chronoParse;
