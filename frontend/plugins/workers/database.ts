import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import isEmpty from 'lodash/isEmpty';
import { DatabaseServiceAction, GenericActions, ServiceKey } from '~/constants';
import { WorkerInvokeMessage } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { IndexedDBMeta } from '~/workers/database/indexeddb/base';

export const isDatabaseService = (service: any): service is DatabaseWrapper => {
    return service instanceof DatabaseWrapper;
};

export class DatabaseWrapper {
    private worker: Worker;
    private context: Context;
    private invokeCallbacks: Record<string, any> = {};
    private invokeTimeout: number = 60_000;
    private onCallbacks: Record<
        string,
        { id: string; listener: (payload: any) => void }[]
    > = {};

    private getTable: () => string | null = () => null;
    private initialized = false;

    constructor(worker: Worker, ctx: Context) {
        this.worker = worker;
        this.context = ctx;
        this.registerMessageHandler();
    }

    initialize(ctx: Partial<WorkerContext>) {
        if (this.initialized) return Promise.resolve();
        this.initialized = true;
        return this.invoke(DatabaseServiceAction.INITIALIZE, {
            operation: DatabaseServiceAction.INITIALIZE,
            payload: { $config: ctx },
        });
    }

    get Events() {
        this.getTable = () => 'events';
        return this;
    }

    get Documents() {
        this.getTable = () => 'documents';
        return this;
    }

    get Tasks() {
        this.getTable = () => 'tasks';
        return this;
    }

    get Projects() {
        this.getTable = () => 'projects';
        return this;
    }

    get Integrations() {
        this.getTable = () => 'integrations';
        return this;
    }

    get Vaults() {
        this.getTable = () => 'vaults';
        return this;
    }

    get User() {
        this.getTable = () => 'users';
        return this;
    }

    get SessionData() {
        this.getTable = () => 'sessionData';
        return this;
    }

    get TaskLists() {
        this.getTable = () => 'taskLists';
        return this;
    }

    get LocalConfig() {
        this.getTable = () => 'localConfig';
        return this;
    }

    get Images() {
        this.getTable = () => 'images';
        return this;
    }

    get ImageData() {
        this.getTable = () => 'imageData';
        return this;
    }

    get LocalConflicts() {
        this.getTable = () => 'localConflicts';
        return this;
    }

    get IntegrationsData() {
        this.getTable = () => 'integrationsData';
        return this;
    }

    get RecoveryKeys() {
        this.getTable = () => 'recoveryKeys';
        return this;
    }

    get Views() {
        this.getTable = () => 'views';
        return this;
    }

    execute(
        operation: DatabaseServiceAction | GenericActions,
        payload: any,
        awaitResponse: boolean = true,
    ) {
        if (operation === GenericActions.TRANSFER_PORT) {
            this.worker.postMessage(
                {
                    ...payload,
                    operation,
                },
                [payload.payload.port],
            );
            return;
        }
        switch (operation) {
            case DatabaseServiceAction.INITIALIZE:
                return this.initialize(payload);
            case DatabaseServiceAction.RETRIEVE:
                return this.retrieve(
                    payload.vaultId,
                    payload.id,
                    payload.table,
                );
            case DatabaseServiceAction.LIST:
                return this.list(
                    payload.vaultId,
                    payload.table,
                    payload.query,
                ).then(r => (isEmpty(r) ? [] : r));
            case DatabaseServiceAction.SAVE:
                return this.save(
                    payload.vaultId,
                    payload.entity,
                    payload.table,
                    payload.meta,
                );
            case DatabaseServiceAction.SAVE_BULK:
                return this.saveBulk(
                    payload.vaultId,
                    payload.entity,
                    payload.table,
                    payload.meta,
                );
            case DatabaseServiceAction.DELETE:
                return this.delete(
                    payload.vaultId,
                    payload.entity,
                    payload.table,
                );
            default:
                if (!awaitResponse) {
                    return this.emit(operation, payload);
                }
                return this.invoke(operation, payload);
        }
    }

    once(event: string, listener: (payload: any) => void) {
        if (!this.onCallbacks[event]) {
            this.onCallbacks[event] = [];
        }

        const id: string = v4();

        this.onCallbacks[event].push({
            id,
            listener: payload => {
                listener(payload);
                this.onCallbacks[event] = this.onCallbacks[event].filter(
                    ({ id: _id }) => _id === id,
                );
            },
        });
    }

    on(event: string, listener: (payload: any) => void) {
        if (!this.onCallbacks[event]) {
            this.onCallbacks[event] = [];
        }
        const id: string = v4();
        this.onCallbacks[event].push({ id, listener });
    }

    retrieve<T>(
        vaultId: string,
        entityId: string,
        table?: string | null,
    ): Promise<T> {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }
        return this.invoke(DatabaseServiceAction.RETRIEVE, {
            table,
            payload: {
                vaultId,
                id: entityId,
            },
        });
    }

    list<T>(
        vaultId: string,
        table?: string | null,
        query?: any,
        paginationId?: string | null,
    ): Promise<T> {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }

        return this.invoke(DatabaseServiceAction.LIST, {
            table,
            payload: {
                vaultId,
                query,
                paginationId,
            },
        });
    }

    async listWithPagination(
        vaultId: string,
        paginationId: string | null,
        commitFn: (data: any) => void,
        table?: string | null,
    ) {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }
        while (paginationId) {
            const data = await this.invoke(DatabaseServiceAction.LIST, {
                table,
                payload: {
                    vaultId,
                    paginationId,
                },
            });

            if (!data.length) break;
            paginationId = data[data.length - 1]?.id ?? null;
            commitFn(data);
        }
        commitFn(null);
    }

    save<T>(
        vaultId: string,
        entity: Partial<T>,
        table?: string | null,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<T> {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }

        return this.invoke(DatabaseServiceAction.SAVE, {
            table,
            payload: {
                vaultId,
                entity,
                meta,
            },
        });
    }

    saveBulk<T>(
        vaultId: string,
        entity: Partial<T>[],
        table?: string | null,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<T> {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }

        return this.invoke(DatabaseServiceAction.SAVE_BULK, {
            table,
            vaultId,
            payload: {
                vaultId,
                entity,
                meta,
            },
        });
    }

    delete<T>(
        vaultId: string,
        entity: Partial<T> & { id: string },
        table?: string | null,
    ): Promise<T> {
        if (!table) {
            table = this.getTable();
            this.getTable = () => null;
        }

        return this.invoke(DatabaseServiceAction.DELETE, {
            table,
            payload: {
                vaultId,
                entity,
            },
        });
    }

    private emit(
        operation: string,
        payload: Record<string, any>,
        messageId?: string,
    ): void {
        const message: Record<string, any> = {
            operation,
            payload,
        };
        if (messageId) {
            message.messageId = messageId;
        }
        this.worker.postMessage(message);
    }

    private invoke(
        operation: string,
        payload: Record<string, any>,
    ): Promise<any> {
        const messageId = v4();
        this.worker.postMessage({
            operation,
            payload,
            messageId,
        });

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(
                    new Error(
                        `${this.constructor.name} invoke timeout: ${operation} table:${payload.table}`,
                    ),
                );
                delete this.invokeCallbacks[messageId];
            }, this.invokeTimeout);

            this.invokeCallbacks[messageId] = (response: any) => {
                clearTimeout(timeout);
                resolve(response);
                delete this.invokeCallbacks[messageId];
            };
        });
    }

    private registerMessageHandler() {
        this.worker.onmessage = async (
            message: MessageEvent<WorkerInvokeMessage>,
        ) => {
            const { service, operation, payload, messageId } = message.data;

            if (operation === GenericActions.TRANSFER_PORT) {
                this.context.$serviceRegistry.emit(
                    service,
                    GenericActions.TRANSFER_PORT,
                    {
                        key: payload.key,
                        message,
                    },
                );
                return;
            }

            if (operation === GenericActions.RESPONSE) {
                this.invokeCallbacks[messageId]?.(payload);
                return;
            }

            if (service === ServiceKey.DATABASE) {
                this.onCallbacks[operation]?.forEach(({ listener }) => {
                    listener(payload);
                });
                return;
            }

            if (messageId) {
                const response = await this.context.$serviceRegistry.invoke(
                    service,
                    operation,
                    payload,
                );

                this.emit(
                    GenericActions.RESPONSE,
                    { payload: response },
                    messageId,
                );
                return;
            }

            this.context.$serviceRegistry.emit(service, operation, payload);
        };
    }
}
