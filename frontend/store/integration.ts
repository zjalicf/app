import { Context } from '@nuxt/types';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import { add, endOfMonth, startOfMonth, sub } from 'date-fns';
import { Vue } from 'vue-property-decorator';
import { IEvent } from '~/@types';
import { IntegrationConfig } from '~/workers/integrations/base';
import {
    GoogleCalendarIntegrationAction,
    IntegrationsActions,
    ServiceKey,
    IntegrationType,
    AppleCalendarIntegrationAction,
} from '~/constants';

interface AppState {
    integrations: IntegrationConfig<any>[];
    entities: Record<string, IntegrationConfig<any>>;
    type: Record<string, string[]>;
    list: string[];
}

const sortCalendars = (
    integration: IntegrationConfig<any>,
): IntegrationConfig<any> => {
    return {
        ...integration,
        data: {
            ...integration.data,
            calendars: [...integration.data.calendars].sort(
                (a: any, b: any) => {
                    return a.primary ? -1 : b.primary ? 1 : 0;
                },
            ),
        },
    };
};

export const state = (): AppState => ({
    integrations: [],
    type: {},
    entities: {},
    list: [],
});

export const getters = {
    byId: (state: AppState) => (id: string) => {
        return state.integrations.find(({ id: _id }) => id === _id);
    },
    byVaultId: (state: AppState) => (_vaultId: string) => {
        return state.integrations
            .filter(({ vaultId }) => vaultId === _vaultId)
            .map(integration => {
                if (integration.data?.calendars)
                    return sortCalendars(integration);
                return integration;
            });
    },
    calendarById:
        (_: AppState, getters: any, _rootState: any, rootGetters: any) =>
        (calendarId: string, integrationId: string | null) => {
            if (!calendarId) return null;
            const integrations = getters.list;

            const defaultCalendar =
                rootGetters['vaultSettings/defaultCalendar'];

            if (
                calendarId === defaultCalendar.id ||
                calendarId === 'defaultCalendar'
            ) {
                const activeVaultId = rootGetters['vault/active']?.id;
                const name =
                    rootGetters['vault/byId'](activeVaultId)?.name ||
                    'Untitled';

                return { ...defaultCalendar, name };
            }

            const calendars = integrations
                .filter(({ id }: any) => id === integrationId)
                .map((integration: any) => {
                    if (integration.data?.calendars)
                        return sortCalendars(integration);
                    return integration;
                })
                .reduce((acc: any, integration: any) => {
                    if (integration.data?.calendars)
                        return [
                            ...acc,
                            ...integration.data?.calendars.map((cal: any) => ({
                                ...cal,
                                integrationId: integration.id,
                            })),
                        ];
                    if (integration.data?.calendar)
                        return [
                            ...acc,
                            {
                                ...integration.data.calendar,
                                integrationId: integration.id,
                            },
                        ];
                    return acc;
                }, [] as any[]);

            const calendar = calendars.find(({ id }: any) => id === calendarId);

            if (!calendar) return null;

            return {
                id: calendar.id,
                color:
                    calendar.displayColor ||
                    calendar.backgroundColor ||
                    calendar.color,
                name: calendar.summary || calendar.name,
                visible: calendar.state === 'visible',
                accessRole: calendar.accessRole || 'reader',
                integrationId: calendar.integrationId,
            };
        },
    list: (state: AppState) => {
        return (
            state.list?.map(id => {
                const integration = state.entities[id];
                if (integration.data?.calendars)
                    return sortCalendars(integration);
                return integration;
            }) ?? []
        );
    },
    byType: (state: AppState) => {
        const byType = Object.keys(state.type).reduce(
            (acc: any, type: string) => {
                acc[type] =
                    state.type?.[type]?.map(id => {
                        const integration = state.entities[id];
                        if (integration?.data?.calendars)
                            return sortCalendars(integration);
                        return integration;
                    }) ?? [];
                return acc;
            },
            {} as Record<string, any>,
        );
        return (type: string) => {
            return byType[type]?.filter((i: any) => !!i) ?? [];
        };
    },
    isLoading: (state: AppState) => {
        return state.integrations
            .filter(({ type }) => type === IntegrationType.GOOGLE_CALENDAR)
            .some(({ data }) => {
                return data.state === 'loading';
            });
    },
    calendars: (state: AppState) => {
        return state.integrations
            .map(integration => {
                if (integration.data?.calendars)
                    return sortCalendars(integration);
                return integration;
            })
            .reduce((acc, integration) => {
                if (integration.data?.calendars)
                    return [
                        ...acc,
                        ...integration.data?.calendars.map((cal: any) => ({
                            ...cal,
                            integrationId: integration.id,
                        })),
                    ];
                if (integration.data?.calendar)
                    return [
                        ...acc,
                        {
                            ...integration.data.calendar,
                            integrationId: integration.id,
                        },
                    ];
                return acc;
            }, [] as any[]);
    },
    getCalendarByEvent:
        (_state: AppState, getters: any, _rootState: any, rootGetters: any) =>
        (event: IEvent) => {
            const calendarId = event.calendarId;
            const integrationId = event.integrationId;
            if (!calendarId) return null; // necessary because there are calednars with ID: undefiend
            const defaultCalendar =
                rootGetters['vaultSettings/defaultCalendar'];

            if (
                calendarId === defaultCalendar.id ||
                calendarId === 'defaultCalendar'
            ) {
                const activeVaultId = rootGetters['vault/active']?.id;
                const name =
                    rootGetters['vault/byId'](activeVaultId)?.name ||
                    'Untitled';
                return { ...defaultCalendar, name };
            }

            // TODO: event does have calendarId but is not acreom. If in this case integrationId is null then there is no way to know which calendar it belongs to.
            if (!integrationId) return null;
            const calendar = getters.calendars.find((cal: any) => {
                return (
                    (cal.id === calendarId || cal.name === calendarId) &&
                    integrationId === cal.integrationId
                );
            });

            if (!calendar) return null;

            return {
                id: calendar.id,
                color:
                    calendar.displayColor ||
                    calendar.backgroundColor ||
                    calendar.color,
                acreomColorId: calendar.acreomColorId,
                name: calendar.summary || calendar.name,
                visible: calendar.state === 'visible',
                accessRole: calendar.accessRole || 'reader',
                integrationId: calendar.integrationId,
                selected: calendar.selected,
            };
        },
};

export const mutations = {
    sortCalendars: (calendars: any[]) => {
        return calendars.sort((a: any) => {
            return a.primary ? -1 : 0;
        });
    },
    clear: (state: AppState) => {
        state.integrations = [];
        state.type = {};
        state.entities = {};
        state.list = [];
    },
    initialize: (state: AppState, integrations: IntegrationConfig<any>[]) => {
        state.integrations = integrations;
        state.entities = integrations.reduce((acc, integration) => {
            return {
                ...acc,
                [integration.id]: integration,
            };
        }, {} as any);
        state.type = integrations.reduce((acc, integration) => {
            if (!acc[integration.type]) {
                return {
                    ...acc,
                    [integration.type]: [integration.id],
                };
            }
            return {
                ...acc,
                [integration.type]: [...acc[integration.type], integration.id],
            };
        }, {} as any);
        state.list = integrations.map(integration => {
            return integration.id;
        });
    },
    update: (state: AppState, integration: IntegrationConfig<any>) => {
        const exists = state.integrations.find(
            ({ id }) => id === integration.id,
        );
        if (!exists) {
            state.integrations = [...state.integrations, integration];
            Vue.set(state.entities, integration.id, integration);
            if (!state.type[integration.type]) {
                Vue.set(state.type, integration.type, []);
            }
            Vue.set(
                state.type[integration.type],
                state.type[integration.type].length,
                integration.id,
            );
            Vue.set(state.list, state.list.length, integration.id);
            return;
        }
        state.integrations = state.integrations.map(_integration => {
            if (_integration.id === integration.id) {
                return {
                    ..._integration,
                    ...integration,
                };
            }
            return _integration;
        });
        Vue.set(state.entities, integration.id, { ...exists, ...integration });
        Vue.set(
            state.type[integration.type],
            state.type[integration.type].indexOf(integration.id),
            integration.id,
        );
        Vue.set(state.list, state.list.indexOf(integration.id), integration.id);
    },
    delete: (state: AppState, integration: IntegrationConfig<any>) => {
        state.integrations = state.integrations.filter(
            ({ id }) => integration.id !== id,
        );
        Vue.delete(state.entities, integration.id);

        if (
            state.type[integration.type] &&
            state.type[integration.type].includes(integration.id)
        ) {
            Vue.delete(
                state.type[integration.type],
                state.type[integration.type].indexOf(integration.id),
            );
            if (state.type[integration.type].length === 0) {
                Vue.delete(state.type, integration.type);
            }
        }

        if (state.list && state.list.includes(integration.id)) {
            Vue.delete(state.list, state.list.indexOf(integration.id));
        }
    },
};

export const actions = {
    refresh(this: Context, { dispatch }: any) {
        return dispatch('initialize');
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
        this.$utils.refreshCalendarData();
    },
    async initialize(this: Context, { commit, dispatch, rootGetters }: any) {
        const activeVaultId = rootGetters['vault/activeVaultId'];
        if (!this.$workers.database) return;
        const integrations = await this.$workers
            .database!.Integrations.list<IntegrationConfig<any>[]>(
                activeVaultId,
            )
            .catch(() => [] as IntegrationConfig<any>[]);

        commit('initialize', integrations);
        integrations.forEach(integration => {
            if (
                [IntegrationType.ICS_CALENDAR, 'apple_calendar'].includes(
                    integration.type,
                )
            ) {
                this.$serviceRegistry.emit(
                    ServiceKey.INTEGRATIONS,
                    IntegrationsActions.MANUAL_RUN,
                    { id: integration.id, vaultId: integration.vaultId },
                );
            }
            if (integration.type === IntegrationType.AI_ASSISTANT) {
                if (integration.data?.type === 'local') {
                    this.$entities.assistant.checkModelState();
                }
                if (integration.data?.isActive) {
                    this.$entities.assistant.updateWorkerConfig(integration);
                }
            }
        });
        dispatch('dailyDoc/emitCalendarDateChange', undefined, { root: true });
        this.$utils.refreshCalendarData();
    },

    update(
        this: Context,
        { dispatch }: any,
        integration: IntegrationConfig<any>,
    ) {
        return dispatch('save', integration);
    },
    async save(
        this: Context,
        { commit, dispatch, rootGetters }: any,
        integration: IntegrationConfig<any>,
    ) {
        if (!this.$workers.database) return;
        commit('update', integration);
        await this.$workers.database.Integrations.save(
            integration.vaultId || rootGetters['vault/active']?.id,
            integration,
        );
        this.$tracking.trackEvent('integration', {
            action: 'create',
            entity_id: integration.id,
            type: integration.type,
        });
        dispatch(
            'appSettings/dismissIntegrationPlaceholder',
            integration.type,
            { root: true },
        );
        dispatch('dailyDoc/emitCalendarDateChange', undefined, { root: true });
        this.$utils.refreshCalendarData();
    },
    updateICSDefaultReminders(
        this: Context,
        { getters, dispatch }: any,
        { id, defaultReminders }: { id: string; defaultReminders: any[] },
    ) {
        const integration = cloneDeep(getters.byId(id));
        if (!integration) return;

        integration.data.defaultReminders = defaultReminders;

        dispatch('save', integration);
        this.$utils.refreshCalendarData();
    },
    updateCalendar(
        this: Context,
        { getters, dispatch }: any,
        { calendar, integrationId }: { calendar: any; integrationId: string },
    ) {
        const integration = cloneDeep(getters.byId(integrationId));
        if (!integration) return;

        if (integration.type === IntegrationType.ICS_CALENDAR) {
            integration.data.calendar = {
                ...integration.data.calendar,
                ...calendar,
            };
        }
        if (integration.type === 'google_calendar') {
            // TODO: add name for gcal
            integration.data.calendars = integration.data.calendars.map(
                (_calendar: any) => {
                    if (calendar.id === _calendar.id) {
                        return { ..._calendar, ...calendar };
                    }

                    return _calendar;
                },
            );
        }
        if (integration.type === 'apple_calendar') {
            integration.data.calendars = integration.data.calendars.map(
                (_calendar: any) => {
                    if (calendar.id === _calendar.id) {
                        return { ..._calendar, ...calendar };
                    }

                    return _calendar;
                },
            );
        }

        dispatch('save', integration);
        this.$utils.refreshCalendarData();
    },
    calendarRangeChange(
        this: Context,
        { getters, rootGetters }: any,
        {
            date,
            calendarType,
        }: { date: Date; calendarType: '1day' | '4day' | 'week' | 'month' },
    ) {
        const typeToInterval = (type: '1day' | '4day' | 'week' | 'month') => {
            switch (type) {
                case 'month':
                    return { months: 1 };
                case '1day':
                    return { days: 5 };
                case '4day':
                    return { days: 10 };
                default:
                    return { weeks: 2 };
            }
        };

        const integrations = getters.byType(IntegrationType.GOOGLE_CALENDAR);
        const interval = typeToInterval(calendarType);
        const range = {
            start: sub(date, interval),
            end: add(add(date, interval), interval),
        };
        if (calendarType === 'month') {
            range.start = startOfMonth(range.start);
            range.end = endOfMonth(range.end);
        }

        const appleCalendarIntegrations = getters.byType('apple_calendar');
        appleCalendarIntegrations.forEach(
            (integration: IntegrationConfig<any>) => {
                if (integration.vaultId !== rootGetters['vault/active']?.id)
                    return;
                this.$serviceRegistry.emit(
                    ServiceKey.INTEGRATIONS,
                    AppleCalendarIntegrationAction.GET_RANGE,
                    {
                        config: integration,
                        range,
                    },
                );
            },
        );

        const isLoggedIn = rootGetters['auth/loggedIn'];
        if (!isLoggedIn) return;

        const gcalIntegrations = getters.byType('google_calendar');
        gcalIntegrations.forEach((integration: IntegrationConfig<any>) => {
            if (integration.vaultId !== rootGetters['vault/active']?.id) return;
            integration.data.calendars.forEach((calendar: any) => {
                if (!calendar.selected) return;

                const calendarId = calendar.id;
                this.$serviceRegistry.emit(
                    ServiceKey.INTEGRATIONS,
                    GoogleCalendarIntegrationAction.GET_EVENTS,
                    {
                        config: integration,
                        calendarId,
                        range,
                    },
                );
            });
        });
        this.$utils.refreshCalendarData();
    },
    deleteVaultIntegrations(this: Context, { commit, getters }: any) {
        const integrations = getters.list;
        integrations.forEach((integration: IntegrationConfig<any>) => {
            commit('delete', integration);
        });
    },
    async delete(
        this: Context,
        { commit }: any,
        integration: IntegrationConfig<any>,
    ) {
        if (!this.$workers.database) return;
        commit('delete', integration);
        await this.$workers.database.Integrations.delete(
            integration.vaultId,
            integration,
        );

        this.$tracking.trackEvent('integration', {
            action: 'delete',
            entity_id: integration.id,
            type: integration.type,
        });

        this.$utils.refreshCalendarData();
    },
    indexedDBUpdate(
        this: Context,
        { commit, dispatch }: any,
        integrations: IntegrationConfig<any> | IntegrationConfig<any>[],
    ) {
        integrations = isArray(integrations) ? integrations : [integrations];
        // first update content
        for (const integration of integrations) {
            commit('update', integration);
        }
        dispatch('dailyDoc/emitCalendarDateChange', undefined, { root: true });
        this.$utils.refreshCalendarData();
    },
    indexedDBDelete(
        this: Context,
        { commit, getters }: any,
        ids: string | string[],
    ) {
        ids = isArray(ids) ? ids : [ids];
        // first update content
        for (const id of ids) {
            const tabType = getters.byId(id)?.type;
            this.$tabs.closeTabsByEntityId(tabType);
            commit('delete', { id });
        }
        this.$utils.refreshCalendarData();
    },
};
