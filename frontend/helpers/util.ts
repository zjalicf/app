import memoize from 'lodash/memoize';
import debounce from 'lodash/debounce';
import has from 'lodash/has';
import isPlainObject from 'lodash/isPlainObject';
import mergeWith from 'lodash/mergeWith';

import { CloudResponse, ReverseIndex } from '~/@types/app';
import { IDocument } from '~/components/document/model';
import { IFolder } from '~/@types';
import { FolderType } from '~/constants';

export const capitalize = (label: string) => {
    const arr = label.split(' ');
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(' ');
};

export const isDocument = (doc: any): doc is IDocument => {
    // @ts-ignore
    return doc && has(doc, 'content');
};

export const isFolder = (folder: any): folder is IFolder => {
    return (
        // @ts-ignore
        folder && has(folder, 'type') && folder.type === FolderType.FOLDER
    );
};

export const isProject = (project: any): project is IFolder => {
    return (
        // @ts-ignore
        project && has(project, 'type') && project.type === FolderType.PROJECT
    );
};

export const isSearch = (project: any): project is IFolder => {
    return (
        // @ts-ignore
        project && has(project, 'type') && project.type === 'search'
    );
};

export const extractDailyDoc = (
    filename: string,
): { dailyDoc: string; title: string } | null => {
    const acreomFormat = /^(\d{4})-([01]\d)-([0123]\d)(.*)/i;
    const craftFormat = /^(\d{4})\.([01]\d)\.([0123]\d)(.*)/i;

    const match = [acreomFormat, craftFormat].reduce((acc, regexp) => {
        if (acc) return acc;
        return filename.match(regexp);
    }, null as null | RegExpMatchArray);

    if (!match) return null;

    return {
        dailyDoc: `${match[1]}-${match[2]}-${match[3]}`,
        title: match[4].trim(),
    };
};

export const stringComparator = (a: string, b: string) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};

export const reverseIndexComparator = <T>(a: ReverseIndex<T>, b: string) => {
    return stringComparator(a.index!.slice(0, b.length), b);
};

export const transition = (to: any, from: any) => {
    if (process.env.platform !== 'mobile') return '';
    if (!from) {
        return '';
    }

    if (to.query.level && from.query.level) {
        if (+to.query.level === +from.query.level) return '';
        return +to.query.level > +from.query.level ? 'deeper' : 'back';
    }

    return '';
};

export const binSearch = <T>(
    array: (T & { id: string })[],
    element: any,
    cmp?: (a: T, b: any) => number,
): (T & { id: string }) | null => {
    if (!cmp) {
        cmp = (a: T, b: any) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        };
    }
    let start = 0;
    let end = array.length - 1;

    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const res = cmp(array[mid], element);
        if (res === 0) {
            return array[mid];
        } else if (res < 0) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
    return null;
};

export const entitiesReduce = <T>(
    entities: T[],
    key: string,
): Record<string, T> => {
    return entities.reduce((acc, entity) => {
        acc[(entity as any)[key] as string] = entity;
        return acc;
    }, {} as Record<string, T>);
};

export const reverseString = (s: string) => {
    return s.split('').reverse().join('');
};

export const createReverseIndex = <T>(
    data: T[],
    property: string = 'index',
): ReverseIndex<T>[] => {
    return data
        .filter((d: any) => !!d[property])
        .map((d: any) => ({
            id: d.id,
            [property]: reverseString(d[property]),
            index: reverseString(d[property]),
            entity: d,
        }))
        .sort((a, b) => {
            return stringComparator(a[property], b[property]);
        }) as any[];
};

export const isCloudServiceResponse = (
    response: any,
): response is CloudResponse<any> => {
    return !!response?.status;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MemoizeDebouncedFunction<F extends (...args: any[]) => any> {
    (...args: Parameters<F>): void;

    flush: (...args: Parameters<F>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoizeDebounce<F extends (...args: any[]) => any>(
    func: F,
    wait = 0,
    options: _.DebounceSettings = {},
    resolver?: (...args: Parameters<F>) => unknown,
): MemoizeDebouncedFunction<F> {
    const debounceMemo = memoize<
        (...args: Parameters<F>) => _.DebouncedFunc<F>
    >(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (..._args: Parameters<F>) => debounce(func, wait, options),
        resolver,
    );

    function wrappedFunction(
        ...args: Parameters<F>
    ): ReturnType<F> | undefined {
        return debounceMemo(...args)(...args);
    }

    wrappedFunction.flush = (...args: Parameters<F>): void => {
        debounceMemo(...args).flush();
    };

    return wrappedFunction as unknown as MemoizeDebouncedFunction<F>;
}

export const customMerge = (...objects: any[]) => {
    // Customizer function for mergeWith
    const customizer = (objValue: any, srcValue: any): any => {
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
