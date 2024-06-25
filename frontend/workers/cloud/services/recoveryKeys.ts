import { AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { WorkerContext } from '~/@types/app';

export type RecoveryKey = { id: string };

export class RecoveryKeysService extends ServiceBase<RecoveryKey> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'recovery-keys', ctx);
    }
}
