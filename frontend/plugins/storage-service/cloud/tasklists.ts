import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';

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
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'tasklists', store);
    }
}
