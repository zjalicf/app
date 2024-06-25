import { IO } from '~/workers/database/device/io';
import { WorkerContext } from '~/@types/app';
import { WEntity } from '~/@types';

interface WritableEntitySerializer<T> {
    serialize(entity: Partial<T>): WEntity | null;
}

export class ContentWriter<T> {
    context: WorkerContext;
    io: IO;
    serializer: WritableEntitySerializer<T>;

    constructor(
        ctx: WorkerContext,
        io: IO,
        entitySerialzier: WritableEntitySerializer<T>,
    ) {
        this.context = ctx;
        this.io = io;
        this.serializer = entitySerialzier;
    }

    create(entity: T): Promise<void> {
        const serializedEntity = this.serializer.serialize(entity);
        if (!serializedEntity) return Promise.resolve();
        return this.io.create(serializedEntity);
    }

    createBatch(vaultId: string, entities: T[]): Promise<void> {
        const serializedEntities = entities
            .map(entity => this.serializer.serialize(entity))
            .filter(entity => !!entity) as WEntity[];
        if (!serializedEntities.length) return Promise.resolve();
        return this.io.createBatch(vaultId, serializedEntities);
    }

    update(entityMods: Partial<T>, entityOldObj: T): Promise<void> {
        const mods = this.serializer.serialize(entityMods);
        const oldObj = this.serializer.serialize(entityOldObj);
        if (!mods) return Promise.resolve();
        return this.io.update(mods, oldObj!);
    }

    delete(entity: T): Promise<void> {
        const serializedEntity = this.serializer.serialize(entity);
        if (!serializedEntity) return Promise.resolve();
        return this.io.delete(serializedEntity);
    }
}
