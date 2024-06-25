import { access, readFile, stat } from 'fs/promises';
import { constants, Stats } from 'fs';
import { parse, sep } from 'path';
import { scopedLogger } from '../../helpers/logger';
import { EntityKind } from '../../constants/electron-constants';
import {
    extractDailyDoc,
    isDailyDoc,
    resolveFileType,
} from '../../helpers/utils';
import { parseFileContent } from './parser';

const logger = scopedLogger('FileWriterBase');

type TransformerFn = (entity: Record<string, any>) => Record<string, any>;

class GenericReader {
    private transformers: TransformerFn[] = [];

    registerTransformer(fn: TransformerFn) {
        this.transformers.push(fn);
    }

    async exists(filepath: string): Promise<boolean> {
        try {
            await access(filepath, constants.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    async readFile(filepath: string) {
        const { content, stats } = await this.readFileRaw(filepath);
        const { name, dir, ext } = parse(filepath);
        const folder = dir.split(sep).pop();
        const parsedContent = parseFileContent(content?.toString() || '');
        const rawMetadata = { ...(parsedContent.metadata || {}) };
        const deserializedMetadata = this.deserializeMetadata(
            parsedContent.metadata,
        );
        const payload = {
            metadata: {
                ...deserializedMetadata,
                createdAt: stats?.birthtime,
                updatedAt: stats?.mtime,
                yamlHeader: rawMetadata,
            } as Record<string, any>,
            content: parsedContent.content,
            filepath,
            name,
            kind: this.resolveKind(folder),
            fileType: resolveFileType(ext),
        };
        if (payload.kind === EntityKind.DOCUMENT && isDailyDoc(name, folder)) {
            const { dailyDoc } = extractDailyDoc(name);
            payload.metadata.dailyDoc = dailyDoc;
        }
        return payload;
    }

    async readConfig(filepath: string) {
        const { content } = await this.readFileRaw(filepath);
        const parsedContent = parseFileContent(content?.toString() || '');
        const rawMetadata = { ...(parsedContent.metadata || {}) };
        return rawMetadata;
    }

    async readAttachment(filepath: string): Promise<string> {
        const content = await readFile(filepath, {
            encoding: null,
        }).catch<string>(e => {
            logger.error({
                operation: 'readAttachment',
                message: e,
            });
            return '';
        });
        return (content as Buffer).toString('base64');
    }

    async readFileRaw(
        filepath: string,
    ): Promise<{ content: string | Buffer; stats: Stats }> {
        const [content, stats] = await Promise.all([
            readFile(filepath).catch<string>(e => {
                logger.error({
                    operation: 'readFile',
                    message: e,
                });
                return '';
            }),
            stat(filepath).catch<null>(e => {
                logger.error({
                    operation: 'readFile',
                    message: e,
                });
                return null;
            }),
        ]);

        return { content, stats };
    }

    resolveKind(path: string): EntityKind {
        const folderEntities = [
            ['.tasks', EntityKind.UNKNOWN],
            ['.events', EntityKind.UNKNOWN],
        ] as [string, EntityKind][];

        return folderEntities.reduce((acc: EntityKind, [folder, kind]) => {
            if (path.endsWith(folder)) return kind;
            if (parse(path).ext === 'yaml' && parse(path).name === '.acreom')
                return EntityKind.CONFIG;
            return acc;
        }, EntityKind.DOCUMENT);
    }

    deserializeMetadata(metadata: Record<string, any>): Record<string, any> {
        if (!metadata) return {};
        return this.transformers.reduce((acc, fn) => {
            return fn(acc);
        }, metadata);
    }

    async readFilesBatch(filepaths: string[]) {
        const output = [];
        for (const filepath of filepaths) {
            const file = await this.readFile(filepath);
            output.push(file);
        }
        return output;
    }
}

export default new GenericReader();
