import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { IFolder } from '~/@types';

export class ProjectsService extends ServiceBase<IFolder> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'projects', store);
    }
}
