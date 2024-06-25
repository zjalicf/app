import { Table } from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import sanitizeFilename from 'sanitize-filename';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { ITask } from '~/components/task/model';
import { IVault, WEntity } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { AnalyticsAction, SearchIndex, ServiceKey } from '~/constants';
import {
    deserializeTask,
    deserializeTaskDateObject,
    serializeTaskDateObject,
} from '~/store/tasks';
import { ContentWriter } from '~/workers/database/device/contentWriter';
import { EntityIO } from '~/workers/database/device/io/entity';
import { HTMLParser } from '~/workers/database/device/parser';
import { StorageType } from '~/workers/utils/parsers';
import { extractDate } from '~/helpers';

export class TasksIndexedDB extends IndexedDBBase<ITask> {
    shouldStoreLocally = false;

    protected platform: string;
    protected context: WorkerContext;
    protected entity: string = 'tasks';
    protected contentKey = 'description';
    protected searchIndex = SearchIndex.TASK;
    protected parserIndex = StorageType.TASK;
    public writer: ContentWriter<ITask>;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.platform = ctx.$config.platform;
        this.writer = new ContentWriter<ITask>(ctx, new EntityIO(ctx), {
            serialize: (entity: Partial<ITask>): WEntity => {
                return this.createDeviceWriteMeta(entity as ITask);
            },
        });
        this.parser = new HTMLParser(ctx);
    }

    table(vaultId: string): Table<ITask, string> {
        return acreomVaultIndexedDB(vaultId).Tasks;
    }

    protected syncToVuex(_vaultId: string, change: IDatabaseChange) {
        return Promise.resolve();
    }

    deserializeWriterEntity(entity: WEntity): ITask & { mdContent?: string } {
        const isException = !!(entity.metadata as Partial<ITask>).recurrentId;
        const splitName = entity.name!.split('_');
        const name = isException
            ? splitName.slice(0, -1).join('_')
            : entity.name;
        return {
            ...entity.metadata,
            start: deserializeTaskDateObject(entity.metadata.start),
            end: deserializeTaskDateObject(entity.metadata.end),
            id: entity.metadata.id ?? entity.id,
            text: name,
            description: entity.content!,
            mdContent: entity.mdContent,
            filepath: entity.filepath,
        } as ITask & { mdContent?: string };
    }

    createDeviceWriteMeta(entity: ITask): WEntity {
        const writeEntity = super.createDeviceWriteMeta(entity);
        return {
            ...writeEntity,
            metadata: {
                ...writeEntity.metadata,
                start: serializeTaskDateObject(entity.start),
                end: serializeTaskDateObject(entity.end),
                recurrentId: entity.recurrentId ?? undefined,
                originalStartTime: entity.originalStartTime
                    ? serializeTaskDateObject(entity.originalStartTime)
                    : undefined,
                type:
                    entity.type === 'exception_cancelled'
                        ? entity.type
                        : undefined,
                rrule: entity.rrule,
                labels: entity.labels,
                completed: entity.completed,
                parentDocument: entity.parentDocument,
            },
            kind: 'task',
        };
    }

    async list(
        vaultId: string,
        _query?: any,
        filter?: (entity: ITask) => boolean,
        paginationId?: string | null,
    ): Promise<ITask[]> {
        const content = await super.list(vaultId, _query, filter, paginationId);

        return content.map(deserializeTask);
    }

    getContent(entity: ITask): string {
        return entity.description || '';
    }

    async createFilepathBase(
        entity: Partial<ITask>,
        changes: Partial<ITask>,
        writeToDevice: boolean,
        vault: IVault,
    ): Promise<string> {
        const mergedChanges = { ...entity, ...changes };
        if (!writeToDevice && mergedChanges.filepath) {
            return mergedChanges.filepath!;
        }
        const vaultPath = vault?.filepath;
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const pathBase = [
            vaultPath,
            '.tasks',
            sanitizeFilename(
                changes?.text || mergedChanges?.text || 'untitled',
            ),
        ].join(sep);
        if (!mergedChanges.recurrentId) {
            return pathBase;
        }
        return (
            pathBase +
            `_${(extractDate(mergedChanges.start!) as any).slice(0, 10)}`
        );
    }

    shouldCreateFilepath(
        vaultId: string,
        mods: Partial<ITask>,
        oldEntity?: Partial<ITask>,
        meta?: Partial<IndexedDBMeta>,
    ): boolean {
        const initialCheck = super.shouldCreateFilepath(
            vaultId,
            mods,
            oldEntity,
            meta,
        );
        if (!initialCheck) return false;
        if (!oldEntity?.filepath) return true;
        const updateIfKeyPresent = ['text'] as (keyof ITask)[];
        const hasWritableMods = this.checkMods(
            updateIfKeyPresent,
            mods,
            oldEntity,
        );
        return hasWritableMods;
    }

    protected async subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );

        this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
            vaultId,
            change,
        });

        if (change.key === 3) return;
        const vault = acreomVaultIndexedDB(vaultId);
        if (!vault.filepath) return;
        // await this.rewriteDocumentsWithTask(vaultId, change.key);
    }

    async subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
            vaultId,
            change,
        });

        if (change.key === 3) return;
        const vault = acreomVaultIndexedDB(vaultId);
        if (!vault.filepath) return;
        // await this.rewriteDocumentsWithTask(vaultId, change.key);
    }

    protected serializeForConverter(
        entity: Partial<ITask> | Partial<ITask>[],
    ): ({ id: string; filepath: string; vaultId: string } & Record<
        string,
        any
    >)[] {
        if (!Array.isArray(entity)) {
            entity = [entity];
        }
        return entity.map((e: Partial<ITask>) => {
            return {
                ...e,
                id: e.id!,
                filepath: e.filepath!,
                vaultId: e.vaultId!,
                labels: e.labels,
            };
        });
    }
}
