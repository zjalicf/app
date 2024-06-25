import {app, Menu} from 'electron';
import {appWindows} from './windows';
import {showQuickCapture} from './quick-capture';

export const registerDock = () => {
    const dockMenu = Menu.buildFromTemplate([
        {
            type: 'normal',
            label: 'Quick Capture',
            click: () => {
                showQuickCapture('Dock');
            },
        },
        {
            type: 'normal',
            label: 'New Page',
            click: () => {
                appWindows.main?.show();
                appWindows.main?.webContents.send('new-document');
            },
        },
        {type: 'separator'},
        {
            label: 'Settings',
            accelerator: 'Cmd+,',
            click: () => {
                appWindows.main?.show();
                appWindows.main?.webContents.send('open-preferences');
            },
        },
    ]);

    app.dock.setMenu(dockMenu);
};
