import { readdir, stat } from 'fs/promises';
import { join, parse } from 'path';
import { IpcMain, IpcMainEvent } from 'electron';
import { v4 } from 'uuid';
import { IFolder } from '../../frontend/@types';
import { DEVICE_ACTIONS } from '../constants/electron-constants';
import { resolveFileType } from '../helpers';
import { Writer, Reader } from './io';
import { customMerge } from '@/helpers/utils';

const blacklist = [
    '.DS_Store',
    '__MACOSX',
    '.git',
    '.gitignore',
    '.gitattributes',
    '.obsidian',
    '.obsidian-git-data',
    '.obsidian-git',
    '.events',
    '.tasks',
];

export const registerIpcMainHandlers = (ipcMain: IpcMain) => {
    ipcMain?.handle(
        DEVICE_ACTIONS.IS_DIR,
        async (_event: IpcMainEvent, filepath: string) => {
            const stats = await stat(filepath);
            return stats.isDirectory();
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_READ,
        async (_event: IpcMainEvent, project: Partial<IFolder>) => {
            const projectStats = await stat(project.filepath);
            return {
                ...project,
                updatedAt: projectStats.mtime,
            };
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_LIST,
        async (
            _event: IpcMainEvent,
            project: Partial<IFolder>,
            options: { recursive?: boolean } = {},
        ) => {
            const projects = (
                await readdir(project.filepath, {
                    withFileTypes: true,
                    ...options,
                })
            )
                .map(entry => {
                    const filepath = join(project.filepath, entry.name);
                    const parsedEntry = parse(filepath);
                    const filetype = resolveFileType(parsedEntry.ext);
                    return {
                        ext: parsedEntry.ext,
                        dir: parsedEntry.dir,
                        filepath,
                        name: parsedEntry.name,
                        parentId: project.id,
                        filetype,
                        isFile: entry.isFile(),
                        isDirectory: entry.isDirectory(),
                    };
                })
                .filter(entry => !entry.name.startsWith('.'));
            return Promise.all(
                projects.map(async entry => {
                    const configFilepath = join(entry.filepath, '.acreom.yaml');
                    const configExists = await Reader.exists(configFilepath);
                    if (configExists) {
                        const config = await Reader.readConfig(configFilepath);
                        entry['properties'] = config;
                        if (config.icon) {
                            entry['icon'] = config.icon;
                        }
                    }
                    return entry;
                }),
            );
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.PARSE_FILEPATH,
        async (_: IpcMainEvent, filepath: string) => {
            const parsedEntry = parse(filepath);
            const filetype = resolveFileType(parsedEntry.ext);
            const stats = await stat(filepath);
            const entry = {
                id: v4(),
                filepath,
                dir: parsedEntry.dir,
                name: parsedEntry.name,
                parentId: null,
                filetype,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                createdAt: stats.birthtime,
                updatedAt: stats.mtime,
            };
            const configFilepath = join(filepath, '.acreom.yaml');
            const configExists = await Reader.exists(configFilepath);
            if (configExists) {
                const config = await Reader.readConfig(configFilepath);
                entry['properties'] = config;
                if (config.icon) {
                    entry['icon'] = config.icon;
                }
            }
            return entry;
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_LIST_RECURSIVE,
        async (_: IpcMainEvent, project: Partial<IFolder>) => {
            const listDirSorted = async (dirpath: string) => {
                const dirents = await readdir(dirpath, {
                    withFileTypes: true,
                });
                const direntsWithStats = await Promise.all(
                    dirents.map(async dirent => {
                        const filepath = join(dirpath, dirent.name);
                        const stats = await stat(filepath);
                        return {
                            dirent,
                            stats,
                        };
                    }),
                );
                const sortedDirents = direntsWithStats.sort(
                    ({ dirent: a }, { dirent: b }) => {
                        return b.name > a.name ? -1 : 1;
                    },
                );

                return sortedDirents;
            };
            const readDirRecursive = async (dir: any, files = []) => {
                const dirs = [];
                const sortedDirents = await listDirSorted(dir.filepath);
                let order = 0;
                for (const { dirent, stats } of sortedDirents) {
                    const filepath = join(dir.filepath, dirent.name);
                    const parsedEntry = parse(filepath);
                    const filetype = resolveFileType(parsedEntry.ext);
                    const entry = {
                        id: v4(),
                        filepath,
                        order,
                        dir: dir.filepath,
                        name: parsedEntry.name,
                        parentId: dir.id,
                        filetype,
                        isFile: dirent.isFile(),
                        isDirectory: dirent.isDirectory(),
                        createdAt: stats.birthtime,
                        updatedAt: stats.mtime,
                    };

                    order += 500;
                    if (blacklist.includes(parsedEntry.name)) continue;
                    if (dirent.isDirectory()) {
                        const configFilepath = join(filepath, '.acreom.yaml');
                        const configExists = await Reader.exists(
                            configFilepath,
                        );
                        if (configExists) {
                            const config = await Reader.readConfig(
                                configFilepath,
                            );
                            entry['properties'] = config;
                            if (config.icon) {
                                entry['icon'] = config.icon;
                            }
                        }
                        dirs.push(entry);
                    }
                    files.push(entry);
                }
                for (const d of dirs) {
                    await readDirRecursive(d, files);
                }
                return files;
            };

            return await readDirRecursive(project);
        },
    );

    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_CREATE,
        async (_: IpcMainEvent, project: Partial<IFolder>) => {
            const timestamps = {
                mtime: new Date(project.updatedAt).getTime(),
                atime: new Date(project.updatedAt).getTime(),
                btime: new Date(project.createdAt).getTime(),
            };
            await Writer.createDir(
                project.vaultId,
                project.filepath,
                timestamps,
            );
            if (project.type === 'project') {
                await Writer.createDirConfig(
                    project.vaultId,
                    `${project.filepath}/.acreom.yaml`,
                    project,
                );
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_CREATE_BATCH,
        async (_: IpcMainEvent, projects: Partial<IFolder>[]) => {
            await Promise.all(
                projects.map(project => {
                    const timestamps = {
                        mtime: new Date(project.updatedAt).getTime(),
                        atime: new Date(project.updatedAt).getTime(),
                        btime: new Date(project.createdAt).getTime(),
                    };
                    return Writer.createDir(
                        project.vaultId,
                        project.filepath,
                        timestamps,
                    );
                }),
            );
            await Promise.all(
                projects
                    .filter(project => project.type === 'project')
                    .map(project => {
                        return Writer.createDirConfig(
                            project.vaultId,
                            `${project.filepath}/.acreom.yaml`,
                            project,
                        );
                    }),
            );
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_UPDATE,
        async (
            _: IpcMainEvent,
            mods: Partial<IFolder>,
            oldProject: Partial<IFolder>,
        ) => {
            if (!oldProject.filepath || !mods.filepath) return;

            await Writer.rename(
                oldProject.vaultId,
                oldProject.filepath,
                mods.filepath,
            );
            if ('properties' in mods) {
                const mergedProperties = customMerge(
                    oldProject.properties ?? {},
                    mods.properties,
                );
                const project = { ...oldProject, ...mods };
                project.properties = mergedProperties;
                await Writer.createDirConfig(
                    project.vaultId,
                    `${project.filepath}/.acreom.yaml`,
                    project,
                );
            }
        },
    );
    ipcMain?.handle(
        DEVICE_ACTIONS.PROJECT_REMOVE,
        async (_: IpcMainEvent, project: Partial<IFolder>) => {
            await Writer.trashRaw(project.vaultId, project.filepath);
        },
    );
};
