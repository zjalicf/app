import { AxiosError, AxiosInstance } from 'axios';
import { ServiceBase } from '~/workers/cloud/services/base';
import { WorkerContext, CloudResponse } from '~/@types/app';
import { networkErrorHandler } from '~/workers/cloud/util';

export class LoaderService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'loader', ctx);
    }

    get APIRoot() {
        return (vaultId?: string) => {
            return `${this.apiRoot}/${vaultId}/initialize`;
        };
    }

    async load(
        vaultId: string,
        requestedEntities: { type: string; timestamp: number }[],
    ): Promise<CloudResponse<{ type: string; entries: any[] }[]>> {
        const response = await this.axiosInstance
            .post<{ type: string; entries: any[] }[]>(
                `${this.APIRoot(vaultId)}`,
                requestedEntities,
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

    async loadDeleteChanges(
        vaultId: string,
        requestedEntities: { type: string; timestamp: number }[],
    ): Promise<CloudResponse<{ type: string; entries: any[] }[]>> {
        const response = await this.axiosInstance
            .post<{ type: string; entries: any[] }[]>(
                `${this.APIRoot(vaultId)}/deletechanges`,
                requestedEntities,
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

    list(
        _vaultId?: string,
        _timestamp?: number,
    ): Promise<CloudResponse<any[]>> {
        throw new Error('not implemented');
    }

    save(
        _entity: Partial<any>,
        _options: { create: boolean } = { create: false },
        _vaultId?: string,
        _token?: string,
    ): Promise<CloudResponse<any>> {
        throw new Error('not implemented');
    }

    saveBatch(
        _entities: Partial<any>[],
        _vaultId?: string,
    ): Promise<CloudResponse<any[]>> {
        throw new Error('not implemented');
    }

    delete(_id: string, _vaultId?: string): Promise<CloudResponse<any>> {
        throw new Error('not implemented');
    }
}
