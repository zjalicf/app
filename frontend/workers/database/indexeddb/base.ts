import DexieDB, { Collection, Table, Transaction } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { defaultsDeep } from 'lodash';
import isNumber from 'lodash/isNumber';
import { v4 } from 'uuid';
import { acreomVaultIndexedDB } from './connector';
import { WorkerContext } from '~/@types/app';
import {
    AnalyticsAction,
    AssistantActions,
    LangChainIndex,
    SearchIndex,
    SearchServiceAction,
    ServiceKey,
    UtilActions,
} from '~/constants';
import { acreomConfigIndexedDB } from '~/workers/database/indexeddb/config';
import { IVault, WEntity } from '~/@types';
import { ContentWriter } from '~/workers/database/device/contentWriter';
import { getMods } from '~/helpers/mods';
import { StorageType } from '~/workers/utils/parsers';
import { ContentParser } from '~/workers/database/device/parser/interface';
import { NoOpParser } from '~/workers/database/device/parser';
import { ProgressReporter } from '~/workers/database/reporter/interface';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import {
    Encryption,
    EntityEncryption,
} from '~/workers/database/encryption/entity';

export type IndexedDBMeta = {
    writeToDevice: boolean;
    encrypt?: boolean;
    postprocess?: boolean;
    updatedAt?: boolean;
    keepStatus?: boolean;
    clientId?: string;
};
export type DatabaseEmitFn = (
    service: ServiceKey,
    key: string,
    payload: Record<string, any> | any[],
) => void;

export type DatabaseInvokeFn = (
    service: ServiceKey,
    key: string,
    payload: Record<string, any>,
) => Promise<any>;

export type QueryObj = Record<
    string,
    {
        eq?: any | any[];
        neq?: any | any[];
        lt?: any;
        gt?: any;
    } & Record<string, any>
>;

export type FilterFn = <T>(entity: T & Record<string, any>) => boolean;

export abstract class IndexedDBBase<
    T extends Record<string, any> = Record<string, any> & {
        filepath: string;
        id: string;
    },
> {
    protected clientId: string;
    protected isElectron: boolean;
    protected shouldStoreLocally: boolean = false;
    protected entity: string = 'base';
    protected emit: DatabaseEmitFn;
    protected context: WorkerContext;
    protected contentKey = 'description';
    protected pageSize = 1000;
    protected vuexBatch: Record<string, any | any[]> = {
        updates: [],
        deletes: [],
        timeout: -1,
    };

    protected writer!: ContentWriter<T>;
    protected parser!: ContentParser;
    public encryption!: Encryption<T>;

    protected batchSize = 200;

    protected searchIndex: SearchIndex | undefined;
    protected langChainIndex: LangChainIndex | undefined;
    protected parserIndex: StorageType | undefined;
    public searchableEntities: string[] = [];

    constructor(ctx: WorkerContext) {
        this.clientId = ctx.$config.clientId;
        this.isElectron = ctx.$config.platform === 'desktop';
        this.emit = ctx.emit;
        this.context = ctx;
        this.parser = new NoOpParser(ctx);
        this.encryption = new EntityEncryption<T>(
            ctx,
            EncryptionDatagramType.NONE,
            [],
        );
    }

    get isEncryptable() {
        return this.encryption.isEncryptable;
    }

    get isEncryptableInProtocol() {
        return false;
    }

    get sep() {
        return this.context.$config.os === 'windows' ? '\\' : '/';
    }

    get canStoreLocally(): boolean {
        return this.shouldStoreLocally;
    }

    protected table(_vaultId?: string): Table<T, string | number> {
        throw new Error('Not Implemented');
    }

    protected database(vaultId?: string): DexieDB {
        if (!vaultId) return acreomConfigIndexedDB;
        return acreomVaultIndexedDB(vaultId!);
    }

    protected processQuery(query: QueryObj): FilterFn {
        const filterFns: FilterFn[] = [];

        for (const propKey of Object.keys(query)) {
            const op = Object.keys(query[propKey]).shift()!;
            const isArray = Array.isArray(query[propKey][op]);

            switch (op) {
                case 'eq':
                    filterFns.push((entity: Record<string, any>): boolean =>
                        isArray
                            ? query[propKey][op].includes(entity[propKey])
                            : entity[propKey] === query[propKey][op],
                    );
                    break;
                case 'neq':
                    filterFns.push((entity: Record<string, any>): boolean =>
                        isArray
                            ? !query[propKey][op].includes(entity[propKey])
                            : entity[propKey] !== query[propKey][op],
                    );
                    break;
                case 'lt':
                    filterFns.push(
                        (entity: Record<string, any>): boolean =>
                            entity[propKey] < query[propKey][op],
                    );
                    break;
                case 'gt':
                    filterFns.push(
                        (entity: Record<string, any>): boolean =>
                            entity[propKey] > query[propKey][op],
                    );
                    break;
            }
        }

        return (entity: Record<string, any>): boolean => {
            return filterFns.reduce(
                (acc: boolean, fn: FilterFn) => acc && fn(entity),
                true,
            );
        };
    }

    searchIndexFilter() {
        return (entity: any): boolean => {
            return (
                !this.searchableEntities.length ||
                this.searchableEntities.includes(entity.id.split('/').shift())
            );
        };
    }

    initialize(vaultId: string) {
        this.initialIndex(vaultId);
        this.registerLocalSync(vaultId);
    }

    public async initialIndex(vaultId: string) {
        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );
        if (!vault) return;

        if (!this.searchIndex && !this.langChainIndex && !this.parserIndex)
            return;

        let paginationId = null;
        do {
            const entities: T[] = await this.list(
                vaultId,
                undefined,
                undefined,
                paginationId,
            );
            if (!entities.length) break;
            paginationId = entities[entities.length - 1].id;
            const vault = acreomVaultIndexedDB(vaultId);
            this.initialPostprocess(vaultId, entities);
            const parsedEntities = entities.map(e => ({
                ...e,
                [this.contentKey]: e.mdContent ?? e[this.contentKey],
                mdContent: undefined,
            }));

            if (this.parserIndex && vault.filepath) {
                this.context.emit(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                    vaultId,
                    type: this.parserIndex,
                    entity: parsedEntities,
                });
            }

            if (this.searchIndex) {
                const filteredEntities =
                    this.initialIndexFilter(parsedEntities);
                this.context.emit(
                    ServiceKey.SEARCH,
                    SearchServiceAction.INITIAL_INDEX,
                    {
                        index: this.searchIndex,
                        entity: filteredEntities,
                    },
                );
            }
        } while (paginationId);
    }

    initialIndexFilter(_entities: T[]) {
        return _entities;
    }

    initialPostprocess(_vaultId: string, _entities: T[]) {}

    initialLangchainIndex(vaultId: string, entities: T[]) {
        this.context.emit(
            ServiceKey.ASSISTANT,
            AssistantActions.LANGCHAIN_INITIAL,
            {
                index: this.langChainIndex,
                vaultId,
                entity: entities,
            },
        );
    }

    indexChange(_change: IUpdateChange) {
        return true;
    }

    protected indexEntity(vaultId: string, change: IDatabaseChange) {
        const updateChange: IUpdateChange = change as IUpdateChange;
        switch (change.type) {
            case 1:
                if (!this.indexChange(updateChange)) break;
                this.emit(ServiceKey.SEARCH, SearchServiceAction.INDEX, {
                    vaultId,
                    index: this.searchIndex,
                    entity: {
                        ...updateChange.obj,
                        [this.contentKey]: updateChange.obj.mdContent,
                    },
                });
                break;
            case 2:
                if (!updateChange.mods) break;
                if (!this.indexChange(updateChange)) break;
                this.emit(ServiceKey.SEARCH, SearchServiceAction.INDEX, {
                    vaultId,
                    index: this.searchIndex,
                    entity: {
                        ...updateChange.obj,
                        [this.contentKey]: updateChange.obj.mdContent,
                    },
                });
                break;
            case 3:
                this.emit(ServiceKey.SEARCH, SearchServiceAction.REMOVE, {
                    vaultId,
                    index: this.searchIndex,
                    entity: {
                        id: change.key,
                        vaultId,
                    },
                });
                break;
        }
    }

    protected async indexEntityInLangchain(
        vaultId: string,
        change: IDatabaseChange,
    ) {
        if (acreomVaultIndexedDB(vaultId).vault.type === 'local') return;
        const localConfig =
            await this.context.$deviceService.LocalConfig.retrieve(
                vaultId,
                'assistantOptions',
            );
        if (!localConfig?.xRay) return;
        const updateChange: IUpdateChange = change as IUpdateChange;
        switch (change.type) {
            case 1:
                this.emit(
                    ServiceKey.ASSISTANT,
                    AssistantActions.LANGCHAIN_INDEX,
                    {
                        vaultId,
                        index: this.langChainIndex,
                        entity: {
                            ...updateChange.obj,
                            [this.contentKey]: updateChange.obj.mdContent,
                        },
                    },
                );
                break;
            case 2:
                if (!updateChange.mods) break;
                this.emit(
                    ServiceKey.ASSISTANT,
                    AssistantActions.LANGCHAIN_INDEX,
                    {
                        vaultId,
                        index: this.langChainIndex,
                        entity: {
                            ...updateChange.obj,
                            [this.contentKey]: updateChange.obj.mdContent,
                        },
                    },
                );
                break;
            case 3:
                this.emit(
                    ServiceKey.ASSISTANT,
                    AssistantActions.LANGCHAIN_REMOVE,
                    {
                        vaultId,
                        index: this.langChainIndex,
                        entity: {
                            id: change.key,
                            vaultId,
                        },
                    },
                );
                break;
        }
    }

    protected indexEntityConversion(vaultId: string, change: IDatabaseChange) {
        const updateChange: IUpdateChange = change as IUpdateChange;
        switch (change.type) {
            case 1:
                this.emit(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                    vaultId,
                    type: this.parserIndex,
                    entity: this.serializeForConverter(updateChange.obj),
                });
                break;
            case 2:
                if (!updateChange.mods) break;
                this.emit(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                    vaultId,
                    type: this.parserIndex,
                    entity: this.serializeForConverter(updateChange.obj),
                });
                break;
            case 3:
                this.emit(ServiceKey.UTILS, UtilActions.REMOVE_ENTITY, {
                    vaultId,
                    type: this.parserIndex,
                    entity: this.serializeForConverter(
                        updateChange.oldObj ?? { id: updateChange.key },
                    ),
                });
                break;
        }
    }

    protected serializeForConverter(entity: Partial<T> | Partial<T>[]): ({
        id: string;
        filepath: string;
        vaultId: string;
    } & Record<string, any>)[] {
        if (!Array.isArray(entity)) {
            entity = [entity];
        }
        return entity.map(e => ({
            ...e,
            [this.contentKey]: undefined,
            id: e?.id ?? '',
            filepath: e?.filepath ?? '',
            vaultId: e?.vaultId ?? '',
        }));
    }

    protected async subprocessLocalChanges(
        vaultId: string,
        _change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );
    }

    protected async subprocessRemoteChanges(
        _vaultId: string,
        _change: IDatabaseChange,
    ): Promise<void> {}

    public deserializeWriterEntity(entity: WEntity): T {
        return {
            ...entity.metadata,
        } as T;
    }

    public createDeviceWriteMeta(entity: T): WEntity {
        return {
            metadata: {
                id: entity.id,
                yamlHeader: entity.yamlHeader,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            },
            filepath: entity.filepath,
            vaultId: entity.vaultId,
            kind: this.entity,
            content: entity.mdContent,
        } as any;
    }

    async encryptChanges(vaultId: string, changes: IDatabaseChange[]) {
        if (!this.encryption?.shouldEncrypt(vaultId)) {
            return changes;
        }

        const obj: any[] = [];
        const mods: any[] = [];
        const oldObj: any[] = [];
        let objIndex = 0;
        let modsIndex = 0;
        let oldObjIndex = 0;
        for (const change of changes) {
            const updateChange = change as IUpdateChange;
            if (
                updateChange.mods &&
                (updateChange.obj?.encryptionKey ||
                    updateChange.mods?.encryptionKey)
            ) {
                mods.push({
                    ...updateChange.mods,
                    encryptionKey:
                        updateChange.mods?.encryptionKey ??
                        updateChange.obj?.encryptionKey,
                });
            }
            if (updateChange.obj?.encryptionKey) {
                obj.push(updateChange.obj);
            }
            if (updateChange.oldObj?.encryptionKey) {
                oldObj.push(updateChange.oldObj);
            }
        }
        const [encryptedObjs, encryptedMods, encryptedOldObjs] =
            await Promise.all([
                this.encryption?.encryptContentBulk(vaultId, obj),
                this.encryption?.encryptContentBulk(vaultId, mods),
                this.encryption?.encryptContentBulk(vaultId, oldObj),
            ]);

        return changes.map(change => {
            const updateChange = { ...change } as IUpdateChange;
            if (
                updateChange.mods &&
                (updateChange.obj?.encryptionKey ||
                    updateChange.mods?.encryptionKey)
            ) {
                updateChange.mods = {
                    ...updateChange.mods,
                    ...encryptedMods[modsIndex++],
                };
            }
            if (updateChange.obj?.encryptionKey) {
                updateChange.obj = {
                    ...updateChange.obj,
                    ...encryptedObjs[objIndex++],
                };
            }
            if (updateChange.oldObj?.encryptionKey) {
                updateChange.oldObj = {
                    ...updateChange.oldObj,
                    ...encryptedOldObjs[oldObjIndex++],
                };
            }
            return updateChange;
        });
    }

    async decryptChanges(
        vaultId: string,
        changes: IDatabaseChange[],
    ): Promise<IDatabaseChange[]> {
        if (!this.encryption?.shouldEncrypt(vaultId)) return changes;

        const obj: any[] = [];
        const mods: any[] = [];
        const oldObj: any[] = [];
        let objIndex = 0;
        let modsIndex = 0;
        let oldObjIndex = 0;
        for (const change of changes) {
            const updateChange = change as IUpdateChange;
            if (updateChange.mods?.encryptedData) {
                mods.push({
                    ...updateChange.mods,
                    encryptionKey:
                        updateChange.mods?.encryptionKey ??
                        updateChange.oldObj?.encryptionKey ??
                        updateChange.obj?.encryptionKey,
                });
            }
            if (updateChange.obj?.encryptedData) {
                obj.push(updateChange.obj);
            }
            if (updateChange.oldObj?.encryptedData) {
                oldObj.push(updateChange.oldObj);
            }
        }
        const [decryptedObjs, decryptedMods, decryptedOldObjs] =
            await Promise.all([
                this.encryption?.decryptData(vaultId, obj),
                this.encryption?.decryptData(vaultId, mods),
                this.encryption?.decryptData(vaultId, oldObj),
            ]);

        return changes.map(change => {
            const updateChange = { ...change } as IUpdateChange;
            if (updateChange.mods?.encryptedData) {
                updateChange.mods = {
                    ...updateChange.mods,
                    ...decryptedMods[modsIndex++],
                    encrypted: !!updateChange.mods?.encryptedData,
                    encryptedData: undefined,
                };
            }
            if (updateChange.obj?.encryptedData) {
                updateChange.obj = {
                    ...updateChange.obj,
                    ...decryptedObjs[objIndex++],
                    encrypted: !!updateChange.obj?.encryptedData,
                    encryptedData: undefined,
                };
            }
            if (updateChange.oldObj?.encryptedData) {
                updateChange.oldObj = {
                    ...updateChange.oldObj,
                    ...decryptedOldObjs[oldObjIndex++],
                    encrypted: !!updateChange.oldObj?.encryptedData,
                    encryptedData: undefined,
                };
            }
            return updateChange;
        });
    }

    public registerLocalSync(vaultId: string) {
        acreomVaultIndexedDB(vaultId).on(
            'changes',
            async (changes: IDatabaseChange[]) => {
                let activeVault =
                    (await acreomConfigIndexedDB.getActiveVault()) as Partial<IVault>;
                if (!activeVault) {
                    const change = changes.find(
                        change => change.table === 'vaults' && change.type < 3,
                    );
                    if (change) {
                        await acreomConfigIndexedDB.setActiveVault(change.key);
                        activeVault = { id: change.key } as Partial<IVault>;
                    }
                }
                const activeVaultId = activeVault?.id;
                const vault = await acreomConfigIndexedDB.Vaults.get(vaultId);
                let changesToProcess = changes.filter(change => {
                    if (change.type === 2) {
                        const changeKeys = Object.keys(
                            (change as IUpdateChange).mods,
                        ); // TODO: properly fix types
                        if (
                            changeKeys.length === 1 &&
                            changeKeys.includes('updatedAt')
                        )
                            return false;
                    }
                    return change.table === this.table(vaultId).name;
                });
                if (!changesToProcess.length) return;

                changesToProcess = await this.decryptChanges(
                    vaultId,
                    changesToProcess,
                );

                changesToProcess.forEach(change => {
                    const isSearchableEntity =
                        !this.searchableEntities.length ||
                        this.searchableEntities.includes(
                            change.key.split('/').shift(),
                        );
                    if (this.searchIndex && isSearchableEntity) {
                        this.indexEntity(vaultId, change);
                    }
                    if (this.langChainIndex) {
                        this.indexEntityInLangchain(vaultId, change);
                    }
                    if (this.parserIndex && vault?.filepath) {
                        this.indexEntityConversion(vaultId, change);
                    }

                    if (
                        change.source === 'device' ||
                        change.source === this.clientId
                    ) {
                        this.subprocessLocalChanges(vaultId, change);
                    } else if (change.source) {
                        this.subprocessRemoteChanges(vaultId, change);
                    }

                    if (vault?.filepath && change.source !== 'device') {
                        this.syncToDevice(vault, change);
                    }

                    if (
                        vaultId !== activeVaultId ||
                        (!(change as IUpdateChange).mods?.filepath &&
                            !(change as IUpdateChange).obj?.filepath &&
                            change.source === this.clientId)
                    ) {
                        return;
                    }
                    this.syncToVuex(vaultId, change);
                });
            },
        );
    }

    public registerVaultSync() {
        acreomConfigIndexedDB.on('changes', (changes: IDatabaseChange[]) => {
            changes.forEach(change => {
                if (change.table !== this.table().name) return;
                this.subprocessLocalChanges('', change);
                if (change.table === 'vaults') {
                    this.indexEntityConversion(change.key, change);
                }
                if (change.source === this.context.$config.clientId) return;
                this.syncToVuex('acreom-database-config', change);
            });
        });
    }

    shouldUpdateOnDevice(entity: Partial<T>): boolean {
        const writeMeta = this.createDeviceWriteMeta(entity as T);

        delete writeMeta.metadata.id;
        delete writeMeta.metadata.updatedAt;
        delete writeMeta.metadata.createdAt;

        const hasMetaToWrite = Object.values(writeMeta.metadata).some(
            v => !isEmpty(v) || isNull(v),
        );

        if (hasMetaToWrite) {
            return hasMetaToWrite;
        }
        return Object.values({
            content: writeMeta.content,
            filepath: writeMeta.filepath,
            name: writeMeta.name,
        }).some(v => v !== undefined);
    }

    async convertContentForWriting(
        vaultId: string,
        content: {
            id: string;
            content: string;
            mdContent: string | null;
            source: string;
            filepath?: string;
        }[],
    ): Promise<string[]> {
        if (!Array.isArray(content)) {
            content = [content];
        }

        if (!content.length) return [];
        let j = 0;

        const notDeviceContent = content.filter(
            c => c.source !== 'device' || !c.mdContent,
        );

        const convertedContent =
            notDeviceContent.length > 0
                ? await this.context.invoke<string[]>(
                      ServiceKey.UTILS,
                      UtilActions.PARSE_HTML_TO_MD,
                      {
                          vaultId,
                          entity: notDeviceContent.map(c => ({
                              ...c,
                              vaultId,
                          })),
                          callerContext:
                              'indexeddb/base.ts/convertContentForWriting',
                      },
                  )
                : [];
        return content.map(c => {
            if (c.source === 'device') {
                return c.mdContent!;
            }
            return convertedContent[j++];
        });
    }

    getContent(entity: T): string {
        return entity.content;
    }

    async isRemoteChange(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<boolean> {
        if (['device', this.clientId].includes(change.source!)) return false;
        // in case of sync, source of the change is id of syncNode, which is numerical.
        const syncNodes = await acreomVaultIndexedDB(vaultId)
            ._syncNodes.filter(node => node.type === 'remote')
            .toArray();
        return (
            isNumber(change.source) &&
            syncNodes.some(node => node.id === change.source)
        );
    }

    protected async syncToDevice(vault: IVault, change: IDatabaseChange) {
        if (!this.shouldStoreLocally) return;
        if (this.context.$config.platform !== 'desktop') return;
        const isRemoteChange = await this.isRemoteChange(vault.id, change);
        if (!isRemoteChange) return;
        const createChange = change as ICreateChange;
        const updateChange = change as IUpdateChange;

        const doc = await this.table(vault.id).get(change.key);
        if (!doc && change.type < 3) return;
        switch (change.type) {
            case 1: // CREATE
                if (createChange.obj[this.contentKey]) {
                    return this.save(vault.id, createChange.obj, {
                        writeToDevice: true,
                        clientId: v4(),
                    });
                }
                return this.writer.create(createChange.obj);
            case 2: // UPDATE
                if (updateChange.mods[this.contentKey]) {
                    return this.save(vault.id, updateChange.obj, {
                        writeToDevice: true,
                        clientId: v4(),
                    });
                }
                return this.writer.update(
                    updateChange.obj,
                    updateChange.oldObj,
                );
            case 3: // DELETE
                if (!(change as IDeleteChange).oldObj) return;
                return this.writer.delete((change as IDeleteChange).oldObj);
        }
    }

    protected async syncToVuex(vaultId: string, change: IDatabaseChange) {
        if (change.source === this.context.$config.clientId) return;
        let updateChange: IUpdateChange | null = null;
        let deleteChange: IDeleteChange | null = null;
        const removeMDContent = (obj: any) => ({
            ...obj,
            mdContent: undefined,
        });

        switch (change.type) {
            case 1: // CREATE
            case 2: // UPDATE
                updateChange = change as IUpdateChange;
                this.vuexBatch.updates.push(removeMDContent(updateChange.obj));
                break;
            case 3: // DELETE
                deleteChange = change as IDeleteChange;
                this.vuexBatch.deletes.push(deleteChange.key);
                break;
        }
        const emitChanges = async () => {
            const deletes = [...this.vuexBatch.deletes];
            const updates = [...this.vuexBatch.updates];

            this.vuexBatch.deletes = [];
            this.vuexBatch.updates = [];

            if (deletes.length > 0) {
                await this.context.invoke(
                    ServiceKey.STORE,
                    `dispatch:${this.entity}/indexedDBDelete`,
                    deletes,
                );
            }
            if (updates.length > 0) {
                this.emit(
                    ServiceKey.STORE,
                    `dispatch:${this.entity}/indexedDBUpdate`,
                    updates,
                );
            }
        };
        clearTimeout(this.vuexBatch.timeout);
        if (this.vuexBatch.updates.length > this.batchSize) {
            this.context.emit(
                ServiceKey.STORE,
                `dispatch:${this.entity}/indexedDBUpdate`,
                [...this.vuexBatch.updates],
            );
            this.vuexBatch.updates = [];
        }
        if (this.vuexBatch.deletes.length > this.batchSize) {
            this.context.emit(
                ServiceKey.STORE,
                `dispatch:${this.entity}/indexedDBDelete`,
                [...this.vuexBatch.deletes],
            );
            this.vuexBatch.deletes = [];
        }
        this.vuexBatch.timeout = setTimeout(() => {
            emitChanges();
        }, 100);
    }

    async retrieve(
        vaultId: string,
        id: string,
        meta: { decrypt: boolean } = { decrypt: true },
    ): Promise<T | null> {
        const entity = await this.table(vaultId)
            .get(id)
            .catch(() => null);
        if (!entity) return null;
        if (
            !this.encryption?.shouldEncrypt(vaultId) ||
            !entity.encryptedData ||
            !entity.encryptionKey ||
            !meta.decrypt
        )
            return entity;

        const decryptedEntities = await this.encryption?.decryptData(vaultId, [
            entity,
        ]);
        if (!decryptedEntities.length) return entity;
        const decryptedEntity = decryptedEntities.shift()!;
        return {
            ...entity,
            ...decryptedEntity,
            encryptionKey: entity?.encryptionKey,
        };
    }

    retrieveWhereEquals(
        vaultId: string,
        index: string,
        value: string | number,
    ): Promise<T | undefined> {
        return this.table(vaultId).where(index).equals(value).first();
    }

    async list(
        vaultId: string,
        _query?: any,
        filter?: (entity: T) => boolean,
        paginationId?: string | null,
    ): Promise<T[]> {
        let query: Table | Collection = this.table(vaultId ?? '');
        if (paginationId !== undefined) {
            if (paginationId !== null) {
                query = query.where('id').above(paginationId);
            }
            if (filter) {
                query = query.filter(filter);
            }
            query = query.limit(this.pageSize);
            const data = await query.toArray();

            return this.encryption?.decryptData(vaultId, data ?? []);
        }
        if (filter) {
            query = (query as Table).toCollection().filter((e: T) => filter(e));
        }
        const data = (await query.toArray()) ?? [];

        return this.encryption?.decryptData(vaultId, data ?? []);
    }

    listByQuery(vaultId: string, query: QueryObj): Promise<T[]> {
        const filter = this.processQuery(query);
        return this.list(vaultId, undefined, filter);
    }

    async listByIds(vaultId: string, ids: string[]): Promise<T[]> {
        const data = await this.table(vaultId).where('id').anyOf(ids).toArray();
        return this.encryption?.decryptData(vaultId, data ?? []);
    }

    async listByFilepath(vaultId: string, filepaths: string[]): Promise<T[]> {
        const hasFilepathIndex = this.table(vaultId).schema.indexes.some(
            i => i.name === 'filepath',
        );
        let data = [];
        if (!hasFilepathIndex) {
            data = await this.table(vaultId)
                .filter(e => filepaths.includes(e.filepath))
                .toArray();
        } else {
            data = await this.table(vaultId)
                .where('filepath')
                .anyOf(filepaths)
                .toArray();
        }
        return this.encryption?.decryptData(vaultId, data ?? []);
    }

    shouldCreateFilepath(
        vaultId: string,
        mods: Partial<T>,
        _oldEntity?: Partial<T>,
        meta?: Partial<IndexedDBMeta>,
    ): boolean {
        const vault = acreomVaultIndexedDB(vaultId);
        if (!vault?.filepath) return false;
        if (mods.filepath) return false;
        if (!meta?.writeToDevice) return false;
        if (meta?.clientId === 'device') return false;
        return true;
    }

    checkMods(
        keys: (keyof T)[],
        mods: Partial<T>,
        oldEntity?: Partial<T>,
    ): boolean {
        return keys.some(key => key in mods && mods[key] !== oldEntity?.[key]);
    }

    createFilepathBase(
        _entity: Partial<T>,
        _changes: Partial<T>,
        _writeToDevice: boolean,
        _vault: IVault,
    ): Promise<string> {
        return Promise.resolve('');
    }

    async createFilepathWithRegister(
        entity: T,
        vault: IVault,
        register: Set<string>,
        extension: string = '.md',
    ): Promise<string> {
        const filepathBase = await this.createFilepathBase(
            entity,
            entity,
            true,
            vault,
        );
        let filepath = filepathBase + extension;
        let index = 0;
        while (register.has(filepath)) {
            index++;
            filepath = filepathBase + ` ${index}${extension}`;
        }
        register.add(filepath);
        return filepath;
    }

    async createFilePath(
        entity: Partial<T>,
        changes: Partial<T>,
        writeToDevice: boolean,
        vault: IVault,
        register: Set<string> = new Set(),
    ): Promise<any> {
        const oldFilepath = changes?.filepath || entity?.filepath;
        const filepathBase = await this.createFilepathBase(
            entity,
            changes,
            writeToDevice,
            vault,
        );
        if (!filepathBase) return oldFilepath;
        if (filepathBase?.endsWith('.md')) {
            return filepathBase;
        }
        return this.getAvailableFilepath(filepathBase, oldFilepath!, register);
    }

    async getAvailableFilepath(
        filepathBase: string,
        originalFilepath?: string,
        register: Set<string> = new Set(),
        extension = '.md',
    ): Promise<string> {
        let filepath = filepathBase + extension;
        let hadFilepath = true;
        if (!originalFilepath) {
            hadFilepath = false;
            originalFilepath = filepath;
        }
        const filepathExists = (_filepath: string) =>
            this.context
                .invoke<{ payload: boolean }>(
                    ServiceKey.DEVICE,
                    'entity:exists',
                    {
                        filepath: _filepath,
                    },
                )
                .then(({ payload }) => payload);

        let index = 0;
        const exists = await filepathExists(filepath);
        if (!hadFilepath && !exists && !register.has(filepath)) {
            register.add(filepath);
            return filepath;
        }
        if (!hadFilepath) {
            index = 1;
            filepath = `${filepathBase} ${index}${extension}`;
        }

        while (
            ((await filepathExists(filepath)) || register.has(filepath)) &&
            filepath !== originalFilepath
        ) {
            index++;
            filepath = `${filepathBase} ${index}${extension}`;
        }
        register.add(filepath);
        return filepath;
    }

    async saveBulk(
        vaultId: string,
        entities: Partial<T>[],
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<T>[]> {
        meta = defaultsDeep(meta, {
            writeToDevice: true,
            postprocess: true,
            encrypt: true,
        });
        const savedEntities = (
            await this.listByIds(
                vaultId,
                entities.map(({ id }: any) => id),
            )
        ).reduce((acc, e) => {
            acc[e.id] = e;
            return acc;
        }, {} as Record<string, any>);

        const entitiesWithFilepaths = entities.reduce((acc, e) => {
            if (e.filepath) {
                acc.push(e);
            }
            return acc;
        }, [] as Partial<T>[]);
        if (entitiesWithFilepaths.length) {
            const savedEntitiesByFilepath = await this.listByFilepath(
                vaultId,
                entitiesWithFilepaths.map(e => e.filepath!),
            );
            const filepathMap = savedEntitiesByFilepath.reduce((acc, e) => {
                acc[e.filepath] = e;
                return acc;
            }, {} as Record<string, any>);

            entities = entities.map(e => {
                if (!e.filepath) return e;
                const savedEntity = filepathMap[e.filepath];
                if (!savedEntity) return e;
                return {
                    ...savedEntity,
                    ...e,
                    id: savedEntity.id,
                };
            });
        }

        const entitiesToParse = entities.filter(
            (entity: any) => !!entity[this.contentKey] && !entity.mdContent,
        );

        const register = new Set<string>();

        entities = await Promise.all(
            entities.map(async e => {
                const previousEntity = savedEntities[e.id as string] ?? {};
                if (
                    this.shouldCreateFilepath(vaultId, e, previousEntity, meta)
                ) {
                    (e as any).filepath = await this.createFilePath(
                        previousEntity ?? {},
                        e,
                        meta!.writeToDevice!,
                        acreomVaultIndexedDB(vaultId).vault,
                        register,
                    );
                }
                return {
                    ...previousEntity,
                    ...e,
                    vaultId,
                };
            }),
        );

        if (this.shouldStoreLocally && entitiesToParse) {
            const parsedContent = await this.parser.parseBatch(
                vaultId,
                entitiesToParse.map(e => ({
                    id: e.id,
                    filepath: e.filepath,
                    content: e[this.contentKey]!,
                    vaultId,
                    type: this.entity,
                    ...e,
                })),
            );
            const parsedContentMap = entitiesToParse.reduce(
                (acc, entity, index) => {
                    acc[entity.id!] = parsedContent[index];
                    return acc;
                },
                {} as Record<string, string>,
            );
            entities = entities.map(entity => {
                if (!parsedContentMap[entity.id!]) return entity;
                return {
                    ...entity,
                    mdContent: parsedContentMap[entity.id!],
                };
            });
        }
        let encryptedEntities = entities;
        if (meta?.encrypt) {
            encryptedEntities = await this.encryption?.encryptContentBulk(
                vaultId,
                entities as any,
            );
        }
        await this.database(vaultId).transaction(
            'rw',
            this.table(vaultId).name,
            async (trx: Transaction) => {
                (trx as Transaction & { source: string }).source =
                    meta?.writeToDevice
                        ? meta?.clientId || this.clientId
                        : 'device';

                await this.table(vaultId).bulkPut(encryptedEntities as T[]);
                trx.on('complete', () => {
                    if (this.shouldWrite(vaultId, meta)) {
                        const writableEntities = entities.filter(entity =>
                            this.shouldUpdateOnDevice(entity),
                        );
                        this.writer.createBatch(
                            vaultId,
                            writableEntities as T[],
                        );
                    }
                });
            },
        );

        if (meta?.postprocess) {
            this.postprocessEntity(vaultId, entities, meta);
        }
        return entities;
    }

    async deleteByQuery(
        vaultId: string,
        query: QueryObj,
        meta?: IndexedDBMeta,
    ) {
        const filterFn = this.processQuery(query);

        await this.database(vaultId).transaction(
            'rw',
            this.table(vaultId).name,
            async (trx: Transaction) => {
                (trx as Transaction & { source: string }).source =
                    meta?.writeToDevice ? this.clientId : 'device';
                await this.table(vaultId)
                    .filter(e => filterFn(e))
                    .delete();
            },
        );
    }

    async deleteBulk(
        vaultId: string,
        entities: Partial<T>[],
        meta?: IndexedDBMeta,
    ) {
        await this.database(vaultId).transaction(
            'rw',
            this.table(vaultId).name,
            async (trx: Transaction) => {
                (trx as Transaction & { source: string }).source =
                    meta?.writeToDevice ? this.clientId : 'device';
                const data = await this.table(vaultId)
                    .where('id')
                    .anyOf(entities.map(({ id }) => id!))
                    .toArray();
                await this.table(vaultId).bulkDelete(
                    (data?.map(({ id }) => id) as string[]) ?? [],
                );
                trx.on('complete', async () => {
                    if (this.shouldWrite(vaultId, meta)) {
                        const dbEntities = await this.encryption?.decryptData(
                            vaultId,
                            data ?? [],
                        );
                        dbEntities.map((e: Partial<T>) => {
                            return this.writer.delete(e as T);
                        });
                    }
                });
            },
        );
    }

    shouldWrite(vaultId: string, meta?: Partial<IndexedDBMeta>) {
        const vault = acreomVaultIndexedDB(vaultId)?.vault;
        if (!vault) return false;
        return (
            vault.filepath &&
            meta?.writeToDevice &&
            this.shouldStoreLocally &&
            meta.clientId !== 'device'
        );
    }

    async save(
        vaultId: string,
        entity: Partial<T>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<T>> {
        meta = defaultsDeep(meta, {
            writeToDevice: true,
            postprocess: true,
            updatedAt: true,
            encrypt: true,
        });
        const idbxEntity = await this.retrieve(vaultId, entity.id!).catch(e => {
            console.log(e);
            return null;
        });
        this.emit(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
            vaultId,
            type: this.parserIndex,
            entity: this.serializeForConverter({ ...idbxEntity, ...entity }),
        });
        if (idbxEntity) {
            delete (idbxEntity as any).status;
        }
        if (meta && !meta.keepStatus) {
            delete entity.status;
        }

        entity = {
            ...entity,
            vaultId,
            createdAt: entity.createdAt ?? idbxEntity?.createdAt ?? new Date(),
        };

        if (this.shouldCreateFilepath(vaultId, entity, idbxEntity!, meta)) {
            (entity as any).filepath = await this.createFilePath(
                idbxEntity ?? {},
                entity,
                meta?.writeToDevice!,
                acreomVaultIndexedDB(vaultId).vault,
            );
        }
        this.emit(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
            vaultId,
            type: this.parserIndex,
            entity: this.serializeForConverter({ ...idbxEntity, ...entity }),
        });
        if (this.shouldStoreLocally && !!entity[this.contentKey]) {
            const parsedContent = await this.parser.parse({
                id: entity.id,
                filepath: entity.filepath,
                content: entity[this.contentKey]!,
                vaultId,
                type: this.entity,
                ...entity,
            });
            entity = {
                ...entity,
                mdContent: parsedContent,
            };
        }

        let encryptedEntity: any = entity;
        if (meta?.encrypt) {
            (entity as any).encryptionKey =
                idbxEntity?.encryptionKey ?? entity?.encryptionKey;
            encryptedEntity = await this.encryption?.encryptContent(
                vaultId,
                entity as any,
                idbxEntity,
            );
        }

        return await new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.writeToDevice
                            ? meta?.clientId || this.clientId
                            : 'device';
                    if (idbxEntity) {
                        const updateEntity = {
                            ...(encryptedEntity ?? entity),
                        } as any;
                        if (meta?.updatedAt) {
                            updateEntity.updatedAt = new Date();
                        }
                        await this.table(vaultId).update(
                            updateEntity.id as string,
                            updateEntity,
                        );
                    } else {
                        await this.table(vaultId).put(
                            (encryptedEntity ?? entity) as T,
                        );
                    }
                    trx.on('complete', () => {
                        if (
                            this.shouldWrite(vaultId, meta) &&
                            this.shouldUpdateOnDevice(entity)
                        ) {
                            this.writeToDevice(entity, idbxEntity!);
                        }
                        if (meta?.postprocess) {
                            this.postprocessEntity(vaultId, [entity], {
                                ...meta,
                                writeToDevice: false,
                            });
                        }
                        resolve({ ...idbxEntity, ...entity });
                    });
                },
            );
        });
    }

    writeToDevice(entity: Partial<T>, oldEntity?: T): Promise<void> {
        if (!oldEntity) {
            return this.writer.create(entity as T);
        }
        const mods = getMods(entity, oldEntity ?? {}) as Partial<T>;
        if (!this.shouldUpdateOnDevice(mods)) return Promise.resolve();
        return this.writer.update(entity, oldEntity);
    }

    modify(
        vaultId: string,
        modifications: Partial<T>,
        where?: Partial<T>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<void> {
        meta = defaultsDeep(meta, {
            writeToDevice: true,
            postprocess: true,
            encrypt: true,
        });
        return new Promise(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.writeToDevice
                            ? meta?.clientId || this.clientId
                            : 'device';
                    let query!: Collection;
                    if (where) {
                        query = this.table(vaultId).where(where);
                    } else {
                        query = this.table(vaultId).toCollection();
                    }
                    await query.modify(modifications);
                    trx.on('complete', () => {
                        resolve();
                    });
                },
            );
        });
    }

    removeFilepaths(vaultId: string) {
        if (!this.shouldStoreLocally) return;

        return new Promise<void>(resolve => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        this.clientId;
                    await this.table(vaultId).toCollection().modify({
                        filepath: undefined,
                    });
                    trx.on('complete', () => {
                        resolve();
                    });
                },
            );
        });
    }

    async delete(
        vaultId: string,
        entity: Partial<T>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<T>> {
        if (!entity) return {};
        meta = defaultsDeep(meta, {
            writeToDevice: true,
            postprocess: true,
        });
        const dbEntity = await this.retrieve(vaultId, entity.id!);
        return await new Promise((resolve, reject) => {
            this.database(vaultId).transaction(
                'rw',
                this.table(vaultId),
                async (trx: Transaction) => {
                    (trx as Transaction & { source: string }).source =
                        meta?.clientId
                            ? meta.clientId
                            : meta?.writeToDevice
                            ? this.clientId
                            : 'device';
                    await this.table(vaultId).delete(entity.id as string);
                    trx.on('complete', () => {
                        if (this.shouldWrite(vaultId, meta)) {
                            this.writer.delete(dbEntity!);
                        }
                        resolve(entity);
                    });
                    trx.on('error', err => {
                        console.log(err);
                        reject(err);
                    });
                },
            );
        });
    }

    async postprocessEntity(
        _vaultId: string,
        _entities: Partial<T>[],
        _meta?: Partial<IndexedDBMeta>,
    ) {}

    async initialProcessing(_vaultId: string) {}

    async *listPaginated(
        vaultId: string,
        pageId: string | null,
        pageSize?: number,
        filter?: (entity: T) => boolean,
    ) {
        let paginationId: string | null = pageId;
        let data = [];
        do {
            let query: any = this.table(vaultId);
            if (paginationId !== null) {
                query = query.where('id').above(paginationId);
            }
            if (filter) {
                query = query.filter(filter);
            }
            query = query.limit(pageSize ?? this.pageSize);
            data = await query.sortBy('id');
            const decryptedData = await this.encryption?.decryptData(
                vaultId,
                data ?? [],
            );
            yield decryptedData;
            paginationId = data[data.length - 1]?.id ?? null;
        } while (paginationId !== null && data.length);
        yield [];
    }

    async syncAllToDevice(
        vault: IVault,
        opts: { extension?: string } = {},
        reporter?: ProgressReporter,
    ) {
        const options = defaultsDeep(opts, { extension: '.md' });

        let paginationId: string | null = null;
        const register = new Set<string>();
        await this.table(vault.id)
            .toCollection()
            .filter(e => !!e.filepath)
            .each(e => {
                register.add(e.filepath);
            });
        let data = [];
        const count = await this.table(vault.id).count();
        reporter?.increaseTotal(count);
        const dataGenerator = this.listPaginated(vault.id, paginationId);
        let result: IteratorResult<any[]>;
        do {
            result = await dataGenerator.next();
            data = result.value as any[];
            data = await Promise.all(
                data.map(async (entity: any) => {
                    return {
                        ...entity,
                        filepath:
                            entity.filepath ??
                            (await this.createFilepathWithRegister(
                                entity,
                                vault,
                                register,
                                options.extension,
                            ).catch(e => {
                                console.log(e);
                                return null;
                            })),
                    } as any;
                }),
            );

            paginationId = data[data.length - 1]?.id ?? null;

            await this.saveBulk(vault.id, data, {
                updatedAt: false,
                postprocess: false,
                writeToDevice: true,
            }).catch(e => {
                console.log(e);
            });
            reporter?.progress(data.length);
        } while (!result.done && data.length);
        dataGenerator.return();
    }

    async encryptAllContent(vaultId: string, reporter?: ProgressReporter) {
        let paginationId = null;
        const vault = acreomVaultIndexedDB(vaultId);
        let data = [];
        if (!vault) return;

        const count = await this.table(vaultId).count();
        reporter?.increaseTotal(count);

        do {
            data = await this.list(vaultId, undefined, undefined, paginationId);
            paginationId = data[data.length - 1]?.id ?? null;
            await this.saveBulk(vaultId, data, {
                postprocess: false,
                writeToDevice: false,
                updatedAt: false,
                clientId: this.clientId,
            });
            reporter?.progress(data.length);
        } while (data.length > 0);
    }

    async decryptAllContent(vaultId: string) {
        let paginationId = null;
        const vault = acreomVaultIndexedDB(vaultId);
        let data = [];
        if (!vault) return;

        do {
            data = await this.list(vaultId, undefined, undefined, paginationId);
            paginationId = data[data.length - 1]?.id ?? null;
            await this.saveBulk(vaultId, data, {
                postprocess: false,
                writeToDevice: false,
                updatedAt: false,
                clientId: this.clientId,
            });
        } while (data.length > 0);
    }
}
