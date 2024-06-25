// @ts-ignore
const service = require('wdio-electron-service');
// @ts-ignore
const utils = require('./utils');
describe('Labels', function() {
  const testUtils = new utils.TestUtils(service, this);

  before(async () => {
    await testUtils.setupVault();
    await service.browser.switchWindow('acreom');
    await testUtils.createAndOpenVault();
  })

  it('should create label in page', async () => {
    await testUtils.pageUtils.createPage('test labels', 'test content #hello-world');
    const labelInPageExists = await testUtils.labelUtils.existsInPage('#hello-world', 'test labels');
    const labelInSettingsExists = await testUtils.labelUtils.existsInSettings('hello-world');

    await expect(labelInPageExists && labelInSettingsExists).toEqual(true);
  })

  it('should delete label', async () => {
    await testUtils.controls.openSettings('Labels');
    await testUtils.controls.click('label-delete-hello-world');
    await testUtils.controls.click('label-delete-confirm');
    await service.browser.keys(['Escape']);
    const labelInPageExists = await testUtils.labelUtils.existsInPage('#hello-world', 'test labels');
    const labelInSettingsExists = await testUtils.labelUtils.existsInSettings('hello-world');

    await expect(!labelInPageExists && !labelInSettingsExists).toEqual(true);
  })
});
