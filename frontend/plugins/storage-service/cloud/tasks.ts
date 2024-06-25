import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { ITask } from '~/components/task/model';

export class TasksService extends ServiceBase<ITask> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'tasks', store);
    }

    async setLabelOrder(
        taskId: string,
        vaultId: string,
        labelId: string,
        order: number,
    ): Promise<ITask | null> {
        try {
            const { data } = await this.axiosInstance.put(
                `${this.APIRoot(vaultId)}/${taskId}/labels`,
                {
                    id: labelId,
                    order,
                },
            );

            return data as ITask;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async updateTodayOrder(
        tasks: Partial<ITask>[],
        vaultId: string,
    ): Promise<void> {
        try {
            await this.axiosInstance.post(`${this.APIRoot(vaultId)}/today`, {
                tasks,
            });
        } catch (e) {
            console.log(e);
        }
    }
}
