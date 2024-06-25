import { dialog, IpcMain, IpcMainEvent, shell } from 'electron';
import { appWindows } from '../app';

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    openDirectory(ipcMain);
    openInFinder(ipcMain);
};

const openInFinder = (ipcMain: IpcMain) => {
  ipcMain?.handle('show-in-finder', (_event: IpcMainEvent, path: string) => {
      shell.showItemInFolder(path);
  })
}

const openDirectory = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        'open-directory',
        async (
            _event: IpcMainEvent,
            meta: { canCreate: true; openFile: boolean; buttonLabel?: string },
        ) => {
            const properties = ['openDirectory'] as any[];
            if (meta?.canCreate) {
                properties.push('createDirectory', 'promptToCreate');
            }
            if (meta?.openFile) {
                properties.push('openFile', 'multiSelections');
            }

            const options: Record<string, any> = {
                properties
            }

            if (meta?.buttonLabel) {
                options.buttonLabel = meta.buttonLabel;
            }

            const path = await dialog.showOpenDialog(appWindows.main, options);

            if (path.canceled || path.filePaths.length === 0) {
                return null;
            }

            return path.filePaths.shift();
        },
    );
};
