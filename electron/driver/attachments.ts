import { IpcMain, IpcMainEvent } from 'electron';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { Reader, Writer } from './io';

type Attachment = {
    vaultId: string;
    filepath: string;
    content: string | Buffer;
};

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.ATTACHMENT_EXISTS,
        async (_: IpcMainEvent, path: string) => {
            return Reader.exists(path);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ATTACHMENT_READ,
        async (_event: IpcMainEvent, filepath: string) => {
            const attachmentData = await Reader.readAttachment(filepath);
            return attachmentData;
        },
    );
    ipcMain?.handle(DEVICE_ACTIONS.ATTACHMENT_COPY, async (_, filepaths) => {
        await Writer.copy(filepaths);
    });
    ipcMain?.handle(
        DEVICE_ACTIONS.ATTACHMENT_CREATE,
        async (
            _: IpcMainEvent,
            vaultId: string,
            filepath: string,
            content: string,
        ) => {
            await Writer.writeFileRaw(
                vaultId,
                filepath,
                Buffer.from(content, 'base64'),
            );
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ATTACHMENT_CREATE_BATCH,
        async (_: IpcMainEvent, attachments: Attachment[]) => {
            await Promise.all(
                attachments.map(({ vaultId, filepath, content }) => {
                    return Writer.writeFileRaw(
                        vaultId,
                        filepath,
                        Buffer.from(content as string, 'base64'),
                    );
                }),
            );
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.ATTACHMENT_DELETE,
        async (_: IpcMainEvent, vaultId: string, filepath: string) => {
            await Writer.trashRaw(vaultId, filepath);
        },
    );
};
