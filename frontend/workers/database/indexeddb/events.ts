import { Table } from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import sanitizeFilename from 'sanitize-filename';
import { v4, validate } from 'uuid';
import has from 'lodash/has';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { IEvent, IVault, WEntity } from '~/@types';
import { WorkerContext } from '~/@types/app';
import {
    AnalyticsAction,
    IntegrationType,
    SearchIndex,
    ServiceKey,
} from '~/constants';
import { serializeTaskDateObject } from '~/store/event';
import { ContentWriter } from '~/workers/database/device/contentWriter';
import { EntityIO } from '~/workers/database/device/io/entity';
import { HTMLParser } from '~/workers/database/device/parser';
import { deserializeTaskDateObject } from '~/store/tasks';
import { StorageType } from '~/workers/utils/parsers';

export class EventsIndexedDB extends IndexedDBBase<IEvent> {
    shouldStoreLocally = false;
    protected entity = 'event';
    protected contentKey = 'description';
    protected platform: string;
    protected context: WorkerContext;
    public searchIndex = SearchIndex.EVENT;
    public parserIndex = StorageType.EVENT;
    protected writer: ContentWriter<IEvent>;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.clientId = ctx.$config.clientId;
        this.platform = ctx.$config.platform;
        this.context = ctx;
        this.writer = new ContentWriter<IEvent>(ctx, new EntityIO(ctx), {
            serialize: (entity: Partial<IEvent>): WEntity | null => {
                if (entity.calendarId !== 'acreom') return null;
                return this.createDeviceWriteMeta(entity as IEvent);
            },
        });
        this.parser = new HTMLParser(ctx);
    }

    table(vaultId: string): Table<IEvent, string> {
        return acreomVaultIndexedDB(vaultId).Events;
    }

    deserializeWriterEntity(entity: WEntity): IEvent & { mdContent?: string } {
        return {
            ...entity.metadata,
            start: deserializeTaskDateObject(entity.metadata.start),
            end: deserializeTaskDateObject(entity.metadata.end),
            id: entity.id,
            summary: entity.name!,
            description: entity.content!,
            mdContent: entity.mdContent,
            filepath: entity.filepath,
        } as IEvent & { mdContent?: string };
    }

    shouldCreateFilepath(
        vaultId: string,
        mods: Partial<IEvent>,
        oldEntity?: Partial<IEvent>,
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
        const updateIfKeyPresent = ['summary'] as (keyof IEvent)[];
        return this.checkMods(updateIfKeyPresent, mods, oldEntity);
    }

    async listIntegrationEvents(
        vaultId: string,
        integrationId: string,
        integrationType: string,
    ): Promise<IEvent[]> {
        return this.table(vaultId)
            .filter(
                x =>
                    x.integrationId === integrationId &&
                    x.integrationType === integrationType,
            )
            .toArray();
    }

    async list(
        vaultId: string,
        query?: any,
        filter?: (entity: IEvent) => boolean,
        paginationId?: string,
    ): Promise<IEvent[]> {
        if (paginationId) {
            return [];
        }
        if (query?.type === 'list integration events') {
            return this.listIntegrationEvents(
                vaultId,
                query.data.id,
                query.data.type,
            );
        }
        const [acreomEvents, googleCalendarEvents, icsEvents] =
            await Promise.all([
                this.table(vaultId)
                    .filter((event: IEvent) => {
                        if (filter) {
                            return filter(event);
                        }
                        return !event.integrationType && !event.integrationId;
                    })
                    .toArray(),
                this.context.$deviceService.GoogleCalendarEventsIndexedDB.list(
                    vaultId,
                    query,
                    filter,
                ),
                this.table(vaultId)
                    .filter(
                        x => x.integrationType === IntegrationType.ICS_CALENDAR,
                    )
                    .toArray(),
            ]);

        return [...acreomEvents, ...googleCalendarEvents, ...icsEvents];
    }

    async delete(
        vaultId: string,
        entity: Partial<IEvent>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IEvent>> {
        // @ts-ignore
        if (!meta?.postprocess && !has(entity, 'integrationType')) {
            const gcalEvent =
                await this.context.$deviceService.GoogleCalendarEventsIndexedDB.retrieve(
                    vaultId,
                    entity.id!,
                );
            if (gcalEvent) {
                return this.context.$deviceService.GoogleCalendarEventsIndexedDB.delete(
                    vaultId,
                    entity,
                    meta,
                );
            }
        }
        if (
            !meta?.postprocess &&
            entity.integrationType === IntegrationType.GOOGLE_CALENDAR
        ) {
            return this.context.$deviceService.GoogleCalendarEventsIndexedDB.delete(
                vaultId,
                entity,
                meta,
            );
        }

        return super.delete(vaultId, entity, meta);
    }

    async save(
        vaultId: string,
        entity: Partial<IEvent>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IEvent>> {
        if (Object.keys(entity).every(k => ['id', 'filepath'].includes(k))) {
            return super.save(vaultId, entity, { ...meta, keepStatus: true });
        }
        if (entity.calendarId !== 'acreom') {
            const event = await this.retrieve(vaultId, entity.id!);
            if (event) {
                await this.delete(
                    vaultId,
                    { id: entity.id },
                    { postprocess: true, writeToDevice: true },
                );
            }
        }
        if (entity.calendarId === 'acreom') {
            const gcalEvent =
                await this.context.$deviceService.GoogleCalendarEventsIndexedDB.retrieve(
                    vaultId,
                    entity.id!,
                );
            if (gcalEvent) {
                await this.context.$deviceService.GoogleCalendarEventsIndexedDB.save(
                    vaultId,
                    {
                        id: entity.id,
                        status: 'cancelled',
                    },
                    {
                        ...meta,
                        keepStatus: true,
                    },
                );
            }
            if (!validate(entity.id)) {
                entity.id = v4();
            }
        }
        if (entity.integrationType === IntegrationType.GOOGLE_CALENDAR) {
            if (entity.status === 'new') {
                entity.status = 'confirmed';
            }
            if (validate(entity.id)) {
                const oldId = entity.id;
                entity.id = [
                    entity.integrationType,
                    entity.integrationId,
                    entity.calendarId,
                    entity.id,
                ].join('/');
                this.delete(vaultId, { ...entity, id: oldId });
            }
            return this.context.$deviceService.GoogleCalendarEventsIndexedDB.save(
                vaultId,
                entity,
                {
                    ...meta,
                    keepStatus: true,
                },
            );
        }

        const _entity = await super.save(vaultId, entity, {
            ...meta,
            keepStatus: true,
        });
        if (
            _entity.hasOwnProperty('sendUpdates') &&
            _entity.sendUpdates === true
        ) {
            setTimeout(() => {
                super.save(
                    vaultId,
                    { id: _entity.id, sendUpdates: false },
                    { ...meta, keepStatus: true },
                );
            }, 1000);
        }
        return _entity;
    }

    getContent(entity: IEvent): string {
        return entity.description;
    }

    async subprocessLocalChanges(
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
    }

    async subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
            vaultId,
            change,
        });
    }

    createDeviceWriteMeta(entity: IEvent): WEntity {
        const writeEntity = super.createDeviceWriteMeta(entity);
        return {
            ...writeEntity,
            metadata: {
                ...writeEntity.metadata,
                start: serializeTaskDateObject(entity.start),
                end: serializeTaskDateObject(entity.end),
                recurrence: entity.recurrence,
                recurringEventId: entity.recurringEventId,
                attendees: entity.attendees,
                attachments: entity.attachments,
                calendarId: entity.calendarId,
                location: entity.location,
                source: entity.source,
                integrationId: entity.integrationId,
                integrationType: entity.integrationType,
                colorId: entity.colorId,
                linkedDocumentId: entity.linkedDocumentId,
            },
            kind: 'event',
        };
    }

    async createFilepathBase(
        entity: Partial<IEvent>,
        changes: Partial<IEvent>,
        writeToDevice: boolean,
        vault: IVault,
    ): Promise<string> {
        const mergedChanges = { ...entity, ...changes };
        if (!writeToDevice && mergedChanges.filepath) {
            return mergedChanges.filepath!;
        }
        const vaultPath = vault?.filepath;
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        return [
            vaultPath,
            '.events',
            sanitizeFilename(
                changes.summary || mergedChanges.summary || 'untitled',
            ),
        ].join(sep);
    }

    async *listPaginated(
        vaultId: string,
        pageId: string | null,
        pageSize?: number,
    ): AsyncGenerator<any[], void, unknown> {
        yield* super.listPaginated(
            vaultId,
            pageId,
            pageSize,
            entity => entity.calendarId === 'acreom',
        );
    }
}
