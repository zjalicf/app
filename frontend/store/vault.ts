import { Context } from '@nuxt/types';
import debounce from 'lodash/debounce';
import isArray from 'lodash/isArray';

import { v4 } from 'uuid';
import { Vue } from 'vue-property-decorator';
import { DatabaseWrapper, isDatabaseService } from '~/plugins/workers/database';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { IVault } from '~/workers/database/indexeddb/types';
import { calcDefaultVaultColor } from '~/helpers';

interface AppState {
    syncStatus: Record<IVault['id'], number>;
    vaultStatus: Record<
        IVault['id'],
        {
            state: string;
            info: any;
        }
    >;
    vaults: Record<IVault['id'], IVault>;
    list: IVault['id'][];
    local: IVault['id'][];
    remote: IVault['id'][];
    activeVaultId: string | null;
}

export const state = (): AppState => ({
    syncStatus: {},
    vaultStatus: {},
    vaults: {},
    list: [],
    local: [],
    remote: [],
    activeVaultId: null,
});

export const getters = {
    preferences: (
        _: AppState,
        getters: any,
    ): Partial<IVault['preferences']> => {
        return getters.active?.preferences || {};
    },
    active: (state: AppState): IVault | null => {
        if (!state.activeVaultId) {
            return null;
        }
        return state.vaults[state.activeVaultId!] ?? null;
    },
    activeVaultId: (state: AppState): string | null => {
        return state.activeVaultId;
    },
    isActiveLocal: (state: AppState, getters: any) => {
        return state.vaults[state.activeVaultId!]?.type === 'local';
    },
    byId: (state: AppState) => (_id: string) => {
        return state.vaults[_id] ?? null;
    },
    local: (state: AppState) => {
        return state.local.map(id => state.vaults[id]);
    },
    remote: (state: AppState) => {
        return state.remote.map(id => state.vaults[id]);
    },
    list: (state: AppState) => {
        return state.list.map(id => state.vaults[id]);
    },
    type: (state: AppState, getters: any) => {
        return state.vaults[state.activeVaultId!]?.type ?? null;
    },
    syncStatus: (state: AppState) => (id: string) => {
        return state.syncStatus[id] ?? 0;
    },
    vaultStatus: (state: AppState) => (id: string) => {
        return state.vaultStatus[id] ?? null;
    },
    defaultCalendar: (
        _: AppState,
        getters: any,
        _rootState: any,
        rootGetters: any,
    ) => {
        const defaultCalendar = {
            calendarId: 'acreom',
            integrationId: null,
            integrationType: null,
        };

        const readOnlyAccess =
            (!rootGetters['vault/isActiveLocal'] &&
                rootGetters['user/subscriptionExpired']) ||
            ['canceled', 'past_due'].includes(
                rootGetters['user/subscription']?.status,
            );

        if (readOnlyAccess) return defaultCalendar;

        const id = getters.active?.id;
        const vault = getters.byId(id);

        if (!vault) {
            return defaultCalendar;
        }

        const calendarId = vault.defaultCalendar?.calendarId;
        const integrationId = vault.defaultCalendar?.integrationId;

        if (!calendarId) {
            return defaultCalendar;
        }

        const exists = rootGetters['integration/calendarById'](
            calendarId,
            integrationId,
        );

        if (!exists) {
            return defaultCalendar;
        }

        return vault.defaultCalendar || defaultCalendar;
    },

    color: (_state: AppState, getters: any) => (_id: string) => {
        const vault = getters.byId(_id);

        if (!vault) {
            return '#ffd500';
        }

        if (vault?.color) {
            return vault.color;
        }
        return calcDefaultVaultColor(vault.name);
    },
};

export const mutations = {
    active: (state: AppState, vault: any) => {
        state.activeVaultId = vault?.id ?? null;
    },
    clearActiveVaultId: (state: AppState) => {
        state.activeVaultId = null;
    },
    initialize: (state: AppState, vaults: any[]) => {
        state.vaults = vaults.reduce((acc, vault) => {
            acc[vault.id] = vault;
            return acc;
        }, {} as any);
        state.syncStatus = vaults.reduce((acc, vault) => {
            acc[vault.id] = 0;
            return acc;
        }, {} as any);
        state.list = vaults.map(vault => vault.id);
        state.local = vaults
            .filter(vault => vault.type === 'local')
            .map(vault => vault.id);
        state.remote = vaults
            .filter(vault => vault.type === 'remote')
            .map(vault => vault.id);
    },
    setSyncStatus: (state: AppState, { vaultId, status }: any) => {
        Vue.set(state.syncStatus, vaultId, status);
    },
    setVaultStatus: (state: AppState, { vaultId, ...rest }: any) => {
        Vue.set(state.vaultStatus, vaultId, {
            ...(state.vaultStatus[vaultId] || {}),
            ...rest,
        });
    },
    update: (state: AppState, vault: any) => {
        const oldVaultState = state.vaults[vault.id] ?? {};
        Vue.set(state.vaults, vault.id, { ...oldVaultState, ...vault });
        if (!oldVaultState.id) {
            Vue.set(state.syncStatus, vault.id, 0);
        }
        const vaultIndex = state.list.indexOf(vault.id);
        Vue.set(
            state.list,
            vaultIndex < 0 ? state.list.length : vaultIndex,
            vault.id,
        );
        if (vault.type === 'local') {
            const localIndex = state.local.indexOf(vault.id);
            Vue.set(
                state.local,
                localIndex < 0 ? state.local.length : localIndex,
                vault.id,
            );
        }
        if (vault.type === 'remote') {
            const remoteIndex = state.remote.indexOf(vault.id);
            Vue.set(
                state.remote,
                remoteIndex < 0 ? state.remote.length : remoteIndex,
                vault.id,
            );
        }
        if (state.activeVaultId === vault.id) {
            state.activeVaultId = vault.id;
        }
    },
    delete: (state: AppState, _id: string) => {
        if (state.activeVaultId === _id) {
            const newActiveVaultId = state.list.find(id => {
                return id !== _id;
            });
            state.activeVaultId = newActiveVaultId ?? null;
        }

        const listIndex = state.list.indexOf(_id);
        const localIndex = state.local.indexOf(_id);
        const remoteIndex = state.remote.indexOf(_id);

        if (listIndex > -1) {
            Vue.delete(state.list, state.list.indexOf(_id));
        }
        if (localIndex > -1) {
            Vue.delete(state.local, state.local.indexOf(_id));
        }
        if (remoteIndex > -1) {
            Vue.delete(state.remote, state.remote.indexOf(_id));
        }
        Vue.delete(state.syncStatus, _id);

        Vue.delete(state.vaults, _id);
    },
};

export const actions = {
    async initialize(
        this: Context,
        { commit, getters, dispatch, rootGetters }: any,
        shouldRedirect: boolean = true,
    ) {
        const data = await this.$serviceRegistry.invoke<IVault[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            { table: 'vaults' },
        );

        const noData = !data || !isArray(data) || data.length === 0;

        if (noData) {
            if (shouldRedirect) {
                if (rootGetters['auth/loggedIn']) {
                    if (this.$config.platform === 'web') {
                        this.app.router?.push('/auth/vault-setup');
                    } else {
                        this.app.router?.push('/auth/vault');
                    }
                } else {
                    this.app.router?.push('/auth/login');
                }
            }
            return;
        }

        commit('initialize', data);
        if (!getters.active) {
            const activeVault = await this.$serviceRegistry.invoke<IVault>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.GET_ACTIVE_VAULT,
                {},
            );
            const vaultToBeActive = (activeVault || data?.[0]) ?? null;
            commit('active', vaultToBeActive);
            dispatch('syncStatus/clear', false, { root: true });
        }
        await dispatch('dailyDoc/emitCalendarDateChange', undefined, {
            root: true,
        });

        try {
            await dispatch('reloadData', getters.active.id);
            this.$serviceRegistry.emit(ServiceKey.NUXT, 'emit', {
                event: 'vaults-initialized',
            });
        } catch (e) {
            // @ts-ignore
            e.message = 'Error while reloading data: ' + e.message;
            console.log(e);
            // @ts-ignore
            this.$sentry.captureException(e);
        }
    },
    async activate(
        this: Context,
        { getters, dispatch }: any,
        vaultId: string | Record<string, any>,
    ) {
        const activeVaultId = getters.active?.id;
        await dispatch('_activate', vaultId);

        if (activeVaultId) {
            this.$tabs.addToHistory({
                name: 'Vault',
                shouldCallForward: false,
                forward: () => {
                    return dispatch('_activate', vaultId);
                },
                backward: () => {
                    return dispatch('_activate', activeVaultId);
                },
            });
        }

        const id = typeof vaultId === 'string' ? vaultId : vaultId.id;
        this.$tracking.trackEvent('vault', {
            action: 'activate',
            entity_id: id,
        });
    },
    async _activate(
        this: Context,
        { getters, dispatch, commit }: any,
        vaultId: string | Record<string, any>,
    ) {
        const activeVaultId = getters.active?.id;
        if (vaultId === null) {
            await dispatch('syncStatus/clear', false, { root: true });
            await dispatch('clearStoreVaultData');
            await this.app.router?.push('/auth/login');
            commit('active', null);
            return;
        }
        const id = typeof vaultId === 'string' ? vaultId : vaultId.id;
        const shouldRedirect =
            typeof vaultId === 'string' ? true : vaultId.redirect;

        if (activeVaultId === id) return;
        if (id === null) {
            commit('active', null);
            return;
        }
        // @ts-ignore TODO
        commit(
            'active',
            getters.list.find(({ id: _id }: IVault) => id === _id),
        );

        if (shouldRedirect) {
            await this.app.router?.push('/');
        }

        dispatch('dailyDoc/dailyDocToday', undefined, { root: true });

        const database = this.$serviceRegistry.service(ServiceKey.DATABASE);
        if (isDatabaseService(database)) {
            await database.execute(DatabaseServiceAction.SET_ACTIVE_VAULT, {
                payload: { id },
            });
        }
        await dispatch('reloadData', id);
        dispatch('syncStatus/set', getters.syncStatus(vaultId) ?? 0, {
            root: true,
        });
    },
    async removeSyncedVaults(
        this: Context,
        { commit, getters, dispatch }: any,
    ) {
        const vaults = getters.list;
        const localVaults = vaults.filter(
            ({ type }: IVault) => type === 'local',
        );

        if (localVaults.length) {
            await dispatch('activate', localVaults?.[0] ?? null);
        }
        commit('initialize', localVaults);
    },

    clearActiveVaultId(this: Context, { commit }: any) {
        commit('clearActiveVaultId');
    },

    setVaultStatus(this: Context, { commit }: any, payload: any) {
        commit('setVaultStatus', payload); // { vaultId, deviceStatus, cloudStatus }
    },
    setSyncStatus(
        this: Context,
        { commit, getters, dispatch }: any,
        payload: any,
    ) {
        commit('setSyncStatus', payload);

        const activeVaultId = getters.activeVaultId;
        if (activeVaultId !== payload.vaultId) return;

        dispatch('syncStatus/set', payload.status ?? 0, {
            root: true,
        });
    },

    clearStoreVaultData(this: Context, { dispatch }: any) {
        return Promise.all([
            dispatch('label/clear', null, { root: true }),
            dispatch('integration/clear', null, { root: true }),
            dispatch('event/clear', null, { root: true }),
            dispatch('folder/clear', null, { root: true }),
            dispatch('document/clear', null, { root: true }),
            dispatch('image/clear', null, { root: true }),
            dispatch('vaultConfig/clear', null, { root: true }),
            dispatch('integrationData/clear', null, { root: true }),
            dispatch('tabs/clear', null, { root: true }),
            dispatch('view/clear', null, { root: true }),
        ]);
    },

    async reloadData(
        this: Context,
        { getters, commit, dispatch, rootGetters }: any,
        vaultId: string,
    ) {
        // @ts-ignore TODO
        const route = this.$router.currentRoute.name;
        const vault = getters.byId(vaultId);
        commit('active', vault);
        if (!vault) {
            dispatch('clearStoreVaultData');
            return;
        }

        const isEncryptionUnlocked =
            await this.$encryption.isEncryptionUnlocked();
        const isEncryptionEnabled = this.$encryption.isEncryptionEnabled();
        if (
            isEncryptionEnabled &&
            vault.type === 'remote' &&
            !isEncryptionUnlocked
        ) {
            return;
        }

        await Promise.all([
            dispatch('appSettings/refresh', null, { root: true }),
            dispatch('view/refresh', null, { root: true }),
            dispatch('tasks/clear', null, { root: true }),
            dispatch('label/clear', null, { root: true }),
            dispatch('integration/refresh', null, { root: true }),
        ]);

        await Promise.all([
            dispatch('event/refresh', null, { root: true }),
            dispatch('folder/refresh', null, { root: true }),
            dispatch('document/refresh', null, { root: true }),
            dispatch('vaultConfig/refresh', null, { root: true }),
            dispatch('vaultSettings/refresh', null, { root: true }),
        ]).then(() => {
            dispatch('image/refresh', null, { root: true });
            dispatch('integrationData/refresh', null, { root: true });
            dispatch('localConflicts/refresh', null, { root: true });
        });

        await this.$tabs.recalculateAllTabs();

        if (route === 'index' || route === 'mobile') {
            const title = rootGetters['dailyDoc/title'];
            const date = rootGetters['dailyDoc/get'];
            await dispatch(
                'document/dailyDoc',
                { dailyDoc: date, title },
                { root: true },
            );
        }
    },
    async update(
        this: Context,
        { commit, dispatch, getters }: any,
        vault: any,
    ) {
        if (!this.$workers.database) return;
        const id = vault.id;
        const oldState = getters.byId(id) ?? {};
        commit('update', { ...oldState, ...vault });

        if (vault.status === 'new') {
            commit('update', { id, status: 'creating' });
            await this.$workers.database.Vaults.save('', vault);
            commit('update', { id, status: 'created' });
            this.$tracking.trackEvent('vault', {
                action: 'create',
                entity_id: id,
                type: vault.type,
            });

            return;
        }

        if (vault.status === 'creating') {
            return;
        }

        debouncedSaveVaultRequest(this.$workers.database, vault);
    },
    indexedDBUpdate(
        this: Context,
        { commit, getters, dispatch }: any,
        vaults: any,
    ) {
        let shouldActivate = true;
        vaults = isArray(vaults) ? vaults : [vaults];

        for (const vault of vaults) {
            if (vault.isStatusUpdate) {
                shouldActivate = false;
                delete vault.isStatusUpdate;
            }
            if (
                Object.keys(vault).every(key => ['id', 'status'].includes(key))
            ) {
                continue;
            }
            commit('update', vault);
        }

        if (!getters.active && shouldActivate) {
            dispatch('activate', vaults.shift().id);
        }
    },
    async delete(
        this: Context,
        { commit, dispatch, getters }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        if (getters.list.length === 0) return;
        if (!getters.list.some(({ id: _id }: IVault) => _id === id)) return;
        const remainingVaults = getters.list.filter(
            (vault: IVault) => vault.id !== id,
        );
        if (remainingVaults.length === 0) {
            this.app.router?.push(`/no-vault?id=${id}`);
            commit('update', { id, toBeDeleted: true });
            return;
        }
        commit('delete', id);

        await this.$workers.database.Vaults.delete('', { id });
        const vault = await this.$serviceRegistry.invoke<IVault>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_ACTIVE_VAULT,
            {},
        );
        dispatch('integration/deleteVaultIntegrations', null, { root: true });
        if (vault) {
            dispatch('activate', vault.id);
        }
    },
    async deleteLastVault(this: Context, { commit, getters }: any, id: string) {
        if (!this.$workers.database) return;
        const vault = getters.byId(id);
        if (!vault || !vault.toBeDeleted) return;
        commit('delete', id);
        await this.$workers.database.Vaults.delete('', { id });
    },
    async indexedDBDelete(
        this: Context,
        { dispatch, getters, commit }: any,
        ids: string | string[],
    ) {
        ids = isArray(ids) ? ids : [ids];
        const vault = await this.$serviceRegistry.invoke<IVault>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_ACTIVE_VAULT,
            {},
        );

        if (!vault || vault.id !== getters.activeVaultId) {
            await dispatch('_activate', vault?.id ?? null);
        }

        for (const id of ids) {
            commit('delete', id);
        }
    },

    async createWebVault(this: Context, { dispatch }: any) {
        const vaultId = v4();
        const color = '#FDA4AF';

        const newSyncedVault = {
            id: vaultId,
            name: 'Web Vault',
            type: 'remote',
            status: 'new',
            color,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Partial<IVault>;

        await dispatch('update', newSyncedVault);
        await dispatch('activate', {
            id: vaultId,
            redirect: false,
        });

        await dispatch('createOnboarding', vaultId, { root: true });
    },

    async createMobileVault(this: Context, { dispatch }: any) {
        const vaultId = v4();
        const color = '#FDA4AF';

        const newSyncedVault = {
            id: vaultId,
            name: 'Mobile Vault',
            type: 'remote',
            status: 'new',
            color,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Partial<IVault>;

        await dispatch('update', newSyncedVault);
        await dispatch('activate', {
            id: vaultId,
            redirect: false,
        });

        await dispatch('createOnboarding', vaultId, { root: true });
    },
};

const saveVaultRequest = async (
    vaultService: DatabaseWrapper,
    vault: Partial<IVault>,
) => {
    await vaultService.save('', vault, 'vaults');
};

const debouncedSaveVaultRequest = debounce(saveVaultRequest, 500, {
    leading: true,
    maxWait: 1500,
    trailing: true,
});
