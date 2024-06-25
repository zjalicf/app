import { IpcMain, IpcMainEvent } from 'electron';
import { createLoginWindow, appWindows } from '../app/windows';
import { scopedLogger } from '../helpers/logger';
const logger = scopedLogger('external-login');

const registerExternaLoginHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle('open-external-login', (_: IpcMainEvent, path: string) => {
        try {
            createLoginWindow(path);
            return true;
        } catch (e) {
            logger.error({
                operation: 'Register External Login Handlers',
                action: 'open-external-login',
                message: e,
            });
            return false;
        }
    });
    ipcMain?.handle('close-external-login', (_: IpcMainEvent) => {
        try {
            if (appWindows.loginWindow) {
                appWindows.loginWindow.close();
            }
            return true;
        } catch (e) {
            logger.error({
                operation: 'Register External Login Handlers',
                action: 'close-external-login',
                message: e,
            });
            return false;
        }
    });
    ipcMain?.handle(
        'login',
        (
            _: IpcMainEvent,
            authData: { access_token: string; refresh_token: string },
        ) => {
            try {
                if (!appWindows.main) return false;
                appWindows.main.webContents.send('login', authData);
                return true;
            } catch (e) {
                logger.error({
                    operation: 'Register External Login Handlers',
                    action: 'login',
                    message: e,
                });
                return false;
            }
        },
    );
    ipcMain?.handle(
        'add-integration',
        (
            _: IpcMainEvent,
            data: string,
        ) => {
            try {
                if (!appWindows.main) return false;
                appWindows.main.webContents.send('received-link', { action: 'integration-add', data });
                return true;
            } catch (e) {
                logger.error({
                    operation: 'Register External Login Handlers',
                    action: 'login',
                    message: e,
                });
                return false;
            }
        },
    );
};

export default registerExternaLoginHandlers;
