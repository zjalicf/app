import { IpcMain, IpcMainEvent } from 'electron';
import { IEvent } from '../../frontend/@types';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { notificationManager } from '../app/notification-manager';
import { ITask } from '../../frontend/components/task/model';

export const enum DatabaseChangeType {
    Create = 1,
    Update = 2,
    Delete = 3,
}

export interface IDeleteChange {
    type: DatabaseChangeType.Delete;
    table: string;
    key: any;
    oldObj: any;
    source?: string;
}
export interface ICreateChange {
    type: DatabaseChangeType.Create;
    table: string;
    key: any;
    obj: any;
    source?: string;
}

export interface IUpdateChange {
    type: DatabaseChangeType.Update;
    table: string;
    key: any;
    mods: { [keyPath: string]: any | undefined };
    obj: any;
    oldObj: any;
    source?: string;
}

export type IDatabaseChange = ICreateChange | IUpdateChange | IDeleteChange;

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.NOTIFICATION_INITIALIZE,
        (
            _: IpcMainEvent,
            payload: {
                vaultId: string;
                events: IEvent[];
                tasks: ITask[];
                integrations: any[];
                localConfig: any[];
            },
        ) => {
            notificationManager.initialize(payload);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.NOTIFICATION_SCHEDULE,
        (
            _: IpcMainEvent,
            payload: (IEvent | ITask)[]
        ) => {
            notificationManager.scheduleEvents(payload);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.NOTIFICATION_UPDATE_EVENT,
        (
            _: IpcMainEvent,
            payload: { vaultId: string; change: IDatabaseChange },
        ) => {
            notificationManager.updateEvent(payload);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.NOTIFICATION_UPDATE_INTEGRATION,
        (
            _: IpcMainEvent,
            payload: { vaultId: string; change: IDatabaseChange },
        ) => {
            notificationManager.updateIntegration(payload);
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.NOTIFICATION_UPDATE_LOCAL_CONFIG,
        (
            _: IpcMainEvent,
            payload: { vaultId: string; change: IDatabaseChange },
        ) => {
            notificationManager.updateLocalConfig(payload);
        },
    );
};
