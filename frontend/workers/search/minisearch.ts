import { format, parseISO } from 'date-fns';
import Minisearch, { SearchOptions, SearchResult } from 'minisearch';
// @ts-ignore
import { DOMParser } from 'xmldom';
import isDate from 'lodash/isDate';
import { validate } from 'uuid';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { WorkerContext } from '~/@types/app';
import { spacedLabelRegexp } from '~/constants/regexp';
import { CloudServiceAction, SearchIndex, ServiceKey } from '~/constants';
import { IEvent, IVault } from '~/@types';
import { ITask, TaskDateObject } from '~/components/task/model';
import { extractDate, formatRelativeToDate } from '~/helpers';
import {
    formatDailyDoc,
    getResultContentHighlight,
    getResultHighlights,
    highlightText,
} from '~/workers/search/highlight';
import { JiraIntegrationDataType } from '~/constants/jira';
import { labelsFromText } from '~/plugins/entities/label';
import {
    GithubIntegrationDataType,
    GithubLabel,
} from '~/components/github/github';
import { LinearIntegrationDataType } from '~/constants/linear';

export const deserializeTaskDateObject = (taskDate: TaskDateObject) => {
    return taskDate
        ? {
              date: taskDate.date
                  ? taskDate.date instanceof Date
                      ? taskDate.date
                      : parseISO(taskDate.date)
                  : null,
              dateTime: taskDate.dateTime
                  ? taskDate.dateTime instanceof Date
                      ? taskDate.dateTime
                      : parseISO(taskDate.dateTime)
                  : null,
              timeZone: taskDate.timeZone || null,
          }
        : null;
};

type Interaction = {
    id: string;
    title: string;
    dailyDoc: string;
    vaultId: string;
    timestamp: number;
};

type Indexable = {
    id: string | number;
    title: string;
    content: string;
    vaultId: string;
    searchIndexType: SearchIndex;
    entityType: string;
    date?: string;
    updatedAt?: string;
    labels?: string[];
    project?: string;
    isNew?: boolean;
    inactive?: boolean;
    prefix?: string;
};

export default class MiniSearch {
    private idToIndex: Record<string, number> = {};
    private indexToId: Record<number, string> = {};
    private maxIndex = 1;
    private context: WorkerContext;
    private interactions: Interaction[] = [];
    private taskCompletedMap = new Set<number>();

    private searchIndex: Minisearch;

    private baseBoosts = {
        title: 2,
        content: 1,
        date: 1.5,
        labels: 1.5,
    };

    constructor(ctx: WorkerContext) {
        this.context = ctx;

        this.searchIndex = new Minisearch({
            fields: ['title', 'content', 'date', 'updatedAt', 'labels'],
            storeFields: [
                'title',
                'content',
                'vaultId',
                'labels',
                'type',
                'searchIndexType',
                'date',
                'start',
                'end',
                'updatedAt',
                'entityType',
                'keybind',
                'icon',
                'inactive',
                'prefix',
            ],
            searchOptions: {
                fields: ['title', 'date', 'labels'],
                prefix: true,
                fuzzy: 0,
                boost: this.baseBoosts,
                boostDocument: (documentId, term) =>
                    this.dynamicBoost(documentId, term),
                combineWith: 'AND',
            },
            autoVacuum: true,
            logger: (level, message, code) => console.log(level, message, code),
            extractField: (doc, field) => this.extractFields(doc, field),
        });
    }

    async querySearch(query: string, options: any = {}) {
        if (
            options.entity === SearchIndex.COMMANDS &&
            query.startsWith?.('>')
        ) {
            query = query.slice(1, query.length).trim();
        }

        const preparedQuery = await this.prepareQuery(query, options);
        const searchOptions = this.prepareQueryOptions(preparedQuery, options);
        const queryOptions = {
            ...searchOptions,
            ...options,
        };

        return {
            results: this.searchIndex.search(preparedQuery.query, queryOptions),
            queryOptions,
            preparedQuery,
        };
    }

    async search(query: string, options: any = {}) {
        const queriedAt = Date.now();
        const activeVault = options.activeVault;

        const { results, queryOptions, preparedQuery } = await this.querySearch(
            query,
            options,
        );

        let parsedResults = results;

        parsedResults = this.normalizeResults(
            query,
            parsedResults,
            queryOptions,
        );

        if (!options.skipCreateDailyDocIfNeeded) {
            const dailyDoc = this.createDailyDocIfNeeded(
                preparedQuery,
                activeVault,
                results,
            );

            if (dailyDoc) {
                parsedResults.unshift(dailyDoc);
            }
        }

        if (options.thisVaultOnly) {
            parsedResults = parsedResults.filter(
                ({ vaultId }) =>
                    vaultId === activeVault.id ||
                    vaultId === SearchIndex.COMMANDS ||
                    vaultId === SearchIndex.SETTINGS,
            );
        }

        if (activeVault.type === 'local') {
            parsedResults = parsedResults.filter(
                ({ id }) => !['github', 'jira', 'assistant'].includes(id),
            );
        }

        if (options.limit) {
            parsedResults = parsedResults.slice(0, options.limit);
        }

        return {
            documents: parsedResults,
            queriedAt,
        };
    }

    public getInteractions(vaultId: string): {
        documents: Interaction[];
        queriedAt: number;
    } {
        return {
            documents: this.interactions
                .filter(v => !!v && v?.vaultId === vaultId)
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(v => ({
                    ...v,
                    interactions: true,
                })),
            queriedAt: Date.now(),
        };
    }

    dynamicBoost(docId: number, _term: string) {
        const searchIndexType = this.indexToId[docId].split('_')?.[1];
        if (
            searchIndexType === SearchIndex.COMMANDS ||
            searchIndexType === SearchIndex.SETTINGS
        ) {
            return 1.3;
        }
        if (searchIndexType === SearchIndex.DOCUMENT) {
            return 1;
        }
        if (searchIndexType === SearchIndex.INTEGRATION_DATA) {
            return 0.8;
        }
        return 1;
    }

    extractFields(entity: any, field: string) {
        if (entity.searchIndexType === SearchIndex.DOCUMENT) {
            return this.parseDocument(entity, field);
        }
        if (entity.searchIndexType === SearchIndex.INTEGRATION_DATA) {
            return this.parseIntegrationDataField(entity, field);
        }
        if (entity.searchIndexType === SearchIndex.VIEW) {
            return this.parseView(entity, field);
        }
        if (entity.searchIndexType === SearchIndex.PROJECT) {
            return this.parseProject(entity, field);
        }
        return entity[field];
    }

    indexInitial(index: SearchIndex, entities: Indexable | Indexable[]) {
        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        const indexableEntities = entities
            .map(entity => {
                const isTemplate =
                    index === SearchIndex.DOCUMENT && (entity as any).template;
                const entityIndex = isTemplate ? SearchIndex.TEMPLATE : index;
                const key = this.entityKey(entityIndex, entity);

                if (!this.idToIndex[key]) {
                    this.idToIndex[key] = this.maxIndex;
                    this.maxIndex++;
                } else {
                    return null;
                }
                this.indexToId[this.idToIndex[key]] = key;

                entity.searchIndexType = entityIndex;
                entity.id = this.idToIndex[key];
                return entity;
            })
            .filter(v => v !== null);

        return this.searchIndex.addAllAsync(indexableEntities, {
            chunkSize: 100,
        });
    }

    async index(index: SearchIndex, entities: Indexable | Indexable[]) {
        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        const indexableEntities = entities.map(entity => {
            const isTemplate =
                index === SearchIndex.DOCUMENT && (entity as any).template;
            const entityIndex = isTemplate ? SearchIndex.TEMPLATE : index;

            const key = this.entityKey(entityIndex, entity);
            if (!this.idToIndex[key]) {
                this.idToIndex[key] = this.maxIndex;
                entity.isNew = true;
                this.maxIndex++;
            }
            this.indexToId[this.idToIndex[key]] = key;
            entity.searchIndexType = entityIndex;
            entity.id = this.idToIndex[key];
            return entity;
        });

        while (indexableEntities.length > 0) {
            const toUpdate = indexableEntities.splice(0, 50);
            toUpdate.map(entity => {
                if (this.searchIndex.has(entity.id)) {
                    return this.searchIndex.replace(entity);
                }
                return this.searchIndex.add(entity);
            });
            // continue on next tick to make search responsive
            // even when updating large amounts of data
            await Promise.resolve();
        }
    }

    indexInteraction(entity: Indexable) {
        const entries = this.interactions.filter(
            ({ id: _id }) => _id !== entity.id,
        );
        entries.push({
            ...entity,
            timestamp: Date.now(),
            dailyDoc: (entity as any).dailyDoc,
            vaultId: entity.vaultId,
        } as any);
        if (entries.length > 15) {
            entries.shift();
        }
        this.interactions = entries;
    }

    removeInteractions(entity: Indexable[]) {
        this.interactions = this.interactions.filter(({ id }) => {
            return !entity.some(({ id: entityId }) => entityId === id);
        });
    }

    async remove(searchIndex: SearchIndex, entities: Indexable | Indexable[]) {
        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        if (searchIndex === SearchIndex.DOCUMENT) {
            this.removeInteractions(entities);
        }

        const indexableEntities = entities
            .map(entity => {
                const key = this.entityKey(searchIndex, entity);
                const index = this.idToIndex[key];
                if (isNumber(index)) {
                    delete this.idToIndex[key];
                    delete this.indexToId[index];
                }
                entity.id = index;
                return entity.id;
            })
            .filter(entity => isNumber(entity));

        while (indexableEntities.length > 0) {
            const toDelete = indexableEntities.splice(0, 50);
            this.searchIndex.discardAll(toDelete);
            // continue on next tick to make search responsive
            // even when deleting large amounts of data
            await Promise.resolve();
        }
    }

    private async prepareNLPQuery(query: string) {
        const payload: any = {};
        const result = await this.context
            .invoke<{
                title: string;
                start_time: Date;
                start: Date;
                date: string;
            }>(ServiceKey.CLOUD, CloudServiceAction.QUICKADD, {
                data: query,
                ts: new Date(),
            })
            .catch(err => {
                this.context.emit(ServiceKey.SENTRY, 'trackError', err);
                return {
                    title: query,
                    start_time: null,
                    start: null,
                    date: null,
                };
            });
        if (!result.date && !result.start && !result.start_time) {
            return payload;
        }

        if (result.date) {
            payload.date = result.date.split('-').join('');
        }

        if (result.title.trim() === query.trim() && payload.date) {
            payload.dateOnly = true;
            payload.query = [payload.date, query].join(' ');
        }

        return payload;
    }

    private async prepareQuery(query: string, options: any) {
        if (options.assistant) return query;
        const nlpQuery = await this.prepareNLPQuery(query);
        const matches = query.matchAll(spacedLabelRegexp);
        const labels = [];

        for (const match of matches) {
            const index = query.indexOf(match[1]);
            if (index + match[1].length < query.length) {
                labels.push({
                    partial: false,
                    label: match[1],
                });
                continue;
            }
            labels.push({
                partial: true,
                label: match[1],
            });
        }

        return {
            labels,
            query,
            ...nlpQuery,
        };
    }

    private prepareQueryOptions(
        preparedQuery: {
            labels: string[];
            query: string;
            date?: string;
            dateOnly?: boolean;
        },
        options?: any,
    ) {
        const searchOptions: SearchOptions = {
            fuzzy: 0,
            maxFuzzy: 0,
            // prefix: true,
            weights: {
                fuzzy: 0.6,
                prefix: 0.8,
            },
        };
        const filters: ((document: Indexable) => boolean)[] = [];

        if (options.excludeTypes) {
            filters.push((document: Indexable) => {
                return !options.excludeTypes.includes(document.searchIndexType);
            });
        }

        if (options.excludeInactive) {
            filters.push((document: Indexable) => {
                return !document.inactive;
            });
        }
        if (preparedQuery.labels?.length > 0) {
            filters.push((document: Indexable) => {
                return this.prepareLabelFilter(preparedQuery, document);
            });
        }
        if (options.entity) {
            if (Array.isArray(options.entity)) {
                filters.push((document: Indexable) => {
                    return options.entity.includes(document.entityType);
                });
            } else {
                filters.push((document: Indexable) => {
                    return document.entityType === options.entity;
                });
            }
        }

        if (preparedQuery.dateOnly) {
            searchOptions.boost = { title: 1.2, date: 2, updatedAt: 1.5 };
            searchOptions.fuzzy = 0;
            searchOptions.combineWith = 'OR';
        }
        if (options.fuzzy) {
            searchOptions.fuzzy = options.fuzzy;
        }
        searchOptions.filter = (document: SearchResult) => {
            return filters.some(fn => fn(document as any));
        };
        return searchOptions;
    }

    private prepareLabelFilter(preparedQuery: any, document: any) {
        return preparedQuery.labels.every(
            ({ partial, label }: { partial: boolean; label: string }) => {
                if (!partial) {
                    return document.labels?.some((documentLabel: string) => {
                        return (
                            documentLabel.toLowerCase() === label.toLowerCase()
                        );
                    });
                }

                return document.labels?.some((documentLabel: string) => {
                    return documentLabel
                        .toLowerCase()
                        .startsWith(label.toLowerCase());
                });
            },
        );
    }

    private createDailyDocIfNeeded(
        preparedQuery: any,
        activeVault: IVault,
        results: any[],
    ) {
        const shouldCreateDailyDoc =
            preparedQuery.date &&
            !results?.some(
                ({ date, searchIndexType, vaultId }) =>
                    searchIndexType === SearchIndex.DOCUMENT &&
                    date === preparedQuery.date &&
                    vaultId === activeVault.id,
            ) &&
            preparedQuery.dateOnly;

        if (!shouldCreateDailyDoc) {
            return null;
        }
        const date = preparedQuery.date as string;
        const dailyDocDate = [
            date.slice(0, 4),
            date.slice(4, 6),
            date.slice(6, 8),
        ].join('-');
        const title = formatDailyDoc({ dailyDoc: dailyDocDate } as any);

        return {
            id: '',
            dailyDoc: dailyDocDate,
            query: preparedQuery.query,
            title,
            content: '<p></p>',
            updatedAt: new Date(),
            createdAt: new Date(),
            projectId: null,
            vaultId: activeVault.id,
            searchIndexType: 'my-day',
            highlights: {
                title: highlightText(title, [[[0, title.length]]]),
            },
        } as any;
    }

    private normalizeResults(
        query: string,
        results: any[],
        options?: any,
    ): SearchResult[] | any[] {
        return results.map(result => {
            const key = this.indexToId[result.id];
            const [vaultId, index, ...idParts] = key.split('_');
            const id = idParts.join('_');
            const isDailyDoc =
                result.date && result.searchIndexType === SearchIndex.DOCUMENT;
            const dailyDoc = isDailyDoc
                ? [
                      result.date.slice(0, 4),
                      result.date.slice(4, 6),
                      result.date.slice(6, 8),
                  ].join('-')
                : null;

            const res = {
                title: isDailyDoc
                    ? formatDailyDoc({ dailyDoc, title: result.title } as any)
                    : result.prefix
                    ? `${result.prefix}${result.title}`
                    : result.title,
                query,
                vaultId,
                id,
                dailyDoc,
                searchIndexType:
                    result.date && index === SearchIndex.DOCUMENT
                        ? 'my-day'
                        : index,
                score: result.score,
            };

            if (options.assistant) {
                return res;
            }

            return {
                ...res,
                highlights: this.computeHighlights(
                    { ...result, ...res, query },
                    options?.dateTimeOptions,
                    options,
                ),
            };
        });
    }

    computeHighlights(result: any, dateTimeOptions?: any, options?: any) {
        const output: any = {};
        const didMatchDate = Object.values<string[]>(result.match).every(
            (val: string[]) => val.every(v => v === 'date'),
        );

        if (result.dailyDoc && didMatchDate) {
            output.title = highlightText(result.title, [
                [[0, result.title.length]],
            ]);
        } else {
            output.title = getResultHighlights(result.title, result, 'title');
        }

        if (result.start) {
            const now = new Date();
            const dateString = formatRelativeToDate(
                result,
                now,
                true,
                dateTimeOptions,
            );
            output.date = getResultHighlights(dateString, result, 'date');
        }
        if (result.labels?.length) {
            output.labels = getResultHighlights(
                result.labels.join(' '),
                result,
                'labels',
            );
        }
        if (options.fields?.includes('content')) {
            output.content = getResultContentHighlight(result);
        }
        return output;
    }

    parseEvent(event: IEvent & Record<string, any>, fieldName: string) {
        if (fieldName === 'entityType') {
            const key = this.indexToId[event.id as any];
            const [_vaultId, _index, ...idParts] = key.split('_');
            const id = idParts.join('_');
            if (validate(id)) {
                return 'event';
            }
            const [entityType] = id.split('/', 1);
            return entityType;
        }
        if (fieldName === 'title') {
            return event.summary;
        }
        if (fieldName === 'content') {
            return this.parseContent(
                event.html_description ?? event.description,
            );
        }
        if (fieldName === 'date') {
            const date = extractDate(deserializeTaskDateObject(event.start));
            if (!date) return null;
            return format(date, 'yyyyMMdd');
        }
        if (fieldName === 'updatedAt') {
            if (!event.updatedAt) return null;
            if (isDate(event.updatedAt)) {
                return format(event.updatedAt, 'yyyyMMdd');
            }
            return format(new Date(event.updatedAt), 'yyyyMMdd');
        }
        if (fieldName === 'labels') {
            return event.labels?.map((label: string) => `#${label}`) ?? [];
        }
        if (fieldName === 'start' || fieldName === 'end') {
            return deserializeTaskDateObject(event[fieldName]);
        }
        return event[fieldName] ?? null;
    }

    parseIntegrationDataField(
        entity: any, // JiraIssue, GithubPullRequest, GithubIssue, LinearIssue
        fieldName: string,
    ) {
        const id = this.indexToId[entity.id].split('_').slice(2).join('_');
        const isGithub =
            id.startsWith(GithubIntegrationDataType.ISSUE) ||
            id.startsWith(GithubIntegrationDataType.PR);
        const isLinear = id.startsWith(LinearIntegrationDataType.ISSUE);
        if (fieldName === 'type') {
            return SearchIndex.INTEGRATION_DATA;
        }
        if (fieldName === 'entityType') {
            if (id.startsWith(GithubIntegrationDataType.ISSUE)) {
                return GithubIntegrationDataType.ISSUE;
            }

            if (id.startsWith(GithubIntegrationDataType.PR)) {
                return GithubIntegrationDataType.PR;
            }

            if (isLinear) {
                return LinearIntegrationDataType.ISSUE;
            }

            return JiraIntegrationDataType.ISSUE;
        }
        if (fieldName === 'title') {
            if (isGithub) {
                return [`#${entity.number}`, entity.title].join(' ');
            }

            if (isLinear) {
                return [entity.identifier, entity.title].join(' ');
            }

            return [entity.key, entity.properties.summary].join(' ');
        }
        if (fieldName === 'content') {
            if (isGithub) {
                const properties = {
                    type: entity.type.split('_').join(' '),
                    assignee: entity.assignee?.login ?? 'unassigned',
                    repository: entity.repository?.full_name,
                    state: entity.state,
                    status: entity.state,
                    creator: entity.user?.login,
                    reporter: entity.user?.login,
                } as Record<string, string>;
                const propertiesString = Object.keys(properties)
                    .map(key => {
                        return `${key}: ${properties[key]}`;
                    })
                    .join('\n');
                return (
                    propertiesString +
                    (entity.body ?? this.parseContent(entity.body_html))
                );
            }

            if (isLinear) {
                return entity.description;
            }

            return this.parseContent(entity.properties.description ?? '');
        }
        if (fieldName === 'date') {
            return null;
        }
        if (fieldName === 'updatedAt') {
            if (isGithub) {
                return format(new Date(entity.updated_at), 'yyyyMMdd');
            }
            if (isLinear) {
                return format(new Date(entity.updatedAt), 'yyyyMMdd');
            }

            if (isDate(entity.properties.updated)) {
                return format(entity.properties.updated, 'yyyyMMdd');
            }
            return format(new Date(entity.properties.updated), 'yyyyMMdd');
        }
        if (fieldName === 'labels') {
            if (isGithub || isLinear) {
                return entity.labels?.map(
                    (label: GithubLabel) => `#${label.name}`,
                );
            }

            return (
                entity.properties.labels?.map((label: string) => `#${label}`) ??
                []
            );
        }
        if (fieldName === 'start' || fieldName === 'end') {
            return null;
        }
        return entity[fieldName] ?? null;
    }

    parseView(view: any, fieldName: string) {
        if (fieldName === 'entityType') {
            return SearchIndex.VIEW;
        }
        if (fieldName === 'title') {
            return view.name;
        }
        if (fieldName === 'content') {
            return null;
        }
        if (fieldName === 'updatedAt') {
            return view.updatedAt;
        }
        if (fieldName === 'start' || fieldName === 'end') {
            return null;
        }
        return view[fieldName] ?? null;
    }

    parseProject(project: any, fieldName: string) {
        if (fieldName === 'entityType') {
            return SearchIndex.PROJECT;
        }
        if (fieldName === 'title') {
            return project.name;
        }
        if (fieldName === 'content') {
            return null;
        }
        if (fieldName === 'updatedAt') {
            return project.updatedAt;
        }
        if (fieldName === 'start' || fieldName === 'end') {
            return null;
        }
        return project[fieldName] ?? null;
    }

    parseDocument(document: any, fieldName: string) {
        if (fieldName === 'entityType') {
            const key = this.indexToId[document.id as any];
            const [vaultId, index, ...idParts] = key.split('_');
            const id = idParts.join('_');
            if (validate(id)) {
                return 'document';
            }
            const [entityType] = id.split('/', 1);
            return entityType;
        }
        if (fieldName === 'labels') {
            return labelsFromText(document.content);
        }
        if (fieldName === 'content') {
            return this.parseContent(document.mdContent ?? document.content);
        }
        if (fieldName === 'date') {
            return document?.dailyDoc?.split('-').join('') ?? '';
        }
        if (fieldName === 'updatedAt' && document.updatedAt) {
            if (isDate(document.updatedAt)) {
                return format(document.updatedAt, 'yyyyMMdd');
            }
            return format(new Date(document.updatedAt), 'yyyyMMdd');
        }
        if (fieldName === 'start' || fieldName === 'end') {
            return null;
        }
        if (fieldName === 'inactive') {
            return document.archived;
        }
        return document[fieldName] ?? null;
    }

    private entityKey(index: SearchIndex, entity: Indexable): string {
        // if (index === SearchIndex.EVENT) {
        //     return `${entity.vaultId}_${index}_${entity.id}`;
        // }
        return `${entity.vaultId || SearchIndex.COMMANDS}_${index}_${
            entity.id
        }`;
    }

    parseContent(content: string) {
        if (!content) return '';
        if (!content.startsWith('<') && !content.endsWith('>')) {
            return content;
        }
        const output = [];
        try {
            const dom = new DOMParser({
                errorHandler: {
                    warning: (e: Error) => {
                        if (this.context.$config.env === 'production') return;
                        console.warn(e);
                    },
                    error: (e: Error) => {
                        if (this.context.$config.env === 'production') return;

                        console.log(e);
                    },
                },
            }).parseFromString(content ?? '<p></p>', 'text/html');
            if (!dom?.childNodes?.length) {
                return dom.textContent;
            }
            for (let i = 0; i < dom.childNodes.length; i++) {
                output.push(...this.traverse(dom.childNodes.item(i)));
            }
            return output.join(' ');
        } catch (err) {
            return '';
        }
    }

    traverse(dom: any): string[] {
        const output = [];
        if (!dom?.childNodes?.length) {
            return [dom.textContent];
        }
        for (let i = 0; i < dom.childNodes.length; i++) {
            output.push(...this.traverse(dom.childNodes.item(i)));
        }
        return output;
    }
}
