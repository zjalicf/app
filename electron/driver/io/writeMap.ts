import { murmurHash } from '../../helpers/murmur';

const appWrites = {} as Record<string, number[]>;

const renames: Record<string, { to: string; inode: number; ts: number }> = {};

export const registerRename = (from: string, to: string, inode: number) => {
    renames[from] = { to, inode, ts: Date.now() };
};

export const isRename = (path: string, inode?: number) => {
    if (renames[path]) {
        const obj = renames[path];
        renames[path] = undefined;
        if (inode) {
            return obj.inode === inode;
        }
        return true;
    }
    return false;
};

const generateContentHash = (
    filepath: string,
    name: string,
    content?: string,
): number => {
    const hashContents = [filepath, name];
    if (content) {
        hashContents.push(content);
    }

    return murmurHash(hashContents.join('\n'));
};

const createWriteKey = (vaultId: string, filepath: string): string => {
    return [vaultId, filepath].join('_');
};

export const registerAppWrite = (
    vaultId: string,
    filepath: string,
    name: string,
    content?: string,
) => {
    const writeKey = createWriteKey(vaultId, filepath);
    if (!appWrites[writeKey]) {
        appWrites[writeKey] = [];
    }

    const hash = generateContentHash(filepath, name, content);
    appWrites[writeKey].push(hash);
};

export const isAppWrite = (
    vaultId: string,
    filepath: string,
    name: string,
    content?: string,
): boolean => {
    const writeKey = createWriteKey(vaultId, filepath);
    if (!appWrites[writeKey]) return false;
    const hash = generateContentHash(filepath, name, content);
    const index = appWrites[writeKey].indexOf(hash);
    if (index > -1) {
        appWrites[writeKey].splice(index, 1);
        if (appWrites[writeKey].length === 0) {
            delete appWrites[writeKey];
        }
        return true;
    }
    return false;
};
