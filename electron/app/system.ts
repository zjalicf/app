import { powerMonitor, nativeTheme, ipcMain, IpcMainEvent } from "electron";
import { appWindows } from './windows';
import { arch } from 'os';

export const registerSystemListeners = () => {
    const suspend = _e => {
        appWindows.main?.webContents.send('system:suspend');
    };
    const resume = _e => {
        appWindows.main?.webContents.send('system:resume');
    };
    nativeTheme.on('updated', () => {
        appWindows.main?.webContents.send('system:theme', nativeTheme.shouldUseDarkColors);
    })

    ipcMain?.on('get-os-arch', async (event, _val) => {
        try {
            event.returnValue = arch();
        } catch(e) {
            event.returnValue = null;
        }
    });

    ipcMain?.handle(
        'open-dev-tools',
        (_event: IpcMainEvent) => {
            appWindows.main?.webContents.openDevTools();
        },
    );

    powerMonitor.on('suspend', suspend);
    powerMonitor.on('lock-screen', suspend);

    powerMonitor.on('resume', resume);
    powerMonitor.on('unlock-screen', resume);
};
