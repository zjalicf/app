import { ipcRenderer, IpcRendererEvent } from 'electron';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import {
    AiAssistantOptions,
    IEvent,
    IFolder,
    IVault,
    QuickaddOptions,
    WEntity,
} from '../../frontend/@types';
import { ITask } from '../../frontend/components/task/model';

type Attachment = {
    vaultId: string;
    filepath: string;
    content: string | Buffer;
};

export const EntityDriver = {
    exists: ({ filepath }: { filepath: string }): Promise<boolean> => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.FILE_EXISTS, filepath);
    },
    read: (entity: Partial<WEntity>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ENTITY_READ, entity);
    },
    batchRead: (entities: Partial<WEntity[]>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ENTITY_BATCH_READ, entities);
    },
    create: (entity: Partial<WEntity>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ENTITY_CREATE, entity);
    },
    createBatch: ({
        vaultId,
        entities,
    }: {
        vaultId: string;
        entities: Partial<WEntity>[];
    }) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.ENTITY_CREATE_BATCH,
            vaultId,
            entities,
        );
    },
    update: ({
        mods,
        oldObj,
    }: {
        mods: Partial<WEntity>;
        oldObj: Partial<WEntity>;
    }) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ENTITY_UPDATE, mods, oldObj);
    },
    delete: (entity: Partial<WEntity>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ENTITY_REMOVE, entity);
    },
};

export const AttachmentDriver = {
    exists: ({ filepath }: { filepath: string }): Promise<boolean> => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ATTACHMENT_EXISTS, filepath);
    },
    read: ({ filepath }: Partial<Attachment>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ATTACHMENT_READ, filepath);
    },
    copy: (filepaths: { from: string; to: string }[]) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.ATTACHMENT_COPY, filepaths);
    },
    create: ({ vaultId, filepath, content }: Attachment) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.ATTACHMENT_CREATE,
            vaultId,
            filepath,
            content,
        );
    },
    createBatch: (attachments: Attachment[]) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.ATTACHMENT_CREATE_BATCH,
            attachments,
        );
    },
    delete: ({ vaultId, filepath }: Partial<Attachment>) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.ATTACHMENT_DELETE,
            vaultId,
            filepath,
        );
    },
};

export const ImageDriver = {
    read: (path: string) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.IMAGE_READ, path);
    },
    save: (payload: { path: string; data: any }) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.IMAGE_CREATE, payload);
    },
    delete: (path: string) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.IMAGE_REMOVE, path);
    },
    mediaMap: () => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.MEDIA_MAP);
    },
};

type MessageHandler = (...data: any) => void;

export const MessagingDriver = {
    on: (event: string, handler: MessageHandler) => {
        ipcRenderer?.on(event, (_event: IpcRendererEvent, ...data: any[]) => {
            handler(...data);
        });
    },
};

const NETWORK_IS_ONLINE = 'network is online';

export const NetworkDriver = {
    isOnline: () => {
        return ipcRenderer.invoke(NETWORK_IS_ONLINE);
    },
};

export const NotificationDriver = {
    initialize: (payload: {
        vaultId: string;
        events: IEvent[];
        tasks: ITask[];
        integrations: any[];
        localConfig: any[];
    }) => {
        ipcRenderer.invoke(DEVICE_ACTIONS.NOTIFICATION_INITIALIZE, payload);
    },
    updateEvent: (payload: IEvent) => {
        ipcRenderer.invoke(DEVICE_ACTIONS.NOTIFICATION_UPDATE_EVENT, payload);
    },
    schedule: (payload: (ITask | IEvent)[]) => {
        ipcRenderer.invoke(DEVICE_ACTIONS.NOTIFICATION_SCHEDULE, payload);
    },
    updateIntegration: (payload: any) => {
        ipcRenderer.invoke(
            DEVICE_ACTIONS.NOTIFICATION_UPDATE_INTEGRATION,
            payload,
        );
    },
    updateLocalConfig: (payload: any) => {
        ipcRenderer.invoke(
            DEVICE_ACTIONS.NOTIFICATION_UPDATE_LOCAL_CONFIG,
            payload,
        );
    },
};

export const ProjectDriver = {
    isDir: (filepath: string) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.IS_DIR, filepath);
    },
    read: (project: Partial<IFolder>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PROJECT_READ, project);
    },
    list: (project: Partial<IFolder>, _options?: { recursive: boolean }) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PROJECT_LIST, project);
    },
    listRecursive: (project: Partial<IFolder>) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.PROJECT_LIST_RECURSIVE,
            project,
        );
    },
    parseFilepath: (filepath: string) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PARSE_FILEPATH, filepath);
    },
    create: (project: Partial<IFolder> | null) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PROJECT_CREATE, project);
    },
    createBatch: (projects: Partial<IFolder>[]) => {
        return ipcRenderer?.invoke(
            DEVICE_ACTIONS.PROJECT_CREATE_BATCH,
            projects,
        );
    },
    update: ({
        mods,
        oldObj,
    }: {
        mods: Partial<IFolder>;
        oldObj: Partial<IFolder>;
    }) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PROJECT_UPDATE, mods, oldObj);
    },
    delete: (project: Partial<IFolder> | null) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.PROJECT_REMOVE, project);
    },
};

export const VaultDriver = {
    list: ({ filepath, type }: { filepath: string; type: string }) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.VAULT_LIST, filepath, type);
    },
    exists: ({ filepath }: Partial<IVault>) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.VAULT_EXISTS, filepath);
    },
    loadNewVault: ({ id, filepath }: Partial<IVault>) => {
        ipcRenderer.send(DEVICE_ACTIONS.VAULT_INITIAL_LOAD, id, filepath);
    },
    loadContentMap: ({ id, filepath }): any => {
        return ipcRenderer.invoke(
            DEVICE_ACTIONS.VAULT_CONTENT_MAP,
            id,
            filepath,
        );
    },
    triggerLocalChangesLoad: ({ id, filepath }: Partial<IVault>) => {
        ipcRenderer.send(DEVICE_ACTIONS.VAULT_LOCAL_CHANGES_LOAD, id, filepath);
    },
    broadcastChange: ({ vaultId }: { vaultId: string }) => {
        return ipcRenderer?.invoke(DEVICE_ACTIONS.VAULT_CHANGE, vaultId);
    },
    registerWatch: ({ path, id }: { path: string; id: string }) => {
        ipcRenderer?.postMessage(
            DEVICE_ACTIONS.VAULT_WATCH_REGISTER,
            {
                path,
                id,
            },
            [],
        );
    },
    removeWatch: ({ id }: { id: string }) => {
        return ipcRenderer?.postMessage(
            DEVICE_ACTIONS.VAULT_WATCH_REMOVE,
            {
                id,
            },
            [],
        );
    },
    getStructure: ({ vaultId }: { vaultId: string }) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.GET_VAULT_STRUCTURE, vaultId);
    },
    isFolderEmpty: ({ path }: { path: string }) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.IS_FOLDER_EMPTY, path);
    },
    createRootFolder: ({ path }: { path: string }) => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.CREATE_ROOT_FOLDER, path);
    },
};

export const AssistantDriver = {
    quickadd: ({
        data,
        ts,
        options,
    }: {
        data: string;
        ts: string;
        options: QuickaddOptions;
    }): Promise<boolean> => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.ASSISTANT_QUICKADD, {
            data,
            ts,
            options,
        });
    },
    isActive: (): Promise<boolean> => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.ASSISTANT_ACTIVE);
    },
};

export const AppleCalendarSyncDriver = {
    openPreferences: (): Promise<void> => {
        return ipcRenderer.invoke(
            DEVICE_ACTIONS.APPLE_CALENDAR_OPEN_PREFERENCES,
            {},
        );
    },
    getAccessStatus: (): Promise<number> => {
        return ipcRenderer.invoke(
            DEVICE_ACTIONS.APPLE_CALENDAR_ACCESS_STATUS,
            {},
        );
    },
    requestAccess: (): Promise<boolean> => {
        return ipcRenderer.invoke(
            DEVICE_ACTIONS.APPLE_CALENDAR_REQUEST_ACCESS,
            {},
        );
    },
    events: (payload: { from: number; to: number }): Promise<any> => {
        return ipcRenderer.invoke(
            DEVICE_ACTIONS.APPLE_CALENDAR_EVENTS,
            payload,
        );
    },
    calendars: (): Promise<any> => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.APPLE_CALENDAR_CALENDARS, {});
    },
};

export const AssistantAssetManagerDriver = {
    getModelState: () => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.ASSISTANT_ASSET_STATUS);
    },
    fetchModel: () => {
        return ipcRenderer?.send(DEVICE_ACTIONS.ASSISTANT_ASSET_FETCH);
    },
    cancelFetchModel: () => {
        return ipcRenderer?.send(DEVICE_ACTIONS.ASSISTANT_ASSET_FETCH_CANCEL);
    },
    deleteModel: () => {
        return ipcRenderer?.send(DEVICE_ACTIONS.ASSISTANT_ASSET_DELETE);
    },
};

export const AIDriver = {
    process: ({
        prompt,
        options,
    }: {
        prompt: string;
        options: AiAssistantOptions;
    }): Promise<boolean> => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.AI_ASSISTANT_PROMPT, {
            prompt,
            options,
        });
    },
    isActive: (): Promise<boolean> => {
        return ipcRenderer.invoke(DEVICE_ACTIONS.AI_ASSISTANT_ACTIVE);
    },
};
