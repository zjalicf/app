import { v4 } from 'uuid';
import { ContentLoader } from '~/workers/database/device/importer/loader';
import { FileType } from '~/constants';
import { WEntity, ListDirent } from '~/@types';
import {
    ContentParser,
    PartialParserEntity,
} from '~/workers/database/device/parser/interface';
import { StorageFactory } from '~/workers/database/device/importer/importer';

export class TestLoader implements ContentLoader {
    parseFilepath(_filepath: string): Promise<any> {
        return Promise.resolve({});
    }

    resolveType(_filepath: string): any {
        return '';
    }

    start() {}

    done() {}

    isDir(filepath: string): Promise<boolean> {
        return Promise.resolve(!filepath.endsWith('.md'));
    }

    isBlacklisted(_filepath: string): boolean {
        return false;
    }

    listDir(filepath: string): Promise<ListDirent[]> {
        const createListDirEnt = (
            filepath: string,
            parentId: string | null = null,
        ) => {
            return {
                name: filepath.split('/').pop()!,
                filepath,
                id: v4(),
                parentId,
                dir: filepath.split('/').slice(0, -1).join('/'),
                isDirectory: !filepath.endsWith('.md'),
                isFile: filepath.endsWith('.md'),
                filetype:
                    (filepath.endsWith('.md') && FileType.MARKDOWN) ??
                    FileType.UNSUPPORTED,
            } as any;
        };

        const folder = createListDirEnt(filepath + '/folder');

        return Promise.resolve([
            createListDirEnt(filepath + '/file1.md'),
            createListDirEnt(filepath + '/file2.md'),
            createListDirEnt(filepath + '/file3.md'),
            folder,
            createListDirEnt(filepath + '/folder/file4.md', folder.id),
        ]);
    }

    readBatch(filepaths: ListDirent[], _config: any): Promise<WEntity[]> {
        return Promise.resolve(
            filepaths.map(entity => {
                return {
                    vaultId: '',
                    id: v4(),
                    metadata: {},
                    name: entity.filepath.split('/').pop()!,
                    filepath: entity.filepath,
                    content: 'content',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    kind: entity.filepath.endsWith('.md')
                        ? 'document'
                        : 'folder',
                } as any;
            }),
        );
    }
}

export class TestParser implements ContentParser {
    parseBatch(
        _vaultId: string,
        contents: PartialParserEntity[],
    ): Promise<string[]> {
        return Promise.resolve(
            contents.map(content => {
                return content.content;
            }),
        );
    }

    parse(parserEntity: PartialParserEntity): Promise<string> {
        return Promise.resolve(parserEntity.content);
    }
}

export class TestStorageResolver implements StorageFactory {
    storage: Record<string, any> = {};

    resolve(type: string): any {
        return {
            saveBulk: (
                vaultId: string,
                entities: any[],
                _options?: any,
            ): Promise<void> => {
                if (!this.storage[vaultId]) {
                    this.storage[vaultId] = {};
                }
                this.storage[vaultId] = {
                    ...this.storage[vaultId],
                    [type]: entities,
                };

                return Promise.resolve();
            },

            deserializeWriterEntity: (writerEntity: WEntity): any => {
                return writerEntity;
            },
        };
    }
}
