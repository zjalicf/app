import { protocol } from 'electron';
import * as path from 'path';

const FRONTEND_PATH = path.join(__dirname, 'acreom');
const PRODUCTION_APP_PROTOCOL = 'app';

export const registerProtocol = () => {
    protocol.registerFileProtocol(
        PRODUCTION_APP_PROTOCOL,
        (request, callback) => {
            const relativePath = path.normalize(new URL(request.url).pathname);
            const absolutePath = path.join(FRONTEND_PATH, relativePath);
            callback({ path: absolutePath });
        },
    );

    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURI(request.url.replace('file:///', ''));
        callback(pathname);
    });
};
