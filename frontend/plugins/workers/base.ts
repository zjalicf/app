import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import { GenericActions } from '~/constants';
import { WorkerInvokeMessage } from '~/@types';

export class BaseWrapper {
    private worker: Worker;
    private context: Context;
    private invokeCallbacks: Record<string, any> = {};
    private invokeTimeout: number = 60_000;

    constructor(worker: Worker, ctx: Context) {
        this.worker = worker;
        this.context = ctx;
        this.registerMessageHandler();
    }

    async execute(
        operation: string,
        payload: any,
        awaitResponse: boolean = true,
    ): Promise<any> {
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
        if (!awaitResponse) {
            return this.emit(operation, payload);
        }
        return this.invoke(operation, payload);
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

    protected invoke(
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
                        `${this.constructor.name} invoke timeout: ${operation}`,
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

            if (messageId) {
                const response =
                    await this.context.$serviceRegistry.invoke<any>(
                        service,
                        operation,
                        payload,
                    );

                this.emit(GenericActions.RESPONSE, response, messageId);
                return;
            }

            this.context.$serviceRegistry.invoke(service, operation, payload);
        };
    }
}
