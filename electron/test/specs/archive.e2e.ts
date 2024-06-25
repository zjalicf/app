// @ts-ignore
const service = require('wdio-electron-service');
// @ts-ignore
const utils = require('./utils');

describe('Archive', function () {
    const testUtils = new utils.TestUtils(service, this);

    before(async () => {
        await testUtils.setupVault();
        await service.browser.switchWindow('acreom');
        await testUtils.createAndOpenVault();
    });

    it('should archive page', async () => {
        const pageTitle = 'archive test page';
        await testUtils.pageUtils.archivePage(pageTitle);
        const isArchivedInAcreom = await testUtils.pageUtils.isArchived(
            pageTitle,
        );
        const isArchivedLocally = testUtils.localVault.isArchived(pageTitle);
        const pageExistsInAcreom = await testUtils.pageUtils.pageExists(
            pageTitle,
        );
        const pageExistsInVault = testUtils.localVault.pageExists(pageTitle);

        await expect(
            isArchivedInAcreom &&
                isArchivedLocally &&
                !pageExistsInAcreom &&
                !pageExistsInVault,
        ).toEqual(true);
    });
});
