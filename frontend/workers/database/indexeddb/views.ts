import { Table } from 'dexie';
import { IndexedDBBase } from '~/workers/database/indexeddb/base';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { IView } from '~/components/view/model';
import { EntityEncryption } from '~/workers/database/encryption/entity';
import { WorkerContext } from '~/@types/app';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { viewEncryptedProperties } from '~/workers/encryption/datagrams';
import {
    GroupingOptions,
    SearchIndex,
    SearchServiceAction,
    ServiceKey,
    SortingOptions,
    ViewType,
} from '~/constants';

export class ViewsIndexedDB extends IndexedDBBase<any> {
    shouldStoreLocally = false;
    entity = 'view';
    searchIndex = SearchIndex.VIEW;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.encryption = new EntityEncryption(
            ctx,
            EncryptionDatagramType.VIEW,
            viewEncryptedProperties,
        );
    }

    table(vaultId: string): Table<IView, string> {
        return acreomVaultIndexedDB(vaultId).Views;
    }

    public async initialIndex(vaultId: string) {
        const vault = await this.context.$deviceService.Vaults.retrieve(
            '',
            vaultId,
        );
        if (!vault) return;
        const views = await this.list(vaultId);

        const defaultViews = this.defaultViews()
            .filter(view => !views.find(v => v.type === view.type))
            .map(view => {
                return {
                    ...view,
                    vaultId,
                };
            });

        this.context.emit(
            ServiceKey.SEARCH,
            SearchServiceAction.INITIAL_INDEX,
            {
                index: this.searchIndex,
                entity: [...defaultViews, ...views],
            },
        );
    }

    defaultViews() {
        return [
            {
                id: ViewType.ACTIVE,
                isDefault: true,
                order: 0,
                type: ViewType.ACTIVE,
                name: 'Active',
                icon: 'InProgressIcon',
                color: '#577DCB',
                display: true,
                definition: [
                    {
                        combine: 'and',
                        definition: [
                            {
                                property: 'template',
                                operation: 'neq',
                                value: true,
                            },
                            {
                                property: 'dailyDoc',
                                operation: 'isNotSet',
                                value: null,
                            },
                            {
                                property: 'pageStatus',
                                operation: 'isSet',
                                value: null,
                            },
                            {
                                property: 'archived',
                                operation: 'neq',
                                value: true,
                            },
                        ],
                    },
                ],
                viewOptions: {
                    groupBy: GroupingOptions.PAGE_STATUS,
                    sortBy: SortingOptions.MANUAL,
                    sortDirection: 'desc',
                    collapsed: {},
                    showTasks: false,
                    hideCompletedTasks: false,
                    selectedDisplayProperties: [
                        'status',
                        'icon',
                        'tasks',
                        'date',
                        'updated',
                    ],
                    displayProperties: [
                        'status',
                        'icon',
                        'tasks',
                        'date',
                        'breadcrumbs',
                        'updated',
                        'created',
                    ],
                },
            },
            {
                id: ViewType.ALL_PAGES,
                isDefault: true,
                order: 500,
                type: ViewType.ALL_PAGES,
                name: 'All Pages',
                icon: 'InterfaceFileDouble',
                color: '#9283ED',
                display: true,
                definition: [
                    {
                        combine: 'and',
                        definition: [
                            {
                                property: 'template',
                                operation: 'neq',
                                value: true,
                            },
                            {
                                property: 'archived',
                                operation: 'neq',
                                value: true,
                            },
                        ],
                    },
                ],
                viewOptions: {
                    sortBy: SortingOptions.UPDATED_AT,
                    sortDirection: 'desc',
                    collapsed: {},
                    showTasks: false,
                    hideCompletedTasks: false,
                    selectedDisplayProperties: [
                        'icon',
                        'tasks',
                        'date',
                        'breadcrumbs',
                        'updated',
                    ],
                    displayProperties: [
                        'status',
                        'icon',
                        'tasks',
                        'date',
                        'breadcrumbs',
                        'updated',
                        'created',
                    ],
                },
            },
            {
                id: ViewType.ARCHIVE,
                isDefault: true,
                order: 1000,
                type: ViewType.ARCHIVE,
                name: 'Archive',
                icon: 'InterfaceContentArchive',
                color: '#626F83',
                display: true,
                definition: [
                    {
                        combine: 'and',
                        definition: [
                            {
                                property: 'template',
                                operation: 'neq',
                                value: true,
                            },
                            {
                                property: 'dailyDoc',
                                operation: 'isNotSet',
                                value: null,
                            },
                            {
                                property: 'archived',
                                operation: 'eq',
                                value: true,
                            },
                        ],
                    },
                ],
                viewOptions: {
                    sortBy: SortingOptions.UPDATED_AT,
                    sortDirection: 'desc',
                    collapsed: {},
                    showTasks: false,
                    hideCompletedTasks: false,
                    selectedDisplayProperties: ['icon', 'updated'],
                    displayProperties: [
                        'status',
                        'icon',
                        'tasks',
                        'date',
                        'breadcrumbs',
                        'updated',
                        'created',
                    ],
                },
            },
        ];
    }
}
