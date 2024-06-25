import { IpcMain, IpcMainEvent, Menu } from 'electron';
import { appWindows, defaultMenu } from '../app';

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    const menu = Menu.buildFromTemplate(defaultMenu());

    ipcMain?.handle('open-windows-menu', (_event: IpcMainEvent, _data: any) => {
        menu.popup({
            window: appWindows.main,
            x: 57,
            y: 15,
        });
    });
};
