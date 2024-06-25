import { WEntity } from '~/@types';

export { DeviceWatcher } from './watcher';

export interface EntityIO {
    create(entity: WEntity): Promise<void>;

    update(oldEntity: WEntity, newEntity: WEntity): Promise<void>;

    delete(entity: WEntity): Promise<void>;
}
