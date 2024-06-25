import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { IDocument } from '~/components/document/model';

export class DocumentsService extends ServiceBase<IDocument> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'documents', store);
    }
}
