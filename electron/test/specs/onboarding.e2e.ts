// @ts-ignore
const service = require('wdio-electron-service');
// @ts-ignore
const utils = require('./utils');
describe('Onboarding', function() {
  const testUtils = new utils.TestUtils(service, this);

  before(async () => {
    await testUtils.setupVault();
    await service.browser.switchWindow('acreom');
    await testUtils.createAndOpenVault();
  })
});
