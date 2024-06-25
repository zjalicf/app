import { Stats } from 'fs';
import { parse } from 'path';
import { readdir } from 'fs/promises';
import * as chokidar from 'chokidar';
import { v4 } from 'uuid';
import { appWindows } from '../../app';
import { sendMessage } from '../messaging';
import { FileType, resolveFileType } from '../../helpers';
import { isRename } from './writeMap';
import { changeRegister } from './register';

const PROCESS_DELAY = 100;
const DELETE_TIMEOUT = 2000;
type WatchEvent = {
    event: string;
    entity: 'document' | 'folder' | 'attachment' | 'vault' | 'config';
    path: string;
    data: Record<string, any>;
};

const mediaMap: Record<
    string,
    {
        path: string;
        iNode: number;
        birthtime: number;
    }
> = {};

const configMap: Record<
    string,
    {
        path: string;
        iNode: number;
        birthtime: number;
    }
> = {};
export const getMediaMap = () => {
    return mediaMap;
};

const sendWatchBatch = (payload: WatchEvent[]) => {
    sendMessage(appWindows.main.webContents, `file-watcher-batch`, payload);
};

export class FileWatcher {
    private eventQueue = { lastWrite: 0, queue: [] as WatchEvent[] };
    private processQueueTimeout: any = 0;
    private fileMap: Record<
        string,
        {
            path: string;
            iNode: number;
            birthtime: number;
            isFile: boolean;
            isDirectory: boolean;
        }
    > = {};

    private deleted = false;

    private renames: Record<string, number> = {};
    private isReady = false;
    private blacklist = [
        '.DS_Store',
        '.git',
        '.obsidian',
        '.trash',
        '.tasks',
        '.events',
        'My Day',
    ];

    private watcher: chokidar.FSWatcher | null = null;
    private readonly vaultId: string;
    private readonly path: string;

    constructor(vaultId: string, path: string) {
        this.vaultId = vaultId;
        this.path = path;
    }

    public watch() {
        if (this.watcher) return;
        this.watcher = chokidar.watch(this.path, {
            alwaysStat: true,
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
            atomic: 300,
        });
        this.watcher.on('add', this.addFileWatcher.bind(this));
        this.watcher.on('addDir', this.addFolderWatcher.bind(this));
        this.watcher.on('unlink', this.unlinkFileWatcher.bind(this));
        this.watcher.on('unlinkDir', this.unlinkFolderWatcher.bind(this));
        this.watcher.on('change', this.changeDocumentWatcher.bind(this));
        this.watcher.on('ready', () => {
            this.isReady = true;
        });
    }

    public unwatch() {
        if (!this.watcher) return;
        this.watcher.close();
        this.watcher.unwatch(this.path);
    }

    private async addFileWatcher(path: string, stats: Stats) {
        const parsedPath = parse(path);

        const fileType = resolveFileType(parsedPath.ext);
        if (fileType === FileType.UNSUPPORTED) return;

        const map = this.resolveFileMap(fileType);
        if (!map) return;

        if (!this.isReady) {
            this.registerFileChange(path, stats, map);
            return;
        }
        if (this.isRootPath(path)) return;
        if (this.blacklist.includes(parsedPath.name)) return;
        if (fileType === FileType.ATTACHMENT) {
            this.registerFileChange(path, stats, map);
            const fileObj = await this.parseFilepath(path, 'attachment', stats);
            this.handleIncomingEvent('add', 'attachment', path, {
                ...fileObj,
                vaultId: this.vaultId,
            });
            return;
        }

        if (fileType === FileType.CONFIG) {
            this.registerFileChange(path, stats, map);
            const fileObj = await this.parseFilepath(path, 'config', stats);
            this.handleIncomingEvent('add', 'config', path, {
                ...fileObj,
                vaultId: this.vaultId,
            });
            return;
        }

        const isRenameEvent = this.checkRename(stats);

        if (isRenameEvent) {
            this.handleRename(path, stats, map, 'document');
            return;
        }
        const isAppWrite = changeRegister.isFileWrite(
            this.vaultId,
            path,
            stats,
        );
        this.registerFileChange(path, stats, map);
        if (isAppWrite) return;
        changeRegister.deleteFileWrite(this.vaultId, path, stats);
        const fileObj = await this.parseFilepath(path, 'document', stats);
        this.handleIncomingEvent('add', 'document', path, {
            vaultId: this.vaultId,
            ...fileObj,
        });
    }

    private async addFolderWatcher(path: string, stats: Stats) {
        if (!this.isReady) {
            this.registerFileChange(path, stats, this.fileMap);
            return;
        }
        if (this.isRootPath(path)) return;
        if (this.blacklist.some(v => path.endsWith(v))) return;
        const isRenameEvent = this.checkRename(stats);

        if (isRenameEvent) {
            this.handleRename(path, stats, this.fileMap, 'folder');

            return;
        }
        const isAppWrite = changeRegister.isFileWrite(
            this.vaultId,
            path,
            stats,
        );
        this.registerFileChange(path, stats, this.fileMap);
        if (isAppWrite) return;
        changeRegister.deleteFileWrite(this.vaultId, path, stats);
        const fileObj = await this.parseFilepath(path, 'folder', stats);
        this.handleIncomingEvent('add', 'folder', path, {
            vaultId: this.vaultId,
            ...fileObj,
        });
    }

    private async unlinkFileWatcher(path: string) {
        if (!this.isReady) return;
        if (this.isRootPath(path)) return;
        const parsedPath = parse(path);
        const fileType = resolveFileType(parsedPath.ext);
        if (fileType === FileType.ATTACHMENT) {
            const fileObj = await this.parseFilepath(path, 'attachment');
            this.handleIncomingEvent('delete', 'attachment', path, {
                ...fileObj,
                vaultId: this.vaultId,
            });
            return;
        }

        if (fileType === FileType.CONFIG) {
            const fileObj = await this.parseFilepath(path, 'config');
            this.handleIncomingEvent('delete', 'config', path, {
                ...fileObj,
                vaultId: this.vaultId,
            });
            return;
        }
        if (fileType !== FileType.MARKDOWN) return;

        this.renames[path] = Date.now();
        if (isRename(path)) return;
        setTimeout(async () => {
            if (this.renames[path]) {
                delete this.renames[path];
                const isAppWrite = changeRegister.isDelete(this.vaultId, path);
                if (isAppWrite) return;
                changeRegister.deleteFileDelete(this.vaultId, path);
                const fileObj = await this.parseFilepath(path, 'document');

                this.handleIncomingEvent('delete', 'document', path, {
                    vaultId: this.vaultId,
                    ...fileObj,
                });
            }
        }, DELETE_TIMEOUT);
    }

    private unlinkFolderWatcher(path: string) {
        if (!this.isReady) return;

        if (this.isRootPath(path)) {
            this.watcher.close();
            this.handleIncomingEvent('delete', 'vault', path, {
                vaultId: this.vaultId,
            });
            this.deleted = true;

            return;
        }

        this.renames[path] = Date.now();
        if (isRename(path)) return;
        setTimeout(async () => {
            if (this.renames[path]) {
                delete this.renames[path];
                const isAppWrite = changeRegister.isDelete(this.vaultId, path);
                if (isAppWrite) return;
                changeRegister.deleteFileDelete(this.vaultId, path);
                const fileObj = await this.parseFilepath(path, 'folder');

                this.handleIncomingEvent('delete', 'folder', path, {
                    vaultId: this.vaultId,
                    ...fileObj,
                });
            }
        }, DELETE_TIMEOUT);
    }

    private async changeDocumentWatcher(path: string, stats: Stats) {
        if (!this.isReady) return;
        if (this.isRootPath(path)) return;
        const isAppWrite = changeRegister.isFileWrite(
            this.vaultId,
            path,
            stats,
        );
        if (isAppWrite) return;
        changeRegister.deleteFileWrite(this.vaultId, path, stats);

        const parsedPath = parse(path);
        const fileType = resolveFileType(parsedPath.ext);

        if (fileType === FileType.CONFIG) {
            const fileObj = await this.parseFilepath(path, 'config', stats);
            this.handleIncomingEvent('change', 'config', path, {
                vaultId: this.vaultId,
                ...fileObj,
            });
            return;
        }

        const fileObj = await this.parseFilepath(path, 'document', stats);
        this.handleIncomingEvent('change', 'document', path, {
            vaultId: this.vaultId,
            ...fileObj,
        });
    }

    async handleRename(
        path: string,
        stats: Stats,
        map: any,
        entity: 'document' | 'folder',
    ) {
        const oldPath = map[`${stats?.ino} ${stats?.birthtimeMs}`].path;

        delete this.renames[oldPath];

        const isAppWrite = changeRegister.isRename(
            this.vaultId,
            oldPath,
            path,
            stats,
        );
        this.registerFileChange(path, stats, map);
        if (isAppWrite) return;
        changeRegister.deleteRename(this.vaultId, oldPath, path, stats);

        const oldFileObj = await this.parseFilepath(oldPath, entity);
        const newFileObj = await this.parseFilepath(path, entity, stats);

        this.handleIncomingEvent('rename', entity, path, {
            vaultId: this.vaultId,
            from: oldFileObj,
            to: newFileObj,
        });
    }

    private handleIncomingEvent(
        event: string,
        entity: 'document' | 'folder' | 'attachment' | 'vault' | 'config',
        path: string,
        data: Record<string, any>,
    ) {
        if (!this.isReady || this.deleted) return;
        clearTimeout(this.processQueueTimeout);
        if (Date.now() - this.eventQueue.lastWrite > PROCESS_DELAY) {
            this.eventQueue = { lastWrite: Date.now(), queue: [] };
        }
        this.eventQueue.queue.push({ event, entity, path, data });
        this.eventQueue.lastWrite = Date.now();
        this.processQueueTimeout = setTimeout(
            () => this.processQueue(this.eventQueue.queue),
            PROCESS_DELAY,
        );
    }

    private processQueue(queue: WatchEvent[]) {
        const uniqueChanges = new Set<string>();
        const sortedQueue = queue
            .sort((a, b) => a.path.length - b.path.length)
            .filter(({ event, entity, path }) => {
                const key = `${event}-${entity}-${path}`;
                if (uniqueChanges.has(key)) return false;
                uniqueChanges.add(key);
                return true;
            });
        sendWatchBatch(sortedQueue);
    }

    resolveFileMap(fileType: FileType): any {
        if (fileType === FileType.MARKDOWN) return this.fileMap;
        if (fileType === FileType.ATTACHMENT) return mediaMap;
        if (fileType === FileType.CONFIG) return configMap;
        return null;
    }

    async parseFilepath(filepath: string, entity: string, stats?: Stats) {
        const parsedPath = parse(filepath);
        const filetype = resolveFileType(parsedPath.ext);
        const projectPath = parsedPath.dir;
        const payload = {
            id: v4(),
            ext: parsedPath.ext,
            dir: projectPath,
            filepath,
            name: parsedPath.name,
            parentId: undefined,
            filetype,
            isFile: stats?.isFile() ?? entity !== 'folder',
            isDirectory: stats?.isDirectory() ?? entity === 'folder',
            createdAt: stats?.birthtime,
            updatedAt: stats?.mtime,
        } as any;

        if (['document', 'folder'].includes(filetype)) {
            const dirEntries = await readdir(parsedPath.dir);
            const order = dirEntries.length * 500;
            payload.order = order;
        }

        return payload;
    }

    get structureMap() {
        return Object.values(this.fileMap);
    }

    private isRootPath(path: string) {
        return path === this.path;
    }

    public registerRename(filepath: string) {
        this.renames[filepath] = Date.now();
    }

    private checkRename(stats: Stats) {
        const fm = this.fileMap[`${stats.ino} ${stats.birthtimeMs}`];

        if (!fm) return false;
        const removed = this.renames[fm.path];

        if (!removed) return false;
        return Date.now() - removed < DELETE_TIMEOUT;
    }

    private registerFileChange(
        path: string,
        stats: Stats,
        map: Record<string, any>,
    ) {
        map[`${stats.ino} ${stats.birthtimeMs}`] = {
            path,
            iNode: stats.ino,
            birthtime: Math.round(stats.birthtimeMs),
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
        };
    }
}
