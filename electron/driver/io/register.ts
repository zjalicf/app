import { Stats } from 'fs';

class ChangeRegister {
    changes: Record<string, Record<string, any>> = {};
    deletes: Record<string, Record<string, any>> = {};
    renames: Record<string, Record<string, any>> = {};

    registerFileWrite(vaultId: string, filepath: string, stats: Stats) {
        if (!this.changes[vaultId]) {
            this.changes[vaultId] = {};
        }
        const key = this.createRegisterKey(filepath, stats);
        this.changes[vaultId][key] = true;
    }

    registerDelete(vaultId: string, filepath: string) {
        if (!this.deletes[vaultId]) {
            this.deletes[vaultId] = {};
        }
        this.deletes[vaultId][filepath] = true;
    }

    registerRename(vaultId: string, from: string, to: string, toStats: Stats) {
        if (!this.renames[vaultId]) {
            this.renames[vaultId] = {};
        }
        const toKey = this.createRegisterKey(to, toStats);
        this.renames[vaultId][toKey] = from;
    }

    createRegisterKey(filepath: string, stats: Stats) {
        if (stats.isDirectory()) {
            return [filepath, stats.ino].join(' ');
        }
        return [filepath, stats.ino, Math.floor(stats.mtimeMs)].join(' ');
    }

    isFileWrite(vaultId: string, filepath: string, stats: Stats) {
        const key = this.createRegisterKey(filepath, stats);
        return !!this.changes[vaultId]?.[key];
    }

    isDelete(vaultId: string, filepath: string) {
        return !!this.deletes[vaultId]?.[filepath];
    }

    isRename(vaultId: string, from: string, to: string, stat: Stats): boolean {
        const key = this.createRegisterKey(to, stat);
        const renamedFrom = this.renames[vaultId]?.[key];
        return renamedFrom === from;
    }

    deleteRename(vaultId: string, from: string, to: string, stat: Stats) {
        const key = this.createRegisterKey(to, stat);
        if (this.renames[vaultId]?.[key] !== from) return;
        delete this.renames[vaultId]?.[key];
    }

    deleteFileWrite(vaultId: string, filepath: string, stats: Stats) {
        const key = this.createRegisterKey(filepath, stats);
        delete this.changes[vaultId]?.[key];
    }

    deleteFileDelete(vaultId: string, filepath: string) {
        delete this.deletes[vaultId]?.[filepath];
    }
}

export const changeRegister = new ChangeRegister();
