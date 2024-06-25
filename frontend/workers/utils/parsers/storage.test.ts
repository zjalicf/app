import { describe, it } from 'vitest';
import { EntityStorage, StorageType } from './storage';

describe('parser consistency', () => {
    const storage = new EntityStorage({ os: 'linux' } as any);
    storage.set('vault-id', StorageType.DOCUMENT, [
        {
            id: 123,
            title: 'Contexts',
            filepath: '/a/b/c/d/Contexts.md',
            vaultId: 'vault-id',
        },
        {
            id: 124,
            title: 'Contexts',
            filepath: '/a/a/c/d/Contexts.md',
            vaultId: 'vault-id',
        },
        {
            id: 125,
            title: 'Contexts',
            filepath: '/a/a/a/d/Contexts.md',
            vaultId: 'vault-id',
        },
        {
            id: 126,
            title: 'Contexts',
            filepath: '/a/a/a/a/Contexts.md',
            vaultId: 'vault-id',
        },
        {
            id: 127,
            title: 'Contexts',
            filepath: '/a/b/d/d/Contexts.md',
            vaultId: 'vault-id',
        },
        {
            id: 127,
            title: 'Contexts',
            filepath: '/a/b/d/d/Aontexts.md',
            vaultId: 'vault-id',
        },
    ]);

    it('should find least common ancestor', ({ expect }) => {
        const leastCommonPathA = storage.getLeastCommonPath(
            'vault-id',
            StorageType.DOCUMENT,
            '/a/a/c/d/Contexts.md',
        );
        const leastCommonPathB = storage.getLeastCommonPath(
            'vault-id',
            StorageType.DOCUMENT,
            '/a/a/a/d/Contexts.md',
        );
        const leastCommonPathC = storage.getLeastCommonPath(
            'vault-id',
            StorageType.DOCUMENT,
            '/a/a/a/a/Contexts.md',
        );
        const leastCommonPathD = storage.getLeastCommonPath(
            'vault-id',
            StorageType.DOCUMENT,
            '/a/b/d/d/Aontexts.md',
        );
        expect(leastCommonPathA).toEqual('a/c/d/Contexts.md');
        expect(leastCommonPathB).toEqual('a/d/Contexts.md');
        expect(leastCommonPathC).toEqual('a/Contexts.md');
        expect(leastCommonPathD).toEqual('Aontexts.md');
    });
});
