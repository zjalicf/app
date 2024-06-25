import { Context } from '@nuxt/types';
import { add, isPast } from 'date-fns';
import isArray from 'lodash/isArray';
import {
    CloudServiceAction,
    DatabaseServiceAction,
    ServiceKey,
} from '~/constants';
import { IUser } from '~/workers/database/indexeddb/types';
import { isDatabaseService } from '~/plugins/workers/database';
import { CloudResponse } from '~/@types/app';

interface AppState {
    user: IUser | null;
}

export const state = (): AppState => ({
    user: null,
});

export const getters = {
    user: (state: AppState) => {
        return state.user;
    },
    credentials: (state: AppState) => {
        return state.user?.credentials;
    },
    subscription: (_: AppState, getters: any) => {
        return getters.user?.subscription ? getters.user.subscription : null;
    },
    subscriptionActive: (_: AppState, getters: any) => {
        const subExpireDate = new Date(getters.subscription?.to);
        return (
            !!getters.subscription &&
            getters.subscription.status === 'active' &&
            !isPast(
                add(subExpireDate, {
                    minutes: subExpireDate.getTimezoneOffset(),
                }),
            )
        );
    },
    subscriptionExpired: (_: AppState, getters: any) => {
        const subExpireDate = new Date(getters.subscription?.to);
        return (
            !getters.subscription ||
            (!!getters.subscription &&
                isPast(
                    add(subExpireDate, {
                        minutes: subExpireDate.getTimezoneOffset(),
                    }),
                ))
        );
    },
};

export const mutations = {
    logout: (state: AppState) => {
        state.user = null;
    },
    initialize: (state: AppState, user: IUser) => {
        state.user = user;
    },
    update: (state: AppState, user: Partial<IUser>) => {
        state.user = { ...state.user, ...user } as IUser;
    },
    delete: (state: AppState, _id: string) => {
        state.user = null;
    },
};

export const actions = {
    async initialize(this: Context, { commit, dispatch }: any) {
        await this.$serviceRegistry.waitForEssentialServices();
        const database = this.$serviceRegistry.service(ServiceKey.DATABASE);
        if (!isDatabaseService(database)) return;
        const users = await database.User.list<IUser[]>('');
        let user = users.pop?.() ?? null;

        // force logout if invalid token, if you cant retrieve user and get 403, you will be logged out
        // await this.$cloudService.User.retrieve();
        const response = await this.$serviceRegistry.invoke<CloudResponse<any>>(
            ServiceKey.CLOUD,
            CloudServiceAction.RETRIEVE,
            {
                entity: 'user',
                payload: {},
                callerContext: 'store/view.ts initialize',
            },
        );

        if (!response?.status || response.status >= 400) {
            dispatch('user/logout', null, { root: true });
            return;
        }

        if (!user) {
            if (response!.status !== 200) return;
            user = response!.data;
        }

        commit('initialize', user);
        dispatch('auth/initialize', user, { root: true });
        dispatch('subscription/refresh', null, { root: true });

        this.$serviceRegistry.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.INITIALIZE_SYNC,
        );
    },
    async retrieveFromDB(this: Context, { commit, dispatch }: any) {
        await this.$serviceRegistry.waitForEssentialServices();
        const database = this.$serviceRegistry.service(ServiceKey.DATABASE);
        if (!isDatabaseService(database)) return;
        const users = await database.User.list<IUser[]>('');
        const user = users.pop?.() ?? null;

        if (!user) {
            return null;
        }
        commit('initialize', user);
        dispatch('auth/initialize', user, { root: true });
        return user;
    },
    update(this: Context, { commit }: any, user: IUser) {
        commit('update', user);
    },
    updateRemote(this: Context, { commit }: any, user: IUser) {
        commit('update', user);
        return this.$serviceRegistry
            .service(ServiceKey.DATABASE)
            .User.save('', user);
    },
    async checkForUpdate(this: Context, { commit }: any) {
        try {
            const response = await this.$serviceRegistry.invoke<
                CloudResponse<any>
            >(ServiceKey.CLOUD, CloudServiceAction.RETRIEVE, {
                entity: 'user',
                payload: {},
                callerContext: 'store/user.ts checkForUpdate',
            });
            commit('update', response!.data);
            const database = this.$serviceRegistry.service(ServiceKey.DATABASE);
            if (!isDatabaseService(database)) return;
            await database.User.save('', response!.data);
        } catch (e) {
            console.log(e);
        }
    },
    logout(this: Context, { commit }: any) {
        commit('logout');
    },
    indexedDBCreate(this: Context, { commit, dispatch }: any, user: IUser) {
        if (
            user.subscription &&
            user.subscription.status === 'active' &&
            user.subscription.type === 'trial'
        ) {
            const subTrialStart = new Date(user.subscription.from);

            const trialInPast = isPast(
                add(subTrialStart, {
                    minutes: 10,
                }),
            );

            dispatch(
                'subscription/updateTrialOptions',
                { showTrialMessage: !trialInPast },
                { root: true },
            );
        }
        commit('initialize', user);
    },

    updateCredentials(this: Context, { commit }: any, credentials: any) {
        commit('update', { credentials });
    },
    indexedDBUpdate(this: Context, { commit, dispatch }: any, user: IUser) {
        if (
            user.subscription &&
            user.subscription.status === 'active' &&
            user.subscription.type === 'trial'
        ) {
            const subTrialStart = new Date(user.subscription.from);

            const trialInPast = isPast(
                add(subTrialStart, {
                    minutes: 10,
                }),
            );

            dispatch(
                'subscription/updateTrialOptions',
                { showTrialMessage: !trialInPast },
                { root: true },
            );
        }
        commit('update', user);
    },
    async delete(this: Context, { commit, dispatch }: any) {
        try {
            await this.$serviceRegistry.invoke<CloudResponse<any>>(
                ServiceKey.CLOUD,
                CloudServiceAction.DELETE,
                {
                    entity: 'user',
                    payload: {},
                    callerContext: 'store/user.ts delete',
                },
            );
            await dispatch('auth/logout', null, { root: true });
            commit('delete');
        } catch (e) {
            console.log(e);
        }
    },
    indexedDBDelete(this: Context, { commit }: any, ids: string | string[]) {
        if (!ids) return;
        ids = isArray(ids) ? ids : [ids];
        // first update content
        for (const id of ids) {
            commit('delete', id);
        }
    },
};
