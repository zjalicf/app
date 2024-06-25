import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';

export type IVault = {
    id: string;
    name: string;
    type: string;
};

export class VaultsService extends ServiceBase<IVault> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'vaults', store);
    }
}
