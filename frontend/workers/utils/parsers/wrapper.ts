import { EntityStorage, StorageType } from './storage';
import { WorkerContext } from '~/@types/app';
import { ITask } from '~/components/task/model';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

type ParserContext = WorkerContext & {
    storage: EntityStorage;
    tasks?: ITask[];
};

export type ParserEntity = {
    id: string;
    filepath: string;
    content: string;
    type: string;
    vaultId: string;
    [key: string]: any;
};

type Parser = (entity: ParserEntity, context: ParserContext) => Promise<string>;

export class ParserWrapper {
    htmlParser: Parser;
    mdParser: Parser;
    storage: EntityStorage;
    context: WorkerContext;

    constructor(
        workerContext: WorkerContext,
        htmlParser: Parser,
        mdParser: Parser,
        storage: EntityStorage,
    ) {
        this.htmlParser = htmlParser;
        this.mdParser = mdParser;
        this.storage = storage;
        this.context = workerContext;
    }

    async parseHTMLtoMD(vaultId: string, entity: any): Promise<string[]> {
        if (!Array.isArray(entity)) {
            entity = [entity];
        }
        const output = [];
        for (const e of entity) {
            const parsedContent = await this.htmlParser(
                { ...e, vaultId },
                {
                    ...this.context,
                    storage: this.storage,
                },
            );
            output.push(parsedContent);
        }
        return output;
    }

    async parseMDtoHTML(vaultId: string, entity: any): Promise<string[]> {
        if (!Array.isArray(entity)) {
            entity = [entity];
        }
        if (!entity.length) {
            return [];
        }
        const output = [];
        for (const e of entity) {
            const parsedContent = await this.mdParser(
                { ...e, vaultId },
                {
                    ...this.context,
                    storage: this.storage,
                },
            ).catch(() => e.content);
            output.push(parsedContent);
        }
        const pairings = [
            // [StorageType.TASK, 'tasks'],
            // [StorageType.LABEL, 'labels'],
            // [StorageType.EVENT, 'events'],
            [StorageType.IMAGE, 'images'],
            [StorageType.DOCUMENT, 'documents'],
        ] as [StorageType, string][];

        for (const [storage, table] of pairings) {
            this.createNewEntities(storage, table);
        }
        return output;
    }

    createNewEntities(storage: StorageType, table: string) {
        const newEntities = this.storage.listParserStorage(storage);
        const vaultIds = Object.keys(newEntities).filter(
            (vaultId: string) => newEntities[vaultId].length > 0,
        );

        for (const vaultId of vaultIds) {
            const entities = newEntities[vaultId].map(e => ({ ...e, vaultId }));

            this.context.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.SAVE_BULK,
                {
                    table,
                    payload: {
                        vaultId,
                        entity: entities,
                        meta: {
                            writeToDevice: table === 'tasks',
                            clientId: table === 'tasks' ? 'importer' : 'device',
                        },
                    },
                },
            );
            this.storage.clearParserStorage(vaultId, storage);
        }
    }
}
