import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { AxiosError } from 'axios';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { IIntegration } from '~/@types';
import { CloudResponse } from '~/@types/app';

export class IntegrationsService extends ServiceBase<IIntegration> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'integrations', store);
    }

    async save(
        entity: Partial<IIntegration>,
        options = { create: false },
        vaultId?: string,
    ): Promise<CloudResponse<IIntegration>> {
        if (options.create) {
            const response = await this.axiosInstance
                .post(this.APIRoot(vaultId), {
                    clientId: this.store?.getters['auth/clientId'],
                    ...entity,
                })
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
                    } as CloudResponse<IIntegration>;
                });
            return response;
        }
        const response = await this.axiosInstance
            .put(`${this.APIRoot(vaultId)}/${entity.id}`, {
                clientId: this.store?.getters['auth/clientId'],
                ...entity,
            })
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
                } as CloudResponse<IIntegration>;
            });
        return response;
    }
}
