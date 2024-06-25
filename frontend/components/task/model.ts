export type TaskDateObject = {
    date: Date | null;
    dateTime: Date | null;
    timeZone: string | null;
} | null;

export interface ITask {
    userId: string;
    id: string;
    vaultId: string;
    text: string | null;
    canModify: boolean;
    description: string | undefined;
    completed: boolean;
    complete: boolean;
    archived: boolean;
    localCompleted: boolean;
    acreomRecurringId: string | null;
    open?: boolean;
    start: TaskDateObject;
    end: TaskDateObject;
    labels: any[];
    recurrentId: string | null;
    originalStartTime: TaskDateObject | null;
    parentDocument: string | null;
    documents: string[];
    source: string;
    status?: 'new' | 'creating' | 'created';
    updatedAt?: Date;
    createdAt?: Date;
    todayOrder: number;
    inboxOrder: number;
    allOrder: number;
    filepath?: string;
    type: any;
    rrule: string | null;
    recurrence: any;
    repeat: string | null;
    updateNotification?: boolean;
    hash: number;
}

export type AcreomJiraIssue = ITask & {
    properties: any & { transitions: any[] };
    key: string;
    integrationId: string;
    integrationType: string;
    url: string;
};
