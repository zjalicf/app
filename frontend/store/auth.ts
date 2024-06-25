import { v4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { Context } from '@nuxt/types';
import { currentTimezone } from '~/helpers/date';
import {
    CloudServiceAction,
    DatabaseServiceAction,
    ServiceKey,
} from '~/constants';
import { IUser } from '~/workers/database/indexeddb/types';

export const AUTH_MUTATIONS = {
    SET_USER: 'SET_USER',
    LOGOUT: 'LOGOUT',
};

export type AuthCredentials = {
    accessToken: string;
    refreshToken: string;
};

interface AppState {
    clientId: string | null;
    user: IUser | null;
    loggedIn: boolean;
    credentials: AuthCredentials | null;
}

export const state = (): AppState => ({
    clientId: null,
    user: null,
    loggedIn: false,
    credentials: null,
});

export const getters = {
    clientId(state: AppState) {
        return state.clientId;
    },
    credentials(state: AppState) {
        return state.credentials;
    },
    user(state: AppState) {
        return state.user;
    },
    loggedIn(state: AppState) {
        return state.loggedIn;
    },
};

export const mutations = {
    clientId(state: AppState, clientId: string) {
        state.clientId = clientId;
    },
    credentials(state: AppState, credentials: AuthCredentials | null) {
        state.credentials = credentials;
    },
    [AUTH_MUTATIONS.SET_USER](state: AppState, user: IUser) {
        state.user = user;
        state.loggedIn = true;
    },
    [AUTH_MUTATIONS.LOGOUT](state: AppState) {
        state.credentials = null;
        state.user = null;
        state.loggedIn = false;
    },
};

export const actions = {
    async refresh(this: Context, { state, commit, dispatch }: any) {
        if (!state.credentials) return;
        const data = {} as any;
        if (data?.status === StatusCodes.FORBIDDEN) {
            return dispatch('logout');
        }
        if (data?.status !== StatusCodes.OK) return;
        commit('credentials', data.data);

        const newStorageEntry = btoa(JSON.stringify(data.data));
        if (this.$utils.isMobile) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.remove({ key: 'acr' });
            await Preferences.set({
                key: 'acr',
                value: newStorageEntry,
            });
        }
        localStorage.removeItem('acr');
        localStorage.setItem('acr', newStorageEntry);
    },
    initialize(this: Context, { commit }: any, user: IUser) {
        commit(AUTH_MUTATIONS.SET_USER, user);
        this.$tracking.identifyUser(user);
        // @ts-ignore
        this.$sentry.setContext('user', {
            id: user.id,
        });
        this.$tracking.identifyApp();
    },
    async fetchUser(this: Context, { dispatch }: any) {
        try {
            await dispatch('user/initialize', undefined, {
                root: true,
            });
        } catch (e) {
            console.log(e);
            // @ts-ignore
            this.$sentry.captureException(e);
        }
    },

    logout(
        this: Context,
        { commit, dispatch, rootGetters }: any,
        waitForNuxt = false,
    ) {
        const redirect = (route: string) => {
            if (waitForNuxt) {
                (window as any).onNuxtReady(() => {
                    window.$nuxt.$router.push(route);
                });
            } else {
                this.app.router?.push(route);
            }
        };

        try {
            localStorage.removeItem('acr');
            commit(AUTH_MUTATIONS.LOGOUT);
            const localVaults = rootGetters['vault/local'];
            if (!localVaults.length) {
                redirect('/logout');
                return;
            }

            dispatch('trueLogout');
        } catch (e) {
            console.log(e);
        }
    },

    async trueLogout(this: Context, { dispatch, rootGetters }: any) {
        try {
            const user = { ...rootGetters['user/user'] };
            localStorage.setItem('skeleton-loader', 'false');
            const localVaults = rootGetters['vault/local'];
            if (!localVaults.length) {
                await this.app.router?.push('/auth/login');
            }
            const activeVault = rootGetters['vault/active'];
            if (activeVault?.type !== 'local') {
                if (!localVaults.length) {
                    await dispatch('vault/clearActiveVaultId', null, {
                        root: true,
                    });
                }

                await dispatch('vault/clearStoreVaultData', null, {
                    root: true,
                });
            }

            await dispatch('user/logout', null, { root: true });
            this.$appStorage.delete(
                this.$encryption.sessionIdentifier(user.id),
            );
            await dispatch('vault/removeSyncedVaults', null, { root: true });

            if (this.$utils.isMobile) {
                const { Preferences } = await import('@capacitor/preferences');
                await Preferences.remove({ key: 'acr' });
            }
            await this.$serviceRegistry.waitForEssentialServices();
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.LOGOUT,
            );

            dispatch('syncStatus/clear', true, { root: true });
        } catch (e) {
            console.log(e);
        }
    },

    async storeCredentials(
        this: Context,
        { commit, dispatch }: any,
        credentials: AuthCredentials,
    ) {
        commit('credentials', credentials);

        dispatch('user/updateCredentials', null, { root: true });

        if (this.$utils.isMobile) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({
                key: 'acr',
                value: btoa(JSON.stringify(credentials)),
            });
        }
        localStorage.setItem('acr', btoa(JSON.stringify(credentials)));
    },

    async updateTimezone(this: Context, { getters, commit }: any) {
        if (!getters.loggedIn) return;

        try {
            const timezone = currentTimezone();
            const user = await this.$serviceRegistry.invoke(
                ServiceKey.CLOUD,
                CloudServiceAction.SET_TIMEZONE,
                { timezone, callerContext: 'store/auth.ts updateTimezone' },
            );
            commit(AUTH_MUTATIONS.SET_USER, user);
        } catch (e) {
            console.log(e);
        }
    },

    async inPlaceLogin(
        this: Context,
        { getters, dispatch }: any,
        {
            access_token,
            refresh_token,
            expires_at,
        }: { access_token: string; refresh_token: string; expires_at: string },
    ) {
        let expiresAt;
        try {
            expiresAt = parseInt(expires_at as string, 10);
        } catch (e) {
            expiresAt = null;
        }

        const credentials = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt,
        };

        await this.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.INITIALIZE_USER,
            {
                payload: credentials,
                callerContext: 'store/auth.ts inPlaceLogin',
            },
        );

        await dispatch('storeCredentials', credentials);
        await dispatch('fetchUser');

        const loggedIn = getters['auth/loggedIn'];

        return loggedIn;
    },
};
