import { IO } from '~/workers/database/device/io/entity';
import { WEntity } from '~/@types';
import { ServiceKey } from '~/constants';
import { WorkerContext } from '~/@types/app';

enum AttachmentActions {
    CREATE = 'attachment:create',
    CREATE_BATCH = 'attachment:createBatch',
    DELETE = 'attachment:delete',
}

export class AttachmentIO implements IO {
    private context: WorkerContext;

    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    read(filepath: string): Promise<WEntity> {
        throw new Error('Method not implemented.');
    }

    readBatch(filepaths: string[]): Promise<WEntity[]> {
        throw new Error('Method not implemented.');
    }

    create(entity: WEntity): Promise<any> {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                AttachmentActions.CREATE,
                entity,
            )
            .then(({ payload }) => payload);
    }

    createBatch(vaultId: string, entities: WEntity[]): Promise<any> {
        return this.context
            .invoke<{ payload: any }>(
                ServiceKey.DEVICE,
                AttachmentActions.CREATE_BATCH,
                entities,
            )
            .then(({ payload }) => payload);
    }

    update(mods: WEntity, oldObj: WEntity): Promise<any> {
        throw new Error('Method not implemented.');
    }

    delete(entity: WEntity): Promise<any> {
        return this.context.invoke(
            ServiceKey.DEVICE,
            AttachmentActions.DELETE,
            entity,
        );
    }
}
