import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import {
    connectGithubAndJiraDoc,
    mobileOnboardingDailyDoc,
    nextStepsDoc,
    onboardingDailyDoc,
    welcomeToAcreomDoc,
} from '~/helpers/onboarding';
import { DatabaseServiceAction, GenericActions, ServiceKey } from '~/constants';
import { IDocument } from '~/components/document/model';
import { IVault, SafeElectronWindow } from '~/@types';
import { IUser } from '~/workers/database/indexeddb/types';
import { ThemeOptions } from '~/helpers/date';
import { Release, UpdateDownloadProgress } from '~/@types/app';
import { KeyboardState } from '~/constants/mobile';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingProperties,
    TrackingType,
} from '~/@types/tracking';

const SPLASH_SCREEN_FADE_OUT_DURATION = 150;

interface AppState {
    latestVersion: string;
    cheatsheetOpen: boolean;
    editorFocused: boolean;
    userForcedBlur: boolean;
    bottomBarVisible: boolean;
}

export const state = (): AppState => ({
    latestVersion: '1.20.4',
    cheatsheetOpen: false,
    editorFocused: false,
    userForcedBlur: false,
    bottomBarVisible: true,
});

export const getters = {
    editorFocused(state: AppState) {
        return state.editorFocused;
    },
    bottomBarVisible(state: AppState) {
        return state.bottomBarVisible;
    },
    userForcedBlur(state: AppState) {
        return state.userForcedBlur;
    },
    latest(state: AppState) {
        return state.latestVersion;
    },
    cheatsheetOpen(state: AppState) {
        return state.cheatsheetOpen;
    },
};

export const mutations = {
    openCheatsheet(state: AppState) {
        state.cheatsheetOpen = true;
    },
    closeCheatsheet(state: AppState) {
        state.cheatsheetOpen = false;
    },
    editorFocused(state: AppState, value: boolean) {
        state.editorFocused = value;
    },
    bottomBarVisible(state: AppState, value: boolean) {
        state.bottomBarVisible = value;
    },
    userForcedBlur(state: AppState, value: boolean) {
        state.userForcedBlur = value;
    },
};

export const actions = {
    async createOnboarding(
        this: Context,
        { dispatch, rootGetters }: any,
        vaultId: string,
    ) {
        const createDoc = async (
            payload: Partial<IDocument>,
            folder: string | null,
        ) => {
            if (!payload.dailyDoc) {
                payload.projectId = folder;
                await dispatch('document/new', payload, { root: true });
            } else {
                await dispatch(
                    'document/dailyDoc',
                    {
                        title: payload.title,
                        dailyDoc: payload.dailyDoc,
                    },
                    { root: true },
                );
                const dailyDoc = rootGetters['document/byDailyDoc'](
                    payload.dailyDoc,
                );
                payload.id = dailyDoc.id;
            }
            return dispatch('document/update', payload, { root: true });
        };

        if (this.$utils.isMobile) {
            return Promise.all([
                createDoc(mobileOnboardingDailyDoc(vaultId), null),
            ]);
        }

        const getStartedFolderId = v4();

        await dispatch(
            'folder/update',
            {
                id: getStartedFolderId,
                name: 'Get Started with acreom',
                status: 'new',
                type: 'folder',
                sharingUuid: null,
                parentId: null,
                expanded: true,
                order: -10000,
            },
            { root: true },
        );

        const welcomeToAcreomDocId = v4();
        const connectGithubAndJiraDocId = v4();
        const nextStepsDocId = v4();
        const breakDownTask = this.$entities.task.createFromProperties({
            id: v4(),
            completed: false,
            text: `create tasks with <code>/task</code> command`,
        });
        const scheduleTask = this.$entities.task.createFromProperties({
            id: v4(),
            completed: false,
            text: `schedule this task with natural language (input time)`,
        });
        const divideAndConquerTasks = `<ul>${breakDownTask}${scheduleTask}</ul>`;

        return Promise.all([
            createDoc(
                welcomeToAcreomDoc(
                    vaultId,
                    welcomeToAcreomDocId,
                    divideAndConquerTasks,
                    connectGithubAndJiraDocId,
                ),
                getStartedFolderId,
            ),
            createDoc(
                connectGithubAndJiraDoc(vaultId, connectGithubAndJiraDocId),
                getStartedFolderId,
            ),
            createDoc(
                nextStepsDoc(vaultId, nextStepsDocId),
                getStartedFolderId,
            ),
            createDoc(onboardingDailyDoc(vaultId, welcomeToAcreomDocId), null),
        ]);
    },

    async initializeAndRedirect(
        this: Context,
        { dispatch, rootGetters }: any,
        { waitForProtocol = true, waitForNuxt = false, context }: any,
    ) {
        const registerNuxtListeners = () => {
            window.$nuxt.$on('vaults-initialized', async () => {
                const userUnlockedVaults =
                    await this.$encryption.isEncryptionUnlocked();
                if (
                    !this.$encryption.isEncryptionEnabled() ||
                    userUnlockedVaults
                )
                    return;

                this.$serviceRegistry.emit(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.INITIALIZE_AVAILABE_VAULTS,
                );

                this.$encryption.openPassphraseModal(() => {
                    this.$serviceRegistry.emit(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.INITIALIZE_VAULTS_SYNC,
                        {},
                    );
                    dispatch(
                        'vault/reloadData',
                        rootGetters['vault/activeVaultId'],
                        { root: true },
                    );
                });
            });

            window.$nuxt.$once('encryption:passphrase', async () => {
                const isAlreadyOpen = window.$nuxt.$vfm.dynamicModals.some(
                    ({ bind }) =>
                        bind?.modalName === 'EncryptionPassphraseModal',
                );
                if (isAlreadyOpen) return;
                const activeVault = rootGetters['vault/active'];
                if (activeVault?.type === 'local') return;
                if (!this.$encryption.isEncryptionEnabled()) return;
                this.$encryption.openPassphraseModal(() => {
                    this.$serviceRegistry.emit(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.INITIALIZE_VAULTS_SYNC,
                        {},
                    );
                    dispatch(
                        'vault/reloadData',
                        rootGetters['vault/activeVaultId'],
                        { root: true },
                    );
                });
            });
        };

        if (!window.$nuxt) {
            window.onNuxtReady(() => {
                registerNuxtListeners();
            });
        } else {
            registerNuxtListeners();
        }
        await this.$entities.vault.initialize();

        // await dispatch('vault/initialize', false, { root: true });

        const activeVault = rootGetters['vault/active'];
        const loggedIn = rootGetters['auth/loggedIn'];
        const syncedVaults = rootGetters['vault/list'].filter(
            ({ type }: IVault) => type === 'remote',
        );
        const isMobile = this.$utils.isMobile;

        const redirect = (route: any) => {
            if (context) {
                route += `?context=${context}`;
            }
            if (waitForNuxt) {
                (window as any).onNuxtReady(() => {
                    window.$nuxt.$router.push(route);
                });
            } else {
                this.app.router?.push(route);
            }
        };

        if (!activeVault && loggedIn) {
            let compatibilityError = false;
            if (isMobile) {
                if (waitForProtocol) {
                    await new Promise<void>(resolve => {
                        this.$serviceRegistry
                            .service(ServiceKey.DATABASE)
                            .once('protocol-loaded', async () => {
                                await dispatch(
                                    'vault/createMobileVault',
                                    null,
                                    {
                                        root: true,
                                    },
                                );

                                resolve();
                            })
                            .once('protocol-compatibility-error', () => {
                                compatibilityError = true;
                                resolve();
                            });
                    });
                } else {
                    await dispatch('vault/createMobileVault', null, {
                        root: true,
                    });
                }

                if (compatibilityError) {
                    redirect('/upgrade');
                } else {
                    redirect('/');
                }

                return;
            }

            if (this.$config.platform === 'web') {
                redirect('/auth/vault-setup');
            } else {
                redirect('/auth/vault');
            }
            // loader
        } else if (!activeVault) {
            redirect('/auth/login'); // loader
        } else if (!loggedIn && syncedVaults.length > 0) {
            dispatch('auth/logout', waitForNuxt); // loader
        } else if (this.app.router?.currentRoute.name?.includes('auth')) {
            redirect('/'); // skeleton
        }
    },

    async registerMobileAppHandlers(this: Context, { dispatch }: any) {
        const { App } = await import('@capacitor/app');

        App.addListener('appUrlOpen', async ({ url }) => {
            if (!url.startsWith('acreom://')) return;
            const { Browser } = await import('@capacitor/browser');

            if (this.$config.os === 'ios') {
                await Browser.close();
            }

            const encoded = url.split('acreom://')[1];
            if (!encoded) {
                throw new Error('Invalid acreom link!');
            }
            const [action, data] = Buffer.from(encoded, 'base64')
                .toString()
                .split(':');

            if (action === 'redirect') {
                // @ts-ignore
                this.$router.push(data);
            }
        });

        App.addListener('pause', () => {
            dispatch('misc/isOnBackground', true);
            dispatch('syncStatus/clear', false);
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                {
                    event: 'device:pause',
                },
            );
        });

        App.addListener('resume', async () => {
            dispatch('misc/isOnBackground', false);
            await this.$checkOnlineStatus?.();
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                {
                    event: 'device:resume',
                },
            );
        });

        App.addListener('appStateChange', state => {
            if (!state.isActive) {
                dispatch('syncStatus/clear', false);
            }
        });
    },

    async registerMobileKeyboardHandlers(
        this: Context,
        { commit, rootGetters }: any,
    ) {
        const { Keyboard, KeyboardResize } = await import(
            '@capacitor/keyboard'
        );

        Keyboard.addListener('keyboardDidHide', () => {
            this.$utils.mobile.changeKeyboardState(KeyboardState.DID_HIDE);
        });

        Keyboard.addListener('keyboardDidShow', () => {
            this.$utils.mobile.changeKeyboardState(KeyboardState.DID_SHOW);
        });

        Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }) => {
            this.$utils.mobile.changeKeyboardState(KeyboardState.WILL_SHOW);
            commit('mobile/setKeyboardHeight', keyboardHeight);
        });

        Keyboard.addListener('keyboardWillHide', () => {
            this.$utils.mobile.changeKeyboardState(KeyboardState.WILL_HIDE);
        });

        if (this.$config.os === 'ios') {
            await Keyboard.setScroll({ isDisabled: true });
            await Keyboard.setResizeMode({ mode: KeyboardResize.None });
        }
    },

    async hideSplashScreen() {
        try {
            const { SplashScreen } = await import('@capacitor/splash-screen');
            SplashScreen.hide({
                fadeOutDuration: SPLASH_SCREEN_FADE_OUT_DURATION,
            });
        } catch (e) {
            console.log(e);
        }
    },

    async setStatusBar(this: Context) {
        if (this.$config.os === 'android') {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.setBackgroundColor({
                color: '#1e232d',
            });
        }
    },

    registerThemeHandler(this: Context, { dispatch }: any) {
        if (!window.matchMedia) return;

        const isDarkTheme = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches;

        dispatch(
            'appSettings/updatePrefersColorScheme',
            isDarkTheme ? ThemeOptions.DARK : ThemeOptions.LIGHT,
            { root: true },
        );

        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', ({ matches }) => {
                if (matches) {
                    dispatch(
                        'appSettings/updatePrefersColorScheme',
                        ThemeOptions.DARK,
                        { root: true },
                    );
                } else {
                    dispatch(
                        'appSettings/updatePrefersColorScheme',
                        ThemeOptions.LIGHT,
                        { root: true },
                    );
                }
            });
    },

    registerWebHandlers(this: Context) {
        window.addEventListener(
            'message',
            e => {
                const message = e.data;
                if (!message || typeof message !== 'string') return;

                const [action, data] = message.split(':');

                if (action === 'integration-add') {
                    const [type, ...rest] = data.split('&');
                    if (type === 'github') {
                        const [accessToken, userIdVaultId] = rest;
                        const [userId, vaultId] = userIdVaultId.split('_');
                        this.$entities.github.createIntegration({
                            accessToken,
                            vaultId,
                            redirect: true,
                        });
                    }

                    if (type === 'jira') {
                        this.$entities.jira.createIntegration({
                            credentials: {
                                accessToken: rest[0],
                                refreshToken: rest[1],
                                expiryDate: rest[2],
                            },
                            vaultId: rest[3],
                            redirect: true,
                        });
                    }

                    if (type === 'linear') {
                        this.$entities.linear.createIntegration({
                            credentials: {
                                accessToken: rest[0],
                                expiryDate: rest[1],
                            },
                            vaultId: rest[2],
                            redirect: true,
                        });
                    }

                    (e.source as any).close();
                }
            },
            false,
        );
    },

    registerDesktopHandlers(
        this: Context,
        { commit, dispatch, rootGetters }: any,
    ) {
        const electronWindow = window as SafeElectronWindow;

        electronWindow.electron.on('apple-calendar-sync', () => {
            const integration =
                rootGetters['integration/byType']('apple_calendar').shift();
            if (!integration) {
                return;
            }

            this.$serviceRegistry.emit(
                ServiceKey.INTEGRATIONS,
                'apple-calendar-watch',
                integration,
            );
        });

        electronWindow.electron.on(
            'track-event',
            (eventType: TrackingType, eventProperties: TrackingProperties) => {
                this.$tracking.trackEventV2(eventType, eventProperties);
            },
        );

        electronWindow.electron.on('received-link', (action, data) => {
            const isNewVaultModalOpen = this.app.context.$vfm.openedModals.some(
                ({ name }: any) => name === 'new-vault',
            );

            if (
                // @ts-ignore
                this.$router.currentRoute.name === 'auth-index-cloud' ||
                isNewVaultModalOpen
            ) {
                const queryString = data.split('?')[1];
                const query = new URLSearchParams(queryString);
                const authData = {
                    access_token: query.get('access_token'),
                    refresh_token: query.get('refresh_token'),
                    expires_at: query.get('expires_at'),
                };

                dispatch('auth/inPlaceLogin', authData, { root: true });
                return;
            }

            if (action === 'integration-add') {
                const [type, ...rest] = data.split('&');
                if (type === 'github') {
                    const [accessToken, userIdVaultId] = rest;
                    const [userId, vaultId] = userIdVaultId.split('_');
                    this.$entities.github.createIntegration({
                        accessToken,
                        vaultId,
                        // @ts-ignore
                        redirect: this.$router.currentRoute.name === 'index',
                    });
                }

                if (type === 'jira') {
                    this.$entities.jira.createIntegration({
                        credentials: {
                            accessToken: rest[0],
                            refreshToken: rest[1],
                            expiryDate: rest[2],
                        },
                        vaultId: rest[3],
                        redirect: true,
                    });
                }

                if (type === 'linear') {
                    this.$entities.linear.createIntegration({
                        credentials: {
                            accessToken: rest[0],
                            expiryDate: rest[1],
                        },
                        vaultId: rest[2],
                        redirect: true,
                    });
                }

                if (
                    this.$config.os === 'linux' ||
                    this.$config.os === 'windows'
                ) {
                    (
                        window as SafeElectronWindow
                    ).electron.closeExternalLogin();
                }
            }

            if (action === 'redirect') {
                // @ts-ignore
                this.$router.push(data);
            }
        });

        electronWindow.electron.on('login', (authData: any) => {
            const isNewVaultModalOpen = this.app.context.$vfm.openedModals.some(
                ({ name }: any) => name === 'new-vault',
            );

            if (
                // @ts-ignore
                this.$router.currentRoute.name === 'auth-index-cloud' ||
                isNewVaultModalOpen
            ) {
                dispatch('auth/inPlaceLogin', authData, { root: true });
                return;
            }

            // @ts-ignore
            this.$router.push({
                path: '/auth/validate',
                query: authData,
            });
        });

        electronWindow.electron.on(
            'window-show',
            (source: TrackingActionSource) => {
                this.$tracking.trackEvent('quick-capture', {
                    action: 'show',
                });

                this.$tracking.trackEventV2(TrackingType.QUICK_CAPTURE, {
                    action: TrackingAction.OPEN,
                    source,
                });
            },
        );

        electronWindow.electron.on('download-start', () => {
            commit('autoUpdater/updateDownloading', true);
        });

        electronWindow.electron.on('download-end', () => {
            commit('autoUpdater/updateDownloading', false);
        });

        electronWindow.electron.on('auto-update-error', (error: any) => {
            commit('autoUpdater/updateChecking', false);
            commit('autoUpdater/updateProgress', 0);
            commit('autoUpdater/updateError', true);
        });

        electronWindow.electron.on('checking-for-update', () => {
            commit('autoUpdater/updateChecking', true);
        });

        electronWindow.electron.on(
            'update-not-available',
            (release: Release) => {
                commit('autoUpdater/updateChecking', false);
                commit('autoUpdater/updateAvailable', false);
            },
        );

        electronWindow.electron.on('update-available', (release: Release) => {
            commit('autoUpdater/updateChecking', false);
            commit('autoUpdater/updateAvailable', true);
        });

        electronWindow.electron.on(
            'download-progress',
            (progress: UpdateDownloadProgress) => {
                commit('autoUpdater/updateProgress', progress.percent);
            },
        );

        electronWindow.electron.on('update-downloaded', (release: Release) => {
            commit('autoUpdater/updateProgress', 0);
        });

        electronWindow.electron.on('focus', () => {
            dispatch('misc/focusWindow');
        });

        electronWindow.electron.on('blur', () => {
            dispatch('misc/blurWindow');
        });

        electronWindow.electron.on('maximize', () => {
            dispatch('misc/windowMaximized');
        });
        electronWindow.electron.on('unmaximize', () => {
            dispatch('misc/windowUnmaximized');
        });

        electronWindow.electron.on('system:suspend', () => {
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                {
                    event: 'device:pause',
                },
            );
        });

        electronWindow.electron.on('ai-stream-data', (message: any) => {
            this.$serviceRegistry.emit(
                ServiceKey.ASSISTANT,
                GenericActions.EMIT,
                {
                    event: 'ai-stream-data',
                    payload: message,
                },
            );
        });

        electronWindow.electron.on('ai-stream-final', (message: any) => {
            this.$serviceRegistry.emit(
                ServiceKey.ASSISTANT,
                GenericActions.EMIT,
                {
                    event: 'ai-stream-final',
                    payload: message,
                },
            );
        });

        electronWindow.electron.on(
            'ai-emit-source-documents',
            (message: any) => {
                this.$serviceRegistry.emit(
                    ServiceKey.ASSISTANT,
                    GenericActions.EMIT,
                    { event: 'ai-emit-source-documents', payload: message },
                );
            },
        );

        electronWindow.electron.on('system:resume', () => {
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                {
                    event: 'device:resume',
                },
            );
        });

        electronWindow.electron.on(
            'system:theme',
            (_shouldUseDarkColors: boolean) => {
                // do nothing. This can be handled via window
            },
        );
    },

    registerActivityTracking(this: Context) {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.$tracking.activityPing('blur');
            } else {
                this.$tracking.activityPing('focus');
            }
        });
    },

    registerNetworkHandlers(this: Context) {
        window.addEventListener('online', () => {
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                { event: 'network:online' },
            );
        });
        window.addEventListener('offline', () => {
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.EMIT,
                { event: 'network:offline' },
            );
        });
    },

    async nuxtClientInit(this: Context, { dispatch }: any, ctx: Context) {
        // @ts-ignore
        this.$sentry.setContext('app', {
            app_version: this.$config.version,
            platform: this.$config.platform,
            os: this.$config.os,
        });
        const isMobile = this.$utils.isMobile;
        const isDesktop = this.$config.platform === 'desktop';
        const isWeb = this.$config.platform === 'web';

        await this.$serviceRegistry.waitForEssentialServices();
        await this.$entities.vault.initialize();
        try {
            this.$tracking.identifyApp();

            dispatch('registerActivityTracking');
            dispatch('registerNetworkHandlers');
            dispatch('registerThemeHandler');
            dispatch('appSettings/refresh', null, { root: true });

            if (isMobile) {
                dispatch('setStatusBar');
                dispatch('registerMobileAppHandlers');
                dispatch('registerMobileKeyboardHandlers');
            }

            if (isWeb) {
                dispatch('registerWebHandlers');
            }

            if (isDesktop) {
                dispatch('misc/setFocusWindowState');
                dispatch('registerDesktopHandlers');
            }

            let user = await dispatch('user/retrieveFromDB', undefined, {
                root: true,
            });

            if (!user) {
                const disallowedRoutes = [
                    'auth-validate',
                    'reset-password',
                    'integrations-success',
                    'integrations-error',
                    'integrations-jira',
                    'integrations-github',
                    // TODO: add integration success pages
                ];

                if (disallowedRoutes.includes(ctx.route!.name!)) {
                    if (isMobile) {
                        dispatch('hideSplashScreen');
                    }
                    return;
                }
                await dispatch('initializeAndRedirect', {
                    waitForNuxt: true,
                });
                if (isMobile) {
                    dispatch('hideSplashScreen');
                }
                return;
            }
            if (!user.credentials) {
                let rawCredentials;
                if (this.$utils.isMobile) {
                    const { Preferences } = await import(
                        '@capacitor/preferences'
                    );
                    rawCredentials = (await Preferences.get({ key: 'acr' }))
                        .value;

                    if (!rawCredentials && localStorage.getItem('acr')) {
                        await Preferences.set({
                            key: 'acr',
                            value: localStorage.getItem('acr') as string,
                        });
                        rawCredentials = (await Preferences.get({ key: 'acr' }))
                            .value;
                    }
                } else {
                    rawCredentials = localStorage.getItem('acr');
                }

                if (rawCredentials) {
                    const credentials = JSON.parse(atob(rawCredentials));
                    await this.$serviceRegistry.invoke(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.SAVE,
                        {
                            table: 'users',
                            entity: {
                                id: user.id,
                                credentials,
                            },
                            callerContext:
                                'store/index.ts nuxtClientInit save user credentials',
                        },
                    );
                    this.$serviceRegistry
                        .invoke<IUser>(
                            ServiceKey.DATABASE,
                            DatabaseServiceAction.INITIALIZE_USER,
                            { payload: credentials },
                        )
                        .then(async response => {
                            if (!response) {
                                if (isMobile) {
                                    dispatch('hideSplashScreen');
                                }
                                dispatch('auth/logout');
                                return;
                            }
                            user = response;
                            await dispatch('auth/initialize', response);
                            await dispatch('user/initialize');
                        });

                    // if (!response) {
                    //     if (isMobile) {
                    //         dispatch('hideSplashScreen');
                    //     }
                    //     dispatch('auth/logout');
                    //     return;
                    // }
                } else {
                    if (isMobile) {
                        dispatch('hideSplashScreen');
                    }
                    dispatch('auth/logout');
                    return;
                }
            }

            await dispatch('auth/initialize', user);
            dispatch('user/initialize');

            const disallowedRoutes = [
                'auth-validate',
                'reset-password',
                'integrations-success',
            ];

            if (!disallowedRoutes.includes(ctx.route!.name!)) {
                await dispatch('initializeAndRedirect', {
                    waitForNuxt: true,
                });
            }
        } catch (error: any) {
            console.log(error);
            // @ts-ignore
            this.$sentry.captureException(error);
        }

        if (isMobile) {
            dispatch('hideSplashScreen');
        }
    },
};
