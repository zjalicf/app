import { add, format, parseISO, startOfDay, sub } from 'date-fns';
import { Context } from '@nuxt/types';
import { TabType } from '~/constants';

interface AppState {
    overviewDate: Date;
    calendarDate: Date;
}

export const state = (): AppState => ({
    overviewDate: new Date(),
    calendarDate: new Date(),
});

export const getters = {
    get: (state: AppState) => {
        return format(state.overviewDate, 'yyyy-MM-dd');
    },
    title: (state: AppState) => {
        return format(state.overviewDate, 'EEEE, LLL d, yyyy');
    },
    date: (state: AppState) => {
        return state.overviewDate;
    },
    range: (state: AppState) => {
        const start = new Date(state.overviewDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(state.overviewDate);
        end.setHours(23, 59, 59, 999);

        return {
            start,
            end,
        };
    },
    calendarDate: (state: AppState) => {
        return startOfDay(new Date(state.calendarDate));
    },
    calendarDateRaw: (state: AppState) => {
        return state.calendarDate;
    },
};

export const mutations = {
    today: (state: AppState) => {
        state.overviewDate = new Date();
    },
    next: (state: AppState) => {
        state.overviewDate = add(state.overviewDate, { days: 1 });
    },
    previous: (state: AppState) => {
        state.overviewDate = sub(state.overviewDate, { days: 1 });
    },
    set: (state: AppState, date: Date) => {
        state.overviewDate = date;
    },
    setFromString: (state: AppState, str: string) => {
        state.overviewDate = parseISO(str);
    },
    calendarToday: (state: AppState) => {
        state.calendarDate = new Date();
    },
    calendarSetDate: (state: AppState, date: Date) => {
        state.calendarDate = new Date(date);
    },
};

export const actions = {
    dailyDocToday: ({ commit }: any) => {
        commit('today');
    },
    calendarSetDate: ({ commit, dispatch }: any, date: Date) => {
        commit('calendarSetDate', date);
        dispatch('emitCalendarDateChange', date);
    },
    emitCalendarDateChange(
        this: Context,
        { dispatch, rootGetters }: any,
        date?: Date,
    ) {
        if (this.$utils.isMobile) return;
        const calendarTabs = rootGetters['tabs/list'].filter(
            ({ type }: any) => {
                return type === TabType.MY_DAY;
            },
        );

        for (const tab of calendarTabs) {
            const tabData = tab.data;
            dispatch(
                'integration/calendarRangeChange',
                {
                    date: startOfDay(tabData.calendarDate || new Date()),
                    calendarType: tabData.calendarType || 'month',
                },
                { root: true },
            );
        }

        if (date) {
            dispatch(
                'integration/calendarRangeChange',
                {
                    date: startOfDay(date || new Date()),
                    calendarType: 'day',
                },
                { root: true },
            );
        }
    },
};
