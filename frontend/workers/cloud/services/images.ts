import { AxiosError, AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext, CloudResponse } from '~/@types/app';
import { networkErrorHandler } from '~/workers/cloud/util';

export class ImagesService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'images', ctx);
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

    async saveBatch(
        entities: Partial<any>[],
        vaultId?: string,
        options?: { create: boolean },
    ): Promise<CloudResponse<any>> {
        return (await Promise.all(
            entities.map(entity => {
                return this.save(entity, options, vaultId);
            }),
        )) as any;
    }

    async save(
        entity: Partial<any>,
        options: { create: boolean } = { create: false },
        vaultId?: string,
    ): Promise<CloudResponse<any>> {
        const formData = new FormData();
        const imageObject = JSON.stringify({ ...entity, data: undefined });
        formData.append('image', entity.data);
        formData.append('imageObject', imageObject);
        const data = await this.axiosInstance
            .post(
                this.APIRoot(vaultId) +
                    (options.create ? '/create' : '/update'),
                formData,
                {
                    params: {
                        clientId: this.context.$config.clientId,
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            )
            .then(data => {
                return {
                    status: data.status,
                    statusText: data.statusText,
                    data: data.data,
                };
            })
            .catch((err: AxiosError) => {
                if (!err.response) return networkErrorHandler(err.code!);
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<any>;
            });
        return data;
    }
}
