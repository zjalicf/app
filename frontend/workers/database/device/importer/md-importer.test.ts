import { describe, it } from 'vitest';
import { v4 } from 'uuid';
import { FileImporter } from '~/workers/database/device/importer';
import {
    TestLoader,
    TestParser,
    TestStorageResolver,
} from '~/workers/database/device/importer/importer.setup';
import { DeviceReporter } from '~/workers/database/reporter';
import { IVault } from '~/@types';

describe('MDImporter', () => {
    const vaultId = v4();
    const storage = new TestStorageResolver();

    it('should import MD   files', async ({ expect }) => {
        const mdImporter = new FileImporter(
            { id: vaultId } as IVault,
            {
                invoke: (..._args: any[]) => Promise.resolve(),
                $config: { os: 'linux' },
            } as any,
            new TestLoader() as any,
            new TestParser(),
            storage as any,
            new DeviceReporter({} as any, vaultId),
        );
        await mdImporter.importUsingFilepath('/vault/test');
        expect(storage.storage[vaultId].document).toHaveLength(4);
        expect(storage.storage[vaultId].folder).toHaveLength(1);
    });
});
