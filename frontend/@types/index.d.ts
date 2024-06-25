import { IDocument } from '../components/document/model';
import { FileType } from '~/constants';

declare module '*' {}

export type AiAssistantOptions = {
    context: string;
    tasks: string;
};

export type TaskDateObject = {
    date: Date | null;
    dateTime: Date | null;
    timeZone: string | null;
} | null;

declare interface SafeElectron {
    isTest: boolean;

    crypto: {
        encrypt: (data: string) => Promise<string>;
        decrypt: (data: string) => Promise<string>;
    };

    openExternal(url: string): void;

    selectDirectory(meta: {
        canCreate: boolean;
        buttonLabel?: string;
    }): Promise<null | string>;

    showItemInFolder(path: string): void;

    saveAs(
        data: string,
        filename: string,
        type: 'string' | 'blob',
    ): Promise<boolean>;

    createFolder(path: string, folderName: string): Promise<string | null>;

    on(
        action: 'received-link',
        callback: (action: string, data: string) => void,
    ): void;

    on(action: string, callback: Function): void;

    off(action: string): void;

    maximize(): void;

    minimize(): void;

    close(): void;

    focusState(): boolean;

    isWindowMaximized(): boolean;

    updateAndRestart(): void;

    checkForUpdates(): Promise<any>;

    restart(): void;

    openExternalLogin(path: string): void;

    closeExternalLogin(): void;

    login(authData: {
        access_token: string;
        refresh_token: string;
        expires_at: string;
    }): void;

    openSystemPreferences(pane: string): void;

    setTray(value: boolean): void;

    setQCShortcut(oldShortcut: string, newShortcut: string): void;

    createBridge(): void;

    store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        delete: (key: string) => void;
    };

    testUtil: {
        getTestPath: () => string;
    };

    addIntegration(data: string): void;

    getOSArch(): string | null;

    openDevTools(): void;
}

export type ListDirent = {
    id: string;
    parentId: string | null;
    filepath: string;
    order: number;
    dir: string;
    filetype: FileType;
    rootPath?: string;
    originalFilepath?: string;
    isFile: boolean;
    isDirectory: boolean;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    properties?: any;
};

export type WEntity = {
    vaultId: string;
    filepath: string;
    dir?: string;
    content?: string;
    mdContent?: string;
    metadata: Record<string, any>;
    name?: string;
    kind?: string;
    fileType: 'markdown' | 'attachment' | 'config' | 'unsupported';
} & Record<string, any>;

export interface Driver {
    read: <T>(entity: Partial<T>) => Promise<T>;
    list: <T>(path: Partial<T>) => Promise<any[]>;
    exists: (path: string) => Promise<boolean>;
    create: (...args: any[]) => Promise<void>;
    update: (...args: any[]) => Promise<void>;
    delete: (...args: any[]) => Promise<void>;
}

interface EntityDriver {
    exists: (pathObj: { filepath: string }) => Promise<boolean>;
    read: (entity: Partial<WEntity>) => Promise<WEntity>;
    batchRead: (entities: Partial<WEntity[]>) => Promise<WEntity[]>;
    create: (entity: Partial<WEntity>) => Promise<void>;
    update: (updateObj: {
        mods: Partial<WEntity>;
        oldObj: Partial<WEntity>;
    }) => Promise<void>;
    delete: (entity: Partial<WEntity>) => Promise<void>;
}

export type QuickaddOptions = {
    pm_bias: boolean;
    date_format: 'EU' | 'US';
};

declare interface SafeDeviceDriver {
    Document: Driver;
    Project: Driver;
    Task: Driver;
    Entity: EntityDriver;
    Attachment: Driver;
    Messaging: {
        on: (action: string, handler: (data: any) => void) => void;
    };
    Vault: {
        list: (path: string) => any[];
        broadcastChange: (vaultId: string) => void;
        registerWatch: (path: string, id: string) => void;
        removeWatch: (path: string, id: string) => void;
    };
    Image: {
        save: (path: string, data: any) => any;
        mediaMap: () => any;
    };
    Assistant: {
        quickadd: (
            data: string,
            ts: string,
            options: QuickaddOptions,
        ) => Promise<any>;
        isActive: () => any;
    };
    AssistantAssetManager: {
        getModelState: () => Promise<any>;
        fetchModel: () => Promise<any>;
        cancelFetchModel: () => Promise<any>;
    };
    AppleCalendarSync: {
        getAccessStatus: () => Promise<number>;
        requestAccess: () => Promise<boolean>;
        events: (payload: { from: number; to: number }) => Promise<any>;
        calendars: () => Promise<any>;
        openPreferences: () => Promise<void>;
    };
    AI: {
        process: (input: {
            prompt: string;
            options: AiAssistantOptions;
        }) => Promise<boolean>;
        isActive: () => Promise<boolean>;
    };
    Notification: {
        initialize: (payload: { vaultId: string; events: any[] }) => void;
        updateEvent: (payload: any) => void;
    };

    Network: {
        isOnline: () => Promise<boolean>;
    };
}

export type SafeElectronWindow = Window &
    typeof globalThis & {
        electron: SafeElectron;
        devicedriver: SafeDeviceDriver;
    };

export type RenameWatchEvent = {
    event: 'rename';
    entity: 'document' | 'folder';
    path: string;
    data: { vaultId: string; from: ListDirent; to: ListDirent };
};

export type BasicWatchEvent = {
    event: 'add' | 'change' | 'delete';
    entity: 'document' | 'folder';
    path: string;
    data: { vaultId: string } & ListDirent;
};

export type WatchEvent = RenameWatchEvent | BasicWatchEvent;

export type IFolder = {
    id: string;
    vaultId: string;
    type: string;
    name: string;
    order: number;
    query: string;
    view: string;
    status: 'new' | 'creating' | 'created';
    sharingUuid?: string | null;
    parentId: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    filepath?: string | null;
    contentHash: string | null;
    documents?: IDocument[];
    icon?: string | null;
    expanded?: boolean | null;
    properties?: any;
};

export type IProject = IFolder;

export type IVault = {
    id: string;
    name: string;
    type: string;
    filepath?: string;
    color?: string;
    createdAt: Date;
    modifiedAt: Date;
};

export type IIntegration = {
    id: string;
};

export type ILabel = string;

export type IEvent = {
    id: string;
    vaultId: string;
    userId?: string;
    remoteId: string | null;
    integrationType: string | null;
    integrationId: string | null;
    status: string | null;
    htmlLink: string | null;
    summary: string;
    description: string;
    location: string | null;
    colorId: string | null;
    creator: Record<string, any> | null;
    organizer: Record<string, any> | null;
    start: TaskDateObject | null;
    end: TaskDateObject | null;
    endTimeUnspecified: boolean | null;
    recurrence: string[] | null;
    acreomRecurringId: string | null;
    recurringEventId: string | null;
    originalStartTime: TaskDateObject | null;
    transparency: string | null;
    visibility: string | null;
    iCalUID: string | null;
    sequence: number;
    attendees: Record<string, any>[] | null;
    attendeesOmitted: boolean | null;
    extendedProperties: Record<string, any> | null;
    hangoutLink: string | null;
    conferenceData: Record<string, any> | null;
    gadget: Record<string, any> | null;
    anyoneCanAddSelf: boolean;
    guestsCanInviteOthers: boolean;
    guestsCanModify: boolean;
    guestsCanSeeOtherGuests: boolean;
    privateCopy?: boolean;
    locked?: boolean;
    reminders: Record<string, any> | null;
    source: Record<string, any> | null;
    attachments: Record<string, any> | null;
    eventType: string | null;
    linkedDocumentId: string | null;
    calendarId: string | null;
    createdAt: Date;
    updatedAt: Date;

    sendNotifications?: boolean;
    sendUpdates: boolean | undefined;

    _status?: string;
    filepath?: string;
};

type DeviceContentStructure = {
    folders: IFolder[];
    documents: WEntity[];
    tasks: WEntity[];
    events: WEntity[];
};

export type ImageObject = {
    id: string;
    entityType: string;
    entityId: string;
    vaultId: string;
    filepath?: string;
    folderId?: string;
    isOnDisk?: boolean;
    remoteUri?: string;
    name?: string;
    ext?: string;
    data?: any;
    encryptedData?: string | null;
    encryptionKey?: string | null;
    encrypted?: boolean;
};

export type IWorkerMessagePayload = {
    vaultId: string;
    id?: string;
};

export type IWorkerMessage = {
    type: string;
    payload: IWorkerMessagePayload;
    messageId: string;
};

export type DatabaseWorkerMessage = {
    type: string;
    table: string;
    operation: string;
    payload: any | any[];
    messageId: string;
};

export type WorkerInvokeMessage = {
    service: any;
    operation: string;
    payload: any | any[];
    messageId: string;
};

export type SidebarItem = {
    id: string;
    parentId: string | null;
    name: string;
    type: 'document' | 'folder';
    status: string | null;
    icon: string | null;
    order: number;
    expanded: boolean;
    clip: { id: string; type: string; key: string };
};
