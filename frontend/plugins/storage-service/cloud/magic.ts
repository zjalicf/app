import { NuxtAxiosInstance } from '@nuxtjs/axios';
import {
    formatISO,
    isEqual,
    startOfDay,
    endOfDay,
    setSeconds,
    setMilliseconds,
    add,
    parse,
} from 'date-fns';
import { Store } from 'vuex';
import { isElectron } from '~/helpers/is-electron';
import { QuickaddOptions, SafeElectronWindow } from '~/@types';
import { createTaskDateObject } from '~/helpers';
import { DateFormat, TimeFormat } from '~/helpers/date';
// import chronoParse from '@/helpers/chrono';

const sanitizeQuickaddOutput = (data: any) => {
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
    private axiosInstance: NuxtAxiosInstance;
    private store: Store<any>;

    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        this.axiosInstance = axios;
        this.store = store;
    }

    async quickAdd(text: string, ts: Date = new Date()): Promise<any> {
        if (!text) return { title: text, labels: [] };
        const formattedTS = formatISO(ts).split('+')[0];

        const isAssistantActive =
            isElectron() &&
            (await (
                window as SafeElectronWindow
            ).devicedriver.Assistant.isActive());

        const { timeFormat, dateFormat } =
            this.store.getters['appSettings/dateTimeOptions'];

        const quickaddOptions: QuickaddOptions = {
            pm_bias: timeFormat === TimeFormat.HOUR_12,
            date_format: dateFormat === DateFormat.EU ? 'EU' : 'US',
        };

        if (isAssistantActive) {
            const response = await (
                window as SafeElectronWindow
            ).devicedriver.Assistant.quickadd(
                text,
                formattedTS,
                quickaddOptions,
            );

            return sanitizeQuickaddOutput(response);
        }

        if (
            !this.store.getters['vault/isActiveLocal'] &&
            this.store.getters['auth/loggedIn']
        ) {
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
                const chronoParse = await import('@/helpers/chrono');
                return chronoParse.default(text, ts);
            }
        }

        const chronoParse = await import('@/helpers/chrono');
        return chronoParse.default(text, ts);
    }
}
