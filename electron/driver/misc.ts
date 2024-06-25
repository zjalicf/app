import { app, IpcMain, IpcMainEvent, safeStorage } from 'electron';
import { autoUpdater } from 'electron-updater';
import { appWindows } from "@/app";
import { ensureSafeQuitAndInstall } from "@/helpers/utils";

export const registerIpcMiscHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle('get-focus-state', (_event: IpcMainEvent) => {
        return appWindows.main.isFocused();
    });

    ipcMain?.handle('get-maximized-state', (_event: IpcMainEvent) => {
        return appWindows.main.isMaximized();
    });

    ipcMain?.handle('update-and-restart', (_event: IpcMainEvent) => {
        ensureSafeQuitAndInstall();
        autoUpdater.quitAndInstall(true, true);
    });

    ipcMain?.handle('restart', (_event: IpcMainEvent) => {
        ensureSafeQuitAndInstall();
        app.relaunch();
        app.quit();
    });

    ipcMain?.handle('encrypt', (_event: IpcMainEvent, data: string) => {
        return safeStorage.encryptString(data).toString('base64');
    });

    ipcMain?.handle('decrypt', (_event: IpcMainEvent, data: string) => {
        return safeStorage.decryptString(Buffer.from(data, 'base64'));
    });
};
