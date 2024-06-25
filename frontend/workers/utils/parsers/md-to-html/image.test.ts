import { describe, it, expect } from 'vitest';
import {
    findClosestImage,
    getImage,
} from '~/workers/utils/parsers/md-to-html/image';
import { EntityStorage, StorageType } from '~/workers/utils/parsers';

describe('md-to-html/image windows', () => {
    const vault = {
        id: 'vault-id',
        name: 'vault-name',
        filepath: 'C:\\Users\\user\\Documents\\acreom\\',
    };
    const windowsConfig = {
        $config: {
            os: 'windows',
        },
        vault,
        sep: '\\',
    };

    runTests(windowsConfig);
});

describe('md-to-html/image linux', () => {
    const vault = {
        id: 'vault-id',
        name: 'vault-name',
        filepath: '/home/user/Documents/acreom/',
    };
    const linuxConfig = {
        $config: {
            os: 'linux',
        },
        vault,
        sep: '/',
    };

    runTests(linuxConfig);
});

const runTests = (platformConfig: any) => {
    platformConfig.storage = new EntityStorage(platformConfig.$config as any);
    const imageFilepaths = [
        'a/b/a/img.png',
        'e/b/a/img.png',
        'a/a/img.png',
        'a/img.png',
    ].map(e => e.replaceAll('/', platformConfig.sep));
    const deviceMediaFilepaths = [
        ...imageFilepaths,
        'e/img 1.png',
        'e/img.png',
    ].map(e => e.replaceAll('/', platformConfig.sep));

    platformConfig.storage.set(
        platformConfig.vault.id,
        StorageType.DEVICE_MEDIA,
        deviceMediaFilepaths.map(filepath => ({
            id: filepath,
            name: filepath.split(platformConfig.sep).pop(),
            filepath: platformConfig.vault.filepath + filepath,
        })),
    );
    platformConfig.storage.set(
        platformConfig.vault.id,
        StorageType.IMAGE,
        imageFilepaths.map(filepath => ({
            id: filepath,
            name: filepath.split(platformConfig.sep).pop(),
            filepath: platformConfig.vault.filepath + filepath,
        })),
    );

    platformConfig.storage.set(platformConfig.vault.id, StorageType.IMAGE, [
        {
            id: 'remote-image',
            name: 'remoteImage.png',
            remoteUri: 'https://acreom.com/api/v1/images/someId',
        },
    ]);

    it('should match most common link', () => {
        const docPath = '/vault/path/a/b/c/file.md'.replaceAll(
            '/',
            platformConfig.sep,
        );
        const docDir = docPath
            .split(platformConfig.sep)
            .slice(0, -1)
            .join(platformConfig.sep);
        const entities = [
            '/vault/path/a/b/a/img.png',
            '/vault/path/e/b/a/img.png',
            '/vault/path/a/a/img.png',
            '/vault/path/a/img.png',
        ].map(e => ({ filepath: e.replaceAll('/', platformConfig.sep) }));

        const closestImage = findClosestImage(docDir, entities);

        expect(closestImage.filepath).toEqual(
            '/vault/path/a/b/a/img.png'.replaceAll('/', platformConfig.sep),
        );
    });

    it('should match most common link without path match', () => {
        const docPath = '/vault/path/e/b/c/file.md'.replaceAll(
            '/',
            platformConfig.sep,
        );
        const docDir = docPath
            .split(platformConfig.sep)
            .slice(0, -1)
            .join(platformConfig.sep);
        const entities = [
            '/vault/path/a/b/a/img.png',
            '/vault/path/a/a/img.png',
            '/vault/path/a/img.png',
        ].map(e => ({ filepath: e.replaceAll('/', platformConfig.sep) }));

        const closestImage = findClosestImage(docDir, entities);

        expect(closestImage.filepath).toEqual(
            '/vault/path/a/img.png'.replaceAll('/', platformConfig.sep),
        );
    });

    it('should match image object', () => {
        const imagePath = 'a/img.png'.replaceAll('/', platformConfig.sep);
        const docPath =
            platformConfig.vault.filepath +
            'a/b/c/file.md'.replaceAll('/', platformConfig.sep);
        platformConfig.entity = {
            vaultId: platformConfig.vault.id,
            filepath: docPath,
        };
        const image = getImage(platformConfig, imagePath, StorageType.IMAGE);
        expect(image.imageObject.id).toEqual(
            'a/b/a/img.png'.replaceAll('/', platformConfig.sep),
        );
        expect(image.type).toEqual('image');
    });

    it('should match image object in root dir', () => {
        const imagePath = 'a/img.png'.replaceAll('/', platformConfig.sep);
        const docPath =
            platformConfig.vault.filepath +
            'f/b/c/file.md'.replaceAll('/', platformConfig.sep);
        platformConfig.entity = {
            vaultId: platformConfig.vault.id,
            filepath: docPath,
        };
        const image = getImage(platformConfig, imagePath, StorageType.IMAGE);
        expect(image.imageObject.id).toEqual(
            'a/img.png'.replaceAll('/', platformConfig.sep),
        );
        expect(image.type).toEqual('image');
    });

    it('should match device media', () => {
        const imagePath = 'e/img.png'.replaceAll('/', platformConfig.sep);
        const docPath =
            platformConfig.vault.filepath +
            'a/b/c/file.md'.replaceAll('/', platformConfig.sep);
        platformConfig.entity = {
            vaultId: platformConfig.vault.id,
            filepath: docPath,
        };
        expect(
            platformConfig.storage.getByIndex(
                platformConfig.vault.id,
                StorageType.IMAGE,
                imagePath,
            ).length,
        ).toEqual(0);
        const image = getImage(platformConfig, imagePath, StorageType.IMAGE);
        expect(image.imageObject.filepath).toEqual(
            platformConfig.vault.filepath +
                'e/img.png'.replaceAll('/', platformConfig.sep),
        );
        expect(image.type).toEqual('image');

        const imageFromStorage = platformConfig.storage.getByIndex(
            platformConfig.vault.id,
            StorageType.IMAGE,
            imagePath,
        );
        expect(imageFromStorage.length).toEqual(1);
    });

    it('should match remoteUri', () => {
        const imageUri = 'https://acreom.com/api/v1/images/someId';
        const docPath =
            platformConfig.vault.filepath +
            'a/b/c/file.md'.replaceAll('/', platformConfig.sep);
        platformConfig.entity = {
            vaultId: platformConfig.vault.id,
            filepath: docPath,
        };

        const image = getImage(platformConfig, imageUri, StorageType.IMAGE);
        expect(image.imageObject.remoteUri).toEqual(imageUri);
        expect(image.type).toEqual('image');
        expect(image.imageObject.id).toEqual('remote-image');
    });
};
