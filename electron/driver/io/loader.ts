import { readdir, stat } from 'fs/promises';
import { join, parse } from 'path';
import { v4 } from 'uuid';
import { IFolder } from '../../../frontend/@types';

export async function* loadVault(
    vaultId: string,
    vaultPath: string,
): AsyncGenerator<{
    requestId: string;
    type: 'folder' | 'document' | 'documentMap' | 'done';
    folders?: any[];
    documents?: any[];
    tasks?: any[];
    events?: any[];
}> {
    const requestId = v4();

    const appFolders = await loadFolders(vaultId, vaultPath);
    yield { requestId, type: 'folder', folders: appFolders };

    const documentMap = await loadDocumentMap(
        vaultId,
        [
            { id: null, filepath: join(vaultPath, '.trash'), type: 'trash' },
            { id: null, filepath: join(vaultPath, '.tasks'), type: 'tasks' },
            { id: null, filepath: join(vaultPath, '.events'), type: 'events' },
            { id: null, filepath: join(vaultPath, 'My Day'), type: 'my day' },
            { id: null, filepath: vaultPath },
            ...appFolders,
        ],
        { includeUpdatedAt: true },
    );
    yield {
        requestId,
        type: 'documentMap',
        documents: documentMap.documents.sort((a, b) => {
            if (a.filepath < b.filepath) return -1;
            if (a.filepath > b.filepath) return 1;
            return 0;
        }),
        events: documentMap.events.sort((a, b) => {
            if (a.filepath < b.filepath) return -1;
            if (a.filepath > b.filepath) return 1;
            return 0;
        }),
        tasks: documentMap.tasks.sort((a, b) => {
            if (a.filepath < b.filepath) return -1;
            if (a.filepath > b.filepath) return 1;
            return 0;
        }),
    };
}

export const loadVaultDiff = async (vaultId: string, vaultPath: string) => {
    const appFolders = await loadFolders(vaultId, vaultPath);
    const documentMap = await loadDocumentMap(
        vaultId,
        [
            { id: null, filepath: join(vaultPath, '.trash'), type: 'trash' },
            { id: null, filepath: join(vaultPath, '.tasks'), type: 'tasks' },
            { id: null, filepath: join(vaultPath, 'My Day'), type: 'my day' },
            { id: null, filepath: vaultPath },
            ...appFolders,
        ],
        { includeUpdatedAt: true },
    );

    return {
        folders: appFolders,
        ...documentMap,
    };
};

const loadFolders = async (
    vaultId: string,
    path: string,
): Promise<Partial<IFolder>[]> => {
    const queue = [];
    const dirents = await readdir(path, { withFileTypes: true });
    const vaultFolders = dirents
        .filter(
            entry =>
                entry.isDirectory() &&
                !['My Day'].includes(entry.name) &&
                !entry.name.startsWith('.'),
        )
        .map(({ name }, index) => ({
            id: v4(),
            parentId: null,
            name,
            type: 'folder',
            filepath: join(path, name),
            order: index,
            createdAt: new Date(),
            updatedAt: new Date(),
        })) as Partial<IFolder>[];
    queue.push(...vaultFolders);

    const loadStructure = async (): Promise<Partial<IFolder>[]> => {
        const dirpath = queue.shift();
        const dirents = await readdir(dirpath.filepath, {
            withFileTypes: true,
        });
        return dirents
            .filter(entry => entry.isDirectory())
            .map(({ name }, index) => ({
                id: v4(),
                parentId: dirpath.id,
                name,
                type: 'folder',
                filepath: join(dirpath.filepath, name),
                dir: dirpath.filepath,
                order: index,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
    };

    while (queue.length > 0) {
        const folders = await loadStructure();
        queue.push(...folders);
        vaultFolders.push(...folders);
    }

    return vaultFolders;
};

const loadDocumentMap = async (
    vaultId: string,
    folders: Partial<IFolder & { isMyDay: boolean }>[],
    meta: { includeUpdatedAt: boolean } = { includeUpdatedAt: false },
): Promise<{ documents: any[]; events: any[]; tasks: any[] }> => {
    const documents = [];
    const events = [];
    const tasks = [];
    let parser = (entry: any, filepath: string): Record<string, any> => ({});
    let output = [];
    for (const folder of folders) {
        const dirents = await readdir(folder.filepath, {
            withFileTypes: true,
        }).catch(() => []);

        switch (folder.type) {
            case 'events':
                parser = (
                    entry: any,
                    filepath: string,
                ): Record<string, any> => {
                    return {
                        metadata: {
                            id: v4(),
                            vaultId,
                            summary: parse(entry.name).name,
                        },
                        type: folder.type,
                        vaultId,
                        filepath,
                    } as any;
                };
                output = events;
                break;
            case 'tasks':
                parser = (
                    entry: any,
                    filepath: string,
                ): Record<string, any> => {
                    return {
                        metadata: {
                            id: v4(),
                            vaultId,
                            text: parse(entry.name).name,
                        },
                        type: folder.type,
                        vaultId,
                        filepath,
                    } as any;
                };
                output = tasks;
                break;
            case 'folder':
            case 'document':
            case 'my day':
                parser = (
                    entry: any,
                    filepath: string,
                ): Record<string, any> => {
                    const title = parse(entry.name).name;
                    const dir = parse(filepath).dir;

                    return {
                        metadata: {
                            id: v4(),
                            vaultId,
                            title: parse(entry.name).name,
                            dailyDoc: folder.type === 'my day' ? title : null,
                            projectId: folder.id,
                            archived: folder.type === 'trash',
                        },
                        type: 'document',
                        vaultId,
                        dir,
                        filepath,
                    } as any;
                };
                output = documents;
                break;
            default:
                parser = (
                    entry: any,
                    filepath: string,
                ): Record<string, any> => {
                    const title = parse(entry.name).name;
                    const dir = parse(filepath).dir;

                    return {
                        metadata: {
                            id: v4(),
                            vaultId,
                            title: parse(entry.name).name,
                            dailyDoc: folder.type === 'my day' ? title : null,
                            projectId: folder.id,
                            archived: folder.type === 'trash',
                        },
                        type: folder.type ?? 'document',
                        vaultId,
                        dir,
                        filepath,
                    } as any;
                };
                output = documents;
        }

        await Promise.all(
            dirents
                .filter(
                    entry => entry.isFile() && parse(entry.name).ext === '.md',
                )
                .map(async entry => {
                    return parseEntity(
                        vaultId,
                        entry,
                        folder.filepath,
                        meta,
                        parser,
                        output,
                    );
                }),
        );
    }

    return { documents, events, tasks };
};

const parseEntity = async (
    vaultId: string,
    entry: any,
    folderFilepath: string,
    meta: { includeUpdatedAt: boolean } = { includeUpdatedAt: false },
    parser: (entry: any, filepath: string) => Record<string, any>,
    output: any[],
) => {
    const filepath = join(folderFilepath, entry.name);
    const payload = parser(entry, filepath);

    if (meta.includeUpdatedAt) {
        const stats = await stat(filepath);
        payload.createdAt = stats.birthtime;
        payload.updatedAt = stats.mtime;
    }
    output.push(payload);
};
