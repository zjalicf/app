import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext } from '~/@types/app';

export type ITaskList = {
    id: number;
    label: string;
    order: number;
    orderBy: string;
    orderDirection: string;
    collapsed: boolean;
    updatedAt: Date;
    createdAt: Date;
};

export class TaskListsService extends ServiceBase<ITaskList> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'tasklists', ctx);
    }
}
