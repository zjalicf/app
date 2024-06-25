import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { WorkerContext, CloudResponse } from '~/@types/app';
import { networkErrorHandler } from '~/workers/cloud/util';

interface IWithID {
    id: string | number;
}

export abstract class ServiceBase<T extends IWithID> {
    protected apiRoot = '/api/v1';
    protected axiosInstance: AxiosInstance;
    protected entity = 'entity';
    protected context: WorkerContext;

    protected constructor(
        axios: AxiosInstance,
        entity: string,
        ctx: WorkerContext,
    ) {
        this.axiosInstance = axios;
        this.entity = entity;
        this.context = ctx;
    }

    get APIRoot() {
        return (vaultId?: string) => {
            if (vaultId) {
                return `${this.apiRoot}/${vaultId}/${this.entity}`;
            }

            return `${this.apiRoot}/${this.entity}`;
        };
    }

    async retrieve(id: string, vaultId?: string): Promise<CloudResponse<T>> {
        const response = await this.axiosInstance
            .get<T>(`${this.APIRoot(vaultId)}/${id}`)
            .catch((err: AxiosError) => {
                console.log(err);
                if (!err.response) return networkErrorHandler(err.code!);
                return err.response!;
            });
        return {
            data: response?.data ?? null,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async list(
        vaultId?: string,
        timestamp?: number,
    ): Promise<CloudResponse<T[]>> {
        const config = {} as AxiosRequestConfig;
        if (timestamp) {
            config.params = { timestamp };
        }
        const response = await this.axiosInstance
            .get<T[]>(this.APIRoot(vaultId), config)
            .catch((err: AxiosError) => {
                console.log(err);
                if (!err.response) return networkErrorHandler(err.code!);

                return err.response!;
            });
        return {
            data: response?.data ?? [],
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async listDeleteChanges(
        vaultId: string | null,
        timestamp: number,
    ): Promise<CloudResponse<{ id: string; type: string; vaultId: string }>> {
        const response = await this.axiosInstance
            .get<{ id: string; type: string; vaultId: string }>(
                `${this.APIRoot(
                    vaultId as string,
                )}/deletechanges?timestamp=${timestamp}`,
            )
            .catch((err: AxiosError) => {
                if (!err.response) return networkErrorHandler(err.code!);
                return err.response!;
            });
        return {
            data: response?.data ?? [],
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async save(
        entity: Partial<T>,
        options = { create: false },
        vaultId?: string,
        token?: string,
    ): Promise<CloudResponse<T>> {
        const config: Record<string, any> = {};

        if (token) {
            config.params = {
                token,
            };
        }

        if (options.create) {
            const response = await this.axiosInstance
                .post(
                    this.APIRoot(vaultId),
                    {
                        clientId: this.context.$config.clientId,
                        ...entity,
                    },
                    config,
                )
                .catch((err: AxiosError) => {
                    if (!err.response) return networkErrorHandler(err.code!);
                    return err.response!;
                });
            return {
                data: response?.data ?? null,
                status: response?.status,
                statusText: response?.statusText,
            };
        }
        const response = await this.axiosInstance
            .put(
                `${this.APIRoot(vaultId)}/${entity.id}`,
                {
                    clientId: this.context.$config.clientId,
                    ...entity,
                },
                config,
            )
            .catch((err: AxiosError) => {
                if (!err.response) return networkErrorHandler(err.code!);
                return err.response!;
            });
        return {
            data: response?.data ?? null,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async saveBatch(
        entities: Partial<T>[],
        vaultId?: string,
        options?: { create: boolean },
    ): Promise<CloudResponse<T[]>> {
        if (!options?.create) {
            const response = await this.axiosInstance
                .put(`${this.APIRoot(vaultId)}/batch`, {
                    clientId: this.context.$config.clientId,
                    entities,
                })
                .catch((err: AxiosError) => {
                    if (!err.response) return networkErrorHandler(err.code!);
                    return err.response!;
                });
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
        }
        const response = await this.axiosInstance
            .post(`${this.APIRoot(vaultId)}/batch`, {
                clientId: this.context.$config.clientId,
                entities,
            })
            .catch((err: AxiosError) => {
                console.log(err);
                if (!err.response) return networkErrorHandler(err.code!);
                return err.response!;
            });
        return {
            data: response?.data,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async delete(id: string, vaultId?: string): Promise<CloudResponse<T>> {
        const response = await this.axiosInstance
            .delete(`${this.APIRoot(vaultId)}/${id}`, {
                params: {
                    clientId: this.context.$config.clientId,
                },
            })
            .catch((err: AxiosError) => {
                console.log(err);
                if (!err.response) return networkErrorHandler(err.code!);
                return err.response!;
            });
        return {
            data: response?.data,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    load(
        _vaultId: string,
        _requestedEntities: { type: string; timestamp: number }[],
    ): Promise<CloudResponse<{ type: string; entries: any[] }[]>> {
        throw new Error('not implemented');
    }

    loadDeleteChanges(
        _vaultId: string,
        _requestedEntities: { type: string; timestamp: number }[],
    ): Promise<CloudResponse<{ type: string; entries: any[] }[]>> {
        throw new Error('not implemented');
    }
}
