import { IpcMain } from 'electron';
import { DEVICE_ACTIONS } from '../../constants/electron-constants';
import { AcreomAI } from './controller';

let AIController!: AcreomAI;

export { registerIpcMainHandlers as registerAssistantAssetsManagerHandlers } from './controls';

export const initializeModel = () => {
    AIController.initializeExecutable();
};

export const registerIpcMainHandlers = (_ipcMain: IpcMain, _ARGS: any) => {};
export const aiHandler = (ipcMain: IpcMain, _ARGS: any) => {
    ipcMain.on('assistant-data-port', (e, _msg) => {
        const [port] = e.ports;
        port.addListener('message', msg => {
            const { vaultId, action, data } = msg.data;
            AIController.index(vaultId, action, data.entity);
        });

        port.start();
        port.addListener('close' as any, () => {
            port.close();
        });
    });

    ipcMain.handle(
        DEVICE_ACTIONS.AI_ASSISTANT_PROMPT,
        async (_, { prompt, options }) => {
            return await AIController.process(prompt, options);
        },
    );
    ipcMain.handle(DEVICE_ACTIONS.AI_ASSISTANT_ACTIVE, _ => {
        return AIController.isActive;
    });
};
