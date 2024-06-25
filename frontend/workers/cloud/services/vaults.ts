import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext } from '~/@types/app';

export type IVault = {
    id: string;
    name: string;
    type: string;
};

export class VaultsService extends ServiceBase<IVault> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'vaults', ctx);
    }
}
