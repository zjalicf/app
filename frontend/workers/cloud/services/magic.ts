import {
    add,
    endOfDay,
    formatISO,
    isEqual,
    parse,
    setMilliseconds,
    setSeconds,
    startOfDay,
} from 'date-fns';
import { AxiosInstance } from 'axios';
import { QuickaddOptions } from '~/@types';
import { createTaskDateObject } from '~/helpers';
import { DateFormat, TimeFormat } from '~/helpers/date';
import { WorkerContext } from '~/@types/app';
import { ServiceKey } from '~/constants';
import chronoParse from '@/helpers/chrono';

const sanitizeQuickaddOutput = (data: any) => {
    data.labels = data.labels || data.labelsList || [];
    data.title = data.title || data.text;
    data.start_time = data.start_time || data.start || null;
    data.end_time = data.end_time || data.end || null;
    data.recurrence = data.recurrence || data.rrule || null;

    if (data.start_time && data.end_time) {
        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        const endParsed = setMilliseconds(setSeconds(endOfDay(end), 0), 0);

        if (isEqual(start, startOfDay(start)) && isEqual(end, endParsed)) {
            return {
                ...data,
                start: createTaskDateObject(startOfDay(start), null),
                end: createTaskDateObject(
                    add(startOfDay(end), { days: 1 }),
                    null,
                ),
            };
        }

        return {
            ...data,
            start: createTaskDateObject(null, start),
            end: createTaskDateObject(null, end),
        };
    }

    if (data.date) {
        const date = startOfDay(parse(data.date, 'yyyy-MM-dd', new Date()));

        return {
            ...data,
            start: createTaskDateObject(date, null),
            end: createTaskDateObject(add(date, { days: 1 }), null),
        };
    }

    return {
        ...data,
        start: null,
        end: null,
    };
};

export class NLPService {
    private axiosInstance: AxiosInstance;
    private context: WorkerContext;

    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        this.axiosInstance = axios;
        this.context = ctx;
    }

    async quickAdd(text: string, ts: Date = new Date()): Promise<any> {
        if (!text) return { title: text, labels: [] };
        const formattedTS = formatISO(ts).split('+')[0];

        const isAssistantActive =
            this.context.$config.platform === 'desktop' &&
            (await this.context.invoke(
                ServiceKey.DEVICE,
                'assistant:isActive',
                null,
            ));
        const { timeFormat, dateFormat } = (await this.context.invoke(
            ServiceKey.STORE,
            'getters:appSettings/dateTimeOptions',
            null,
        )) as { timeFormat: TimeFormat; dateFormat: DateFormat };
        const quickaddOptions: QuickaddOptions = {
            pm_bias: timeFormat === TimeFormat.HOUR_12,
            date_format: dateFormat === DateFormat.EU ? 'EU' : 'US',
        };

        if (isAssistantActive) {
            try {
                const response = await this.context.invoke(
                    ServiceKey.DEVICE,
                    'assistant:quickadd',
                    { data: text, ts: formattedTS, options: quickaddOptions },
                );
                return sanitizeQuickaddOutput(response);
            } catch (e) {
                console.log(e);
            }
        }
        const isActiveLocal = await this.context.invoke(
            ServiceKey.STORE,
            'getters:vault/isActiveLocal',
            null,
        );
        const loggedIn = await this.context.invoke(
            ServiceKey.STORE,
            'getters:auth/loggedIn',
            null,
        );
        if (!isActiveLocal && loggedIn) {
            try {
                const { data: response } = await this.axiosInstance.post(
                    '/api/v1/magic/quickadd/',
                    {
                        data: text,
                        ts: formattedTS,
                        ...quickaddOptions,
                    },
                );

                return sanitizeQuickaddOutput(response);
            } catch (e) {
                return chronoParse(text, ts);
            }
        }

        return chronoParse(text, ts);
    }
}
