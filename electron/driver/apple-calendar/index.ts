import { IpcMain, IpcMainEvent, app } from 'electron';
import * as chokidar from 'chokidar';
import { DEVICE_ACTIONS } from '../../constants/electron-constants';
import { appWindows } from '../../app';
import { isMac } from '../../helpers';
import { AppleCalendarNativeAPI } from './native-bindings';

let service: AppleCalendarNativeAPI;
export const registerAppleCalendarSyncService = async (
    ipcMain: IpcMain,
    ARGS: any,
) => {
    if (!isMac) return;
    appleCalendarSyncHandler(ipcMain);
    app.on('web-contents-created', () => {
        if (service) return;
        try {
            service = new AppleCalendarNativeAPI(ARGS);
            const sessionDataPath = app.getPath('appData');
            const notificationsPath = sessionDataPath + '/acs.notifications';
            const watcher = chokidar.watch(notificationsPath);
            watcher.on('ready', () => {
                watcher.on('change', () => {
                    appWindows.main?.webContents?.send('apple-calendar-sync');
                });
            });
            service.setNotificationPath(notificationsPath);
        } catch (e) {
            appWindows.main?.webContents?.send(
                'electron-log',
                'AppleCalendarNativeAPI: error: ' + e.message,
            );
        }
    });
};

const appleCalendarSyncHandler = (ipcMain: IpcMain) => {
    ipcMain?.handle(DEVICE_ACTIONS.APPLE_CALENDAR_OPEN_PREFERENCES, () => {
        return service.openPreferences();
    });
    ipcMain?.handle(DEVICE_ACTIONS.APPLE_CALENDAR_ACCESS_STATUS, () => {
        return service.getAuthorizationStatus();
    });
    ipcMain?.handle(DEVICE_ACTIONS.APPLE_CALENDAR_REQUEST_ACCESS, () => {
        return service.requestAccess();
    });
    ipcMain?.handle(
        DEVICE_ACTIONS.APPLE_CALENDAR_EVENTS,
        (_event: IpcMainEvent, { from, to }: { from: number; to: number }) => {
            return service.getEvents(from, to);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.APPLE_CALENDAR_CALENDARS,
        (_event: IpcMainEvent) => {
            return service.getCalendars();
        },
    );
};
