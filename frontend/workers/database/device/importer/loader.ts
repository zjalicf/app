import { WEntity, ListDirent } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { GenericActions, ServiceKey } from '~/constants';
import { StorageType } from '~/workers/utils/parsers/storage';

export interface ContentLoader {
    isDir(filepath: string, config?: any): Promise<boolean>;
    listDir(filepath: string, config?: any): Promise<ListDirent[]>;
    readBatch(filepaths: ListDirent[], config?: any): Promise<WEntity[]>;
    parseFilepath(filepath: string): Promise<ListDirent>;
    resolveType(filepath: string): StorageType;
    isBlacklisted(filepath: string): boolean;
    start(): void;
    done(): void;
}

enum ImportLoaderActions {
    IS_DIR = 'project:isDir',
    LIST_DIR_RECURSIVE = 'project:listRecursive',
    PARSE_FILEPATH = 'project:parseFilepath',
    READ_BATCH = 'entity:batchRead',
}
export class MDLoader implements ContentLoader {
    context: WorkerContext;
    channel!: MessageChannel;

    internalFolders = ['.trash'];
    blacklistedFolders = [
        '.tasks',
        '.events',
        '.obsidian',
        '.git',
        '.github',
        '.vscode',
        '.idea',
    ];

    constructor(ctx: WorkerContext) {
        this.context = ctx;
    }

    get blacklistedItems() {
        return [...this.internalFolders, ...this.blacklistedFolders];
    }

    isDir(filepath: string, _config?: any): Promise<boolean> {
        return this.context
            .invoke<{ payload: boolean }>(
                ServiceKey.DEVICE,
                ImportLoaderActions.IS_DIR,
                filepath,
            )
            .then(({ payload }) => payload);
    }

    isBlacklisted(filepath: string): boolean {
        return this.blacklistedItems.some(folder => filepath.endsWith(folder));
    }

    async listDir(filepath: string, config?: any): Promise<ListDirent[]> {
        const internalFolders = [...this.blacklistedItems, config.myDayFolder];
        const endsWithInternal = (entry: ListDirent) =>
            internalFolders.some(
                folder => entry.isDirectory && entry.filepath.endsWith(folder),
            );

        const dirs = await this.context
            .invoke<{ payload: ListDirent[] }>(
                ServiceKey.DEVICE,
                ImportLoaderActions.LIST_DIR_RECURSIVE,
                {
                    id: null,
                    filepath,
                },
            )
            .then(({ payload }) => payload);
        return dirs.filter(dir => dir.isFile || !endsWithInternal(dir));
    }

    parseFilepath(filepath: string): Promise<ListDirent> {
        return this.context
            .invoke<{ payload: ListDirent }>(
                ServiceKey.DEVICE,
                ImportLoaderActions.PARSE_FILEPATH,
                filepath,
            )
            .then(({ payload }) => payload);
    }

    readBatch(filepaths: ListDirent[], _config?: any): Promise<WEntity[]> {
        this.channel.port1.postMessage(filepaths);
        return new Promise(resolve => {
            this.channel.port1.onmessage = (e: MessageEvent) => {
                const content = e.data;
                resolve(content);
            };
        });
    }

    resolveType(filepath: string): StorageType {
        const sep = this.context.$config.os === 'windows' ? '\\' : '/';
        const parts = filepath.split(sep);
        const type = parts[parts.length - 2];
        const name = parts[parts.length - 1];

        if (type === '.tasks') return StorageType.UNKNOWN;
        if (type === '.events') return StorageType.UNKNOWN;
        if (name.endsWith('.md') || name.endsWith('.txt'))
            return StorageType.DOCUMENT;
        return StorageType.UNKNOWN;
    }

    start() {
        this.channel = new MessageChannel();
        this.context.emit(
            ServiceKey.DEVICE,
            GenericActions.TRANSFER_PORT,
            {
                key: 'importer-loader-port',
            },
            [this.channel.port2],
        );
        this.channel.port1.start();
    }

    done() {
        this.channel.port1.postMessage('done');
        this.channel.port1.close();
    }
}
