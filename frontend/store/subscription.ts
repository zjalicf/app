import { Context } from '@nuxt/types';
import Vue from 'vue';
import { add, isPast } from 'date-fns';

interface AppState {
    trialOptions: {
        showTrialMessage: boolean;
    };
}

export const state: () => AppState = () => ({
    trialOptions: {
        showTrialMessage: false,
    },
});

export const getters = {
    trialOptions(state: AppState) {
        return state.trialOptions;
    },
};

export const mutations = {
    initialize(
        state: AppState & Record<string, any>,
        value: Partial<AppState>,
    ) {
        Object.keys(value).forEach((key: string) => {
            const val = (value as any)[key];

            Vue.set(state, key, {
                ...state[key],
                ...val,
            });
        });
    },
    updateTrialOptions(state: AppState, value: AppState['trialOptions']) {
        state.trialOptions = { ...state.trialOptions, ...value };
    },
};

export const actions = {
    initialize(this: Context, { dispatch, commit, rootGetters }: any) {
        const trialOptions: AppState['trialOptions'] | undefined =
            this.$appStorage.get('trialOptions');

        if (
            this.$accessControl.isTrialActive &&
            trialOptions === undefined /* trial bol created at v last 10min */
        ) {
            const sub = rootGetters['user/subscription'];
            const subTrialStart = new Date(sub?.from);

            const trialInPast = isPast(
                add(subTrialStart, {
                    minutes: 10,
                }),
            );

            commit('updateTrialOptions', {
                showTrialMessage: !trialInPast,
            });
        }

        if (this.$accessControl.isProActive && trialOptions === undefined) {
            dispatch('updateTrialOptions', {
                showTrialMessage: false,
            });
        }
    },
    refresh(this: Context, { dispatch }: any) {
        dispatch('initialize');
    },
    updateTrialOptions(
        this: Context,
        { commit, getters }: any,
        value: Partial<AppState['trialOptions']>,
    ) {
        commit('updateTrialOptions', value);
        this.$appStorage.set('trialOptions', {
            ...getters.trialOptions,
            ...value,
        });
    },
};
