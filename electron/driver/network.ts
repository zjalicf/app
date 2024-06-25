import isOnline from 'is-online';
import { IpcMain } from 'electron';

const NETWORK_IS_ONLINE = 'network is online';

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(NETWORK_IS_ONLINE, () => {
        return isOnline();
    });
};
