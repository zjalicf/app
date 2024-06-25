import { contextBridge, ipcRenderer } from 'electron';
import { AssistantDriver } from './driver/drivers';

function onFactory() {
    const callbacks: Record<string, Function[]> = {};

    ipcRenderer.on('window-show', (_: any, data: any) => {
        (callbacks['window-show'] || []).forEach(callback => {
            callback(data);
        });
    });

    ipcRenderer.on('window-hide', (_: any, data: any) => {
        (callbacks['window-hide'] || []).forEach(callback => {
            callback(data);
        });
    });

    return function (action: string, callback: () => void) {
        if (!callbacks[action]) {
            callbacks[action] = [];
        }
        callbacks[action].push(callback);
    };
}

contextBridge.exposeInMainWorld('electron', {
    on: onFactory(),
    close: (source?: string) => {
        ipcRenderer.invoke('capture-close', source);
    },
    trackEvent: (eventType: any, eventProperties: any) => {
        ipcRenderer.invoke('track-event', eventType, eventProperties);
    },
    appendToDailyDoc: text => {
        ipcRenderer.invoke('append-daily-doc', text);
    },
    addPage: page => {
        ipcRenderer.invoke('add-page', page);
    },
    resize: height => {
        ipcRenderer.invoke('resize-quick-capture', height);
    },
    store: {
        get(val) {
            return ipcRenderer.sendSync('electron-store-get', val);
        },
        set(property, val) {
            ipcRenderer.send('electron-store-set', property, val);
        },
    },
    isMac: () => {
        return process.platform === 'darwin';
    },
});

contextBridge.exposeInMainWorld('devicedriver', {
    Assistant: AssistantDriver,
});
