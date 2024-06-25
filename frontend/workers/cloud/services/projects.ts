import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { IFolder } from '~/@types';
import { WorkerContext } from '~/@types/app';

export class ProjectsService extends ServiceBase<IFolder> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'projects', ctx);
    }
}
