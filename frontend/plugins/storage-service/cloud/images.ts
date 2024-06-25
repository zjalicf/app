import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { AxiosError } from 'axios';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { CloudResponse } from '~/@types/app';

export class ImagesService extends ServiceBase<any> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'images', store);
    }

    async retrieve(id: string, vaultId?: string) {
        const data = await this.axiosInstance.get(
            `${this.APIRoot(vaultId)}/${id}`,
            {
                responseType: 'blob',
            },
        );

        return data.data;
    }

    async save(
        entity: Partial<any>,
        _options: { create: boolean } = { create: false },
        vaultId?: string,
    ): Promise<CloudResponse<any>> {
        const formData = new FormData();
        const imageObject = JSON.stringify({ ...entity, data: undefined });
        formData.append('image', entity.data);
        formData.append('imageObject', imageObject);
        const data = await this.axiosInstance
            .post(this.APIRoot(vaultId) + '/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(data => {
                return {
                    status: data.status,
                    statusText: data.statusText,
                    data: data.data,
                };
            })
            .catch((err: AxiosError) => {
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<any>;
            });
        return data;
    }
}

export class i {
    private axiosInstance: NuxtAxiosInstance;

    constructor(axios: NuxtAxiosInstance) {
        this.axiosInstance = axios;
    }

    retrieve(remoteUri: string) {
        return this.axiosInstance
            .request({
                url: remoteUri,
                method: 'get',
                responseType: 'blob',
            })
            .then(res => res.data);
    }

    save(entityId: string, image: Blob): Promise<{ data: { url: string } }> {
        const formData = new FormData();
        formData.append('image', image);
        return this.axiosInstance.post('/api/v1/images/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                entity_id: entityId,
            },
        });
    }
}
