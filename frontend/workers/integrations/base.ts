import { v4 } from 'uuid';

type uuid = string;

export enum IntegrationStatus {
    SLEEP = 'sleep',
    QUEUED = 'queued',
    PROCESSING = 'processing',
    ERROR = 'error',
}

export enum IntegrationAuthStatus {
    AUTHORIZED = 'authorized',
    UNAUTHORIZED = 'unauthorized',
}

export type IntegrationConfig<T> = {
    id: uuid;
    vaultId: string;
    status: IntegrationStatus;
    authStatus: IntegrationAuthStatus;
    type: string;
    lastRunTimestamp: number;
    syncCursors?: Record<string, any>;
    updateProgress: Record<string, any>;
    runInterval: number;
    createdAt: Date;
    updatedAt: Date;
    data: T;
};

export abstract class BaseIntegration<T> {
    name: string = 'base_integration';
    runInterval: number = 10 * 60 * 1000;
    syncEnabled: boolean = false;

    createObject(vaultId: string, ..._args: any[]): IntegrationConfig<T> {
        return {
            id: v4(),
            status: IntegrationStatus.SLEEP,
            authStatus: IntegrationAuthStatus.AUTHORIZED,
            vaultId,
            type: this.name,
            lastRunTimestamp: Date.now(),
            updateProgress: {},
            runInterval: this.runInterval,
            createdAt: new Date(),
            updatedAt: new Date(),
            data: {} as T,
        };
    }

    manualExecute(_config: IntegrationConfig<T>): Promise<void> {
        throw new Error('not implemented');
    }

    shouldRun(_config: IntegrationConfig<T>): boolean {
        return false;
    }

    execute(
        _config: IntegrationConfig<T>,
        isInitial: boolean = false,
    ): Promise<void> {
        throw new Error('not implemented');
    }
}
