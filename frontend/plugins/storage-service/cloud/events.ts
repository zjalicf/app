import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Store } from 'vuex';
import { ServiceBase } from '~/plugins/storage-service/cloud/base';
import { IEvent } from '~/@types';

export class EventsService extends ServiceBase<IEvent> {
    constructor(axios: NuxtAxiosInstance, store: Store<any>) {
        super(axios, 'events', store);
    }
}
