import { v4 } from 'uuid';
import { deserializeTaskDateObject } from '~/store/tasks';
import { ITask } from '~/components/task/model';

export const createNewTaskObject = (vaultId: string): Partial<ITask> => {
    return {
        id: v4(),
        vaultId,
        text: '',
        completed: false,
        end: null,
        start: null,
        rrule: null,
    };
};

export const createQcTaskObject = (data: any): ITask => {
    return {
        id: v4(),
        text: data.text ?? '',
        description: '',
        canModify: true,
        completed: data.completed,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        end:
            deserializeTaskDateObject(
                JSON.parse(data.end?.replaceAll('&quot;', '"') || 'null'),
            ) ?? null,
        start:
            deserializeTaskDateObject(
                JSON.parse(data.start?.replaceAll('&quot;', '"') || 'null'),
            ) ?? null,
        rrule: null,
        recurrentId: null,
        parentDocument: null,
        labels:
            JSON.parse(data.labels.replaceAll('&quot;', '"') || '[]') ?? null,
        source: 'quick-capture',
        open: false,
    } as ITask;
};
