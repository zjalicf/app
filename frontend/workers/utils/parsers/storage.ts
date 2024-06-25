import { WorkerContext } from '~/@types/app';
import { ImageObject } from '~/@types';

export enum StorageType {
    USER = 'user',
    TASK = 'task',
    LABEL = 'label',
    FOLDER = 'folder',
    IMAGE = 'image',
    DEVICE_MEDIA = 'device_media',
    DOCUMENT = 'document',
    EVENT = 'event',
    VAULT = 'vault',
    INTEGRATION_DATA = 'integration_data',
    UNKNOWN = 'unknown',
}

interface Storage {
    getById(vaultId: string, type: StorageType, id: string): any;
    getByIndex(vaultId: string, type: StorageType, filepath: string): string[];
    getByFilepath(vaultId: string, type: StorageType, filepath: string): string;
    getLeastCommonPath(
        vaultId: string,
        type: StorageType,
        filepath: string,
    ): string;
    listByIds(vaultId: string, type: StorageType, ids: string[]): any[];
    set(vaultId: string, type: StorageType, entities: any): void;
    delete(vaultId: string, type: StorageType, entities: any): void;
}

export class EntityStorage implements Storage {
    config: WorkerContext['$config'];
    entities: Record<
        StorageType | string,
        Record<string, Record<string, any>>
    > = Object.values(StorageType).reduce((acc, key) => {
        acc[key] = {};
        return acc;
    }, {} as Record<StorageType | string, Record<string, Record<string, any>>>);

    filepathToEntityId: Record<string, Record<string, string>> = {};
    indexes: Record<StorageType | string, Record<string, CompressedTrie>> =
        Object.values(StorageType).reduce((acc, key) => {
            acc[key] = {};
            return acc;
        }, {} as Record<StorageType | string, Record<string, CompressedTrie>>);

    parserStorage = Object.values(StorageType).reduce((acc, key) => {
        acc[key] = {};
        return acc;
    }, {} as Record<StorageType | string, Record<string, any[]>>);

    constructor(config: WorkerContext['$config']) {
        this.config = config;
    }

    get sep() {
        return this.config.os === 'windows' ? '\\' : '/';
    }

    getById(vaultId: string, type: StorageType, id: string): any {
        return this.entities?.[type]?.[vaultId]?.[id] ?? null;
    }

    getByIndex(
        vaultId: string,
        type: StorageType,
        filepath: string,
        shouldSplit = true,
    ): string[] {
        const entityIds =
            this.indexes[type][vaultId]?.find(filepath, shouldSplit) ?? [];
        return (
            entityIds
                .map(id => this.entities[type][vaultId]?.[id])
                .filter(e => !!e) ?? []
        );
    }

    getByFilepath(
        vaultId: string,
        type: StorageType,
        filepath: string,
    ): string {
        const id = this.filepathToEntityId[vaultId]?.[filepath];
        return this.entities[type][vaultId]?.[id];
    }

    getLeastCommonPath(
        vaultId: string,
        type: StorageType,
        filepath: string,
    ): string {
        return this.indexes[type][vaultId]?.findSingle(filepath) ?? '';
    }

    listByIds(vaultId: string, type: StorageType, ids: string[]): any[] {
        if (!this.entities[type][vaultId]) return [];
        return ids.map(id => this.entities[type][vaultId]?.[id]);
    }

    set(vaultId: string, type: StorageType, entities: any): void {
        if (!this.entities[type as StorageType]) return;
        if (!this.entities[type as StorageType][vaultId]) {
            this.entities[type as StorageType][vaultId] = {};
        }
        if (!this.indexes[type as StorageType][vaultId]) {
            this.indexes[type as StorageType][vaultId] = new CompressedTrie(
                this.sep,
            );
        }
        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        for (const entity of entities) {
            this.entities[type][vaultId][entity.id] = entity;
            if (type === StorageType.IMAGE && entity.remoteUri) {
                this.indexes[type as StorageType][vaultId].add(
                    (entity as ImageObject).remoteUri!,
                    entity.id,
                    false,
                );
            }
            if (!entity.filepath) {
                entity.filepath = entity.title ?? entity.text ?? entity.summary;
            }

            this.indexes[type as StorageType][vaultId].add(
                entity.filepath,
                entity.id,
            );

            if (!this.filepathToEntityId[vaultId]) {
                this.filepathToEntityId[vaultId] = {};
            }
            this.filepathToEntityId[vaultId][entity.filepath] = entity.id;
        }
    }

    save(vaultId: string, type: StorageType, entity: any): void {
        if (!this.parserStorage[type][vaultId]) {
            this.parserStorage[type][vaultId] = [];
        }
        this.parserStorage[type][vaultId].push(entity);
    }

    findInParserStorage(
        vaultId: string,
        type: StorageType,
        fn: (...args: any) => boolean,
    ): any {
        return this.parserStorage[type][vaultId]?.find(fn);
    }

    listParserStorage(type: StorageType): Record<string, any[]> {
        return this.parserStorage[type];
    }

    clearParserStorage(vaultId: string, type: StorageType): void {
        delete this.parserStorage[type][vaultId];
    }

    delete(vaultId: string, type: StorageType, entities: any): void {
        if (!this.entities[type as StorageType]) return;
        if (type === StorageType.VAULT) {
            Object.values(StorageType).forEach(key => {
                delete this.entities?.[key]?.[vaultId];
                delete this.indexes?.[key]?.[vaultId];
            });
            delete this.filepathToEntityId[vaultId];
            return;
        }

        if (!this.entities[type as StorageType][vaultId]) return;
        if (!Array.isArray(entities)) {
            entities = [entities];
        }
        for (const entity of entities) {
            delete this.entities[entity.type as StorageType][vaultId][
                entity.id
            ];
            delete this.filepathToEntityId[vaultId][entity.filepath];
        }
    }
}

class CompressedTrie {
    trie: Record<string, any> = {};
    sep: string = '/';

    constructor(sep: string) {
        this.sep = sep;
    }

    add(filepath: string, id: string, shouldSplit = true) {
        if (!filepath) return;
        let parts = [filepath];
        if (shouldSplit) {
            parts = filepath.split(this.sep).reverse();
        }
        let current = this.trie;
        for (const part of parts) {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
            if (!current.node_ids) {
                current.node_ids = new Set<string>();
            }
            current.node_ids.add(id);
        }
    }

    remove(filepath: string, id: string) {
        const parts = filepath.split(this.sep).reverse();
        let current = this.trie;
        for (const part of parts) {
            if (!current[part]) {
                return;
            }
            current = current[part];
        }
        if (!current.ids) {
            return;
        }
        current.ids.delete(id);
    }

    find(filepath: string, shouldSplit = true): string[] {
        let parts = [filepath];
        if (shouldSplit) {
            parts = filepath.split(this.sep).reverse();
        }
        let current = this.trie;
        for (const part of parts) {
            if (!part.length) continue;
            if (!current[part]) {
                return [];
            }
            current = current[part];
        }
        if (!current?.node_ids) {
            return [];
        }
        return [...current.node_ids?.values()];
    }

    findSingle(filepath: string): string {
        const parts = filepath.split(this.sep).reverse();
        let current = this.trie;
        const path = [];
        for (const part of parts) {
            path.push(part);
            if (!part.length) continue;
            if (current?.node_ids?.size === 1) {
                path.pop();
                return path.reverse().join(this.sep);
            }
            if (!current[part]) {
                return path.reverse().join(this.sep);
            }
            current = current[part];
        }
        return path.reverse().join(this.sep);
    }
}
