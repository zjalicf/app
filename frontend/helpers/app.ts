import { isElectron } from '~/helpers/is-electron';
import { SafeElectronWindow } from '~/@types';
import { acreomConfigIndexedDB } from '~/workers/database/indexeddb';

export const cleanCache = async () => {
    localStorage.clear();
    sessionStorage.clear();

    const versions =
        await acreomConfigIndexedDB.retrieveVaultDatabaseVersions();

    // @ts-ignore
    await Promise.all(
        versions.map(({ name }: any) => {
            if (!name) return Promise.resolve();
            return indexedDB.deleteDatabase(name) as any;
        }),
    );
};

export const reloadApp = () => {
    window.location.reload();
};

export const restartApp = () => {
    if (isElectron()) {
        (window as SafeElectronWindow).electron.restart();
        return;
    }

    window.location.reload();
};
