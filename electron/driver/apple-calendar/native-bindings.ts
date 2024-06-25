import { join } from 'path';
import { readdir } from 'fs/promises';
import * as path from 'path';
import koffi from 'koffi';
import { shell, app } from 'electron';
import { isMac, isWindows } from '../../helpers';
import { appWindows } from '../../app';

const RequestAccessCallback = koffi.proto(
    'void requestAccessCallback(long granted, long error)',
);

export class AppleCalendarNativeAPI {
    lib: {
        setNotificationPath: koffi.KoffiFunction;
        getAuthorizationStatus: koffi.KoffiFunction;
        getCalendars: koffi.KoffiFunction;
        getEvents: koffi.KoffiFunction;
        requestAccess: koffi.KoffiFunction;
    };

    free: any;

    constructor(ARGS: any) {
        const directory = isMac ? 'mac-arm64' : isWindows ? 'windows' : 'linux';
        const path = ARGS.dev
            ? join(
                  __dirname,
                  '../',
                  'Assets',
                  directory,
                  'libAppleCalendarSync.dylib',
              )
            : join(
                  process.resourcesPath,
                  'Assets',
                  'libAppleCalendarSync.dylib',
              );
        const lib = koffi.load(path);
        const disposableString = koffi.disposable('String', 'str');
        this.lib = {
            setNotificationPath: lib.func(
                'appleCalendar_setNotificationPath',
                'void',
                ['string'],
            ),
            getAuthorizationStatus: lib.func(
                'appleCalendar_getAuthorizationStatus',
                'long',
                [],
            ),
            getCalendars: lib.func(
                'appleCalendar_getCalendars',
                disposableString,
                // 'string',
                [],
            ),
            getEvents: lib.func(
                'appleCalendar_getEvents',
                disposableString,
                // 'string',
                ['long', 'long'],
            ),
            requestAccess: lib.func('appleCalendar_requestAccess', 'void', [
                koffi.pointer(RequestAccessCallback),
            ]),
        };
    }

    openPreferences(): Promise<void> {
        return shell.openExternal(
            'x-apple.systempreferences:com.apple.preference.security?Privacy_Calendars',
        );
    }

    setNotificationPath(path: string): void {
        this.lib.setNotificationPath(path);
    }

    getAuthorizationStatus(): number {
        const status = this.lib.getAuthorizationStatus();
        appWindows.main.webContents.send(
            'electron-log',
            'AppleCalendarNativeAPI: getAuthorizationStatus: ' + status,
        );
        return status;
    }

    async requestAccess(): Promise<boolean> {
        let cb: any = null;
        const homePath = app.getPath('home');
        try {
            await readdir(path.join(homePath, 'Library', 'Calendars'));
            appWindows.main.webContents.send(
                'electron-log',
                'AppleCalendarNativeAPI: requestAccess: readdir success',
            );
        } catch (e) {
            appWindows.main.webContents.send(
                'electron-log',
                'AppleCalendarNativeAPI: requestAccess: readdir error' +
                    e.message,
            );
        }
        return new Promise((resolve, reject) => {
            cb = koffi.register((granted: number, error: number) => {
                appWindows.main.webContents.send(
                    'electron-log',
                    'AppleCalendarNativeAPI: requestAccess: ' +
                        granted +
                        ' ' +
                        error,
                );
                if (error) {
                    reject(
                        new Error(
                            'error while requesting access to apple calendar',
                        ),
                    );
                } else {
                    resolve(granted);
                }
            }, koffi.pointer(RequestAccessCallback));

            this.lib.requestAccess(cb);
        }).then((res: number) => {
            koffi.unregister(cb);
            return res === 1;
        });
    }

    getEvents(from: number = -7, to: number = 7): any[] {
        try {
            const eventsJSON: string = this.lib.getEvents(from, to);
            return JSON.parse(eventsJSON);
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    getCalendars(): any[] {
        try {
            const calendarsJSON: string = this.lib.getCalendars();
            return JSON.parse(calendarsJSON);
        } catch (e) {
            console.error(e);
            return [];
        }
    }
}
