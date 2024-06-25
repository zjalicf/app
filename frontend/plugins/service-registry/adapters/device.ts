import { Context } from '@nuxt/types';
import {
    Driver,
    SafeDeviceDriver,
    SafeElectronWindow,
    WatchEvent,
} from '~/@types';
import { isElectron } from '~/helpers/is-electron';
import { DatabaseServiceAction, GenericActions, ServiceKey } from '~/constants';

export class DeviceAdapter {
    private deviceDriver!: SafeDeviceDriver;
    private bridge!: MessagePort;

    constructor(ctx: Context) {
        if (!isElectron()) return;
        this.deviceDriver = (window as SafeElectronWindow).devicedriver;

        this.deviceDriver.Messaging.on(
            'file-watcher-batch',
            (events: WatchEvent[]) =>
                ctx.$serviceRegistry.emit(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.FILE_WATCHER_BATCH,
                    { payload: { events } },
                ),
        );
        this.deviceDriver.Messaging.on(
            'vault-local-changes-load',
            (initialStructureLoad: {
                structure: { folders: any[]; documents: any[] };
                type: string;
                vaultId: string;
            }) => {
                ctx.$serviceRegistry.emit(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.LOAD_VAULT_CHANGES,
                    { payload: initialStructureLoad },
                );
            },
        );
        this.deviceDriver.Messaging.on(
            'vault-initial-load',
            (event: {
                requestId: string;
                type: string;
                folders?: any[];
                documents?: any[];
                tasks?: any[];
                events?: any[];
            }) => {
                ctx.$serviceRegistry.emit(
                    ServiceKey.DATABASE,
                    DatabaseServiceAction.LOAD_NEW_VAULT,
                    { payload: event },
                );
            },
        );

        const messageListener = (event: any) => {
            if (!event.ports.length) return;
            this.bridge = event.ports[0];
            window.removeEventListener('message', messageListener);
        };
        window.addEventListener('message', messageListener);
        (window as SafeElectronWindow).electron.createBridge();
    }

    private resolveService(entity: string): Driver | any | null {
        switch (entity) {
            case 'project':
                return this.deviceDriver.Project;
            case 'image':
                return this.deviceDriver.Image;
            case 'vault':
                return this.deviceDriver.Vault;
            case 'assistant':
                return this.deviceDriver.Assistant;
            case 'assistantAssetsManager':
                return this.deviceDriver.AssistantAssetManager;
            case 'ai':
                return this.deviceDriver.AI;
            case 'messaging':
                return this.deviceDriver.Messaging;
            case 'notification':
                return this.deviceDriver.Notification;
            case 'attachment':
                return this.deviceDriver.Attachment;
            case 'network':
                return this.deviceDriver.Network;
            case 'appleCalendarSync':
                return this.deviceDriver.AppleCalendarSync;
            default:
                return this.deviceDriver.Entity;
        }
    }

    async execute(
        operation: string,
        payload: any,
        awaitResponse: boolean = true,
    ): Promise<any | null> {
        if (!isElectron()) return Promise.resolve(null);
        if (operation === GenericActions.TRANSFER_PORT) {
            this.bridge.postMessage(payload.key, payload.message.ports);
            return null;
        }
        if (operation === 'subtle:decrypt') {
            const data = await (
                window as SafeElectronWindow
            ).electron.crypto.decrypt(payload.data);
            return data;
        }
        const [entity, op] = operation.split(':');
        const service = this.resolveService(entity);
        if (!service) return Promise.resolve(null);
        const result = await service[op]?.(payload);

        return result ?? null;
    }
}
