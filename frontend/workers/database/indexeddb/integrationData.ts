import { Table } from 'dexie';
import { IDatabaseChange, IUpdateChange } from 'dexie-observable/api';
import { unflatten } from 'flat';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase } from './base';
import { WorkerContext } from '~/@types/app';
import { ITask } from '~/components/task/model';
import {
    AnalyticsAction,
    JiraIntegrationAction,
    SearchIndex,
    SearchServiceAction,
    ServiceKey,
    UtilActions,
} from '~/constants';
import { JiraIntegrationDataType } from '~/constants/jira';
import { StorageType } from '~/workers/utils/parsers';
import {
    GithubIntegrationAction,
    GithubIntegrationDataType,
} from '~/components/github/github';
import { isGithubEntity } from '~/plugins/entities/github';
import { LinearIntegrationDataType } from '~/constants/linear';

export class IntegrationsDataIndexedDB extends IndexedDBBase<ITask> {
    shouldStoreLocally = false;
    protected entity = 'integrationData';
    protected platform: string;
    protected context: WorkerContext;
    protected batchSize = 30;
    protected pageSize = 300;

    public searchIndex = SearchIndex.INTEGRATION_DATA;
    public parserIndex = StorageType.INTEGRATION_DATA;
    public searchableEntities = [
        JiraIntegrationDataType.ISSUE,
        GithubIntegrationDataType.ISSUE,
        GithubIntegrationDataType.PR,
        LinearIntegrationDataType.ISSUE,
    ];

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.clientId = ctx.$config.clientId;
        this.platform = ctx.$config.platform;
        this.context = ctx;
    }

    table(vaultId: string): Table<ITask, string> {
        return acreomVaultIndexedDB(vaultId).IntegrationsData;
    }

    protected async subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        if (change.type !== 2) return;
        if (!isGithubEntity((change as IUpdateChange).obj)) return;
        if (change.source === 'initial_load') {
            return;
        }

        const integrationId = (change as IUpdateChange).obj.integrationId;

        if (!integrationId) {
            console.warn('No integrationId found for change', change);
            return;
        }

        const integration =
            await this.context.$deviceService.Integrations.retrieve(
                vaultId,
                integrationId,
            );

        if (!integration) {
            console.warn('No integration found for change', change);
            return;
        }

        this.emit(
            ServiceKey.INTEGRATIONS,
            GithubIntegrationAction.PROCESS_REMOTE_CHANGE,
            {
                config: integration,
                change,
            },
        );
    }

    protected async subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );

        if (change.type !== 2) return;
        const entity = (change as IUpdateChange).obj;
        const mods = unflatten<any, any>((change as IUpdateChange).mods);
        const oldEntity = (change as IUpdateChange).oldObj;

        const integrationId =
            (change as IUpdateChange).obj.integrationId ?? null;
        if (!integrationId) return;

        const key = JiraIntegrationDataType.ISSUE + '/';
        if (entity.id?.startsWith(key)) {
            const integration =
                await this.context.$deviceService.Integrations.retrieve(
                    vaultId,
                    integrationId,
                );
            this.context.emit(
                ServiceKey.INTEGRATIONS,
                JiraIntegrationAction.SAVE_ISSUE,
                {
                    integration,
                    entity,
                    mods,
                    oldEntity,
                },
            );
        }
    }

    public async initialIndex(vaultId: string) {
        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );
        if (!vault) return;
        let paginationId = null;
        do {
            const entities: any[] = await this.list(
                vaultId,
                undefined,
                (entity: any) => {
                    return this.searchableEntities.some(type =>
                        entity.id.startsWith(type),
                    );
                },
                paginationId,
            );
            if (!entities.length) break;
            paginationId = entities[entities.length - 1].id;
            this.context.emit(
                ServiceKey.SEARCH,
                SearchServiceAction.INITIAL_INDEX,
                {
                    index: this.searchIndex,
                    entity: entities,
                },
            );
        } while (paginationId);
    }
}
