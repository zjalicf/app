import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosError } from 'axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { CloudResponse } from '~/@types/app';
import type { IUser } from '~/workers/database/indexeddb/types';

export class UserService extends ServiceBase<IUser> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'users', store);
    }

    async retrieve(token?: string): Promise<CloudResponse<IUser>> {
        const config: Record<string, any> = {};

        if (token) {
            config.params = {
                token,
            };
        }

        const response = await this.axiosInstance
            .get(this.APIRoot(), config)
            .then(res => {
                return {
                    status: res.status,
                    statusText: res.statusText,
                    data: res.data,
                };
            })
            .catch((err: AxiosError) => {
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<IUser>;
            });
        return response;
    }

    async list(): Promise<CloudResponse<IUser[]>> {
        const response = await this.retrieve();
        return { ...response, data: [response.data] };
    }

    async listDeleteChanges(
        _vaultId: string | null,
        _timestamp: number,
    ): Promise<CloudResponse<any>> {
        return {
            data: [],
            status: 200,
            statusText: '',
        };
    }

    delete(): Promise<any> {
        throw new Error('Not Implemented');
    }

    async setTimezone(timezone: string): Promise<IUser> {
        const { data } = await this.axiosInstance.post(
            `${this.APIRoot()}/timezone`,
            { timezone },
        );
        return data as IUser;
    }

    manage(): string {
        const apiRoot = this.APIRoot();
        const token = this.store?.getters['user/credentials'].accessToken;
        return `${
            this.axiosInstance.defaults.baseURL
        }${apiRoot}/subscription/manage?token=${encodeURIComponent(token)}`;
    }

    userSubscriptionDetails(): Promise<any> {
        const apiRoot = this.APIRoot();
        return this.axiosInstance.get(`${apiRoot}/subscription`);
    }

    async expireSubscription(): Promise<any> {
        const apiRoot = this.APIRoot();
        const sub = await this.userSubscriptionDetails();
        return this.axiosInstance.get(
            `${apiRoot}/subscription/expireSubscription/${sub.data.id}`,
        );
    }

    async setTrial(): Promise<any> {
        const apiRoot = this.APIRoot();
        const sub = await this.userSubscriptionDetails();
        return this.axiosInstance.get(
            `${apiRoot}/subscription/setTrial/${sub.data.id}`,
        );
    }

    async setPro(): Promise<any> {
        const apiRoot = this.APIRoot();
        const sub = await this.userSubscriptionDetails();
        return this.axiosInstance.get(
            `${apiRoot}/subscription/setPro/${sub.data.id}`,
        );
    }

    async setStatus(status: string): Promise<any> {
        const apiRoot = this.APIRoot();
        const sub = await this.userSubscriptionDetails();
        return this.axiosInstance.get(
            `${apiRoot}/subscription/setStatus/${sub.data.id}/${status}`,
        );
    }
}
