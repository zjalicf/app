import * as path from 'path';
import * as os from 'os';
import { readdir } from 'fs/promises';
import { app, session } from 'electron';

export const setupDevelopmentEnvironment = async () => {
    const vueDevToolsDir =
        process.platform === 'darwin'
            ? path.join(
                  os.homedir(),
                  '/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd',
              )
            : path.join(
                  os.homedir(),
                  '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\nhdogjmejiglipccpnnnanhbledajbpd',
              );
    try {
        const versions = await readdir(vueDevToolsDir);
        const vueDevToolsVersion = versions.pop();

        app.whenReady().then(async () => {
            await session.defaultSession.loadExtension(
                path.join(vueDevToolsDir, vueDevToolsVersion),
            );
        });
    } catch (e) {
        console.log('Could not find Vue extension');
    }
};
