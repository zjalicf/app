import { mkdir, writeFile } from "fs/promises";
import { IpcMain, IpcMainEvent, dialog } from "electron";
import { DEVICE_ACTIONS } from "../constants/electron-constants";
import sanitizeFilename from "sanitize-filename";
import { appWindows } from "../app";
import { join } from "path";

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.FOLDER_CREATE,
        async (
            _: IpcMainEvent,
            { path, folderName }: { path: string; folderName: string },
        ) => {
            return await mkdir(join(path, sanitizeFilename(folderName)), {
                recursive: true,
            });
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.SAVE_AS,
        async (
            _: IpcMainEvent,
            { data, filename }: { data: string; filename: string, type: 'string' | 'blob' },
        ) => {
            const mainWindow = appWindows.main;
            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
                defaultPath: filename,
            });

            if (canceled) return false;

            const deserializedData = Buffer.from(data, 'base64');
            try {
                await writeFile(filePath, deserializedData);
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },
    );
};
