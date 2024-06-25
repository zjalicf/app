import { createParser as createJSONtoMDParser } from './json-to-md';
import { createParser as createMDtoHTMLParser } from './md-to-html';
import * as helpers from './helpers';
import { WorkerContext } from '~/@types/app';

export { ParserWrapper } from './wrapper';
export { EntityStorage, StorageType } from './storage';

export const createJSONParser = (ctx: WorkerContext) => {
    const config = {
        context: ctx,
        helpers,
    } as any;

    return createJSONtoMDParser(config);
};
export const createMDParser = (ctx: WorkerContext) => {
    const config = {
        context: ctx,
        helpers,
    };
    return createMDtoHTMLParser(config);
};
