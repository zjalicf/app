import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { IEvent } from '~/@types';
import { WorkerContext } from '~/@types/app';

export class EventsService extends ServiceBase<IEvent> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'events', ctx);
    }
}
