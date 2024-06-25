import isArray from 'lodash/isArray';
import debounce from 'lodash/debounce';
import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import { Store } from 'vuex';
import { isBefore, isSameDay, startOfDay, sub } from 'date-fns';
import { Vue } from 'vue-property-decorator';
import has from 'lodash/has';
import isNull from 'lodash/isNull';
import { ContentVersion, IDocument } from '~/components/document/model';
import {
    deserializeDates,
    extractDate,
    isAllDay,
    isInRange,
} from '~/helpers/date';
import {
    DatabaseServiceAction,
    IntegrationType,
    ServiceKey,
    PageStatus,
    FolderType,
} from '~/constants';
import type { ServiceRegistry } from '~/plugins/service-registry/hub';
import { serializeTaskDateObject } from '~/store/tasks';
import { PostprocessingMap } from '~/@types/app';
import { PageController } from '~/plugins/entities/page';

interface AppState {
    isLoaded: boolean;
    documents: { [key: string]: IDocument };
    contents: { [key: string]: string };
    versions: { [key: string]: ContentVersion[] };
    dailyDocs: Record<string, string>;
    docsCache: IDocument[];
    list: string[];
    taskMap: { [key: string]: string };
    eventMap: { [key: string]: string };
    clips: Record<string, string>;
    postprocessingMap: Record<string, PostprocessingMap>;
}

interface DocumentGetters {
    list: IDocument[];
}

export const state: () => AppState = () => ({
    isLoaded: false,
    docsCache: [],
    list: [],
    dailyDocs: {},
    documents: {},
    contents: {},
    versions: {},
    clips: {},
    taskMap: {},
    eventMap: {},
    postprocessingMap: {},
});

const creatingPromises: Record<string, Promise<any>> = {};

export const getters = {
    isLoaded: (state: AppState) => {
        return state.isLoaded;
    },
    backlinks:
        (_: AppState, getters: any) =>
        (id: string): IDocument[] => {
            return getters.list.filter((doc: IDocument) => {
                const properties = getters.postprocessingMap(doc.id);
                return properties.links && properties.links.includes(id);
            });
        },
    links:
        (_: AppState, getters: any) =>
        (id: string): IDocument[] => {
            const properties = getters.postprocessingMap(id);
            return (
                properties.links &&
                properties.links.map((id: string) => getters.byId(id))
            );
        },
    taskMap: (state: AppState) => {
        return state.taskMap;
    },
    byClip: (state: AppState, getters: any) => {
        return (clip: string) => {
            const documentId = state.clips[clip];
            return getters.byId(documentId);
        };
    },
    postprocessingMap: (state: AppState) => (pageId: string) => {
        return (
            state.postprocessingMap[pageId] ?? {
                labels: [],
                tasks: [],
                links: [],
                events: [],
                jiraIssues: [],
                githubLinks: [],
                images: [],
            }
        );
    },
    dailyDocsByTaskId: (state: AppState, getters: any) => (id: string) => {
        return (
            getters.list.filter((doc: IDocument) => {
                return (
                    doc.dailyDoc &&
                    state.postprocessingMap[doc.id]?.tasks?.includes(id)
                );
            }) ?? []
        );
    },
    documentByTaskId:
        (state: AppState, getters: any) =>
        (id: string): IDocument[] => {
            const docs =
                state.taskMap[id] && !getters.byId(state.taskMap[id]).dailyDoc
                    ? getters.byId(state.taskMap[id])
                    : null;
            return docs;
        },
    list: (state: AppState): IDocument[] => {
        return state.list.map(id => state.documents[id]);
    },
    dailyDocs: (state: AppState): Record<string, string> => {
        return state.dailyDocs;
    },
    dailyDocsWithContent: (state: AppState, getters: any): string[] => {
        return Object.entries(state.dailyDocs)
            .filter(([_key, value]) => {
                const doc = getters.byId(value);

                return doc && !['<p></p>', ''].includes(doc.content);
            })
            .map(([key]) => key);
    },
    byId: (state: AppState) => (id: string | null) => {
        if (!id) return null;
        if (!state.documents[id]) return null;
        // @ts-ignore
        return { ...state.documents[id], content: state.contents[id] };
    },
    breadcrumbsById:
        (_: AppState, getters: any, _rootState: any, rootGetters: any) =>
        (id: string) => {
            const page = getters.byId(id);
            if (!page) return null;
            const parentFolder = page.projectId;
            if (!parentFolder) return null;
            let parentId = parentFolder;
            const path = [];
            while (parentId) {
                const parentFolder = rootGetters['folder/byId'](parentId);
                if (parentFolder?.type === FolderType.PROJECT)
                    return parentFolder.name ?? 'New Project';
                path.push(parentFolder?.name ?? 'New Folder');
                parentId = parentFolder?.parentId ?? null;
            }
            return path.reverse().join('/');
        },
    pinned: (
        _state: AppState,
        getters: { list: IDocument[] },
        _rootState: any,
        rootGetters: any,
    ) => {
        return getters.list
            .filter(doc => {
                return (
                    !!doc.pinned &&
                    !doc.dailyDoc &&
                    !doc.template &&
                    !doc.archived
                );
            })
            .map(doc => {
                return {
                    id: doc.id,
                    parentId: doc.projectId,
                    name: doc.title,
                    type: 'document',
                    status: doc.status,
                    icon: doc.icon,
                    order: doc.pinOrder,
                    clip:
                        doc.clip &&
                        rootGetters['integrationData/byId'](doc.clip)
                            ? {
                                  type: IntegrationType.JIRA,
                                  key: rootGetters['integrationData/byId'](
                                      doc.clip,
                                  ).key,
                              }
                            : null,
                };
            })
            .sort((a, b) => a.order - b.order);
    },
    byFolderId:
        (_state: AppState, getters: DocumentGetters) =>
        (projectId: string | null) => {
            return getters.list.filter(document => {
                if (projectId === null) {
                    return !document.projectId && !document.dailyDoc;
                }
                return document.projectId === projectId;
            });
        },
    byDailyDoc: (state: AppState, getters: any) => (dailyDoc: string) => {
        const dailyDocId = state.dailyDocs[dailyDoc];
        if (!dailyDocId) return null;

        return getters.byId(dailyDocId) ?? null;
    },
    byEventId: (state: AppState, getters: any) => (eventId: string) => {
        return getters.byId(state.eventMap[eventId]) ?? null;
    },
    getDocumentByEventId: (_: AppState, getters: any) => (eventId: string) => {
        return getters.list.filter((doc: IDocument) => {
            const properties = getters.postprocessingMap(doc.id);
            return properties.events && properties.events.includes(eventId);
        });
    },
    sortedDocuments: (_: AppState, getters: DocumentGetters) => {
        return getters.list.filter(d => !!d.id && !d.dailyDoc && !d.template);
    },
    treeSortedDocuments: (
        state: AppState,
        _getters: any,
        _rootState: any,
        rootGetters: any,
    ): IDocument[] => {
        const dfs = (node: any): any[] => {
            let documents: string[] = [];
            // @ts-ignore
            if (has(node.data, 'title')) {
                documents.push(node.data.id);
            } else if (node.children) {
                node.children.sort(
                    (a: any, b: any) => a.data.order - b.data.order,
                );
                for (const child of node.children) {
                    documents = documents.concat(dfs(child));
                }
            }
            return documents;
        };
        const docs: any[] = [];
        rootGetters['folder/tree'].forEach((node: any) => {
            docs.push(...dfs(node));
        });
        return docs.map((node: any) => state.documents[node]);
    },
    archivedDocuments: (_: AppState, getters: DocumentGetters) => {
        return getters.list.filter(d => !!d.id && !d.dailyDoc && d.archived);
    },
    templates: (_: AppState, getters: DocumentGetters): IDocument[] => {
        return getters.list.filter(
            d => !!d.id && !d.dailyDoc && !d.archived && d.template,
        );
    },
    length: (_: AppState, getters: DocumentGetters) => {
        return getters.list.length;
    },
    byIdsOfKind:
        (_: AppState, getters: DocumentGetters) =>
        (kind: string, ids: string[]) => {
            return getters.list.filter(
                (doc: IDocument & Record<string, any>) => {
                    return ids.reduce((acc, id) => {
                        return acc || doc[kind]?.includes(id);
                    }, false);
                },
            );
        },
    byRange:
        (_state: AppState, getters: any) =>
        (range: { start: Date; end: Date }) => {
            return getters.list
                .filter((document: any) => {
                    return (
                        document.start &&
                        extractDate(document.start) &&
                        isInRange(document, range)
                    );
                })
                .map((document: any) => {
                    const calendarEntity = {
                        ...document,
                        type: 'page',
                    } as any;
                    calendarEntity.name = document.title;
                    if (calendarEntity.start) {
                        if (
                            document.start &&
                            document.end &&
                            new Date(extractDate(document.start)).getDate() !==
                                new Date(extractDate(document.end)).getDate()
                        ) {
                            calendarEntity.timed = false;
                        } else {
                            calendarEntity.timed = !isAllDay(document.start);
                        }

                        calendarEntity.startObject = document.start
                            ? { ...document.start }
                            : null;
                        calendarEntity.endObject = document.end
                            ? { ...document.end }
                            : null;
                        calendarEntity.start = extractDate(
                            document.start,
                        ).getTime();

                        calendarEntity.startTime = extractDate(document.start);

                        if (
                            isAllDay(document.start) &&
                            isAllDay(document.end)
                        ) {
                            const endDate = sub(extractDate(document.end), {
                                days: 1,
                            });
                            calendarEntity.end = extractDate(document.end)
                                ? endDate.getTime()
                                : calendarEntity.start;

                            calendarEntity.endTime = extractDate(document.end)
                                ? endDate
                                : calendarEntity.startTime;
                        } else {
                            calendarEntity.end = extractDate(document.end)
                                ? extractDate(document.end).getTime()
                                : calendarEntity.start;

                            calendarEntity.endTime = document.end
                                ? extractDate(document.end)
                                : calendarEntity.startTime;
                        }
                    }
                    return calendarEntity;
                });
        },
    review: (_: AppState, getters: any, __: any) => (date: Date) => {
        const today = startOfDay(date);

        return [...getters.list]
            .filter((page: IDocument) => {
                let start = null;
                let end = null;

                if (!page.start) return false;
                if (page.pageStatus && page.pageStatus === PageStatus.DONE)
                    return false;

                start = extractDate(page.start);

                if (page.end) {
                    if (isAllDay(page.start)) {
                        end = sub(extractDate(page.end), { days: 1 });
                    } else {
                        end = extractDate(page.end);
                    }
                }

                if (start && !end && isBefore(start, today)) return true;
                return !!(start && end && isBefore(end, today));
            })
            .sort((a: IDocument, b: IDocument) => {
                return (
                    extractDate(b.start).getTime() -
                    extractDate(a.start).getTime()
                );
            });
    },
    agenda: (_: AppState, getters: any) => (date: Date) => {
        const today = startOfDay(date);

        return [...getters.list]
            .filter((page: IDocument) => {
                let start = null;
                if (!page.start) return false;
                start = extractDate(page.start);
                return start && isSameDay(start, today);
            })
            .sort((a: IDocument, b: IDocument) => {
                return (
                    extractDate(b.start).getTime() -
                    extractDate(a.start).getTime()
                );
            });
    },
};

export const mutations = {
    clear: (state: AppState) => {
        state.documents = {};
        state.contents = {};
        state.dailyDocs = {};
        state.list = [];
        state.taskMap = {};
        state.clips = {};
        state.postprocessingMap = {};
    },
    updatePostprocessingMap: (
        state: AppState,
        { pageId, data }: { pageId: string; data: Partial<PostprocessingMap> },
    ) => {
        Vue.set(
            state.postprocessingMap,
            pageId,
            Object.freeze({
                ...state.postprocessingMap[pageId],
                ...data,
            }),
        );
    },

    updatePostprocessingMapBatch: (
        state: AppState,
        data: { pageId: string; data: any }[],
    ) => {
        const map = data.reduce(
            (acc, { pageId, data }) => {
                acc[pageId] = Object.freeze({
                    ...(state.postprocessingMap[pageId] ?? {}),
                    ...data,
                });
                return acc;
            },
            { ...(state.postprocessingMap ?? {}) },
        );

        Vue.set(state, 'postprocessingMap', map);
    },
    update: (state: AppState, document: IDocument) => {
        const previousState = state.documents[document.id] ?? {};
        const updateObject = { ...previousState, ...document };
        const listIndex = state.list.indexOf(document.id);

        if ('versions' in document) {
            Vue.set(state.versions, updateObject.id, document.versions);
            updateObject.versions = undefined;
        }

        if ('content' in document) {
            Vue.set(state.contents, updateObject.id, document.content);
            updateObject.content = '';
            const keys = Object.keys(document);
            const isEditorUpdate =
                keys.length === 4 &&
                keys.every(key =>
                    ['id', 'content', 'editorId', 'updatedAt'].includes(key),
                );
            const isSameEditor = previousState.editorId === document.editorId;
            if (isEditorUpdate && isSameEditor) {
                return;
            }
        }
        Vue.set(state.documents, document.id, Object.freeze(updateObject));
        if (listIndex < 0) {
            Vue.set(
                state.list,
                // listIndex < 0 ? state.list.length : listIndex,
                state.list.length,
                document.id,
            );
        }
        if (updateObject.dailyDoc) {
            if (
                previousState.dailyDoc !== updateObject.dailyDoc &&
                previousState.dailyDoc
            ) {
                Vue.delete(state.dailyDocs, previousState.dailyDoc);
            }
            Vue.set(state.dailyDocs, updateObject.dailyDoc, updateObject.id);
        }
        if (document.clip) {
            if (previousState.clip && state.clips[previousState.clip]) {
                Vue.delete(state.clips, previousState.clip);
            }
            Vue.set(state.clips, document.clip, updateObject.id);
        } else if (isNull(document.clip)) {
            Vue.delete(state.clips, previousState.clip!);
        }
    },
    updateBatch: (state: AppState, documents: IDocument[]) => {
        const docs: any = {};
        const dailyDocs: any = { ...(state.dailyDocs ?? {}) };
        const list = [];
        const clips: any = {};
        const contents: any = {};
        const versions: any = {};
        const indexes = state.list.reduce((acc, id, index) => {
            acc[id] = index;
            return acc;
        }, {} as any);
        for (const document of documents) {
            const previousState = state.documents[document.id] ?? {};
            const updateObject = { ...previousState, ...document };
            const listIndex = indexes[document.id] ?? -1;
            if ('versions' in document) {
                versions[updateObject.id] = document.versions;
                updateObject.versions = undefined;
            }
            if ('content' in document) {
                contents[updateObject.id] = document.content;
                updateObject.content = '';
            }
            if (updateObject.dailyDoc) {
                if (
                    previousState.dailyDoc !== updateObject.dailyDoc &&
                    previousState.dailyDoc
                ) {
                    delete dailyDocs[previousState.dailyDoc!];
                }
                dailyDocs[updateObject.dailyDoc] = updateObject.id;
            }
            if (listIndex < 0) {
                indexes[updateObject.id] = state.list.length;
                list.push(updateObject.id);
            }
            if (updateObject.clip) {
                clips[updateObject.clip] = updateObject.id;
            }
            docs[document.id] = Object.freeze(updateObject);
        }

        state.documents = { ...(state.documents ?? {}), ...docs };
        state.versions = { ...(state.versions ?? {}), ...versions };
        state.contents = { ...(state.contents ?? {}), ...contents };
        state.dailyDocs = { ...dailyDocs };
        state.clips = { ...(state.clips ?? {}), ...clips };
        state.list = [...state.list, ...list];
    },
    batchDelete: (state: AppState, ids: string[]) => {
        for (const id of ids) {
            const deleteObject = state.documents[id];
            const listIndex = state.list.indexOf(id);
            if (listIndex >= 0) {
                Vue.delete(state.list, listIndex);
            }
            if (
                deleteObject &&
                deleteObject.dailyDoc &&
                state.dailyDocs[deleteObject.dailyDoc] === id
            ) {
                Vue.delete(state.dailyDocs, deleteObject.dailyDoc);
            }
            if (deleteObject && deleteObject.clip) {
                Vue.delete(state.clips, deleteObject.clip);
            }
            Vue.delete(state.documents, id);
            Vue.delete(state.contents, id);
            Vue.delete(state.versions, id);
        }
    },
    delete: (state: AppState, id: string) => {
        const deleteObject = state.documents[id];
        const listIndex = state.list.indexOf(id);
        if (listIndex >= 0) {
            Vue.delete(state.list, listIndex);
        }
        if (
            deleteObject &&
            deleteObject.dailyDoc &&
            state.dailyDocs[deleteObject.dailyDoc] === id
        ) {
            Vue.delete(state.dailyDocs, deleteObject.dailyDoc);
        }
        if (deleteObject && deleteObject.clip) {
            Vue.delete(state.clips, deleteObject.clip);
        }
        Vue.delete(state.documents, id);
        Vue.delete(state.contents, id);
        Vue.delete(state.versions, id);
    },
    removeTaskFromDocument: (
        state: AppState,
        {
            id,
            taskRegex,
            updateId,
        }: { id: string; taskRegex: RegExp; updateId: string },
    ) => {
        if (id) {
            // @ts-ignore
            const doc = { ...state.documents[id], content: state.contents[id] };
            if (!doc) return;
            const oldContent = doc.content;
            doc.updateId = updateId;
            doc.content = oldContent.replaceAll(taskRegex, '');
            mutations.update(state, doc);
        }
    },
    removeEventFromDocument: (
        state: AppState,
        {
            id,
            eventId,
            updateId,
        }: { id: string; eventId: string; updateId: string },
    ) => {
        // @ts-ignore
        const doc = { ...state.documents[id], content: state.contents[id] };
        if (!doc) return;
        const oldContent = doc.content;
        doc.updateId = updateId;
        doc.content = oldContent.replaceAll(
            `<inline-event id='${eventId}'></inline-event>`,
            '',
        );
        mutations.update(state, doc);
    },
    addToTaskMap: (
        state: AppState,
        { tasks, doc }: { tasks: string[]; doc: IDocument },
    ) => {
        tasks.forEach(task => {
            if (!doc.dailyDoc) {
                state.taskMap[task] = doc.id;
                state.taskMap = { ...state.taskMap };
            }
        });
    },
    addToEventMap: (
        state: AppState,
        { events, page }: { events: string[]; page: IDocument },
    ) => {
        events.forEach(event => {
            if (!page.dailyDoc) {
                state.eventMap[event] = page.id;
                state.eventMap = { ...state.eventMap };
            }
        });
    },
    addTaskToDocArray: (
        state: AppState,
        { id, taskId }: { id: string; taskId: string },
    ) => {
        const docPostprocessingMap = { ...state.postprocessingMap[id] };
        docPostprocessingMap.tasks = [
            ...new Set([taskId, ...docPostprocessingMap.tasks]),
        ];
        mutations.updatePostprocessingMap(state, {
            pageId: id,
            data: docPostprocessingMap,
        });
    },
    removeFromTaskMap: (
        state: AppState,
        { tasks, _doc }: { tasks: string[]; _doc: IDocument },
    ) => {
        tasks.forEach(task => {
            delete state.taskMap[task];
            state.taskMap = { ...state.taskMap };
        });
    },
    removeFromEventMap: (
        state: AppState,
        { events, _doc }: { events: string[]; _doc: IDocument },
    ) => {
        events.forEach(event => {
            delete state.eventMap[event];
            state.eventMap = { ...state.eventMap };
        });
    },
    isLoaded: (state: AppState, isLoaded: boolean) => {
        state.isLoaded = isLoaded;
    },
};

export const actions = {
    socketUpdate(this: Context, { commit }: any, payload: any) {
        const { action, document } = JSON.parse(payload) as {
            action: string;
            document: IDocument;
        };
        if (action === 'delete') {
            commit('delete', document.id);
            return;
        }
        commit('update', document);
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    updateMyDayTemplates({ commit, getters, rootGetters }: any) {
        const myDayDocsToUpdate = getters.list.filter(
            ({ dailyDoc, status }: IDocument) => !!dailyDoc && status === 'new',
        );
        const { myDayTemplateId } = rootGetters['vault/preferences'] ?? {};
        let content = '<p></p>';
        const template = getters.byId(myDayTemplateId);
        if (template) {
            content = template.content;
        }
        myDayDocsToUpdate.forEach((doc: IDocument) => {
            commit('update', {
                id: doc.id,
                content,
                updateId: v4(),
            });
        });
    },

    updatePostprocessingMap({ commit }: any, { pageId, data }: any) {
        commit('updatePostprocessingMap', { pageId, data });
    },
    updatePostprocessingMapBatch({ commit }: any, data: any) {
        commit('updatePostprocessingMapBatch', data);
    },
    addTaskToStart(
        this: Context,
        { dispatch, getters }: any,
        { id, task }: any,
    ) {
        const taskHtml = this.$entities.task.createFromProperties(task);
        const docPostprocessingMap = getters.postprocessingMap(id);
        if (docPostprocessingMap.tasks?.includes(task.id)) return;

        const doc = getters.byId(id);

        const payload = {
            id,
            content: this.$entities.task.addTaskToContent(
                doc?.content ?? '',
                taskHtml,
            ),
            updateId: v4(),
        };
        dispatch('update', payload);
        this.$entities.page.postprocess(payload as Partial<IDocument>);
    },
    dailyDoc(
        { commit, getters, rootGetters }: any,
        { dailyDoc, title }: { dailyDoc: string; title: string },
    ) {
        const doc = getters.byDailyDoc(dailyDoc);

        if (!doc) {
            const { myDayTemplateId } = rootGetters['vault/preferences'] ?? {};
            if (!myDayTemplateId) {
                commit('update', {
                    id: v4(),
                    projectId: null,
                    dailyDoc,
                    title,
                    status: 'new',
                    content: '<p></p>',
                    tasks: [],
                });
            } else {
                const template = getters.byId(myDayTemplateId);
                commit('update', {
                    id: v4(),
                    projectId: null,
                    dailyDoc,
                    title,
                    status: 'new',
                    content: template ? template.content : '<p></p>',
                    tasks: [],
                });
            }
        }

        // const duplicates = getters.byDailyDocDuplicates(dailyDoc);
        // if (duplicates.length > 1) {
        //     duplicates.forEach((dup: IDocument) => {
        //         if (dup.status === 'new') {
        //             commit('delete', dup.id);
        //         }
        //     });
        // }
    },
    new({ commit, rootGetters, getters }: any, document: Partial<IDocument>) {
        const items = rootGetters['sidebar/layerByParentId'](
            document.projectId,
        );

        if (items.length) {
            document.order = items.length * 500;
        } else {
            document.order = 0;
        }
        if (document.dailyDoc) {
            if (
                getters.dailyDocs[document.dailyDoc] &&
                getters.dailyDocs[document.dailyDoc] !== document.id
            ) {
                return;
            }
        }
        commit('update', document);
    },
    initialPostprocessing(
        this: Context,
        _: any,
        document: Partial<IDocument> | IDocument[],
    ) {
        const data = Array.isArray(document) ? document : [document];
        return this.$entities.page.postprocessBatch(data);
    },
    async list(this: Context, { commit, dispatch, rootGetters }: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;
        commit('isLoaded', false);

        const data = await this.$workers.database.list<IDocument[]>(
            rootGetters['vault/active'].id,
            'documents',
            undefined,
            null,
        );
        const deserializedData = data.map(d => deserializeDates(d));
        commit('updateBatch', deserializedData);
        await dispatch('initialPostprocessing', deserializedData);
        const paginationId: string | null =
            deserializedData?.[deserializedData.length - 1]?.id ?? null;
        const vaultId = rootGetters['vault/active'].id;

        this.$workers.database?.Documents.listWithPagination(
            vaultId,
            paginationId,
            data => {
                if (!data) {
                    commit('isLoaded', true);
                    return;
                }
                const deserializedData = data.map((d: any) =>
                    deserializeDates(d),
                );
                commit('updateBatch', deserializedData);
                dispatch('initialPostprocessing', deserializedData);
            },
        );
    },
    indexedDBUpdate(
        this: Context,
        { commit }: Store<any>,
        documents: Partial<IDocument> | Partial<IDocument>[],
    ) {
        documents = isArray(documents) ? documents : [documents];
        const deduplicateUpdates = (
            documentArray: IDocument[],
        ): IDocument[] => {
            return Object.values(
                documentArray.reduce(
                    (acc: Record<string, IDocument>, val: IDocument) => {
                        if (!acc[val.id]) {
                            acc[val.id] = val;
                            return acc;
                        }
                        if (
                            new Date(val.updatedAt).getTime() >
                            new Date(acc[val.id].updatedAt).getTime()
                        ) {
                            acc[val.id] = { ...acc[val.id], ...val };
                        }
                        return acc;
                    },
                    {} as Record<string, IDocument>,
                ),
            );
        };
        documents = deduplicateUpdates(documents as IDocument[]);
        commit(
            'updateBatch',
            documents.map(doc => deserializeDates({ ...doc, updateId: v4() })),
        );
        // then postprocess them in batch
        this.$entities.page.postprocessBatch(documents as IDocument[]);
    },
    async update(
        this: Context,
        { commit, getters, rootGetters }: any,
        document: Partial<IDocument> & { meta?: { omitUpdate?: boolean } },
    ) {
        const id = document.id;
        const doc = getters.byId(id);

        if (!doc) return;
        const activeVaultId = rootGetters['vault/active'].id;

        let shouldDebounce = true;
        const meta = document.meta;
        delete document.meta;

        if (!document.content || document.updateId) {
            shouldDebounce = false;
            const docToUpdate = { ...document, updatedAt: new Date() };

            if (meta && meta.omitUpdate) {
                delete (docToUpdate as Partial<IDocument>).updatedAt;
            }
            commit('update', docToUpdate);
        }

        if (doc.status === 'new') {
            commit('update', {
                ...document,
                id,
                status: 'creating',
                updateId: v4(),
            });

            const createDocument = async () => {
                const dbDocument =
                    await this.$serviceRegistry.invoke<IDocument>(
                        ServiceKey.DATABASE,
                        DatabaseServiceAction.SAVE,
                        {
                            vaultId: activeVaultId,
                            table: 'documents',
                            entity: { ...doc, ...document },
                            callerContext:
                                'store/document.ts update createDocument',
                        },
                    );

                if (document.content) {
                    this.$entities.page.postprocess(document as IDocument);
                }
                const payload = { id, status: 'created' } as Partial<IDocument>;
                if (dbDocument!.filepath) {
                    payload.filepath = dbDocument!.filepath;
                }

                commit('update', payload);
            };

            creatingPromises[doc.id] = new Promise(resolve => {
                createDocument().then(resolve);
            });

            await creatingPromises[doc.id];

            this.$tracking.trackEvent('document', {
                action: doc.template ? 'create-template' : 'create',
                entity_id: id,
            });

            return;
        }

        if (doc.status === 'creating') {
            if (doc.id in creatingPromises) {
                await creatingPromises[doc.id];
            }
        }

        getDebouncedSaveRequest(document.id!)(
            this.$serviceRegistry,
            activeVaultId,
            (doc: any) => this.$entities.page.postprocess(doc),
            shouldDebounce ? commit : () => {},
            document.id!,
            document,
            meta,
        );
    },
    removeTaskFromDocument(
        this: Context,
        { commit, getters, rootGetters }: any,
        { id, taskId }: { id: string; taskId: string },
    ) {
        if (!id) return;
        if (!this.$workers.database) return;
        const doc = getters.byId(id);
        const taskRegex = this.$entities.task.taskRegex({ id: taskId });
        commit('removeTaskFromDocument', { id, taskRegex, updateId: v4() });
        if (!doc.dailyDoc) {
            commit('removeFromTaskMap', { tasks: [taskId] });
        }
        const updatedDocument = getters.byId(id);
        if (!updatedDocument) return;

        getDebouncedSaveRequest(id)(
            this.$serviceRegistry,
            rootGetters['vault/active'].id,
            (doc: any) => this.$entities.page.postprocess(doc),
            () => {},
            id,
            {
                id,
                content: updatedDocument.content,
            },
        );
    },
    deleteLocal(this: Context, { commit }: any, id: string) {
        commit('delete', id);
    },
    async removeEventFromDocuments(
        this: Context,
        { commit, getters, rootGetters }: any,
        { id }: { id: string },
    ) {
        if (!id) return;
        if (!this.$workers.database) return;
        const documents = getters.getDocumentByEventId(id);
        for (const doc of documents) {
            await getDebouncedSaveRequest(doc.id!).flush();
            commit('removeEventFromDocument', {
                id: doc.id,
                eventId: id,
                updateId: v4(),
            });
            const updatedDocument = getters.byId(doc.id);
            if (!updatedDocument) return;
            getDebouncedSaveRequest(doc.id!)(
                this.$serviceRegistry,
                rootGetters['vault/active'].id,
                (doc: any) => this.$entities.page.postprocess(doc),
                commit,
                doc.id,
                { id: doc.id, content: updatedDocument.content },
            );
        }
    },
    async deleteWithoutRedirect(
        this: Context,
        { commit, rootGetters }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        try {
            await this.$workers.database.Documents.delete<IDocument>(
                rootGetters['vault/active'].id,
                { id },
            );
            commit('delete', id);
            // @ts-ignore
        } catch (e) {
            console.log(e);
        }
    },
    async indexedDBDelete(
        this: Context,
        { commit }: any,
        ids: string | string[],
    ) {
        ids = isArray(ids) ? ids : [ids];
        for (const id of ids) {
            if (this.$utils.isMobile) {
                if (!id) return;
                if (window.$nuxt.$route.name === 'mobile-documents-id') {
                    // @ts-ignore
                    await this.$router.push(`/mobile/sidebar`);
                }
            }
            this.$tabs.closeTabsByEntityId(id);
            commit('delete', id);
        }
    },
    async duplicate(this: Context, { dispatch, getters }: any, id: string) {
        const doc = getters.byId(id);
        if (!doc) {
            console.warn(
                'Document you are trying to duplicate does not exist in store.',
            );
            return;
        }

        const _id = v4();
        const payload = {
            id: _id,
            title: `${doc.title} (copy)`,
            content: doc.content,
            status: 'new',
            updatedAt: new Date(),
            createdAt: new Date(),
            projectId: doc.projectId,
        };

        await dispatch('new', payload);
        dispatch('update', payload);

        return payload;
    },
    async delete(
        this: Context,
        { commit, getters, rootGetters }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        try {
            const document = getters.byId(id);
            if (this.$utils.isMobile) {
                if (!document) return;
                if (window.$nuxt.$route.name === 'mobile-documents-id') {
                    // @ts-ignore
                    await this.$router.push(`/mobile/sidebar`);
                }
            }

            try {
                await this.$workers.database.Documents.delete<IDocument>(
                    rootGetters['vault/active'].id,
                    { id },
                );
                const properties = getters.postprocessingMap(id);
                if (properties.tasks?.length > 0) {
                    commit('removeFromTaskMap', {
                        tasks: properties.tasks,
                        _doc: document,
                    });
                }
                commit('removeFromEventMap', {
                    events: properties.events,
                    _doc: document,
                });
                commit('delete', id);
                // @ts-ignore
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    },
    async refresh(this: Context, { dispatch, commit }: any) {
        commit('clear');
        await dispatch('list', true);
    },

    async deleteArchived(this: Context, { commit, getters, rootGetters }: any) {
        const archivedDocuments = getters.archivedDocuments;
        const archivedDocumentsIds = archivedDocuments.map(({ id }: any) => id);
        commit('batchDelete', archivedDocumentsIds);
        await this.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.DELETE_BULK,
            {
                vaultId: rootGetters['vault/active'].id,
                table: 'documents',
                payload: {
                    vaultId: rootGetters['vault/active'].id,
                    entity: archivedDocuments,
                    meta: {
                        writeToDevice: true,
                    },
                },
                callerContext: 'store/document.ts deleteArchived',
            },
        );
    },

    rewriteOnEntityUpdate(
        this: Context,
        { getters, rootGetters }: any,
        { kind, ids }: { kind: string; ids: string[] },
    ) {
        const docsToRewrite = getters.byIdsOfKind(kind, ids);
        const activeVaultId = rootGetters['vault/active'].id;
        docsToRewrite.map((doc: IDocument) => {
            return this.$workers.database?.Documents.save<IDocument>(
                activeVaultId,
                {
                    ...doc,
                    sequence: v4(),
                },
            );
        });
    },
};

const saveDocumentRequest = async (
    serviceRegistry: ServiceRegistry,
    vaultId: string,
    postprocess: PageController['postprocess'],
    commit: any,
    _id: string,
    document: Partial<IDocument>,
    meta?: { omitUpdate?: boolean },
) => {
    const docToUpdate = {
        ...document,
        updatedAt: new Date(),
    } as Partial<IDocument>;

    if (meta && meta.omitUpdate) {
        delete (docToUpdate as Partial<IDocument>).updatedAt;
    }

    commit('update', { ...docToUpdate });

    if (document.start) {
        docToUpdate.start = serializeTaskDateObject(
            document.start ?? null,
        ) as any;
        docToUpdate.end = serializeTaskDateObject(document.end ?? null) as any;
    }

    if (document.start === null) {
        docToUpdate.sequence = v4();
    }

    if (document.content) {
        postprocess(document as IDocument);
    }
    await serviceRegistry.invoke(
        ServiceKey.DATABASE,
        DatabaseServiceAction.SAVE,
        {
            table: 'documents',
            vaultId,
            entity: docToUpdate,
            callerContext: 'store/document.ts saveDocumentRequest',
        },
    );
};

const debounceRequests: Record<string, any> = {};

const getDebouncedSaveRequest = (id: string) => {
    if (!debounceRequests[id]) {
        debounceRequests[id] = debounce(saveDocumentRequest, 500, {
            leading: true,
            maxWait: 1500,
            trailing: true,
        });
    }
    return debounceRequests[id];
};
