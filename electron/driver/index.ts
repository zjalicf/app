import { IpcMain } from 'electron';
import { registerIpcMainHandlers as registerIpcMainProjectHandlers } from './project';
import { registerIpcMainHandlers as registerIpcMainDialogHandlers } from './dialog';
import { registerIpcMainHandlers as registerIpcMainVaultHandlers } from './vault';
import { registerIpcMainHandlers as registerIpcMainImageHandlers } from './image';
import { registerIpcMainHandlers as registerIpcMainFolderHandlers } from './folder';
import { registerIpcMainHandlers as registerIpcMainEntityHandlers } from './entity';
import { registerQuickaddService } from './assistant';
import { registerIpcMiscHandlers } from './misc';
import { registerIpcMainHandlers as registerIpcMainWindowsMenuHandlers } from './windowsMenu';
import { registerIpcMainHandlers as registerIpcMainNotificationHandlers } from './notification';
import { registerIpcMainHandlers as registerIpcMainAttachmentHandlers } from './attachments';
import { registerIpcMainHandlers as registerIpcMainNetworkHandlers } from './network';
import { registerAppleCalendarSyncService } from './apple-calendar';
import {
    registerIpcMainHandlers as registerIpcMainAIHandlers,
    registerAssistantAssetsManagerHandlers,
} from './ai';

export { sendMessage, broadcastMessage } from './messaging';

export const registerIpcMainHandlers = (ipcMain: IpcMain, ARGS: any) => {
    registerIpcMainProjectHandlers(ipcMain);
    registerIpcMainVaultHandlers(ipcMain);
    registerIpcMainDialogHandlers(ipcMain);
    registerIpcMainImageHandlers(ipcMain);
    registerIpcMainFolderHandlers(ipcMain);
    registerIpcMainEntityHandlers(ipcMain);
    registerQuickaddService(ipcMain, ARGS);
    registerIpcMiscHandlers(ipcMain);
    registerIpcMainWindowsMenuHandlers(ipcMain);
    registerIpcMainNotificationHandlers(ipcMain);
    registerIpcMainAttachmentHandlers(ipcMain);
    registerIpcMainNetworkHandlers(ipcMain);
    registerAppleCalendarSyncService(ipcMain, ARGS);
    registerIpcMainAIHandlers(ipcMain, ARGS);
    registerAssistantAssetsManagerHandlers(ipcMain);
};
