import { IEvent } from '~/@types';
import { deserializeTaskDateObject } from '~/store/tasks';

interface AppState {
    events: Partial<IEvent>[];
}

export const state: () => AppState = () => ({
    events: [],
});

export const getters = {
    byId: (state: AppState) => (_id: string) => {
        return state.events.find(({ id }) => id === _id);
    },
};

export const mutations = {
    addEvents: (state: AppState, events: any[]) => {
        state.events = events.map(event => ({
            ...event,
            start: deserializeTaskDateObject(event.start),
            end: deserializeTaskDateObject(event.end),
        }));
    },
};
