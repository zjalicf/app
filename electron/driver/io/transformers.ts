import { isString } from '../../helpers/utils';
import Reader from './reader';

const chrono = require('chrono-node');

const parseTagsAndLabels = entity => {
    if (entity.tags && entity.tags.length) {
        if (!Array.isArray(entity.tags)) {
            entity.tags = [entity.tags];
        }
        const tags = [...entity.tags];
        delete entity.tags;
        entity.labels = tags;
    }
    return parseLabels(entity);
};

const parseLabels = entity => {
    if (!entity.labels || !entity.labels.length) return entity;
    if (!Array.isArray(entity.labels)) {
        entity.labels = [entity.labels];
    }
    entity.labels = entity.labels.map(label => {
        if (isString(label)) return label;
        return label?.label ?? label;
    });
    return entity;
};

const parseDateObjectOnEntity = entity => {
    if (!entity.start && !entity.end) return entity;
    if (!entity.start?.date && !entity.start?.dateTime) {
        entity.start = null;
    }
    if (!entity.end?.date && !entity.end?.dateTime) {
        entity.end = null;
    }
    return entity;
};

const parseDate = entity => {
    const padWithZero = (str: number): string => {
        if (str < 10) return `0${str}`;
        return `${str}`;
    };
    const parseRawDate = (date: string) => {
        const referenceDate = entity.updatedAt
            ? new Date(entity.updatedAt)
            : new Date();
        if (isString(date)) {
            const [result] = chrono.parse(date, referenceDate, {
                forwardDate: true,
            });
            // @ts-ignore
            const isAllDay = !result.start.knownValues.hour;
            if (isAllDay) {
                return {
                    date: `${result.start.get('year')}-${padWithZero(
                        result.start.get('month'),
                    )}-${padWithZero(result.start.get('day'))}`,
                };
            }
            return {
                dateTime: result.start.date(),
            };
        }
    };
    if (entity.start) {
        if (isString(entity.start)) {
            entity.start = parseRawDate(entity.start);
        }
        if (isString(entity.start.date)) {
            entity.start = {
                ...entity.start,
                ...parseRawDate(entity.start.date),
            };
        }
        if (isString(entity.start.dateTime)) {
            entity.start = {
                ...entity.start,
                ...parseRawDate(entity.start.date),
            };
        }
    }
    if (entity.end) {
        if (isString(entity.end)) {
            entity.end = parseRawDate(entity.end);
        }
        if (isString(entity.end.date)) {
            entity.end = {
                ...entity.end,
                ...parseRawDate(entity.end.date),
            };
        }
        if (isString(entity.start.dateTime)) {
            entity.end = {
                ...entity.end,
                ...parseRawDate(entity.end.dateTime),
            };
        }
    }
    return entity;
};

Reader.registerTransformer(parseTagsAndLabels);
Reader.registerTransformer(parseDate);
Reader.registerTransformer(parseDateObjectOnEntity);
