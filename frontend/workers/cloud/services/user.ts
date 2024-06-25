import { AxiosError, AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext, CloudResponse } from '~/@types/app';
import type { IUser } from '~/workers/database/indexeddb/types';
import { networkErrorHandler } from '~/workers/cloud/util';

export class UserService extends ServiceBase<IUser> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'users', ctx);
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
                if (res.status > 300) {
                    return {
                        status: res.status,
                        statusText: res.statusText,
                        data: null,
                    };
                }
                return {
                    status: res.status,
                    statusText: res.statusText,
                    data: res.data,
                };
            })
            .catch((err: AxiosError) => {
                if (!err.response) return networkErrorHandler(err.code!);
                if (!err.response?.data) {
                    return {
                        status: err.response?.status,
                        statusText: err.response?.statusText,
                        data: null,
                    };
                }
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<IUser>;
            });
        return response as any;
    }

    async list(): Promise<CloudResponse<IUser[]>> {
        const response = await this.retrieve();
        if (response.status >= 300 || !response.data) {
            return {
                ...response,
                data: [],
            };
        }
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

    async delete(): Promise<any> {
        const response = await this.axiosInstance
            .delete(this.APIRoot())
            .then(res => {
                return {
                    status: res.status,
                    statusText: res.statusText,
                    data: res.data,
                };
            })
            .catch((err: AxiosError) => {
                if (!err.response) return networkErrorHandler(err.code!);
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<IUser>;
            });

        return response;
    }

    async setTimezone(timezone: string): Promise<IUser> {
        const { data } = await this.axiosInstance.post(
            `${this.APIRoot()}/timezone`,
            { timezone },
        );
        return data as IUser;
    }

    userSubscriptionDetails(): Promise<any> {
        const apiRoot = this.APIRoot();
        return this.axiosInstance.get(`${apiRoot}/subscription`);
    }
}
