import { AxiosError, AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { IIntegration } from '~/@types';
import { WorkerContext, CloudResponse } from '~/@types/app';
import { ServiceKey } from '~/constants';
import { networkErrorHandler } from '~/workers/cloud/util';

export class IntegrationsService extends ServiceBase<IIntegration> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'integrations', ctx);
    }

    async googleAuthUrl(vaultId: string): Promise<string> {
        const apiRoot = this.APIRoot(vaultId);
        const credentials = await this.context.invoke<{ accessToken: string }>(
            ServiceKey.STORE,
            'getters:auth/credentials',
            null,
        );
        return `${apiRoot}/google_calendar/authorize?token=${encodeURIComponent(
            credentials.accessToken,
        )}`;
    }

    async save(
        entity: Partial<IIntegration>,
        options = { create: false },
        vaultId?: string,
    ): Promise<CloudResponse<IIntegration>> {
        if (options.create) {
            const response = await this.axiosInstance
                .post(this.APIRoot(vaultId), {
                    clientId: this.context.$config.clientId,
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
                    if (!err.response) return networkErrorHandler(err.code!);
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
                clientId: this.context.$config.clientId,
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
                if (!err.response) return networkErrorHandler(err.code!);
                return {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                } as CloudResponse<IIntegration>;
            });
        return response;
    }
}
