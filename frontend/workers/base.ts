import { v4 } from 'uuid';
import { GenericActions, ServiceKey } from '~/constants';

export abstract class WorkerBase {
    protected invokeCallbacks: Record<string, any> = {};
    protected eventListeners: Record<string, ((payload: any) => void)[]> = {};
    protected invokeTimeout: number = 10_000;
    protected messages: Record<string, MessageEvent> = {};
    protected serviceKey = ServiceKey.WORKER;
    private isRegistered = false;
    private serviceRegistry: Record<ServiceKey | string, MessagePort> = {};

    protected constructor() {
        this.registerOnMessageListener();
    }

    protected getCommsFunctions() {
        const emit = (
            service: ServiceKey,
            key: string,
            payload: Record<string, any>,
            transferable?: any[],
        ) => {
            this.emit(service, key, payload, undefined, transferable);
        };
        const invoke = (
            service: ServiceKey,
            key: string,
            payload: Record<string, any>,
            transferable?: any[],
        ) => {
            return this.invoke(service, key, payload, transferable);
        };
        const on = (event: string, cb: (payload: any) => void) => {
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push(cb);
        };
        const off = (event: string) => {
            this.eventListeners[event] = [];
        };
        return { emit, invoke, on, off };
    }

    protected handleEvent(event: string, payload: any) {
        this.eventListeners[event]?.forEach(cb => {
            cb(payload);
        });
    }

    protected emit(
        service: ServiceKey,
        operation: string,
        payload: Record<string, any>,
        messageId?: string,
        transferable?: any[],
    ): void {
        const message: Record<string, any> = {
            service,
            operation,
            payload,
        };
        if (messageId) {
            message.messageId = messageId;
        }
        this.postMessage(service, message, transferable);
    }

    protected invoke(
        service: ServiceKey,
        operation: string,
        payload: Record<string, any>,
        transferable?: any[],
    ): Promise<any> {
        const messageId = v4();
        const callerContext = payload?.callerContext;

        if (callerContext) {
            delete payload.callerContext;
        }

        const message = {
            service,
            operation,
            payload,
            messageId,
        };
        this.postMessage(service, message, transferable);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                let errorMessage = `${this.serviceKey} invoke timeout: ${service}/${operation}`;
                if (callerContext) {
                    errorMessage += ` from ${callerContext}`;
                }

                reject(new Error(errorMessage));
                delete this.invokeCallbacks[messageId];
            }, this.invokeTimeout);

            this.invokeCallbacks[messageId] = (response: any) => {
                clearTimeout(timeout);

                resolve(response);
                delete this.invokeCallbacks[messageId];
            };
        });
    }

    private registerOnMessageListener() {
        this.isRegistered = true;
        self.onmessage = (message: MessageEvent<any>) => {
            const { operation, payload, messageId } = message.data;
            if (operation === GenericActions.TRANSFER_PORT) {
                this.registerPortForService(payload.key, payload.port);
                return;
            }

            this.handleMessage(operation, payload, messageId);
        };
    }

    private registerPortOnMessageListener(service: ServiceKey) {
        this.serviceRegistry[service].onmessage = (
            message: MessageEvent<any>,
        ) => {
            const { operation, payload, messageId } = message.data;
            if (messageId) {
                this.messages[messageId] = message;
            }
            this.handleMessage(operation, payload, messageId, service);
        };
    }

    registerPortForService(key: ServiceKey, port: MessagePort) {
        this.serviceRegistry[key] = port;

        this.registerPortOnMessageListener(key);
    }

    postMessage(key: ServiceKey, message: any, transferable: any[] = []) {
        let sender: any = self;
        if (this.serviceRegistry[key]) {
            sender = this.serviceRegistry[key];
        }
        sender.postMessage(message, transferable);

        if (message.messageId) {
            delete this.messages[message.messageId];
        }
    }

    protected async handleMessage(
        operation: string,
        payload: any,
        messageId: string,
        service?: ServiceKey,
    ) {
        if (operation === GenericActions.RESPONSE) {
            this.invokeCallbacks[messageId]?.(payload);
            return;
        }
        const response: any = await this.processMessage(operation, payload);
        return this.emit(
            service || this.serviceKey,
            GenericActions.RESPONSE,
            response,
            messageId,
        );
    }

    async processMessage(
        operation: string,
        payload: any,
    ): Promise<any | void> {}
}
