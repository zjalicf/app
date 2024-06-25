import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { IDocument } from '~/components/document/model';
import { WorkerContext } from '~/@types/app';

export class DocumentsService extends ServiceBase<IDocument> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'documents', ctx);
    }
}
