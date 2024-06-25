// @ts-ignore
const service = require('wdio-electron-service');
// @ts-ignore
const utils = require('./utils');

describe('Local Vaults', function () {
    const testUtils = new utils.TestUtils(service, this);

    before(async () => {
        await testUtils.setupVault();
        await service.browser.switchWindow('acreom');
        await testUtils.createAndOpenVault();
    });

    it('Create page in acreom', async () => {
        await testUtils.pageUtils.createPage('test page', 'test content');

        const pageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'test page',
        );
        const pageExistsInVault = testUtils.localVault.pageExists('test page');

        await expect(pageExistsInAcreom && pageExistsInVault).toEqual(true);
    });

    it('Create page in file system', async () => {
        await testUtils.localVault.createPage(
            'file from file system',
            'test content',
        );

        const pageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'file from file system',
        );
        await expect(pageExistsInAcreom).toEqual(true);
    });

    it('Edit page in acreom', async () => {
        await testUtils.pageUtils.replaceContent(
            'test page',
            'this is new content from text',
        );
        const page = testUtils.localVault.getPage('test page');

        await expect(page.content).toEqual('this is new content from text');
    });

    it('Edit page in file system', async () => {
        await testUtils.localVault.replaceContent(
            'file from file system',
            'updated content from file system',
        );
        const pageInAcreom = await testUtils.pageUtils.getPage(
            'file from file system',
        );

        await expect(pageInAcreom.content).toEqual(
            'updated content from file system',
        );
    });

    it('Create folder in acreom', async () => {
        await testUtils.folderUtils.createFolder('test folder');
        const folderExistsInVault =
            testUtils.localVault.folderExists('test folder');

        await expect(folderExistsInVault).toEqual(true);
    });

    it('Create folder in file system', async () => {
        await testUtils.localVault.createFolder('folder from file system');
        const folderExistsInAcreom = await testUtils.folderUtils.folderExists(
            'folder from file system',
        );

        await expect(folderExistsInAcreom).toEqual(true);
    });

    it('Rename page in acreom', async () => {
        await testUtils.pageUtils.renamePage('test page', 'renamed page');
        const pageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'renamed page',
        );
        const pageExistsInVault =
            testUtils.localVault.pageExists('renamed page');
        const oldPageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'test page',
        );
        const oldPageExistsInVault =
            testUtils.localVault.pageExists('test page');

        await expect(
            pageExistsInAcreom &&
                pageExistsInVault &&
                !oldPageExistsInAcreom &&
                !oldPageExistsInVault,
        ).toEqual(true);
    });

    it('Rename page in file system', async () => {
        await testUtils.localVault.renamePage(
            'file from file system',
            'renamed file from file system',
        );
        const pageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'renamed file from file system',
        );
        const pageExistsInVault = testUtils.localVault.pageExists(
            'renamed file from file system',
        );
        const oldPageExistsInAcreom = await testUtils.pageUtils.pageExists(
            'file from file system',
        );
        const oldPageExistsInVault = testUtils.localVault.pageExists(
            'file from file system',
        );

        await expect(
            pageExistsInAcreom &&
                pageExistsInVault &&
                !oldPageExistsInAcreom &&
                !oldPageExistsInVault,
        ).toEqual(true);
    });

    it('Rename folder in acreom', async () => {
        await testUtils.folderUtils.renameFolder(
            'test folder',
            'renamed folder',
        );
        const folderExistsInAcreom = await testUtils.folderUtils.folderExists(
            'renamed folder',
        );
        const folderExistsInVault =
            testUtils.localVault.folderExists('renamed folder');
        const oldFolderExistsInAcreom =
            await testUtils.folderUtils.folderExists('test folder');
        const oldFolderExistsInVault =
            testUtils.localVault.folderExists('test folder');

        await expect(
            folderExistsInAcreom &&
                folderExistsInVault &&
                !oldFolderExistsInAcreom &&
                !oldFolderExistsInVault,
        ).toEqual(true);
    });

    it('Rename folder in file system', async () => {
        await testUtils.localVault.renameFolder(
            'folder from file system',
            'renamed folder from file system',
        );
        const folderExistsInAcreom = await testUtils.folderUtils.folderExists(
            'renamed folder from file system',
        );
        const folderExistsInVault = testUtils.localVault.folderExists(
            'renamed folder from file system',
        );
        const oldFolderExistsInAcreom =
            await testUtils.folderUtils.folderExists('folder from file system');
        const oldFolderExistsInVault = testUtils.localVault.folderExists(
            'folder from file system',
        );

        await expect(
            folderExistsInAcreom &&
                folderExistsInVault &&
                !oldFolderExistsInAcreom &&
                !oldFolderExistsInVault,
        ).toEqual(true);
    });

    it('Move page to folder in acreom', async () => {
        await testUtils.pageUtils.moveToFolder(
            'renamed page',
            'renamed folder',
        );
        await testUtils.folderUtils.toggleFolder('renamed folder');
        const pageExistsInAcreom = await testUtils.pageUtils.pageExistsInFolder(
            'renamed page',
            'renamed folder',
        );
        const pageExistsInVault = testUtils.localVault.pageExistsInFolder(
            'renamed page',
            'renamed folder',
        );
        const pageExistsInVaultRoot = testUtils.localVault.pageExistsInFolder(
            'renamed page',
            '',
        );

        await expect(
            pageExistsInAcreom && pageExistsInVault && !pageExistsInVaultRoot,
        ).toEqual(true);
    });

    it('Move page to folder in file system', async () => {
        await testUtils.localVault.moveToFolder(
            'renamed file from file system',
            'renamed folder from file system',
        );
        await testUtils.folderUtils.toggleFolder(
            'renamed folder from file system',
        );
        const pageExistsInAcreom = await testUtils.pageUtils.pageExistsInFolder(
            'renamed file from file system',
            'renamed folder from file system',
        );
        const pageExistsInVault = testUtils.localVault.pageExistsInFolder(
            'renamed file from file system',
            'renamed folder from file system',
        );
        const pageExistsInVaultRoot = testUtils.localVault.pageExistsInFolder(
            'renamed file from file system',
            '',
        );

        await expect(
            pageExistsInAcreom && pageExistsInVault && !pageExistsInVaultRoot,
        ).toEqual(true);
    });
});
