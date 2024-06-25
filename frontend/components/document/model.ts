import { TaskDateObject } from '../task/model';
import { PageStatus } from '~/constants';

export type ContentVersion = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface IDocument {
    id: string;
    userId: string;
    vaultId: string;
    title: string;
    content: string;
    updateId?: string;
    updatedAt: Date;
    createdAt: Date;
    pinned?: boolean;
    tasks: string[];
    events: string[];
    links: string[];
    images: string[];
    labels: string[];
    sharingUuid: string | null;
    projectId: string | null;
    dailyDoc: string | null;
    archived?: boolean;
    template?: boolean;
    status?: 'new' | 'creating' | 'created';
    type?: 'syncable' | 'local';
    filepath?: string | null;
    directory?: string | null;
    sequence?: string;
    order: number;
    pinOrder: number;
    icon?: string;
    clip?: string | null;
    mdContent?: string;
    pageStatus?: PageStatus | null;
    properties?: {
        recurringExceptions?: {
            completed?: string[];
            deleted?: string[];
        };
    };
    viewOrder?: Record<string, number>;
    editorId?: string;
    versions?: ContentVersion[];
    start: TaskDateObject;
    end: TaskDateObject;
}
