import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { AxiosError } from 'axios';
import { CloudResponse } from '~/@types/app';

interface IWithID {
    id: string | number;
}

export abstract class ServiceBase<T extends IWithID> {
    protected apiRoot = '/api/v1';
    protected axiosInstance: NuxtAxiosInstance;
    protected entity = 'entity';
    protected store: Store<any> | null;

    protected constructor(
        axios: NuxtAxiosInstance,
        entity: string,
        store: Store<any> | null = null,
    ) {
        this.axiosInstance = axios;
        this.entity = entity;
        this.store = store;
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
                return err.response!;
            });
        return {
            data: response?.data,
            status: response?.status,
            statusText: response?.statusText,
        };
    }

    async list(vaultId?: string): Promise<CloudResponse<T[]>> {
        const response = await this.axiosInstance
            .get<T[]>(this.APIRoot(vaultId))
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response?.data,
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
                return err.response!;
            });
        return {
            data: response?.data,
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
                        clientId: this.store?.getters['auth/clientId'],
                        ...entity,
                    },
                    config,
                )
                .catch((err: AxiosError) => {
                    return err.response!;
                });
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
        }
        const response = await this.axiosInstance
            .put(
                `${this.APIRoot(vaultId)}/${entity.id}`,
                {
                    clientId: this.store?.getters['auth/clientId'],
                    ...entity,
                },
                config,
            )
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
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
                    clientId: this.store?.getters['auth/clientId'],
                    entities,
                })
                .catch((err: AxiosError) => {
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
                clientId: this.store?.getters['auth/clientId'],
                entities,
            })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async delete(id: string, vaultId?: string): Promise<CloudResponse<T>> {
        const response = await this.axiosInstance
            .delete(`${this.APIRoot(vaultId)}/${id}`, {
                params: {
                    clientId: this.store?.getters['auth/clientId'],
                },
            })
            .catch((err: AxiosError) => {
                console.log(err);
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }
}
