import { defaultsDeep, differenceBy } from 'lodash';
import { v4 } from 'uuid';
import { Importer } from '~/workers/database/device/importer/interface';
import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { WorkerContext } from '~/@types/app';
import { FileType, ServiceKey, UtilActions } from '~/constants';

import { IEvent, IVault, WEntity, ListDirent } from '~/@types';
import { ContentLoader } from '~/workers/database/device/importer/loader';
import { StorageType } from '~/workers/utils/parsers/storage';
import {
    ImporterEvents,
    ProgressReporter,
} from '~/workers/database/reporter/interface';
import {
    checkMap,
    setParentId,
    updateIds,
} from '~/workers/database/device/importer/helpers';
import { DeviceReporter } from '~/workers/database/reporter';

export interface Storage {
    retrieve(vaultId: string, id: string): Promise<any>;
    list(vaultId: string, query?: any, filter?: any): Promise<any[]>;

    listByFilepath(vaultId: string, filepaths: string[]): Promise<any[]>;

    saveBulk(vaultId: string, entities: any[], options?: any): Promise<any>;

    deleteBulk(vaultId: string, entities: any[], options?: any): Promise<any>;

    deserializeWriterEntity(writerEntity: WEntity): any;
}

export interface StorageFactory {
    resolve(type: string): Storage;
}

type ImporterConfig = {
    copy: boolean;
    batchSize: number;
    sep: string;
    myDayFolder: string;
    rootParentId: string | null;
};

export class FileImporter implements Importer {
    vault: IVault;
    context: WorkerContext;
    loader: ContentLoader;
    parser: ContentParser;
    dbFactory: StorageFactory;
    config: ImporterConfig;
    reporter: DeviceReporter;

    constructor(
        vault: IVault,
        ctx: WorkerContext,
        loader: ContentLoader,
        parser: ContentParser,
        db: StorageFactory,
        reporter: DeviceReporter,
        config: Partial<ImporterConfig> = {},
    ) {
        this.config = defaultsDeep(config, {
            copy: false,
            batchSize: 50,
            sep: ctx.$config.os === 'windows' ? '\\' : '/',
            myDayFolder: 'My Day',
            rootParentId: null,
        });
        this.reporter = reporter;
        this.vault = vault;
        this.context = ctx;
        this.loader = loader;
        this.parser = parser;
        this.dbFactory = db;
        this.reporter.on(ImporterEvents.COMPLETE, () => {
            this.loader.done();
        });
    }

    /*
    check if content is dir or file
    if dir:
        add all fielpaths in dir recuresively to filepaths
    if file:
        add filepath to filepaths

    for each filepath:
        resolve type
        load content
        parse content

    for each content type:
        save content

    TODO:
    1. Progress reporting
    2. Error handling
    3. Cancelation
*/

    get vaultId() {
        return this.vault.id;
    }

    /*
     filepath
            .../parent/name.md
            .../parent/dir

    root filepath => ...parent

    const rootFilepath = filepath.split(sep).slice(0, -1).join(sep)
     */

    get sep() {
        return this.config.sep;
    }

    async importUsingFilepath(
        filepath: string,
        options: Partial<ImporterConfig> = {},
    ): Promise<void> {
        this.loader.start();
        this.reporter.start();
        const importOptions = defaultsDeep(options, this.config);
        let rootFilepath: string | null = filepath
            .split(this.sep)
            .slice(0, -1)
            .join(this.sep);

        if (filepath === this.vault.filepath) {
            rootFilepath = null;
        }

        let filepaths: ListDirent[] = [
            {
                id: v4(),
                filepath,
                vaultId: this.vaultId,
                rootPath: rootFilepath,
            } as any,
        ];

        const isDir = await this.loader.isDir(filepath);
        if (isDir) {
            const dirFilepaths = await this.loader.listDir(
                filepath,
                importOptions,
            );
            filepaths = dirFilepaths.map(dirFilepath => ({
                ...dirFilepath,
                vaultId: this.vaultId,
                rootPath: filepath,
            }));
        }

        await this._importFilepaths(filepaths, importOptions);
        this.loader.done();
        this.reporter.done();
    }

    async importUsingMultipleFilepaths(
        filepaths: string[],
        options: Partial<ImporterConfig> = {},
    ): Promise<void> {
        this.loader.start();
        this.reporter.start();
        const importOptions = defaultsDeep(options, this.config);
        const importableFilepaths = [];
        for (const filepath of filepaths) {
            const rootFilepath = filepath
                .split(this.sep)
                .slice(0, -1)
                .join(this.sep);
            const isBlacklisted = this.loader.isBlacklisted(filepath);
            const isDir = await this.loader.isDir(filepath);
            const listDirEntry = await this.loader.parseFilepath(filepath);
            if (!isBlacklisted) {
                importableFilepaths.push({
                    ...listDirEntry,
                    parentId: null,
                    rootPath: rootFilepath,
                });
            }
            if (!isDir) continue;

            const dirFilepaths = await this.loader.listDir(
                filepath,
                importOptions,
            );
            importableFilepaths.push(
                ...dirFilepaths.map(dirFilepath => ({
                    ...dirFilepath,
                    vaultId: this.vaultId,
                    parentId:
                        dirFilepath.parentId === null
                            ? listDirEntry.id
                            : dirFilepath.parentId,
                    rootPath: rootFilepath,
                })),
            );
        }

        await this._importFilepaths(importableFilepaths, importOptions);
        this.loader.done();
        this.reporter.done();
    }

    importUsingContent(_content: string, _options?: any): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async importChanges(vault: IVault) {
        if (!vault.filepath) return;
        this.loader.start();
        this.reporter.start();
        const { importableFilepaths, missingEntities } =
            await this.getImportableFilepaths(vault);

        await Promise.all([
            this.deleteMissingEntities(missingEntities),
            this._importFilepaths(importableFilepaths),
        ]);

        this.loader.done();
        this.reporter.done();
    }

    async deleteMissingEntities(entities: any[]) {
        this.reporter.progress(0, entities.length);

        const groupedByType = entities.reduce((acc, entity) => {
            let type = this.loader.resolveType(entity.filepath ?? '');
            if (type === StorageType.UNKNOWN && entity.isDirectory) {
                type = StorageType.FOLDER;
            }
            type = entity.kind ?? type;
            acc[type] = acc[type] || [];
            acc[type].push(entity);
            return acc;
        }, {});

        await Promise.all(
            Object.keys(groupedByType).map(async type => {
                const storage = this.dbFactory.resolve(type);
                const groupEntities = groupedByType[type];
                await storage.deleteBulk(this.vaultId, groupEntities);
                this.reporter.progress(groupEntities.length);
            }),
        );
    }

    // this is used in watcher
    public async importFilepaths(files: ListDirent[], options?: any) {
        const config = defaultsDeep(options, this.config);
        this.loader.start();
        this.reporter.start();

        await this._importFilepaths(files, config);
        this.loader.done();
        this.reporter.done();
    }

    public async _importFilepaths(
        files: ListDirent[],
        options: Partial<ImporterConfig> = {},
    ): Promise<void> {
        const total = files.length;
        const dirs = files.filter(({ isDirectory }) => isDirectory);
        const filepaths = files.filter(
            ({ isFile, filetype }) => isFile && filetype === FileType.MARKDOWN,
        );

        const attachments = files
            .filter(
                ({ isFile, filetype }) =>
                    isFile && filetype === FileType.ATTACHMENT,
            )
            .map(entry =>
                this.normalizeIndexPath(
                    { ...entry, originalFilepath: entry.filepath },
                    options,
                ),
            );

        const documents = filepaths.filter(
            ({ dir }) => !dir.endsWith('.tasks') && !dir.endsWith('.events'),
        );
        const importTotal = dirs.length + documents.length;

        const totalUnsupported = total - attachments.length - importTotal;

        const unsupportedData = differenceBy(
            files,
            [...dirs, ...documents, ...attachments],
            'id',
        );

        this.reporter.progress(0, importTotal);
        this.reporter.increaseUnsupported(totalUnsupported);
        this.reporter.addData(unsupportedData);

        await Promise.all([
            this.context.invoke(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                vaultId: this.vaultId,
                type: StorageType.FOLDER,
                entity: dirs.map(entry =>
                    this.normalizeIndexPath(entry, options),
                ),
                callerContext: '_importFilepaths folder',
            }),
            this.context.invoke(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                vaultId: this.vaultId,
                type: StorageType.DOCUMENT,
                entity: documents.map(entry =>
                    this.normalizeIndexPath(entry, options),
                ),
                callerContext: '_importFilepaths document',
            }),
            this.context.invoke(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
                vaultId: this.vaultId,
                type: StorageType.DEVICE_MEDIA,
                entity: attachments,
                callerContext: '_importFilepaths attachment',
            }),
        ]);

        // handle loading folders
        if (dirs.length) {
            await this.importFolders(dirs, options);
            this.reporter.progress(dirs.length);
        }
        if (attachments.length && this.vault.filepath) {
            await this.importAttachments(attachments, options);
        }
        // handle loading files
        const chunks = this.makeChunks(filepaths, options.batchSize);
        for (const chunk of chunks) {
            const contents = await this.loader.readBatch(chunk as any[]);

            const parserEntities = await this.parser.parseBatch(
                this.vaultId,
                contents as PartialParserEntity[],
            );

            const entitiesWithParsedContent = contents.map(
                (content: WEntity, index: number) =>
                    ({
                        ...content,
                        ...chunk[index],
                        mdContent: content.content,
                        content: parserEntities[index],
                    } as WEntity),
            );
            const entities = this.deserializeEntities(
                entitiesWithParsedContent,
            );

            await this.saveEntities(entities, options);
            this.reporter.progress(chunk.length);
        }
    }

    private async importFolders(
        dirs: ListDirent[],
        options?: any,
    ): Promise<void> {
        const folders = dirs.map(
            ({
                id,
                filepath,
                name,
                parentId,
                order,
                createdAt,
                updatedAt,
                properties,
            }) => {
                const entry = {
                    id,
                    parentId,
                    name,
                    order,
                    filepath: options.copy ? undefined : filepath,
                    createdAt: new Date(createdAt),
                    updatedAt: new Date(updatedAt),
                    type: 'folder',
                    vaultId: this.vaultId,
                };
                if (properties) {
                    if (properties.type === 'project') {
                        entry.type = 'project';
                    }
                    if (properties.icon) {
                        // @ts-ignore
                        entry.icon = properties.icon;
                    }
                    // @ts-ignore
                    entry.properties = properties;
                }
                return entry;
            },
        );
        const queue: (string | null)[] = [null];

        for (const id of queue) {
            const children = folders.filter(folder => folder.parentId === id);
            if (!children.length) continue;

            queue.push(...children.map(({ id }) => id));
            await this.dbFactory
                .resolve('folder')
                .saveBulk(this.vaultId, children, {
                    writeToDevice: options.copy,
                    clientId: options.copy ? 'importer' : 'device',
                });
        }

        await this.dbFactory.resolve('folder').saveBulk(this.vaultId, folders, {
            writeToDevice: options.copy,
            clientId: 'device',
        });
    }

    private async importAttachments(attachments: ListDirent[], _options: any) {
        await this.context.invoke(
            ServiceKey.DEVICE,
            'attachment:copy',
            attachments
                .map(({ filepath, originalFilepath }) => ({
                    to: filepath,
                    from: originalFilepath,
                }))
                .filter(({ to, from }) => to !== from),
        );
    }

    private async getImportableFilepaths(vault: IVault) {
        const dirFilepaths = await this.loader.listDir(
            vault.filepath!,
            this.config,
        );
        const { document, folder } = await this.getExistingData(vault);
        const filepaths = dirFilepaths.map(dirFilepath => {
            if (!dirFilepath.isDirectory) {
                const existingDocument = document.map[dirFilepath.filepath];
                return {
                    ...dirFilepath,
                    order: existingDocument?.order ?? dirFilepath?.order,
                    vaultId: this.vaultId,
                };
            }

            const existingFolder = folder.map[dirFilepath.filepath];
            const entry = {
                ...dirFilepath,
                vaultId: this.vaultId,
                order: existingFolder?.order ?? dirFilepath?.order,
                parentId: existingFolder?.parentId ?? dirFilepath.parentId,
                id: existingFolder?.id ?? dirFilepath.id,
            };

            const properties =
                existingFolder?.properties ?? dirFilepath.properties;
            if (!properties) return entry;

            entry.properties = properties;
            if (properties.type === 'project') {
                // @ts-ignore
                entry.type = 'project';
            }
            if (properties.icon) {
                // @ts-ignore
                entry.icon = properties.icon;
            }
            return entry;
        });

        const existingEntities = [
            ...document.array.map(e => ({ ...e, kind: 'document' })),
            ...folder.array.map(e => ({ ...e, kind: 'folder' })),
        ];
        const missingEntities = this.getMissingFilepaths(
            existingEntities,
            filepaths,
        );
        const importableFilepaths = this.getUpdatedFilepaths(
            filepaths,
            folder,
            document,
        );

        return { importableFilepaths, missingEntities };
    }

    public getUpdatedFilepaths(
        filepaths: ListDirent[],
        folder: any,
        document: any,
    ): ListDirent[] {
        const getMapByType = (type: string) => {
            switch (type) {
                case StorageType.DOCUMENT:
                    return document.map;
                default:
                    return null;
            }
        };

        return filepaths
            .map(dirent => setParentId(dirent, folder.map))
            .filter(dirent => {
                if (dirent.isDirectory) {
                    return checkMap(folder.map, dirent);
                }
                const type = this.loader.resolveType(dirent.filepath);
                const map = getMapByType(type);
                if (!map) return false;
                return checkMap(map, dirent);
            })
            .map(dirent => {
                const type = this.loader.resolveType(dirent.filepath);
                if (dirent.isDirectory) {
                    return updateIds(dirent, folder.map, folder.map, type);
                }
                const map = getMapByType(type);
                if (!map) return null;
                return updateIds(dirent, map, folder.map, type);
            })
            .filter(v => !!v) as ListDirent[];
    }

    private getMissingFilepaths(
        dbEntities: any[],
        localFilepaths: ListDirent[],
    ) {
        const existingFilepaths = localFilepaths.reduce((acc, val) => {
            acc.add(val.filepath);
            return acc;
        }, new Set<string>());
        return dbEntities.filter(
            ({ filepath }) => !existingFilepaths.has(filepath),
        );
    }

    private normalizeIndexPath(entry: any, options: any) {
        if (entry.rootPath) {
            const vaultFilepath = entry.filepath.replace(
                entry.rootPath,
                this.vault.filepath ?? '',
            );
            return {
                ...entry,
                filepath: vaultFilepath,
            };
        }
        return entry;
    }

    private async getExistingData(vault: IVault) {
        const [existingDocuments, existingFolders] = await Promise.all([
            this.dbFactory.resolve('document').list(vault.id),
            this.dbFactory.resolve('folder').list(vault.id),
        ]);
        const documentMap = existingDocuments.reduce((acc, doc) => {
            acc[doc.filepath] = doc;
            return acc;
        }, {});
        const folderMap = existingFolders.reduce((acc, folder) => {
            acc[folder.filepath] = folder;
            return acc;
        }, {});

        return {
            document: {
                map: documentMap,
                array: existingDocuments,
            },
            folder: {
                map: folderMap,
                array: existingFolders,
            },
        };
    }

    private makeChunks(
        filepaths: ListDirent[],
        chunkSize = 50,
    ): ListDirent[][] {
        return filepaths.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / chunkSize);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []; // start a new chunk
            }

            resultArray[chunkIndex].push(item);

            return resultArray;
        }, [] as ListDirent[][]);
    }

    private resolveType(entity: WEntity): string {
        return entity.metadata?.kind || entity.kind;
    }

    private deserializeEntities(entities: WEntity[]): Record<string, any[]> {
        return entities.reduce(
            (acc: Record<string, any[]>, writerEntity: WEntity) => {
                const type = this.resolveType(writerEntity);
                const db = this.dbFactory.resolve(type);
                acc[type] = acc[type] || [];
                const deserializedEntity =
                    db.deserializeWriterEntity(writerEntity);
                acc[type].push(deserializedEntity);
                return acc;
            },
            {} as Record<string, any[]>,
        );
    }

    private async saveEntities(
        entities: Record<string, any[]>,
        options?: any,
    ): Promise<void> {
        const savePromises = Object.keys(entities).map(type => {
            const storage = this.dbFactory.resolve(type);
            return storage
                .saveBulk(
                    this.vaultId,
                    entities[type].map(e => ({
                        ...e,
                        vaultId: this.vaultId,
                        filepath: options.copy ? undefined : e.filepath,
                    })),
                    {
                        writeToDevice: options.copy,
                        clientId: options.copy ? 'importer' : 'device',
                    },
                )
                .catch(e => console.error(e));
        });
        await Promise.all(savePromises);
    }
}
