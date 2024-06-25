import { Table, Transaction } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import sanitizeFilename from 'sanitize-filename';
import { v4 } from 'uuid';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { IDocument } from '~/components/document/model';
import { IFolder, IVault, WEntity } from '~/@types';
import { WorkerContext } from '~/@types/app';
import {
    AnalyticsAction,
    LangChainIndex,
    SearchIndex,
    ServiceKey,
} from '~/constants';
import { ContentWriter } from '~/workers/database/device/contentWriter';
import { EntityIO } from '~/workers/database/device/io/entity';
import { HTMLParser } from '~/workers/database/device/parser';
import {
    deserializeTaskDateObject,
    serializeTaskDateObject,
} from '~/store/tasks';

import { StorageType } from '~/workers/utils/parsers';
import { ITask } from '~/components/task/model';
import { createTaskDateObject, extractDate } from '~/helpers';
import { taskRegex } from '~/plugins/entities/task';
import { DocumentEncryption } from '~/workers/database/encryption/document';

const getProperty = (text: string, property: string) => {
    const match = text.match(new RegExp(`${property}=['"]([^'"]+)['"]`));
    return match?.[1] ?? null;
};

const DAILY_DOC_DIRECTORY = 'My Day';
const TRASH_DIRECTORY = '.trash';

export class DocumentsIndexedDB extends IndexedDBBase<IDocument> {
    shouldStoreLocally = true;
    protected entity = 'document';
    protected platform: string;
    protected context: WorkerContext;
    protected deviceService: WorkerContext['$deviceService'];
    protected contentKey = 'content';
    protected writer: ContentWriter<IDocument>;

    public searchIndex = SearchIndex.DOCUMENT;
    public langChainIndex = LangChainIndex.DOCUMENT;
    public parserIndex = StorageType.DOCUMENT;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.platform = ctx.$config.platform;
        this.deviceService = ctx.$deviceService;

        this.writer = new ContentWriter<IDocument>(ctx, new EntityIO(ctx), {
            serialize: (entity: Partial<IDocument>): WEntity => {
                return this.createDeviceWriteMeta(entity as IDocument);
            },
        });
        this.parser = new HTMLParser(ctx);
        this.encryption = new DocumentEncryption(ctx);
    }

    get isEncryptableInProtocol() {
        return true;
    }

    table(vaultId: string): Table<IDocument, string> {
        try {
            return acreomVaultIndexedDB(vaultId)?.Documents;
        } catch (e) {
            return null as any;
        }
    }

    projectTable(vaultId: string): Table<IFolder, string> {
        return acreomVaultIndexedDB(vaultId).Projects;
    }

    protected serializeForConverter(
        entity: Partial<IDocument> | Partial<IDocument>[],
    ): ({ id: string; filepath: string; vaultId: string } & Record<
        string,
        any
    >)[] {
        if (!Array.isArray(entity)) {
            entity = [entity];
        }

        return entity.map((e: Partial<IDocument>) => {
            return {
                ...e,
                id: e.id!,
                filepath: e.filepath!,
                vaultId: e.vaultId!,
            };
        });
    }

    protected subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );
        this.processChangeForNotifications(vaultId, change);
        this.deviceService.Versions.createVersionFromChange(vaultId, change);
        return Promise.resolve();
    }

    protected subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.processChangeForNotifications(vaultId, change);
        return Promise.resolve();
    }

    updateFilePath(vaultId: string, id: string, filepath: string) {
        return new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source = 'device';
                    await this.table(vaultId).update(id, { filepath });
                    trx.on('complete', () => {
                        resolve({});
                    });
                },
            );
        });
    }

    createDeviceWriteMeta(doc: IDocument) {
        const writeEntity = super.createDeviceWriteMeta(doc);

        if (doc.pageStatus) {
            writeEntity.metadata.pageStatus = doc.pageStatus;
        }

        if (doc.template) {
            return {
                ...writeEntity,
                metadata: {
                    ...writeEntity.metadata,
                    template: true,
                    sequence: doc.sequence,
                },
            };
        }

        let meta: Record<string, any> = {};
        if (Object.keys(writeEntity?.metadata?.yamlHeader || {}).length) {
            meta = writeEntity.metadata;
            meta.id = undefined;
        }

        if (doc.start) {
            meta.start = serializeTaskDateObject(doc.start);
            meta.end = serializeTaskDateObject(doc.end);
        }

        if (doc.pinned) {
            meta.pinned = doc.pinned;
            meta.pinOrder = doc.pinOrder;
        }

        if ('pageStatus' in doc) {
            meta.pageStatus = doc.pageStatus;
        }

        if ('icon' in doc) {
            meta.icon = doc.icon;
        }

        if ('properties' in doc) {
            meta.properties = doc.properties;
        }

        return {
            ...writeEntity,
            metadata: {
                ...meta,
                sequence: doc.sequence,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            },
        };
    }

    deserializeWriterEntity(entity: WEntity): IDocument {
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const folder = entity.filepath.split(sep).at(-2);
        return {
            ...entity.metadata,
            start: deserializeTaskDateObject(entity.metadata.start),
            end: deserializeTaskDateObject(entity.metadata.end),
            pinned: entity.metadata.pinned ?? false,
            id: entity.id,
            title: entity.name!,
            content: entity.content!,
            mdContent: entity.mdContent!,
            filepath: entity.filepath,
            projectId: entity.parentId,
            archived: folder === '.trash',
        } as IDocument;
    }

    initialPostprocess(vaultId: string, entities: IDocument[]) {
        const tasks: any[] = [];
        entities.forEach(entity => {
            const parsedTasks = this.extractTasksFromContent(vaultId, entity);
            tasks.push(
                ...parsedTasks.filter(task => !!extractDate(task.start!)),
            );
        });

        this.context.emit(ServiceKey.DEVICE, 'notification:schedule', tasks);
    }

    shouldCreateFilepath(
        vaultId: string,
        mods: Partial<IDocument>,
        oldEntity?: Partial<IDocument>,
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
        const updateIfKeyPresent = [
            'archived',
            'title',
            'projectId',
            'template',
        ] as (keyof IDocument)[];
        return this.checkMods(updateIfKeyPresent, mods, oldEntity);
    }

    async createFilepathBase(
        doc: Partial<IDocument>,
        changes: Partial<IDocument>,
        writeToDevice: boolean,
        vault: IVault,
    ): Promise<string> {
        const mergedChanges = {
            ...doc,
            ...changes,
            vaultId: vault.id,
        } as Partial<IDocument>;
        const hasProperty = (ent: any, key: string): boolean => {
            // eslint-disable-next-line no-prototype-builtins
            return ent.hasOwnProperty(key);
        };

        if (
            !mergedChanges.archived &&
            // eslint-disable-next-line no-prototype-builtins
            ((!hasProperty(changes, 'title') &&
                hasProperty(mergedChanges, 'title') &&
                !hasProperty(changes, 'projectId') &&
                hasProperty(mergedChanges, 'projectId') &&
                !hasProperty(changes, 'archived')) ||
                !writeToDevice)
        ) {
            return mergedChanges.filepath!;
        }
        const project = mergedChanges.projectId
            ? await this.projectTable(vault.id!)
                  .get(mergedChanges.projectId)
                  .then(
                      project =>
                          project ||
                          ({ name: null } as unknown as Partial<IFolder>),
                  )
            : mergedChanges.dailyDoc
            ? ({ name: 'My Day' } as Partial<IFolder>)
            : ({ name: null } as unknown as Partial<IFolder>);

        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const vaultPath = vault?.filepath;
        const title = mergedChanges.title as string;

        const directory = mergedChanges.dailyDoc
            ? `${vaultPath}${sep}${DAILY_DOC_DIRECTORY}`
            : mergedChanges.archived
            ? `${vaultPath}${sep}${TRASH_DIRECTORY}`
            : project?.filepath || vaultPath;

        const filepathBase = [
            directory,
            sanitizeFilename(
                mergedChanges.dailyDoc
                    ? mergedChanges.dailyDoc
                    : title || 'Untitled',
            ),
        ].join(sep);

        return filepathBase;
    }

    async extractTasksInitial(vaultId: string) {
        const tasks: Partial<ITask>[] = [];
        await this.table(vaultId)
            .toCollection()
            .each((document: IDocument) => {
                const parsedTasks = this.extractTasksFromContent(
                    vaultId,
                    document,
                );
                tasks.push(
                    ...parsedTasks.filter(task => !!extractDate(task.start!)),
                );
            });
        return tasks;
    }

    extractTasksFromContent(
        vaultId: string,
        document: IDocument,
    ): Partial<ITask>[] {
        const tasks: Partial<ITask>[] = [];
        const content = document?.content || '';
        if (!content) return tasks;
        const match = content.matchAll(taskRegex);
        if (!match) return tasks;
        for (const task of match) {
            const parsedTask = this.parseProperties(vaultId, task);
            tasks.push(parsedTask);
        }
        return tasks;
    }

    parseProperties(vaultId: string, match: RegExpMatchArray) {
        const fullMatch = match[0];
        const propertiesMatch =
            fullMatch.match(
                /<div data-type=['"]taskItemContent['"][^>]+?>/,
            )?.[0] ?? '';

        const text = match[1];

        const completed = getProperty(propertiesMatch, 'completed') === 'true';
        const id = getProperty(propertiesMatch, 'id');
        const start = this.parseStoredDate(
            getProperty(propertiesMatch, 'start'),
        );
        const end = this.parseStoredDate(getProperty(propertiesMatch, 'end'));
        const rrule = getProperty(propertiesMatch, 'rrule');

        return {
            id: id || v4(),
            vaultId,
            completed,
            start,
            end,
            text,
            rrule,
        };
    }

    parseStoredDate(date: string | null) {
        if (!date) return null;
        const [type, value] = date.split(':');
        if (type === 'date') {
            return createTaskDateObject(new Date(parseInt(value)), null);
        }
        return createTaskDateObject(null, new Date(parseInt(value)));
    }

    processChangeForNotifications(vaultId: string, change: IDatabaseChange) {
        const notifications = this.retrieveNotificationsFromChange(
            vaultId,
            change,
        );

        for (const notification of notifications) {
            this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
                vaultId,
                change: notification,
            });
        }
    }

    retrieveNotificationsFromChange(vaultId: string, change: IDatabaseChange) {
        if ((change as ICreateChange).type === 1) {
            return this.processCreateChangeForNotifications(
                vaultId,
                change as ICreateChange,
            );
        }
        if ((change as IUpdateChange).type === 2) {
            return this.processUpdateChangeForNotifications(
                vaultId,
                change as IUpdateChange,
            );
        }
        if ((change as IDeleteChange).type === 3) {
            return this.processDeleteChangeForNotifications(
                vaultId,
                change as IDeleteChange,
            );
        }
        return [];
    }

    processCreateChangeForNotifications(
        vaultId: string,
        change: ICreateChange,
    ) {
        const parsedTasks = this.extractTasksFromContent(vaultId, change.obj);
        const notifications = parsedTasks.filter(
            task => !!extractDate(task.start!),
        );
        return notifications.map(task => ({
            type: 1,
            key: task.id,
            obj: task,
        }));
    }

    processDeleteChangeForNotifications(
        vaultId: string,
        change: IDeleteChange,
    ) {
        const parsedTasks = this.extractTasksFromContent(
            vaultId,
            change.oldObj,
        );
        const notifications = parsedTasks.filter(
            task => !!extractDate(task.start!),
        );
        return notifications.map(task => ({
            type: 3,
            key: task.id,
            oldObj: task,
        }));
    }

    processUpdateChangeForNotifications(
        vaultId: string,
        change: IUpdateChange,
    ) {
        if (!change.mods.content) {
            return [];
        }
        const newParsedTasks = this.extractTasksFromContent(
            vaultId,
            change.obj,
        ).filter(task => !!extractDate(task.start!));
        const oldParsedTasks = this.extractTasksFromContent(
            vaultId,
            change.oldObj,
        ).filter(task => !!extractDate(task.start!));

        const addedTasks = newParsedTasks.filter(
            task => !oldParsedTasks.some(t => t.id === task.id),
        );
        const deletedTasks = oldParsedTasks.filter(
            task => !newParsedTasks.some(t => t.id === task.id),
        );
        const modifiedTasks = newParsedTasks
            .filter(task => oldParsedTasks.some(t => t.id === task.id))
            .filter(task => {
                const oldTask = oldParsedTasks.find(t => t.id === task.id)!;
                return (
                    task.text !== oldTask.text ||
                    task.rrule !== oldTask.rrule ||
                    extractDate(task.start!) !== extractDate(oldTask.start!) ||
                    extractDate(task.end!) !== extractDate(oldTask.end!)
                );
            });

        return [
            ...addedTasks.map(task => ({
                type: 1,
                key: task.id,
                obj: task,
            })),
            ...deletedTasks.map(task => ({
                type: 3,
                key: task.id,
                oldObj: task,
            })),
            ...modifiedTasks.map(task => ({
                type: 2,
                key: task.id,
                obj: task,
            })),
        ];
    }
}
