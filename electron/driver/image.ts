import { readFile, writeFile, rm, access } from 'fs/promises';
import { IpcMain, IpcMainEvent } from 'electron';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { getMediaMap } from './io/watcher';

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.IMAGE_READ,
        async (_event: IpcMainEvent, path: string) => {
            try {
                await access(path);
                const data = await readFile(path);
                return data;
            } catch (err) {
                return null;
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.IMAGE_CREATE,
        async (_event: IpcMainEvent, payload: { path: string; data: any }) => {
            await writeFile(payload.path, payload.data);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.IMAGE_REMOVE,
        async (_event: IpcMainEvent, path: string) => {
            await rm(path);
        },
    );
    ipcMain?.handle(DEVICE_ACTIONS.MEDIA_MAP, async (_event: IpcMainEvent) => {
        return await getMediaMap();
    });
};
