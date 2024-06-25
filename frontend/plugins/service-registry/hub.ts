import { GenericActions, ServiceKey } from '~/constants';

export class ServiceRegistry {
    private endpoints: Record<ServiceKey, any> = {} as Record<ServiceKey, any>;
    private adapters: Record<ServiceKey, any> = {} as Record<ServiceKey, any>;
    private registerCallbacks: Record<string, any> = {};

    get service() {
        return (key: ServiceKey) => {
            return (this.endpoints[key] || this.adapters[key]) ?? null;
        };
    }

    public waitForEssentialServices(): Promise<void[]> {
        return Promise.all([
            this.waitForService(ServiceKey.DATABASE),
            this.waitForService(ServiceKey.CLOUD),
        ]);
    }

    public waitForService(key: ServiceKey): Promise<void> {
        if (this.endpoints[key] || this.adapters[key]) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (this.endpoints[key] || this.adapters[key]) return resolve();
                reject(new Error('service did not register in time'));
            }, 60_000);

            if (!this.registerCallbacks[key]) {
                this.registerCallbacks[key] = [];
            }
            this.registerCallbacks[key].push(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    public register(key: ServiceKey, service: any, isAdapter = false) {
        const registeredServices = Object.keys(this.endpoints) as ServiceKey[];
        if (isAdapter) {
            this.adapters[key] = service;
        } else {
            this.endpoints[key] = service;
        }

        this.registerCallbacks[key]?.map((cb: Function) => cb());
        delete this.registerCallbacks[key];

        if (isAdapter) return;

        for (const serviceKey of registeredServices) {
            const channel = new MessageChannel();
            this.endpoints[serviceKey].execute(GenericActions.TRANSFER_PORT, {
                payload: {
                    key,
                    port: channel.port1,
                },
            });
            this.endpoints[key].execute(GenericActions.TRANSFER_PORT, {
                payload: {
                    key: serviceKey,
                    port: channel.port2,
                },
            });
        }
    }

    public emit(service: ServiceKey, operation: string, payload: any = {}) {
        return (
            this.service(service)?.execute(operation, payload, false) ??
            Promise.resolve<null>(null)
        );
    }

    public invoke<T>(
        service: ServiceKey,
        operation: string,
        payload: any = {},
    ): Promise<T | null> {
        return (
            (this.service(service)?.execute(
                operation,
                payload,
            ) as Promise<T>) ?? Promise.resolve<null>(null)
        );
    }
}
