import { ListDirent } from '~/@types';
import { StorageType } from '~/workers/utils/parsers';

export const setParentId = (dirent: ListDirent, folderMap: any) => {
    if (dirent.isDirectory) {
        const existingFolder = folderMap[dirent.filepath];
        return {
            ...dirent,
            parentId: existingFolder?.parentId ?? dirent.parentId,
            id: existingFolder?.id ?? dirent.id,
        };
    }

    const existingParentFolder = folderMap[dirent.dir];
    if (existingParentFolder)
        return {
            ...dirent,
            parentId: existingParentFolder.id,
        };
    return dirent;
};

export const checkMap = (map: any, dirent: ListDirent) => {
    if (!map[dirent.filepath]) return true;
    const diskUpdatedAt = new Date(dirent.updatedAt);
    const dbUpdatedAt = new Date(map[dirent.filepath].updatedAt);
    return diskUpdatedAt.getTime() - 1000 > dbUpdatedAt.getTime();
};

export const updateIds = (
    dirent: ListDirent,
    map: any,
    folderMap: any,
    type: StorageType,
): ListDirent => {
    return {
        ...dirent,
        id: map[dirent.filepath]?.id ?? dirent.id,
        parentId:
            map[dirent.filepath]?.parentId ??
            folderMap[dirent.dir]?.id ??
            dirent.parentId,
        name: updateName(dirent, map, type),
    };
};

export const resolveNameProp = (type: StorageType): string => {
    switch (type) {
        case StorageType.DOCUMENT:
            return 'title';
        case StorageType.EVENT:
            return 'summary';
        case StorageType.TASK:
            return 'text';
        default:
            return 'name';
    }
};

export const updateName = (
    dirent: ListDirent,
    map: any,
    type: StorageType,
): string => {
    const nameProp = resolveNameProp(type);
    const existingEntity = map[dirent.filepath];
    if (!existingEntity) return dirent.name;
    return existingEntity[nameProp];
};
