import isEqual from 'lodash/isEqual';
import { v4 } from 'uuid';
import isEmpty from 'lodash/isEmpty';
import { sub } from 'date-fns';
import capitalize from 'lodash/capitalize';
import { IDocument } from '~/components/document/model';
import { EntityController } from '~/plugins/entities/controller';
import { imagesRegex } from '~/constants/regexp';
import { PostprocessingMap } from '~/@types/app';
import { ITask } from '~/components/task/model';
import { murmurHash } from '~/helpers';
import { labelsFromText } from '~/plugins/entities/label';
import { PageStatus, TabType } from '~/constants';
import {
    CANCELLED_EXCEPTION_TYPE,
    createRecurrentTaskObject,
    dailyDocToDate,
    formatDailyDoc,
    getDateAsDailyDocTitle,
    getDateInDailyDocFormat,
} from '~/helpers/date';
import { taskRegex } from '~/plugins/entities/task';
import {
    TrackingAction,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

export const fullPageBacklinkRegex =
    /<(?:vue-document|inline-document-link) id=['"]([A-Za-z0-9-]+)['"]><\/(?:vue-document|inline-document-link)>/g;
export const docBacklinkRegex =
    /(?:vue-document|inline-document-link) id=['"]([A-Za-z0-9-]+)['"]/g;
const jiraLinkRegex =
    /jira-link id=['"]([/A-Za-z0-9-]+)['"]|jira-link url=['"][A-Za-z0-9-_.:/]+['"] id=['"]([/A-Za-z0-9-]+)['"]/g;
const linearLinkRegex =
    /linear-link id=['"]([A-Za-z0-9-_.:/]+)['"]|linear-link url=['"][A-Za-z0-9-_.:/]+['"] id=['"]([A-Za-z0-9-_.:/]+)['"]/g;
const eventRegex = /inline-event id=['"](.*?)['"]/g;
const githubLinkRegex =
    /github-link url=['"][A-Za-z0-9-_.:/]+['"] id=['"]([A-Za-z0-9-_.:/]+)['"]|github-link id=['"]([A-Za-z0-9-_.:/]+)['"] url=['"][A-Za-z0-9-_.:/]+['"]/g;
const urlRegex =
    /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.\S{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.\S{2,}|www\.[a-zA-Z0-9]+\.\S{2,})$/;
export const parseFromContentByRegexp = (
    content: string,
    regexp: RegExp,
): string[] => {
    const match = content?.matchAll(regexp);
    if (!match) return [];

    const entityIds = new Set<string>();
    for (const entity of match) {
        const entityId = entity[1] ?? entity[2];
        if (entityId === 'new') continue;
        entityIds.add(entityId);
    }

    return [...entityIds];
};

export class PageController extends EntityController<IDocument> {
    protected storeEntity: string = 'document';
    protected dbTable: string = 'documents';

    getSortedPages() {
        const projectIds = this.context.$entities.project
            .getProjects()
            .map(project => project.id);

        const pages = this.context.store.getters['document/sortedDocuments'];
        // return pages.map(page => {
        //     return {
        //         ...page,
        //         project:
        //     }
        // });

        return pages;
    }

    byDailyDoc(dailyDoc: string) {
        return this.context.store.getters['document/byDailyDoc'](dailyDoc);
    }

    byFolderId(projectId: string) {
        return this.context.store.getters['document/byFolderId'](projectId);
    }

    displayTitle(entityOrId: string | IDocument) {
        const entity =
            typeof entityOrId === 'string' ? this.byId(entityOrId) : entityOrId;

        if (!entity) return 'Untitled';

        if (entity.dailyDoc) {
            return formatDailyDoc(entity.dailyDoc);
        }

        if (entity.template) {
            return entity.title || 'Untitled template';
        }

        return entity.title || 'Untitled';
    }

    getPostprocessingMap(pageId: string): PostprocessingMap {
        return this.context.store.getters['document/postprocessingMap'](pageId);
    }

    updatePostprocessingMap(pageId: string, data: Partial<PostprocessingMap>) {
        return this.context.store.dispatch('document/updatePostprocessingMap', {
            pageId,
            data,
        });
    }

    updatePostprocessingMapBatch(
        maps: { pageId: string; data: Partial<PostprocessingMap> }[],
    ) {
        return this.context.store.dispatch(
            'document/updatePostprocessingMapBatch',
            maps,
        );
    }

    newPage(id: string): Partial<IDocument> {
        return {
            id,
            title: '',
            content: '',
            archived: false,
            pinned: false,
            pinOrder: 0,
            order: 0,
            projectId: null,
            dailyDoc: null,
            sharingUuid: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    postprocess(pages: Partial<IDocument> | Partial<IDocument>[]) {
        let data: Partial<IDocument>[] = [];
        data = Array.isArray(pages) ? pages : ([pages] as IDocument[]);

        for (const page of data) {
            if (!page || !page.content || !page.id) continue;

            let fullPage: IDocument | null = this.byId(page.id);
            if (!fullPage || isEmpty(fullPage)) {
                fullPage = page as IDocument;
            }

            fullPage = {
                ...fullPage,
                content: page.content || fullPage.content,
            };

            if (fullPage?.archived) {
                this.updatePostprocessingMap(page.id, {
                    tasks: [],
                    jiraIssues: [],
                    events: [],
                    links: [],
                    labels: [],
                    images: [],
                });
                continue;
            }

            this.postprocessing(fullPage);
        }
    }

    update(page: Partial<IDocument>) {
        return this.context.store.dispatch('document/update', page);
    }

    getGithubLinks(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);
        return (
            postprocessingMap.githubLinks?.map((_id: string) => {
                return this.context.$entities.github.getById(_id);
            }) ?? []
        );
    }

    getJiraLinks(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);
        return (
            postprocessingMap.jiraIssues?.map((_id: string) => {
                return this.context.$entities.jira.getByKey(_id);
            }) ?? []
        );
    }

    getLinearLinks(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);
        return (
            postprocessingMap.linearIssues?.map((_id: string) => {
                return this.context.$entities.linear.getIssueById(_id);
            }) ?? []
        );
    }

    getBacklinks(id: string) {
        const pages = this.list();
        return pages.filter((page: IDocument) => {
            const postprocessingMap = this.getPostprocessingMap(page.id);
            return postprocessingMap.links?.includes(id);
        });
    }

    getLinks(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);

        return (
            postprocessingMap.links?.map((_id: string) => {
                return this.byId(_id);
            }) ?? []
        );
    }

    hasLinks(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);
        const backlinks = this.getBacklinks(id);
        return (
            postprocessingMap.links?.length > 0 ||
            postprocessingMap.githubLinks?.length > 0 ||
            postprocessingMap.jiraIssues?.length > 0 ||
            postprocessingMap.linearIssues?.length > 0 ||
            backlinks.length > 0
        );
    }

    async postprocessBatch(pages: Partial<IDocument>[]) {
        let data: Partial<IDocument>[] = [];
        data = Array.isArray(pages) ? pages : ([pages] as IDocument[]);

        const archived = [];
        const toProcess = [];

        for (const page of data) {
            if (!page || !page.content || !page.id) continue;

            let fullPage: IDocument | null = this.byId(page.id);
            if (!fullPage) {
                fullPage = page as IDocument;
            }

            if (fullPage?.archived) {
                archived.push({
                    pageId: page.id,
                    data: {
                        tasks: [],
                        jiraIssues: [],
                        linearIssues: [],
                        events: [],
                        links: [],
                        labels: [],
                        images: [],
                    },
                });
                continue;
            }
            toProcess.push(fullPage);
        }
        this.updatePostprocessingMapBatch(archived);
        await this.postprocessingBatch(toProcess);

        const recurrentExceptions = [];
        for (const page of data) {
            const properties = page.properties;
            if (properties?.recurringExceptions) {
                recurrentExceptions.push(
                    ...this.createRecurringExceptions(page as IDocument),
                );
            }
        }
        this.context.store.commit('tasks/batchUpdate', recurrentExceptions);
    }

    processPageToMap(page: IDocument) {
        const postprocessingMap = this.getPostprocessingMap(page.id);
        const newPostprocessingMap: Partial<PostprocessingMap> = {};

        const tasks = this.parseTasksFromContent(page.content);
        const taskIds = [...Object.keys(tasks)];

        const jiraIds = parseFromContentByRegexp(page.content, jiraLinkRegex);
        const linearIds = parseFromContentByRegexp(
            page.content,
            linearLinkRegex,
        );
        const eventIds = parseFromContentByRegexp(page.content, eventRegex);
        const links = parseFromContentByRegexp(page.content, docBacklinkRegex);
        const labels = labelsFromText(page.content);
        const images = parseFromContentByRegexp(page.content, imagesRegex);
        const githubLinks = parseFromContentByRegexp(
            page.content,
            githubLinkRegex,
        );

        // const tasksChanged = this.didChange(postprocessingMap.tasks, taskIds);
        const jiraChanged = this.didChange(
            postprocessingMap.jiraIssues,
            jiraIds,
        );
        const linearChanged = this.didChange(
            postprocessingMap.linearIssues,
            linearIds,
        );
        // const eventsChanged = this.didChange(
        //     postprocessingMap.events,
        //     eventIds,
        // );
        const linksChanged = this.didChange(postprocessingMap.links, links);
        // const labelsChanged = this.didChange(postprocessingMap.labels, labels);
        const imagesChanged = this.didChange(postprocessingMap.images, images);
        const githubLinksChanged = this.didChange(
            postprocessingMap.githubLinks,
            githubLinks,
        );

        newPostprocessingMap.tasks = taskIds;
        newPostprocessingMap.fullTasks = tasks;
        newPostprocessingMap.events = eventIds;

        newPostprocessingMap.labels = labels;

        if (jiraChanged) {
            newPostprocessingMap.jiraIssues = jiraIds;
        }
        if (linearChanged) {
            newPostprocessingMap.linearIssues = linearIds;
        }
        if (linksChanged) {
            newPostprocessingMap.links = links;
        }
        if (imagesChanged) {
            newPostprocessingMap.images = images;
        }
        if (githubLinksChanged) {
            newPostprocessingMap.githubLinks = githubLinks;
        }

        return newPostprocessingMap;
    }

    async postprocessingBatch(pages: IDocument[]) {
        const maps: { pageId: string; oldData: any; data: any }[] = [];
        for (const page of pages) {
            try {
                const oldData = this.getPostprocessingMap(page.id);
                const data = this.processPageToMap(page);
                maps.push({ pageId: page.id, oldData, data });
            } catch (e) {
                console.log(e);
            }
        }

        await this.updatePostprocessingMapBatch(
            maps.map(({ pageId, data }) => ({ pageId, data })),
        );

        this.context.$entities.label.updateEntityBatch(
            maps.map(({ oldData, data, pageId }) => {
                return {
                    id: pageId,
                    oldLabels: oldData?.labels ?? [],
                    newLabels: data?.labels ?? [],
                };
            }),
            'pages',
        );

        for (const index in maps) {
            const page = pages[index];
            const map = maps[index] ?? {};

            this.context.$entities.task.postprocessTasks(map, page);
            this.context.$utils.event.postprocessEvents(map, page);
        }
    }

    postprocessing(page: IDocument) {
        const postprocessingMap = this.getPostprocessingMap(page.id);
        const newPostprocessingMap: Partial<PostprocessingMap> =
            this.processPageToMap(page);

        if (Object.keys(newPostprocessingMap).length > 0) {
            this.updatePostprocessingMap(page.id, newPostprocessingMap);
        }

        if (newPostprocessingMap.labels) {
            this.context.$entities.label.updateEntity(
                page.id,
                postprocessingMap.labels ?? [],
                newPostprocessingMap.labels,
                'pages',
            );
        }

        this.context.$entities.task.postprocessTasks(
            {
                pageId: page.id,
                oldData: postprocessingMap,
                data: newPostprocessingMap,
            },
            page,
        );
        this.context.$utils.event.postprocessEvents(
            {
                pageId: page.id,
                oldData: postprocessingMap,
                data: newPostprocessingMap,
            },
            page,
        );

        return newPostprocessingMap;
    }

    parseTasksFromContent(content: string): Record<string, Partial<ITask>> {
        const matches = content.matchAll(taskRegex);

        if (!matches) return {};
        const tasks: Record<string, Partial<ITask>> = {};
        for (const task of matches) {
            const properties =
                this.context.$entities.task.parseProperties(task);
            const hash = murmurHash(JSON.stringify(properties));
            tasks[properties.id] = {
                ...properties,
                hash,
            };
        }
        return { ...tasks };
    }

    didChange(previousEntityIds: string[], newEntityIds: string[]): boolean {
        return !isEqual(newEntityIds, previousEntityIds);
    }

    didHashChange(
        previousEntityIds: string[],
        newEntities: Partial<ITask>[],
    ): boolean {
        return (
            newEntities.filter(task => {
                const storedTask = this.context.store.getters['tasks/byId'](
                    task.id,
                );
                return (
                    previousEntityIds.includes(task.id!) &&
                    storedTask?.hash !== task?.hash
                );
            }).length > 0
        );
    }

    async updateLabel(pageId: string, from: string, to: string | null) {
        const page = this.byId(pageId);
        if (!page) return;

        const fromRegexp = new RegExp(from, 'g');

        const codeTags: { open: number; close: number }[] = [];
        const matches = page?.content?.matchAll(/<code>|<\/code>/g);
        if (matches) {
            for (const match of matches) {
                const tag = match[0];
                if (tag === '<code>') {
                    codeTags.push({ open: match.index!, close: match.index! });
                }
                if (tag === '</code>') {
                    codeTags[codeTags.length - 1].close = match.index!;
                }
            }
        }

        const newContent = page?.content?.replaceAll(
            fromRegexp,
            (fullMatch, index: number) => {
                const isInCode = codeTags.some(
                    tag => tag.open < index && tag.close > index,
                );
                if (isInCode) return fullMatch;

                return fullMatch.replace(from, to || '');
            },
        );

        await this.context.store.dispatch('document/update', {
            id: page.id,
            content: page.content,
            updateId: v4(),
        });

        await this.context.store.dispatch('document/update', {
            id: page.id,
            content: newContent,
            updateId: v4(),
        });
        this.postprocess(page);
    }

    writeTaskToPage(page: IDocument, properties: Partial<ITask>) {
        const selector = this.context.$entities.task.taskRegex(properties);
        if (!this.isPageActive(page)) {
            const taskContent =
                this.context.$entities.task.createFromProperties(properties);
            const newContent = page.content.replace(
                selector,
                taskContent.replace('</li>', ''),
            );
            return this.context.store.dispatch('document/update', {
                id: page.id,
                content: newContent,
                updateId: v4(),
            });
        }

        window.$nuxt.$emit(
            `editor:${page.id}:update-task`,
            this.context.$entities.task.toNodeAttributes(properties),
        );
    }

    isPageActive(page: IDocument) {
        const activeDocuments = this.context.$utils.navigation.activeDocuments;
        return activeDocuments.some(doc => doc.id === page.id);
    }

    changeStatus(page: Partial<IDocument>, status: PageStatus | null) {
        this.saveToStore({
            id: page.id,
            pageStatus: status,
        });
        this.context.$tracking.trackEvent('document', {
            action: 'change-status',
            pageStatus: status,
            entity_id: page.id,
        });
    }

    async _removeClip(pageId: string) {
        await this.saveToStore({
            id: pageId,
            clip: null,
        });
        this.context.$tracking.trackEvent('document', {
            action: 'remove-clip',
            entity_id: pageId,
        });
    }

    async _addClip(pageId: string, clip: string) {
        await this.saveToStore({
            id: pageId,
            clip,
        });
        this.context.$tracking.trackEvent('document', {
            action: 'add-clip',
            type: clip?.split('/')[0] ?? 'unknown',
            entity_id: pageId,
        });
    }

    async clipPage(pageId: string, clip: string) {
        await this._addClip(pageId, clip);
    }

    async removeClip(pageId: string) {
        await this._removeClip(pageId);
    }

    async replaceClip(oldPageId: string, newPageId: string, clip: string) {
        await this._removeClip(oldPageId);
        await this._addClip(newPageId, clip);
    }

    updateRecurringException(task: Partial<ITask>) {
        const [parentId, dailyDocDateString] = task.id!.split('__');
        if (!parentId || !dailyDocDateString) return;
        const dailyDoc = {
            ...(this.byDailyDoc(dailyDocDateString) as IDocument),
        };
        if (!dailyDoc.properties) {
            dailyDoc.properties = {};
        }
        if (!dailyDoc.properties.recurringExceptions) {
            dailyDoc.properties.recurringExceptions = {};
        }
        if (!dailyDoc.properties.recurringExceptions.completed) {
            dailyDoc.properties.recurringExceptions.completed = [];
        }
        const completed =
            dailyDoc.properties.recurringExceptions.completed.filter(
                id => id !== parentId,
            );
        if (task.completed) {
            completed.push(parentId);
        }
        dailyDoc.properties.recurringExceptions.completed = completed;
        return this.saveToStore(dailyDoc);
    }

    deletePage(id: string) {
        const postprocessingMap = this.getPostprocessingMap(id);
        const tasks = postprocessingMap.tasks ?? [];
        this.context.store.dispatch('document/delete', id);
        this.context.$tracking.trackEvent('document', {
            action: 'delete',
            entity_id: id,
        });
        if (!tasks) return;

        this.context.store.dispatch('tasks/delete', tasks);
        this.context.store.commit('tasks/removeFromPageMap', {
            page: { id },
            tasks,
        });
    }

    removeFromExceptions(tasks: Partial<ITask>[]) {
        for (const task of tasks) {
            const [parentId, dailyDocDateString] = task.id!.split('__');
            if (!parentId || !dailyDocDateString) return;
            const dailyDoc = {
                ...(this.byDailyDoc(dailyDocDateString) as IDocument),
            };
            if (!dailyDoc.properties) {
                dailyDoc.properties = {};
            }
            if (!dailyDoc.properties.recurringExceptions) {
                dailyDoc.properties.recurringExceptions = {};
            }
            if (dailyDoc.properties.recurringExceptions.deleted) {
                dailyDoc.properties.recurringExceptions.deleted =
                    dailyDoc.properties.recurringExceptions.deleted.filter(
                        id => id !== parentId,
                    );
            }
            if (dailyDoc.properties.recurringExceptions.completed) {
                dailyDoc.properties.recurringExceptions.completed =
                    dailyDoc.properties.recurringExceptions.completed.filter(
                        id => id !== parentId,
                    );
            }
            this.saveToStore(dailyDoc);
        }
    }

    createRecurringExceptions(fullPage: IDocument) {
        if (!fullPage.properties?.recurringExceptions || !fullPage.dailyDoc)
            return [];
        const exceptions = fullPage.properties.recurringExceptions;
        const completed = exceptions.completed ?? [];
        const deleted = exceptions.deleted ?? [];
        const dailyDoc = fullPage.dailyDoc;
        const rawDailyDocDate = dailyDocToDate(dailyDoc);
        const dailyDocDate = sub(rawDailyDocDate, {
            minutes: rawDailyDocDate.getTimezoneOffset(),
        });
        const tasks = [];
        for (const id of completed) {
            const parentTask = this.context.$entities.task.byId(id);
            if (!parentTask) continue;
            const instance = createRecurrentTaskObject(
                parentTask!,
                dailyDocDate,
            );
            instance.completed = true;
            tasks.push(instance);
        }

        for (const id of deleted) {
            const parentTask = this.context.$entities.task.byId(id);
            if (!parentTask) continue;
            const instance = createRecurrentTaskObject(
                parentTask!,
                dailyDocDate,
            );
            instance.type = CANCELLED_EXCEPTION_TYPE;
            tasks.push(instance);
        }
        return tasks;
    }

    async create(params: any = {}) {
        const id = params.id ?? v4();
        const newPage = this.newPage(id);

        const page = {
            ...newPage,
            ...params,
            status: 'new',
            updateId: v4(),
        };

        await this.context.store.dispatch('document/new', page);
        await this.context.store.dispatch('document/update', page);

        return page;
    }

    findByClipId(id: string): IDocument | null {
        return this.context.store.getters['document/byClip'](id) || null;
    }

    prepareTemplate(content: string): string {
        const taskRegexp =
            /<div data-type=['"]taskItemContent['"] id=['"].+?['"]/g;

        return content.replaceAll(taskRegexp, () => {
            return `<div data-type="taskItemContent" id="${v4()}"`;
        });
    }

    setViewOrder(
        viewIdOrProjectId: string,
        pageId: string,
        order: number | null,
        status: PageStatus,
    ) {
        const page = this.byId(pageId);
        if (!page) return;
        if (order === null) {
            if (page.pageStatus === status) return;
            this.context.$utils.showMiscNotification(
                'Status set to ' + (status ? capitalize(status) : 'No Status'),
            );
            this.changeStatus(page, status);

            this.context.$tracking.trackEventV2(TrackingType.PAGE, {
                action: this.context.$tracking.resolveActionFromPageStatus(
                    status,
                ),
                source: this.context.$tracking.resolveSourceFromViewOrProject(
                    viewIdOrProjectId,
                ),
                sourceMeta: TrackingActionSourceMeta.DRAG,
                entityId: pageId,
            });
            return;
        }
        if (page.pageStatus !== status) {
            this.context.$utils.showMiscNotification(
                'Status set to ' + (status ? capitalize(status) : 'No Status'),
            );
            this.context.$tracking.trackEvent('document', {
                action: 'change-status',
                pageStatus: status,
                entity_id: pageId,
            });

            this.context.$tracking.trackEventV2(TrackingType.PAGE, {
                action: this.context.$tracking.resolveActionFromPageStatus(
                    status,
                ),
                source: this.context.$tracking.resolveSourceFromViewOrProject(
                    viewIdOrProjectId,
                ),
                sourceMeta: TrackingActionSourceMeta.DRAG,
                entityId: pageId,
            });
        }

        this.context.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CHANGE_ORDER,
            source: this.context.$tracking.resolveSourceFromViewOrProject(
                viewIdOrProjectId,
            ),
            sourceMeta: TrackingActionSourceMeta.DRAG,
            entityId: pageId,
        });

        this.saveToStore({
            id: pageId,
            pageStatus: status,
            viewOrder: {
                ...(page.viewOrder ?? {}),
                [viewIdOrProjectId]: order,
            },
        });
    }

    setPageListStatus(
        viewIdOrProjectId: string,
        pageId: string,
        status: PageStatus,
    ) {
        const page = this.byId(pageId);
        if (!page || page.pageStatus === status) return;
        this.context.$utils.showMiscNotification(
            'Status set to ' + (status ? capitalize(status) : 'No Status'),
        );
        this.changeStatus(page, status);

        this.context.$tracking.trackEventV2(TrackingType.PAGE, {
            action: this.context.$tracking.resolveActionFromPageStatus(status),
            source: this.context.$tracking.resolveSourceFromViewOrProject(
                viewIdOrProjectId,
            ),
            sourceMeta: TrackingActionSourceMeta.DRAG,
            entityId: pageId,
        });
    }

    setPageListOrder(
        viewIdOrProjectId: string,
        pageId: string,
        order: number | null,
    ) {
        const page = this.byId(pageId);
        if (!page || !order) return;
        this.context.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CHANGE_ORDER,
            source: this.context.$tracking.resolveSourceFromViewOrProject(
                viewIdOrProjectId,
            ),
            sourceMeta: TrackingActionSourceMeta.DRAG,
            entityId: pageId,
        });

        this.saveToStore({
            id: pageId,
            viewOrder: {
                ...(page.viewOrder ?? {}),
                [viewIdOrProjectId]: order,
            },
        });
    }

    isValidUrl(url: string) {
        return urlRegex.test(url);
    }

    openClippedUrl(url: string) {
        this.context.$utils.navigation.openExternalLink(url);
    }

    hasClip(page: Partial<IDocument>) {
        return (
            page &&
            page.clip &&
            (this.context.store.getters['integrationData/byId'](page.clip) ||
                this.isValidUrl(page.clip))
        );
    }

    async restoreFromVersion(id: string, pageVersionId: string) {
        const page = this.byId(id);
        if (!page) return;
        const version = await this.context.$entities.version.byId(
            pageVersionId,
        );

        if (!version) return;

        // create version from current page
        await this.context.$entities.version.createVersionFromPage(page.id);

        // restore the version
        await this.saveToStore({
            id: page.id,
            ...version.content,
            updateId: v4(),
        });

        this.context.$tracking.trackEventV2(TrackingType.VERSION_HISTORY, {
            action: TrackingAction.RESTORE,
            entityId: id,
        });
    }

    _clearIcon(id: string) {
        this.update({ id, icon: '' });
        this.context.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CLEAR_EMOJI,
        });
    }

    _changeIcon(id: string, icon: string) {
        this.update({ id, icon });
        this.context.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.UPDATE_EMOJI,
        });
    }

    updateIcon(id: string, icon: string) {
        if (icon) {
            this._changeIcon(id, icon);
        } else {
            this._clearIcon(id);
        }
    }
}
