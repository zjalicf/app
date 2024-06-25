import { parse } from 'path';
import { constants, mkdir, rename, stat, writeFile, cp } from 'fs/promises';
import { accessSync } from 'fs';
import { utimes } from 'utimes';
import isEmpty from 'lodash/isEmpty';
import trash = require('trash');
import { scopedLogger } from '../../helpers/logger';
import { IFolder, WEntity } from '../../../frontend/@types';
import { serializeEntity } from './parser';
import { registerAppWrite } from './writeMap';
import { changeRegister } from './register';

const logger = scopedLogger('FileWriterBase');

type FileTimestamps = { btime: number; mtime: number; atime: number };

const access = (filepath: string, mode: any) => {
    try {
        accessSync(filepath, mode);
        return true;
    } catch (e) {
        return false;
    }
};

class GenericWriter {
    createMetadata(entity: WEntity): Partial<WEntity> {
        delete entity.metadata.sequence;
        delete entity.metadata.updatedAt;
        delete entity.metadata.createdAt;
        entity.metadata = {
            ...(entity.metadata.yamlHeader || {}),
            ...entity.metadata,
        };
        delete entity.metadata?.yamlHeader;
        return entity.metadata || {};
    }

    getTimestamps(entity: WEntity): Partial<FileTimestamps> {
        const output: Partial<FileTimestamps> = {};
        if (entity.metadata.updatedAt) {
            const timestamp = new Date(entity.metadata.updatedAt).getTime();
            if (!isNaN(timestamp)) {
                output.mtime = timestamp;
                output.atime = timestamp;
            }
        }
        if (entity.metadata.createdAt) {
            const timestamp = new Date(entity.metadata.createdAt).getTime();
            if (!isNaN(timestamp)) {
                output.btime = timestamp;
            }
        }
        return output;
    }

    getContent(entity: WEntity): string {
        return entity?.content;
    }

    getFilepath(entity: WEntity): string {
        return entity?.filepath || null;
    }

    async createDirRecursive(
        vaultId: string,
        filepath: string,
        timestamps?: Partial<FileTimestamps>,
    ) {
        const { dir } = parse(filepath);
        const pathExists = access(filepath, constants.F_OK);
        if (pathExists) return;

        const parentExists = access(dir, constants.F_OK);
        if (!parentExists) {
            await this.createDirRecursive(vaultId, dir, timestamps);
        }
        const isWritable = access(dir, constants.W_OK);
        if (!isWritable) {
            throw new Error('parent dir is not writable');
        }
        await mkdir(filepath);

        if (!timestamps || isEmpty(timestamps)) {
            const stats = await stat(filepath);
            changeRegister.registerFileWrite(vaultId, filepath, stats);
            return;
        }
        await this.setTimestamps(filepath, timestamps).catch(() => {
            console.log('could not set timestamps for dir ', filepath);
        });
        const stats = await stat(filepath);
        changeRegister.registerFileWrite(vaultId, filepath, stats);
    }

    async createDir(
        vaultId: string,
        filepath: string,
        timestamps?: Partial<FileTimestamps>,
    ) {
        return this.createDirRecursive(vaultId, filepath, timestamps);
    }

    async createDirConfig(
        vaultId: string,
        filepath: string,
        project: Partial<IFolder>,
    ) {
        const stringContent = serializeEntity(project.properties, '');
        await this.writeFileRaw(vaultId, filepath, stringContent).catch(e =>
            console.log('error writing project config', project?.properties, e),
        );
    }

    copy(filepaths: { from: string; to: string }[]) {
        return Promise.all(
            filepaths.map(({ from, to }) => {
                return cp(from, to, { preserveTimestamps: true }).catch(e => {
                    console.log(e);
                    return null;
                });
            }),
        );
    }

    async rename(vaultId: string, from: string, to: string) {
        const parsedFilepath = parse(to);
        if (parsedFilepath.dir.endsWith('.trash')) {
            await this.createDir(vaultId, parsedFilepath.dir);
        }
        await rename(from, to).catch(e => {
            logger.error({
                operation: 'rename',
                vaultId,
                message: e,
            });
        });
        const statsTo = await stat(to);
        changeRegister.registerRename(vaultId, from, to, statsTo);

        const parsedPath = parse(to);
        const dirStats = await stat(parsedPath.dir);
        changeRegister.registerFileWrite(vaultId, parsedPath.dir, dirStats);
    }

    async writeFile(vaultId: string, entity: WEntity) {
        const timestamps = this.getTimestamps(entity);
        const stringContent = serializeEntity(
            this.createMetadata(entity),
            this.getContent(entity),
        );
        const filepath = this.getFilepath(entity);
        await this.writeFileRaw(
            vaultId,
            filepath,
            stringContent,
            timestamps,
        ).catch(e => console.log('error writing entity', entity, e));
    }

    async writeFileBatch(vaultId: string, entities: WEntity[]) {
        const batchSize = 100;
        let chunk = entities.splice(0, batchSize);
        do {
            await Promise.all(
                chunk.map(entity => this.writeFile(vaultId, entity)),
            );
            chunk = entities.splice(0, batchSize);
        } while (chunk.length > 0);
    }

    async writeFileRaw(
        vaultId: string,
        filepath: string,
        content: string | Buffer,
        timestamps?: Partial<FileTimestamps>,
    ) {
        const parsedFilepath = parse(filepath);
        await this.createDir(vaultId, parsedFilepath.dir, timestamps);
        await writeFile(filepath, content);

        if (!timestamps || isEmpty(timestamps)) {
            const preTimestampStats = await stat(filepath);
            changeRegister.registerFileWrite(
                vaultId,
                filepath,
                preTimestampStats,
            );
            return;
        }
        await this.setTimestamps(filepath, timestamps).catch(() => {
            console.log('could not set timestamps for file');
        });
        const postTimestampStats = await stat(filepath);
        changeRegister.registerFileWrite(vaultId, filepath, postTimestampStats);
    }

    async setTimestamps(filepath: string, timestamps: Partial<FileTimestamps>) {
        const payload = {
            btime: undefined,
            mtime: undefined,
            atime: undefined,
            ...timestamps,
        };
        if (Object.values(payload).every(timestamp => !timestamp)) return;
        await utimes(filepath, payload);
    }

    async trash(vaultId: string, entity: WEntity) {
        const filepath = this.getFilepath(entity);
        const stringContent = serializeEntity(
            this.createMetadata(entity),
            this.getContent(entity),
        );
        const parsedFilepath = parse(filepath);

        registerAppWrite(vaultId, filepath, parsedFilepath.name, stringContent);
        await this.trashRaw(vaultId, filepath);
    }

    trashRaw(vaultId: string, filepath: string): Promise<any> {
        changeRegister.registerDelete(vaultId, filepath);
        return trash(filepath, { glob: false }).catch(e => {
            logger.error({
                operation: 'trash',
                vaultId,
                message: e,
            });
        });
    }
}

export default new GenericWriter();
