import {join} from 'path';
import {app, Menu, Tray} from 'electron';
import {appWindows} from '@/app/windows';
import {showQuickCapture} from '@/app/quick-capture';

const ARGS = {dev: process.env.NODE_ENV_ELECTRON_VITE}

let tray: Tray | null = null;

export const destroyWindowsTray = () => {
    tray?.destroy();
};

export const registerWindowsTray = () => {
    if (tray && !tray.isDestroyed()) return;
    const logoIconPath = ARGS.dev
        ? './build-dev/icon-16x16.png'
        : join(process.resourcesPath, 'Assets', 'icon-16x16.png');

    const trayIconPath = ARGS.dev
        ? './build-dev/icon.ico'
        : join(process.resourcesPath, 'Assets', 'icon.ico');

    tray = new Tray(trayIconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            icon: logoIconPath,
            label: 'Open acreom',
            type: 'normal',
            click: () => {
                appWindows.main?.show();
            },
        },
        {
            type: 'separator',
        },
        {
            type: 'normal',
            label: 'Quick Capture',
            click: () => {
                showQuickCapture('Tray');
            },
        },
        {
            type: 'separator',
        },
        {
            type: 'normal',
            label: 'New Page',
            click: () => {
                appWindows.main?.show();
                appWindows.main?.webContents.send('new-document');
            },
        },
        {
            type: 'separator',
        },
        {
            label: 'Settings',
            click: () => {
                appWindows.main?.show();
                appWindows.main?.webContents.send('open-preferences');
            },
        },
        {type: 'separator'},
        {
            label: 'Quit acreom',
            type: 'normal',
            click: () => {
                if (
                    appWindows.quickNote &&
                    !appWindows.quickNote.isDestroyed()
                ) {
                    appWindows.quickNote.destroy();
                }
                app.quit();
            },
        },
    ]);

    tray.setToolTip('acreom');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        appWindows.main?.show();
    });
};
