import isPlainObject from 'lodash/isPlainObject';
import mergeWith from 'lodash/mergeWith';

export const isDailyDoc = (filename: string, folder: string): boolean => {
    const dailyDoc = extractDailyDoc(filename);
    return folder === 'My Day' && !!dailyDoc;
};

export const extractDailyDoc = (
    filename: string,
): { dailyDoc: string; title: string } | null => {
    const dailyDocFormat = /^(\d{4})[.\-\/]([01]\d)[.\-\/]([0123]\d)(.*)/i;
    const match = filename.match(dailyDocFormat);
    if (!match) return null;

    return {
        dailyDoc: `${match[1]}-${match[2]}-${match[3]}`,
        title: match[4].trim(),
    };
};

export const isTest = process.argv.includes('--test-type=webdriver');

/**
 * ensureSafeQuitAndInstall
 *
 * @access  public
 * @return  void
 */
export function ensureSafeQuitAndInstall() {
    const electron = require('electron');
    const app = electron.app;
    const BrowserWindow = electron.BrowserWindow;
    app.removeAllListeners('window-all-closed');
    const browserWindows = BrowserWindow.getAllWindows();
    for (const browserWindow of browserWindows) {
        browserWindow.removeAllListeners('close');
    }
}

export const filterUndefinedProperties = <T>(obj: any): T => {
    const isObject = (obj: any): obj is any => {
        return typeof obj === 'object';
    };
    if (!isObject(obj)) return obj;
    return Object.keys(obj).reduce((acc: any, key: string) => {
        if (Array.isArray(obj[key])) {
            acc[key] = obj[key].map((e: any) =>
                filterUndefinedProperties<any>(e),
            );
            return acc;
        }
        if (!obj[key]) return acc;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            acc[key] = filterUndefinedProperties<any>(obj[key]);
            return acc;
        }
        acc[key] = obj[key];
        return acc;
    }, {} as any);
};

export const isString = (x: any): x is string => {
    return Object.prototype.toString.call(x) === '[object String]';
};

export enum FileType {
    MARKDOWN = 'markdown',
    ATTACHMENT = 'attachment',
    CONFIG = 'config',
    UNSUPPORTED = 'unsupported',
}

export const resolveFileType = (ext: string): FileType => {
    const parsedExt = ext.replace('.', '');
    const attachmentExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'mp4',
        'avi',
        'mkv',
        'mov',
        'mp3',
        'wav',
    ];
    const configExtensions = ['json', 'yaml', 'yml'];
    if (parsedExt === 'md') return FileType.MARKDOWN;
    if (attachmentExtensions.includes(parsedExt)) return FileType.ATTACHMENT;
    if (configExtensions.includes(parsedExt)) return FileType.CONFIG;
    return FileType.UNSUPPORTED;
};

export const customMerge = (...objects) => {
    // Customizer function for mergeWith
    const customizer = (objValue, srcValue) => {
        // If both values are objects, continue merging
        if (isPlainObject(objValue) && isPlainObject(srcValue)) {
            return mergeWith({}, objValue, srcValue, customizer);
        }
        // Default behavior: srcValue takes precedence
        return srcValue;
    };

    // Use mergeWith and the customizer to merge all objects
    return mergeWith({}, ...objects, customizer);
};
