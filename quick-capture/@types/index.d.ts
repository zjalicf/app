declare module '*' {}

export type TaskDateObject = {
    date: Date | null;
    dateTime: Date | null;
    timeZone: string | null;
} | null;

declare interface SafeElectron {
    selectDirectory(meta: { canCreate: boolean }): Promise<null | string>;

    showItemInFolder(path: string): void;

    createFolder(path: string, folderName: string): string | null;

    on(
        action: 'received-link',
        callback: (action: string, data: string) => void,
    ): void;

    on(action: string, callback: Function): void;

    maximize(): void;

    minimize(): void;

    close(source?: string): void;

    trackEvent(eventType: any, eventProperties: any): void;

    focusState(): boolean;

    isWindowMaximized(): boolean;

    updateAndRestart(): void;

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

    store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
    };

    appendToDailyDoc(html: string): void;

    addTask(data: any): void;

    addPage(data: any): void;

    isMac(): boolean;
}

export type WEntity = {
    vaultId: string;
    filepath: string;
    dir?: string;
    content?: string;
    metadata: Record<string, any>;
    name?: string;
    kind?: string;
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

export type WatchEvent = {
    event: string;
    entity: 'document' | 'folder';
    path: string;
    data: Record<string, any>;
};

export type IVault = {
    id: string;
    name: string;
    type: string;
    filepath?: string;
    createdAt: Date;
    modifiedAt: Date;
};

export type IIntegration = {
    id: string;
};

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

export type ImageObject = {
    id: string;
    entityType: string;
    entityId: string;
    vaultId: string;
    filepath?: string;
    isOnDisk?: boolean;
    remoteUri?: string;
    name?: string;
    ext?: string;
    data?: any;
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
