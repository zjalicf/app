import { ChatCompletionTool } from 'openai/resources';
import { add, startOfDay } from 'date-fns';
import { WorkerContext } from '~/@types/app';
import {
    DatabaseServiceAction,
    SearchIndex,
    SearchServiceAction,
    ServiceKey,
} from '~/constants';
import {
    getEntityType,
    propertiesFilter,
    shouldPrepareUsers,
    translateGithubType,
} from '~/workers/assistant/chat/tools/filtering';
import { extractDate } from '~/helpers';
import { JiraIntegrationDataType } from '~/constants/jira';

export const getRelevantContentDefinition = {
    type: 'function',
    function: {
        name: 'get_relevant_content',
        description: 'function that searches for relevant content in the vault',
        parameters: {
            type: 'object',
            properties: {
                content_match: {
                    type: 'string',
                    description:
                        'content_match is a string that is used to search the content of the entities in the vault for a match, it can contain multiple values separated by a comma. Do not use values from properties_match in content match',
                },
                properties_match: {
                    type: 'object',
                    description:
                        'properties_match is an object that is used to search the properties of the entities in the vault for a match',
                    properties: {
                        type: {
                            type: 'object',
                            description: 'type of the entity',
                            properties: {
                                value: {
                                    type: 'string',
                                    description: 'value used to match type',
                                    enum: [
                                        'page',
                                        'daily_doc',
                                        'event',
                                        'issue',
                                        'pull_request',
                                    ],
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq'],
                                },
                            },
                        },
                        assignee: {
                            type: 'object',
                            description:
                                'identifier of the user that is assigned to the entity',
                            properties: {
                                value: {
                                    type: 'string',
                                    description:
                                        'value of the assignee that is used to search for a match',
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq'],
                                },
                            },
                        },
                        status: {
                            type: 'object',
                            description: 'state of the entity',
                            properties: {
                                value: {
                                    type: 'string',
                                    description:
                                        'value of the state that is used to search for a match',
                                    enum: [
                                        'todo',
                                        'in_progress',
                                        'done',
                                        'open',
                                        'closed',
                                        'merged',
                                    ],
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq'],
                                },
                            },
                        },
                        creator: {
                            type: 'object',
                            description:
                                'identifier of the user that created the entity',
                            properties: {
                                value: {
                                    type: 'string',
                                    description:
                                        'value of the creator that is used to search for a match',
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq'],
                                },
                            },
                        },
                        // created_at: {
                        //     type: 'object',
                        //     description:
                        //         'date when the entity was created, use relative value to today e.g. 0 for today, -1 for yesterday, 1 for tomorrow',
                        //     properties: {
                        //         value: {
                        //             type: 'number',
                        //             description:
                        //                 'value of the created_at that is used to search for a match',
                        //         },
                        //         operation: {
                        //             type: 'string',
                        //             description:
                        //                 'operation that is used to compare values',
                        //             enum: ['eq', 'neq', 'gte', 'lte'],
                        //         },
                        //     },
                        // },
                        // updated_at: {
                        //     type: 'object',
                        //     description:
                        //         'date when the entity was updated, use relative value to today e.g. 0 for today, -1 for yesterday, 1 for tomorrow',
                        //     properties: {
                        //         value: {
                        //             type: 'number',
                        //             description:
                        //                 'value of the updated_at that is used to search for a match',
                        //         },
                        //         operation: {
                        //             type: 'string',
                        //             description:
                        //                 'operation that is used to compare values',
                        //             enum: ['eq', 'neq', 'gte', 'lte'],
                        //         },
                        //     },
                        // },
                        start_date: {
                            type: 'object',
                            description:
                                'start date, use relative value to today e.g. 0 for today, -1 for yesterday, 1 for tomorrow',
                            properties: {
                                value: {
                                    type: 'number',
                                    description:
                                        'value of the start_date that is used to search for a match',
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq', 'gte', 'lte'],
                                },
                            },
                        },
                        end_date: {
                            type: 'object',
                            description:
                                'end date, use relative value to today e.g. 0 for today, -1 for yesterday, 1 for tomorrow',
                            properties: {
                                value: {
                                    type: 'number',
                                    description:
                                        'value of the end_date that is used to search for a match',
                                },
                                operation: {
                                    type: 'string',
                                    description:
                                        'operation that is used to compare values',
                                    enum: ['eq', 'neq', 'gte', 'lte'],
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as ChatCompletionTool;

export const getRelevantContent = (ctx: WorkerContext) => {
    return async (vaultId: string, args: any) => {
        const relevantEntities = await retrieveContent(ctx, vaultId, args);
        const serializedEntities = await serializeForAssistant(
            ctx,
            vaultId,
            relevantEntities,
        );
        const topEntities = serializedEntities.slice(0, 5);
        const ids = topEntities.map((entity: any) => entity.id);
        topEntities.forEach((entity: any) => {
            delete entity.id;
        });
        return {
            metadata: {
                totalResultsCount: serializedEntities.length,
                providedResultsCount: topEntities.length,
            },
            content: topEntities,
            ids,
        };
    };
};

const retrieveContent = async (
    ctx: WorkerContext,
    vaultId: string,
    { content_match, properties_match }: any,
) => {
    const contentMatch = content_match?.split?.(',') ?? [];
    properties_match = Object.entries(properties_match ?? {}).map(
        ([key, value]: [string, any]) => ({
            key,
            ...value,
        }),
    );

    if (contentMatch.length) {
        let userData = {};
        if (shouldPrepareUsers(properties_match)) {
            userData = await ctx.invoke<any>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.GET_INTEGRATIONS_MYSELF,
                {
                    vaultId,
                },
            );
        }
        const entities = await getRelevantEntities(
            ctx,
            vaultId,
            contentMatch.join(' '),
        );
        return propertiesFilter(entities, properties_match ?? [], userData);
    } else {
        const response = await ctx.invoke<any>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_RELEVANT_CONTENT,
            {
                payload: {
                    vaultId,
                    propertiesMatch: properties_match ?? {},
                },
            },
        );
        return response.payload ?? response ?? [];
    }
};

const serializeForAssistant = async (
    ctx: WorkerContext,
    vaultId: string,
    entities: any[],
) => {
    const jiraMetadata: Record<string, any> = {};
    const jiraEntities = entities.filter(
        entity => getEntityType(entity) === 'jira',
    );
    if (jiraEntities.length) {
        const ids = new Set();
        for (const entity of jiraEntities) {
            if (!entity.id.startsWith(JiraIntegrationDataType.ISSUE)) {
                continue;
            }
            ids.add(entity.properties.status);
            ids.add(entity.properties.assignee);
            ids.add(entity.properties.project);
        }
        const metadata = await ctx.invoke<any[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_IDS,
            {
                vaultId,
                table: 'integrationsData',
                payload: {
                    vaultId,
                    ids: [...ids.values()].filter(v => !!v),
                },
            },
        );
        for (const item of metadata) {
            jiraMetadata[item.id] = item;
        }
    }

    return entities
        .map(entity => {
            const type = getEntityType(entity);
            if (type === 'page') {
                return {
                    id: entity.id,
                    source: 'acreom',
                    type: entity.dailyDoc ? 'My Day' : 'page',
                    title: entity.title,
                    content: entity.mdContent ?? entity.content,
                    status: entity.pageStatus,
                    start: entity.dailyDoc ?? extractDate(entity.start),
                    created_at: entity.createdAt,
                    updated_at: entity.updatedAt,
                };
            }
            if (type === 'github') {
                return {
                    id: entity.id,
                    source: 'github',
                    title: entity.title,
                    type: translateGithubType(entity.type),
                    content: entity.body_html,
                    status: entity.state,
                    created_by: entity.user?.login ?? 'none',
                    assignee: entity.assignee?.login ?? 'none',
                    number: entity.number,
                    repository:
                        entity.repository?.full_name ??
                        entity.base?.repo?.full_name ??
                        'none',
                    created_at: entity.created_at,
                    updated_at: entity.updated_at,
                };
            }
            if (type === 'jira') {
                return {
                    id: entity.id,
                    source: 'jira',
                    type: entity.properties?.issuetype?.name,
                    title: entity.text,
                    content: entity.description,
                    key: entity.key,
                    status: jiraMetadata[entity.properties.status]?.status
                        ?.name,
                    assignee:
                        jiraMetadata[entity.properties.assignee]?.displayName ??
                        'none',
                    project: jiraMetadata[entity.properties.project]?.name,
                    created_at: entity.created_at,
                    updated_at: entity.updated_at,
                };
            }
            return null;
        })
        .filter(v => !!v)
        .sort(
            (a, b) =>
                new Date(b!.updated_at).getTime() -
                new Date(a!.updated_at).getTime(),
        );
};

const indexToTable = (index: SearchIndex): string => {
    const tableMap = {
        [SearchIndex.DOCUMENT]: 'documents',
        [SearchIndex.MY_DAY]: 'documents',
        [SearchIndex.JIRA_ISSUE]: 'integrationsData',
        [SearchIndex.INTEGRATION_DATA]: 'integrationsData',
    } as any;
    return tableMap[index];
};

const getRelevantEntities = async (
    context: WorkerContext,
    vaultId: string,
    query: string,
) => {
    const results = await context.invoke<{ documents: any[] }>(
        ServiceKey.SEARCH,
        SearchServiceAction.QUERY,
        {
            query,
            options: {
                fields: ['title', 'content'],
                activeVault: {
                    id: vaultId,
                },
                thisVaultOnly: true,
                excludeTypes: [SearchIndex.COMMANDS],
            },
            callerContext: 'tools/content.ts/getRelevantEntities',
        },
    );
    const scoreMap: Record<string, number> = {};

    const queries = results.documents.reduce((acc, val) => {
        const table = indexToTable(val.searchIndexType);
        if (!acc[table]) {
            acc[table] = [];
        }
        acc[table].push(val.id);
        scoreMap[val.id] = val.score;
        return acc;
    }, {} as any);

    const queryKeys = Object.keys(queries);

    const entities = await Promise.all(
        queryKeys.map(table => {
            return context.invoke<any[]>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.LIST_BY_IDS,
                {
                    vaultId,
                    table,
                    payload: {
                        vaultId,
                        ids: queries[table],
                    },
                    callerContext: 'tools/content.ts/getRelevantEntities',
                },
            );
        }),
    );
    return entities
        .map((entity, index) => {
            return entity.map((item: any) => ({
                ...item,
                dbTableName: queryKeys[index],
            }));
        })
        .flat()
        .sort((a, b) => {
            return (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0);
        });
};
