import { Table } from 'dexie';
import sanitizeFilename from 'sanitize-filename';
import { IUpdateChange } from 'dexie-observable/api';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase, IndexedDBMeta } from './base';
import { IFolder, IVault } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { IDocument } from '~/components/document/model';
import { FolderIO } from '~/workers/database/device/io/folder';
import { ContentWriter } from '~/workers/database/device/contentWriter';
import { NoOpParser } from '~/workers/database/device/parser/noop';
import { StorageType } from '~/workers/utils/parsers';
import { FolderEncryption } from '~/workers/database/encryption/folder';
import { FolderType, SearchIndex } from '~/constants';

export class ProjectsIndexedDB extends IndexedDBBase<IFolder> {
    shouldStoreLocally = true;
    protected platform: string;
    protected context: WorkerContext;
    protected entity: string = 'folder';
    protected parserIndex = StorageType.FOLDER;
    public searchIndex = SearchIndex.PROJECT;
    protected contentKey = 'name';

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.context = ctx;
        this.platform = ctx.$config.platform;
        this.writer = new ContentWriter<IFolder>(ctx, new FolderIO(ctx), {
            serialize: (entity: Partial<IFolder>) => {
                return entity as any;
            },
        });
        this.parser = new NoOpParser(ctx);
        this.encryption = new FolderEncryption(ctx);
    }

    table(vaultId: string): Table<IFolder, string> {
        return acreomVaultIndexedDB(vaultId).Projects;
    }

    initialIndexFilter(entities: IFolder[]) {
        return entities.filter((entity: IFolder) => {
            return entity.type === FolderType.PROJECT;
        });
    }

    indexChange(change: IUpdateChange) {
        return change?.obj?.type === FolderType.PROJECT;
    }

    async postprocessEntity(
        vaultId: string,
        entities: Partial<IFolder>[],
        meta?: Partial<IndexedDBMeta>,
    ): Promise<any> {
        if (meta?.clientId === 'device') return;
        await Promise.all(
            entities.map(async (changedProject: Partial<IFolder>) => {
                if (!changedProject.filepath) return null;
                const documents =
                    await this.context.$deviceService.Documents.list(
                        vaultId,
                    ).catch(() => []);
                const projects = await this.list(vaultId).catch(() => []);
                await Promise.all(
                    projects
                        .filter(
                            ({ parentId }) => parentId === changedProject.id,
                        )
                        .map(project => {
                            const filepath = this.updateFilepathAfterMove(
                                changedProject,
                                project,
                            );
                            return this.save(
                                vaultId,
                                { id: project.id, filepath },
                                {
                                    clientId: 'device',
                                    writeToDevice: false,
                                    postprocess: true,
                                    updatedAt: false,
                                },
                            ).catch(() => null);
                        }),
                );
                return Promise.all(
                    (documents as IDocument[])
                        .filter(
                            ({ projectId }) => projectId === changedProject.id,
                        )
                        .map(doc => {
                            const filepath = this.updateFilepathAfterMove(
                                changedProject,
                                doc,
                            );
                            return this.context.$deviceService.Documents.updateFilePath(
                                vaultId,
                                doc.id,
                                filepath,
                            ).catch(() => null);
                        }),
                );
            }),
        );
    }

    updateFilepathAfterMove(
        project: Partial<IFolder>,
        entity: any & { id: string; filepath: string },
    ) {
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const name =
            entity.filepath?.split(sep).pop() ??
            (entity.name || entity.title || entity.summary || entity.text);
        return [project.filepath, name].join(sep);
    }

    async createFilepathBase(
        project: Partial<IFolder>,
        changes: Partial<IFolder>,
        _writeToDevice: boolean,
        vault: IVault,
    ) {
        if (changes.filepath) {
            return changes.filepath;
        }
        if (!Object.keys(changes).some(v => ['name', 'parentId'].includes(v))) {
            return project.filepath!;
        }
        const mergedChanges = {
            ...project,
            ...changes,
        } as Partial<IFolder>;
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const vaultPath = vault?.filepath || `${sep}${vault?.name}`;
        const DEFAULT_NAME =
            project.type === FolderType.PROJECT ? 'New Project' : 'New Folder';
        let folderName = DEFAULT_NAME;

        if (!Object.keys(changes).includes('name') && project && project.name) {
            folderName = project.name || DEFAULT_NAME;
        } else if (Object.keys(changes).includes('name')) {
            folderName = changes.name || DEFAULT_NAME;
        }

        const sanitizedProjectName = sanitizeFilename(folderName);
        let parentFilepath = vaultPath;
        if (mergedChanges.parentId) {
            const project = await this.context.$deviceService.Projects.retrieve(
                mergedChanges.vaultId!,
                mergedChanges.parentId,
            );
            parentFilepath = project?.filepath ?? vaultPath;
        }

        return [parentFilepath, sanitizedProjectName].join(sep);
    }

    async createFilePath(
        entity: Partial<IFolder>,
        changes: Partial<IFolder>,
        writeToDevice: boolean,
        vault: IVault,
        register: Set<string> = new Set(),
    ): Promise<any> {
        const oldFilepath = changes.filepath || entity?.filepath;
        const filepathBase = await this.createFilepathBase(
            entity,
            changes,
            writeToDevice,
            vault,
        );
        return this.getAvailableFilepath(
            filepathBase,
            oldFilepath!,
            register,
            '',
        );
    }

    shouldUpdateOnDevice(entity: Partial<IDocument>): boolean {
        const keys = Object.keys(entity);
        const updateIfKeyPresent = ['parentId', 'name', 'properties'];
        return keys.some(key => updateIfKeyPresent.includes(key));
    }

    async save(
        vaultId: string,
        entity: Partial<IFolder>,
        meta?: Partial<IndexedDBMeta>,
    ): Promise<Partial<IFolder>> {
        const _entity = await super.save(vaultId, entity, {
            ...meta,
            postprocess: false,
        });

        if (entity.filepath || entity.parentId || entity.name) {
            this.postprocessEntity(vaultId, [entity], meta);
        }

        return _entity;
    }

    async archive(
        vaultId: string,
        entity: Partial<IFolder>,
        meta: IndexedDBMeta = { writeToDevice: true },
    ): Promise<Partial<IFolder>> {
        if (!entity) return entity;
        await super.delete(vaultId, entity, meta);

        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );

        if (!vault) return entity;

        const documents = await this.context.$deviceService.Documents.list(
            vaultId,
        ).catch(() => []);
        const projects = await this.list(vaultId).catch(() => []);

        const ids = (documents as IDocument[])
            .filter(({ projectId }) => projectId === entity.id)
            .map(({ id, projectId }) => ({
                id,
                projectId,
            }));

        this.context.$deviceService.Documents.saveBulk(
            vaultId,
            ids.map(({ id }) => ({
                id,
                projectId: null,
                archived: true,
            })),
            { writeToDevice: true, clientId: '*' },
        ).catch(() => null);

        projects
            .filter(({ parentId }) => parentId === entity.id)
            .forEach(project => {
                this.archive(vaultId, project, {
                    writeToDevice: true,
                }).catch(() => null);
            });

        return entity;
    }

    async delete(
        vaultId: string,
        entity: Partial<IFolder>,
        meta: IndexedDBMeta = { writeToDevice: true },
    ): Promise<Partial<IFolder>> {
        if (!entity) return entity;
        await super.delete(vaultId, entity, meta);

        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );

        if (!vault) return entity;

        const documents = await this.context.$deviceService.Documents.list(
            vaultId,
        ).catch(() => []);
        const projects = await this.list(vaultId).catch(() => []);

        const ids = (documents as IDocument[])
            .filter(({ projectId }) => projectId === entity.id)
            .map(({ id, projectId }) => ({
                id,
                projectId,
            }));

        this.context.$deviceService.Documents.deleteBulk(vaultId, ids, {
            postprocess: false,
            writeToDevice: true,
            clientId: '*',
        }).catch(() => null);

        projects
            .filter(({ parentId }) => parentId === entity.id)
            .forEach(project => {
                this.delete(vaultId, project, {
                    writeToDevice: false,
                }).catch(() => null);
            });

        return entity;
    }

    async *listPaginated(
        vaultId: string,
    ): AsyncGenerator<any[], void, unknown> {
        const queue = ['null'];
        const dbData = await this.table(vaultId).toArray();
        const data = await this.encryption?.decryptData(vaultId, dbData ?? []);
        const projects = data.reduce((acc, project) => {
            const parentId = project.parentId ?? 'null';
            if (!acc[parentId]) {
                acc[parentId] = [];
            }
            acc[parentId].push(project);
            return acc;
        }, {} as Record<string, IFolder[]>);

        for (const key of queue) {
            const children = projects[key] ?? [];
            if (!children.length) continue;
            queue.push(...children.map(({ id }) => id));
            yield children;
        }
        yield [];
    }
}
