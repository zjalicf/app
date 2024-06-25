import {join} from 'path';
import {app, Menu, Tray} from 'electron';
import {appWindows} from '@/app/windows';
import {showQuickCapture} from '@/app/quick-capture';
import { store } from "@/app/store";

const ARGS = {dev: process.env.NODE_ENV_ELECTRON_VITE}

let tray: Tray | null = null;

export const destroyMacosTray = () => {
    tray?.destroy();
};

export const registerMacosTray = () => {
    if (tray && !tray.isDestroyed()) return;
    const logoIconPath = ARGS.dev
        ? './build-dev/tray-icon-Template.png'
        : join(process.resourcesPath, 'Assets', 'tray-icon-Template.png');

    tray = new Tray(logoIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            type: 'normal',
            label: 'Quick Capture',
            accelerator: 'Cmd+Shift+Space',
            click: () => {
                showQuickCapture('Tray');
            },
        },
        {type: 'separator'},
        {
            label: 'Settings',
            type: 'normal',
            click: () => {
                appWindows.main?.show();
                appWindows.main.webContents.send('open-preferences', 'preferences');
            },
        },
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
        {type: 'separator'},
        {
            label: 'Hide from tray',
            type: 'normal',
            click: () => {
                destroyMacosTray();
                store.set('platformOptions', { windowsTray: false });
            },
        },
    ]);

    tray.setToolTip('acreom');

    tray.on('click', () => {
        showQuickCapture('Tray');
    });

    tray.on('double-click', () => {
        showQuickCapture('Tray');
    });

    tray.on('right-click', () => {
        tray?.popUpContextMenu(contextMenu);
    });
};
