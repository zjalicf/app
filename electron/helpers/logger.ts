import log from 'electron-log';
const isDev = require('electron-is-dev');

log.transports.file.level = 'error';

if (!isDev) {
    log.transports.console.level = false;
}

export const scopedLogger = (scope: string) => {
    return log.scope(scope);
};
