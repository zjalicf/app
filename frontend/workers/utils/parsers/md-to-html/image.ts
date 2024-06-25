import { v4 } from 'uuid';
import { StorageType } from '~/workers/utils/parsers';
import { parseAsWikiLink } from '~/workers/utils/parsers/md-to-html/helpers';

export const getImage = (config: any, src: string, type: string): any => {
    const isHttpLink = src.startsWith('https://') || src.startsWith('http://');
    if (isHttpLink) {
        return getHttpImage(config, decodeURIComponent(src), type);
    }
    return getLocalImage(
        config,
        decodeURIComponent(src).replaceAll('/', config.sep),
        type,
    );
};

export const getHttpImage = (config: any, src: string, type: string): any => {
    const entities = config.storage.getByIndex(
        config.entity.vaultId,
        StorageType.IMAGE,
        src,
        false,
    );
    if (!entities.length) {
        return parseAsDoclink(config, src, type);
    }
    const imageObject = entities.shift()!;

    return {
        type,
        imageObject,
    };
};

export const getLocalImage = (config: any, src: string, type: string): any => {
    const entityDir = config.entity.filepath
        .split(config.sep)
        .slice(0, -1)
        .join(config.sep);

    const deviceEntities = config.storage.getByIndex(
        config.entity.vaultId,
        StorageType.DEVICE_MEDIA,
        src,
    );

    if (!deviceEntities.length) {
        const images = config.storage.getByIndex(
            config.entity.vaultId,
            StorageType.IMAGE,
            src,
        );
        if (!images.length) {
            return parseAsDoclink(config, src, type);
        }
        const imageObject = findClosestImage(entityDir, images);
        return {
            type,
            imageObject,
        };
    }

    const imageEntities = deviceEntities.reduce((acc: any[], entity: any) => {
        const image = config.storage.getByIndex(
            config.entity.vaultId,
            StorageType.IMAGE,
            entity.filepath,
        );
        return [...acc, ...image];
    }, []);

    if (!imageEntities.length) {
        return getDeviceImage(config, src, type);
    }

    const imageObject = findClosestImage(entityDir, imageEntities);
    return {
        type,
        imageObject,
    };
};

export const getDeviceImage = (config: any, src: string, type: string): any => {
    const entityDir = config.entity.filepath
        .split(config.sep)
        .slice(0, -1)
        .join(config.sep);
    const entities = config.storage.getByIndex(
        config.entity.vaultId,
        StorageType.DEVICE_MEDIA,
        src,
    );

    if (!entities.length) {
        return parseAsDoclink(config, src, type);
    }

    const mediaObj = findClosestImage(entityDir, entities);
    const filepath = mediaObj.filepath.replaceAll('/', config.sep);
    const dir = filepath.split(config.sep).slice(0, -1).join(config.sep);
    const name = filepath.split(config.sep).pop()!;
    const parentFolder = config.storage.getByFilepath(
        config.entity.vaultId,
        StorageType.FOLDER,
        dir,
    );

    const imageObject = {
        id: v4(),
        entityType: 'document',
        entityId: config.entity.metadata?.id ?? config.entity.id,
        vaultId: config.entity.vaultId,
        name,
        ext: name.split('.').pop(),
        isOnDisk: true,
        filepath,
        folderId: parentFolder?.id ?? config.entity.parentId ?? null,
    };

    config.storage.save(config.entity.vaultId, StorageType.IMAGE, imageObject);
    config.storage.set(config.entity.vaultId, StorageType.IMAGE, imageObject);
    return {
        type,
        imageObject,
    };
};

export const parseAsDoclink = (config: any, src: string, type: string) => {
    const { link: docLink, oc } = parseAsWikiLink(src, config) ?? { link: '' };
    const document = config.storage.getByIndex(
        config.entity.vaultId,
        StorageType.DOCUMENT,
        docLink,
    );
    if (document?.length) {
        const firstMatch = document.shift();
        return {
            type: 'wikilinkLinks',
            id: firstMatch.id,
            entity: firstMatch,
            kind: 'document',
            preview: true,
            oc,
        };
    }

    return {
        type,
        href: src,
    };
};

export const findClosestImage = (entityDir: string, entities: any[]): any => {
    const closestImage = entities.reduce((acc, entity) => {
        const match = longestPrefixLength(entityDir, entity.filepath);
        if (!acc) return { match, entity };
        if (match > acc.match) return { match, entity };
        if (
            match === acc.match &&
            entity.filepath.length < acc.entity.filepath.length
        ) {
            return { match, entity };
        }
        return acc;
    }, null);
    return closestImage.entity;
};

export const longestPrefixLength = (a: string, b: string): number => {
    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
        if (a[i] !== b[i]) return i;
    }
    return minLength;
};
