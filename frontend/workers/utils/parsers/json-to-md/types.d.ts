import { WorkerContext } from '~/@types/app';
import { IVault, WEntity } from '~/@types';
import { EntityStorage } from '~/workers/utils/parsers';

type MarkObj = { type: string; attrs?: Record<string, any> };
type MarksParserFn = (
    marksArray: MarkObj | MarkObj[],
    config: Config,
) => { open: string; close: string };

type ContentObj = {
    type: string;
    content?: ContentObj[];
    text?: string;
    attrs?: Record<string, any>;
    marks?: MarkObj[];
};

type Parser = (contentArray: ContentObj[]) => Promise<string>;
type ParserFn = (
    contentArray: ContentObj | ContentObj[],
    config: Config,
) => Promise<string>;
type ParserExtension = { type: string; parse: ParserFn };
type ParserExtensionResult = { result: string; matched: boolean };
type ParserDBQueries = {
    listByIds: (vaultId: string, ids: string[]) => Promise<any[]>;
    save: (vaultId: string, entity: any, ...args: any[]) => Promise<any>;
};
type HelperFunctions = {
    normalizeDocumentLink: (
        vaultPath: string | undefined,
        filepath: string,
    ) => string;
};
type Config = {
    vaultId: string;
    vault: IVault;
    context: WorkerContext;
    inline: {
        parse: ParserFn;
        extensions: ParserExtension[];
    };
    block: {
        parse: ParserFn;
        extensions: ParserExtension[];
    };
    marks: {
        parse: MarksParserFn;
        extensions: ParserExtension[];
    };
    list: {
        isActive: boolean;
        indent?: number;
        start?: number;
        type?: 'orderedList' | 'bulletList' | 'taskList';
        level?: number;
    };
    paragraph: any;
    helpers: HelperFunctions;
    entities: Record<string, any[]>;
    entity: WEntity;
    index: number;
    total: number;
    entityFilepath?: string;
    storage: EntityStorage;
} & Record<string, any>;
