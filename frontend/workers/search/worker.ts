import MiniSearch from './minisearch';
import { WorkerContext } from '~/@types/app';
import { GenericActions, SearchServiceAction, ServiceKey } from '~/constants';
import { WorkerBase } from '~/workers/base';

export class SearchWorker extends WorkerBase {
    private minisearch: MiniSearch;
    protected invokeTimeout: number = 10_000;
    protected serviceKey = ServiceKey.SEARCH;

    constructor() {
        super();
        const comms = this.getCommsFunctions();
        this.minisearch = new MiniSearch({ ...comms } as WorkerContext);
    }

    protected async handleMessage(
        operation: string,
        payload: any,
        messageId: string,
        service?: ServiceKey,
    ) {
        if (operation === GenericActions.RESPONSE) {
            this.invokeCallbacks[messageId]?.(payload);
            return;
        }
        const { index, entity } = payload;
        let response = {};
        switch (operation) {
            case SearchServiceAction.INDEX:
                this.minisearch.index(index, entity);
                break;
            case SearchServiceAction.INITIAL_INDEX:
                this.minisearch.indexInitial(index, entity);
                break;
            case SearchServiceAction.REMOVE:
                this.minisearch.remove(index, entity);
                break;
            case SearchServiceAction.GET_INTERACTIONS:
                response = await this.minisearch.getInteractions(
                    payload?.vaultId,
                );
                break;
            case SearchServiceAction.QUERY:
                response = await this.minisearch.search(
                    payload.query,
                    payload.options,
                );
                break;
            case SearchServiceAction.INDEX_INTERACTION:
                this.minisearch.indexInteraction({
                    ...entity,
                    vaultId: payload.vaultId,
                });
                break;
        }

        return this.emit(
            service || ServiceKey.SEARCH,
            GenericActions.RESPONSE,
            response ?? {},
            messageId,
        );
    }
}
