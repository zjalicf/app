import { isElectron } from '~/helpers/is-electron';
import { SafeElectronWindow } from '~/@types';
const LOCAL_STORAGE_PREFIX = '_app_storage';

const localStorageWrapper = {
    getQueryKey(key: string): string {
        return `${LOCAL_STORAGE_PREFIX}_${key}`;
    },
    get(key: string): any {
        const storageKey = this.getQueryKey(key);
        let value;
        const data = localStorage.getItem(storageKey);

        if (!data) return null;

        try {
            value = JSON.parse(data);
        } catch (e) {
            if (localStorage[storageKey]) {
                value = { data: localStorage.getItem(storageKey) };
            } else {
                return null;
            }
        }

        if (typeof value === 'object' && typeof value.data !== 'undefined') {
            return value.data;
        }

        return null;
    },
    set(key: string, value: any): void {
        const storageKey = this.getQueryKey(key);

        try {
            localStorage.setItem(storageKey, JSON.stringify({ data: value }));
        } catch (e) {
            console.warn('localStorage is full');
        }
    },
    delete(key: string): void {
        const storageKey = this.getQueryKey(key);
        localStorage.removeItem(storageKey);
    },
};

export class AppStorage {
    private adapter:
        | typeof localStorageWrapper
        | SafeElectronWindow['electron']['store'];

    constructor() {
        if (isElectron()) {
            this.adapter = (window as SafeElectronWindow).electron.store;
        } else {
            this.adapter = localStorageWrapper;
        }
    }

    get(key: string): any {
        const value = this.adapter.get(key);
        return value;
    }

    set(key: string, value: any): void {
        this.adapter.set(key, value);
    }

    delete(key: string): void {
        this.adapter.delete(key);
    }
}
