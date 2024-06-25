import * as path from 'path';
import {
    app,
    ipcMain,
    IpcMainEvent,
    Menu,
    protocol,
} from 'electron';
import * as Sentry from '@sentry/electron';
import { registerIpcMainHandlers } from './driver';
import {
    appWindows,
    createMainWindow,
    createSubWindows,
    defaultMenu,
    registerControlButtonsListeners,
    registerDeepLink,
    registerDock,
    registerQuickCaptureHandlers,
    registerStore,
    registerSystemListeners,
    setupAutoUpdater,
    setupDevelopmentEnvironment,
    registerTestUtil,
} from '@/app';
import { SENTRY_DSN } from '@/constants/electron-constants';
import { isLinux, isMac, isWindows } from "@/helpers";
import registerExternaLoginHandlers from '@/driver/externalLogin';
import { sendTestNotification } from '@/app/notification-manager';
import { registerQuickCaptureShortcut } from '@/app/shortcuts';
import { isTest } from '@/helpers/utils';
import { registerRequestModifiers } from '@/app/session';
import { destroyTray, registerTray } from "@/tray";

const {
    openSystemPreferences,
    enforceMacOSAppLocation,
    isFirstAppLaunch,
} = require('electron-util');

const FRONTEND_PATH = path.join(__dirname, 'acreom');
const QUICK_CAPTURE_PATH = path.join(__dirname, 'quick-capture');
const ARGS = { dev: process.env.NODE_ENV_ELECTRON_VITE };
const PRODUCTION_APP_PROTOCOL = 'app';
const PRODUCTION_APP_PROTOCOL_QUICK = 'quick';
const gotTheLock = app.requestSingleInstanceLock();

if (isTest) {
    // @ts-ignore
    import('wdio-electron-service/main');
}

if (!gotTheLock) {
    app.quit();
} else {
    // could not extract to separate file it would crash
    const contextMenu = require('electron-context-menu');
    contextMenu({
        showLookUpSelection: false,
        showSearchWithGoogle: false,
        showInspectElement: ARGS.dev,
        shouldShowMenu: (_, parameters) => parameters.isEditable,
    });

    const store = registerStore();

    if (isTest) {
        registerTestUtil();
    }

    registerDeepLink();

    if (ARGS.dev) {
        setupDevelopmentEnvironment();
    } else {
        protocol.registerSchemesAsPrivileged([
            {
                scheme: PRODUCTION_APP_PROTOCOL,
                privileges: { secure: true, standard: true },
            },
            {
                scheme: PRODUCTION_APP_PROTOCOL_QUICK,
                privileges: { secure: true, standard: true },
            },
        ]);
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: ARGS.dev ? 'development' : 'production',
    });

    app.whenReady().then(() => {
        const isTest = app.commandLine.getSwitchValue('test') === 'true';
        if (isTest) return;
        enforceMacOSAppLocation();
    });
    app.on('ready', () => {
        const isTrayEnabled =
            store.get('platformOptions.windowsTray') === true ||
            store.get('platformOptions.windowsTray') === undefined;

        const quickCaptureEnabled = () =>
            store.get('quickCaptureOptions.allowQuickCapture') === true ||
            store.get('quickCaptureOptions.allowQuickCapture') === undefined;

        Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu()));

        if (isMac) {
            registerDock();
        }

        ipcMain?.on('disable-tray', () => {
            destroyTray();
        });
        ipcMain?.on('enable-tray', () => {
            registerTray();
        });

        if (isTrayEnabled) {
            registerTray();
        }

        if (isWindows) {
            app.commandLine.appendSwitch('wm-window-animations-disabled');
            app.setAppUserModelId(app.name);
        }

        if (isLinux || isWindows) {
            registerExternaLoginHandlers(ipcMain);
        }

        ipcMain?.handle(
            'open-system-preferences',
            (_event: IpcMainEvent, pane: any) => {
                openSystemPreferences(pane);
            },
        );

        if (!ARGS.dev) {
            protocol.registerFileProtocol(
                PRODUCTION_APP_PROTOCOL,
                (request, callback) => {
                    const relativePath = path.normalize(
                        new URL(request.url).pathname,
                    );
                    const absolutePath = path.join(FRONTEND_PATH, relativePath);
                    callback({ path: absolutePath });
                },
            );
            protocol.registerFileProtocol(
                PRODUCTION_APP_PROTOCOL_QUICK,
                (request, callback) => {
                    const relativePath = path.normalize(
                        new URL(request.url).pathname,
                    );
                    const absolutePath = path.join(
                        QUICK_CAPTURE_PATH,
                        relativePath,
                    );
                    callback({ path: absolutePath });
                },
            );

            protocol.registerFileProtocol('file', (request, callback) => {
                const pathname = decodeURI(request.url.replace('file:///', ''));
                callback(pathname);
            });
        }

        registerSystemListeners();
        registerControlButtonsListeners(ipcMain, isTrayEnabled);
        registerQuickCaptureHandlers(ipcMain);
        registerIpcMainHandlers(ipcMain, ARGS);
        registerRequestModifiers();
        createMainWindow(FRONTEND_PATH, ARGS);

        createSubWindows(QUICK_CAPTURE_PATH, ARGS);
        ipcMain?.on(
            'quick-capture-set-shortcut',
            (_, oldShortcut: string, newShortcut: string) => {
                registerQuickCaptureShortcut(
                    newShortcut,
                    quickCaptureEnabled,
                    oldShortcut,
                );
            },
        );

        if (
            !ARGS.dev &&
            app.getName() !== 'acreom-beta' &&
            app.getName() !== 'acreom-test'
        ) {
            setupAutoUpdater();
        }

        if (isFirstAppLaunch()) {
            sendTestNotification();
        }
    });

    let quitCalled = false;
    app.on('before-quit', () => {
        quitCalled = true;
    });

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin' || quitCalled) {
            app.quit();
        }
    });

    app.on('activate', function () {
        createMainWindow(FRONTEND_PATH, ARGS);
    });

    app.on('second-instance', () => {
        if (appWindows.main) {
            appWindows.main.show();
        }
    });
}
