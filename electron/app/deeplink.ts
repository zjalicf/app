import { Deeplink } from 'electron-deeplink';
import { app } from 'electron';
import { appWindows } from './windows';

export const registerDeepLink = () => {
    const deeplink = new Deeplink({
        app,
        mainWindow: appWindows.main,
        protocol: 'acreom',
    });

    deeplink.on('received', link => {
        if (!link.startsWith('acreom://')) return;
        const encoded = link.split('acreom://')[1];
        if (!encoded) {
            throw new Error('Invalid acreom link!');
        }
        const [action, data] = Buffer.from(encoded, 'base64')
            .toString()
            .split(':');
        appWindows.main.webContents.send('received-link', { action, data });
    });
};
