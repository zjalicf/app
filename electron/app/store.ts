import { ipcMain } from 'electron';
const Store = require('electron-store');

export const store = new Store();

export const registerStore = () => {
    // IPC listener
    ipcMain.on('electron-store-get', async (event, val) => {
        event.returnValue = store.get(val);
    });
    ipcMain.on('electron-store-set', async (_event, key, val) => {
        store.set(key, val);
    });
    ipcMain.on('electron-store-delete', async (_event, val) => {
        store.delete(val);
    });
    return store;
};
