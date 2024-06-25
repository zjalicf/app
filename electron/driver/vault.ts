import { mkdir, readdir, stat } from 'fs/promises';
import { app, IpcMain, IpcMainEvent } from 'electron';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { appWindows } from '../app';
import { broadcastMessage } from './messaging';
import { FileWatcher } from './io/watcher';
import { loadVault, loadVaultDiff } from './io/loader';

export const watchList: Record<string, FileWatcher> = {};

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.CREATE_ROOT_FOLDER,
        async (_: IpcMainEvent, path: string) => {
            try {
                await mkdir(path, { recursive: true });
            } catch (e) {
                console.log(e);
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.VAULT_EXISTS,
        async (_event: IpcMainEvent, path: string) => {
            try {
                const stats = await stat(path);
                return !!stats?.isDirectory();
            } catch (e) {
                return false;
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.VAULT_LIST,
        async (_event: IpcMainEvent, path: string, type?: string) => {
            const results = (
                await readdir(path, {
                    withFileTypes: true,
                })
            ).map(entry => ({
                name: entry.name,
                isFile: entry.isFile(),
                isDirectory: entry.isDirectory(),
            }));

            if (type === 'folder') {
                return results.filter(({ isDirectory }) => isDirectory);
            }

            return results;
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.VAULT_CHANGE,
        (_: IpcMainEvent, vaultId: string) => {
            broadcastMessage(
                [appWindows.quickNote?.webContents].filter(v => !!v),
                'vault-change',
                vaultId,
            );
        },
    );
    ipcMain?.on(
        DEVICE_ACTIONS.VAULT_WATCH_REGISTER,
        async (_: IpcMainEvent, { path, id }: { path: string; id: string }) => {
            if (watchList[id]) {
                watchList[id].unwatch();
                delete watchList[id];
            }
            watchList[id] = new FileWatcher(id, path);
            watchList[id].watch();
        },
    );
    ipcMain?.on(
        DEVICE_ACTIONS.VAULT_WATCH_REMOVE,
        (_: IpcMainEvent, { id }: { id: string }) => {
            if (!watchList[id]) return;
            watchList[id].unwatch();
            delete watchList[id];
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.GET_VAULT_STRUCTURE,
        (_: IpcMainEvent, vaultId: string) => {
            return watchList[vaultId].structureMap;
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.IS_FOLDER_EMPTY,
        async (_: IpcMainEvent, path: string) => {
            const dirContent = await readdir(path);
            return dirContent.length === 0;
        },
    );

    app.on('before-quit', () => {
        Object.values(watchList).forEach(watcher => {
            watcher.unwatch();
        });
    });
};
