exports.config = {
  runner: 'local',
  headless: false,
  specs: [
    './test/specs/**/*.e2e.ts'
  ],
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 10,
  capabilities: [{
    browserName: 'chrome',
    'wdio:chromedriverOptions': {
      browserVersion: '114.0.5735.134',
    }
  }],
  logLevel: 'error',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [[
    'electron',
    {
      appPath: './dist-test',
      appName: 'acreom-test',
      appArgs: ['test=true'],
      chromedriver: {
        port: 9519,
        logFileName: 'wdio-chromedriver.log',
      },
      electronVersion: '25.2.0',
    },
  ],],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
}
