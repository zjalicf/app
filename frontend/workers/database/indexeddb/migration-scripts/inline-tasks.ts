import { v4 } from 'uuid';
import { format, parse } from 'date-fns';
import sha256 from 'crypto-js/sha256';
import isString from 'lodash/isString';
import { IEvent, TaskDateObject } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { extractDate } from '~/helpers';
import { IDocument } from '~/components/document/model';
import { ITask } from '~/components/task/model';
import { parseFromContentByRegexp } from '~/plugins/entities/page';
import { StorageType } from '~/workers/utils/parsers';
import { ServiceKey, UtilActions } from '~/constants';

function stringToUuidLike(str: string) {
    // Hash the input string using SHA256
    const hash = sha256(str).toString();

    // Convert the hash into a UUID-like format
    return (
        hash.substring(0, 8) +
        '-' +
        hash.substring(8, 12) +
        '-4' +
        hash.substring(12, 15) +
        '-8' +
        hash.substring(15, 18) +
        '-' +
        hash.substring(18, 30)
    );
}

const parseTasksFromContentByRegexp = (
    content: string | null,
    regexp: RegExp,
): string[] => {
    const match = content?.matchAll(regexp);
    if (!match) return [];

    const entityIds = new Set<string>();
    for (const entity of match) {
        const entityId = entity[1] || entity[2] || entity[3];
        if (entityId === 'new') continue;
        entityIds.add(entityId);
    }

    return [...entityIds];
};

const taskRegexPlain =
    /<vue-todo notification=['"][A-Za-z]+['"] uuid=['"]([A-Za-z0-9-]+)['"]><\/vue-todo>|<vue-todo uuid=['"]([A-Za-z0-9-]+)['"]><\/vue-todo>|<vue-todo uuid=['"]([A-Za-z0-9-]+)['"] notification=['"][A-Za-z]+['"]><\/vue-todo>/g;

const eventRegex = /<inline-event id=['"]([A-Za-z0-9-]+)['"]><\/inline-event>/g;

const checkboxRegex =
    /<li data-checked="([A-Za-z]+)" data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div><p>(.+?)<\/p><\/div><\/li>/g;

const dynamicTaskRegex = (id: string) => {
    return new RegExp(
        `<vue-todo notification=['"][A-Za-z]+['"] uuid=['"]${id}['"]></vue-todo>|<vue-todo uuid=['"]${id}['"]></vue-todo>|<vue-todo uuid=['"]${id}['"] notification=['"][A-Za-z]+['"]></vue-todo>`,
        'g',
    );
};

const dynamicEventRegex = (id: string) => {
    return new RegExp(`<inline-event id=['"]${id}['"]></inline-event>`, 'g');
};

const dynamicTaskInListRegex = (id: string) => {
    return new RegExp(
        `<li><vue-todo notification=['"][A-Za-z]+['"] uuid=['"]${id}['"]></vue-todo></li>|<li><vue-todo uuid=['"]${id}['"]></vue-todo></li>|<li><vue-todo uuid=['"]${id}['"] notification=['"][A-Za-z]+['"]></vue-todo></li>`,
        'g',
    );
};

const createInlineDocumentLink = (id: string) => {
    return `<inline-document-link id="${id}"></inline-document-link>`;
};

const isEmptyDescription = (description?: string) => {
    return !description || /^(<p>(?:<br(\/)?>)*<\/p>)+$/.test(description);
};

const formatStoredDate = (date: TaskDateObject) => {
    if (!date) return null;
    if (date.date) {
        return `date:${new Date(date.date).getTime()}`;
    }
    if (date.dateTime) {
        return `datetime:${new Date(date.dateTime).getTime()}`;
    }
    return null;
};

const createFromProperties = (properties: any, pageId?: string | null) => {
    const {
        id,
        completed,
        start,
        end,
        text,
        labels,
        rrule,
        summary,
        recurrence,
    } = properties;

    const isCompleted =
        properties.type === 'event' && !recurrence && !rrule
            ? true
            : !!completed;

    const task = [
        `<li><div data-type="taskItemContent" id="${id}" completed="${isCompleted}"`,
    ];
    if (start) {
        task.push(`start="${formatStoredDate(start)}"`);
    }
    if (end) {
        task.push(`end="${formatStoredDate(end)}"`);
    }
    if (rrule) {
        task.push(`rrule="${rrule}"`);
    }
    if (recurrence?.length) {
        const rule = recurrence.find((rule: string) => {
            if (!isString(rule)) return false;
            return rule.toLowerCase().startsWith('rrule:');
        });
        if (rule) {
            const eventRRule = rule.replace('RRULE:', '').replace('rrule:', '');
            task.push(`rrule="${eventRRule}"`);
        }
    }

    const content = [text || summary || ''];

    if (labels && labels.length) {
        content.push(labels.join(' '));
    }

    if (pageId) {
        content.push(createInlineDocumentLink(pageId));
    }

    return task.join(' ') + `>${content.join(' ')}</div></li>`;
};

const createPageContentFromDescription = (description: string) => {
    let content = description?.replaceAll(/ data-type="taskList"/g, '') ?? '';
    content = content.replaceAll(checkboxRegex, (_, completed, text) => {
        return createFromProperties({
            id: v4(),
            text,
            completed: completed === 'true',
        });
    });
    return content;
};

const createDailyDoc = (date: string, vaultId: string): any => {
    return {
        id: v4(),
        dailyDoc: date,
        vaultId,
        title: format(
            parse(date, 'yyyy-MM-dd', new Date()),
            'EEEE, LLL d, yyyy',
        ),
        content: '<p></p>',
        updatedAt: new Date(),
        createdAt: new Date(),
    };
};

const mergeTaskListItems = (content: string) => {
    let c = content.replaceAll(
        /<ul>(<li><div.*?<\/div><\/li>)<\/ul>/g,
        (_, b) => {
            return b;
        },
    );

    c = c.replaceAll(/(<li><div.*?<\/div><\/li>)+/g, '<ul>$&</ul>');

    return c;
};

export class Migrator {
    vaultId: string;
    context: WorkerContext;

    documentIndex: { [key: string]: IDocument };
    dailyDocIndex: { [key: string]: IDocument };
    taskIndex: { [key: string]: ITask };
    eventIndex: { [key: string]: IEvent };

    documents: IDocument[];
    tasks: ITask[];
    events: IEvent[];

    entityInPageIndex: any[] = [];
    updateIndex: { [key: string]: IDocument };
    tasksWithoutPageIndex: any[] = [];

    descriptionFolderId: string;
    createDescriptionFolder: boolean = false;
    dryRun: boolean;

    constructor(
        vaultId: string,
        context: WorkerContext,
        dryRun: boolean = false,
    ) {
        this.vaultId = vaultId;
        this.context = context;

        this.documentIndex = {};
        this.dailyDocIndex = {};
        this.taskIndex = {};
        this.eventIndex = {};

        this.documents = [];
        this.tasks = [];
        this.events = [];

        this.entityInPageIndex = [];
        this.updateIndex = {};
        this.tasksWithoutPageIndex = [];
        this.dryRun = dryRun;

        this.descriptionFolderId = stringToUuidLike(
            'Task Descriptions' + vaultId,
        );
    }

    async initialize() {
        const documents = await this.context.$deviceService.Documents.list(
            this.vaultId,
        );
        const tasks = await this.context.$deviceService.Tasks.list(
            this.vaultId,
        );
        const events = await this.context.$deviceService.Events.list(
            this.vaultId,
        );

        this.documents = documents;
        this.tasks = tasks;
        this.events = events.filter(e => e.calendarId === 'acreom');

        this.documentIndex = documents.reduce((acc: any, doc) => {
            if (!doc.dailyDoc) acc[doc.id] = doc;
            return acc;
        }, {});

        this.dailyDocIndex = documents.reduce((acc: any, doc) => {
            if (doc.dailyDoc) acc[doc.dailyDoc] = doc;
            return acc;
        }, {});

        this.taskIndex = tasks.reduce((acc: any, task) => {
            acc[task.id] = { ...task, type: 'task' };
            return acc;
        }, {});

        this.eventIndex = this.events.reduce((acc: any, event) => {
            acc[event.id] = { ...event, type: 'event' };
            return acc;
        }, {});
    }

    processPage(page: IDocument) {
        const taskIds = this.extractTaskIdsFromContent(page.content) ?? [];
        const eventIds =
            parseFromContentByRegexp(page.content, eventRegex) ?? [];
        const entityIds = [...taskIds, ...eventIds];

        if (!entityIds.length) return;

        const content = this.generateNewPageContentFromEntity(
            page.content,
            entityIds,
        );
        this.updatePage({
            ...page,
            content,
        });
    }

    processPages() {
        const documents = Object.keys(this.documentIndex).map(key => {
            return this.documentIndex[key];
        });

        for (const page of documents) {
            this.processPage(page);
        }
    }

    processDailyDocs() {
        const documents = Object.keys(this.dailyDocIndex).map(key => {
            return this.dailyDocIndex[key];
        });

        for (const page of documents) {
            this.processPage(page);
        }
    }

    processNoPage() {
        const tasksWithoutPage = Object.keys(this.taskIndex)
            .filter(id => !this.entityInPageIndex.includes(id))
            .map(id => this.taskIndex[id]);

        const eventsWithoutPage = Object.keys(this.eventIndex)
            .filter(id => !this.entityInPageIndex.includes(id))
            .map(id => this.eventIndex[id]);

        const entitiesWithoutPage = [...tasksWithoutPage, ...eventsWithoutPage];

        const entitiesToIterate = entitiesWithoutPage.sort((a, b) => {
            // sort by createdAt or updatedAt, or if not createdAt, updatedAt put last
            const aDate = a.createdAt ?? a.updatedAt;
            const bDate = b.createdAt ?? b.updatedAt;

            if (!aDate || !bDate) return 0;

            if (aDate > bDate) return 1;
            if (aDate < bDate) return -1;
            return 0;
        });

        for (const entity of entitiesToIterate) {
            let pageId: string | null = null;
            if (!isEmptyDescription(entity.description)) {
                const newPage = this.createPageFromEntity(entity);
                pageId = newPage.id;
                this.updatePage(newPage);
            }

            const taskHtml = createFromProperties(entity, pageId);

            // if date save to daily doc and do not push to tasksWithoutPageIndex
            // also check if daily doc exists, if not create it
            if (entity.start) {
                const dailyDocId = format(
                    new Date(extractDate(entity.start)),
                    'yyyy-MM-dd',
                );
                let dailyDoc = this.dailyDocIndex[dailyDocId];

                if (!dailyDoc) {
                    dailyDoc = createDailyDoc(dailyDocId, this.vaultId);
                    this.dailyDocIndex[dailyDocId] = dailyDoc;
                }

                let content = dailyDoc.content;

                if (this.updateIndex[dailyDoc.id]) {
                    content = this.updateIndex[dailyDoc.id].content;
                }

                dailyDoc.content = `${taskHtml}${content}`;
                this.updatePage(dailyDoc);
                continue;
            }
            this.tasksWithoutPageIndex.push(taskHtml);
        }
    }

    async run() {
        this.processPages();
        this.processDailyDocs();

        this.processNoPage();

        await this.createSupportingContent();
        await this.updateDB();
        await this.cleanup();
    }

    async cleanup() {
        if (this.dryRun) return;
        await this.context.$deviceService.Tasks.deleteBulk(
            this.vaultId,
            this.tasks,
            {
                writeToDevice: true,
            },
        );

        await this.context.$deviceService.Events.deleteBulk(
            this.vaultId,
            this.events,
            {
                writeToDevice: true,
            },
        );
    }

    private extractTaskIdsFromContent(content: string) {
        return parseTasksFromContentByRegexp(content, taskRegexPlain);
    }

    private generateNewPageContentFromEntity(
        originalContent: string,
        entityIds: string[],
    ) {
        let content = originalContent ?? '';

        for (const id of entityIds) {
            let entity: any = this.taskIndex[id] || this.eventIndex[id];

            if (!entity) {
                entity = {
                    id,
                    text: '',
                };
            }

            let pageId: string | null = null;

            if (!isEmptyDescription(entity.description)) {
                const newPage = this.createPageFromEntity(entity);
                pageId = newPage.id;
                this.updatePage(newPage);
            }

            const newTask = createFromProperties(entity, pageId);

            content = content.replaceAll(dynamicTaskInListRegex(id), newTask);
            content = content.replaceAll(dynamicTaskRegex(id), newTask);
            content = content.replaceAll(dynamicEventRegex(id), newTask);

            this.updateEntityInPageIndex(id);
        }

        return content;
    }

    updatePage(page: any) {
        delete page.mdContent;

        if (!this.updateIndex[page.id]) {
            this.updateIndex[page.id] = page;
        }

        this.updateIndex[page.id] = {
            ...this.updateIndex[page.id],
            ...page,
        };
    }

    createPageFromEntity(entity: any): any {
        this.createDescriptionFolder = true;
        let title = entity.text || entity.summary;

        if (!title) {
            title = entity.type === 'task' ? 'Untitled Task' : 'Untitled Event';
        }

        return {
            id: stringToUuidLike(entity.id),
            vaultId: this.vaultId,
            title,
            content: createPageContentFromDescription(entity.description!),
            createdAt: entity.createdAt ?? new Date(),
            updatedAt: entity.updatedAt ?? new Date(),
            projectId: this.descriptionFolderId,
        };
    }

    private updateEntityInPageIndex(id: string) {
        this.entityInPageIndex.push(id);
    }

    private async updateDB() {
        const updates = Object.keys(this.updateIndex).map(key => {
            const content = mergeTaskListItems(this.updateIndex[key].content);
            return { ...this.updateIndex[key], content };
        });

        if (updates.length > 0) {
            this.context.emit(ServiceKey.TOAST, 'sidebar-update');
        }

        if (this.dryRun) return;

        await this.context.invoke(ServiceKey.UTILS, UtilActions.INDEX_ENTITY, {
            vaultId: this.vaultId,
            type: StorageType.DOCUMENT,
            entity: updates,
            callerContext: 'Migrator updateDB',
        });

        await this.context.$deviceService.Documents.saveBulk(
            this.vaultId,
            updates,
            {
                clientId: '*',
                writeToDevice: true,
            },
        );
    }

    private async createSupportingContent() {
        const folder = {
            id: stringToUuidLike('Tasks' + this.vaultId),
            name: 'Tasks',
            order: -10000,
            type: 'folder',
            updatedAt: new Date(),
            createdAt: new Date(),
            vaultId: this.vaultId,
            view: 'cards',
            parentId: null,
        };

        const descriptionsFolder = {
            id: this.descriptionFolderId,
            name: 'Task Descriptions',
            order: 500,
            type: 'folder',
            updatedAt: new Date(),
            createdAt: new Date(),
            vaultId: this.vaultId,
            view: 'cards',
            parentId: folder.id,
        };

        if (
            this.tasksWithoutPageIndex.length > 0 ||
            this.createDescriptionFolder
        ) {
            if (!this.dryRun) {
                await this.context.$deviceService.Projects.save(
                    this.vaultId,
                    folder,
                    {
                        clientId: '*',
                    },
                );
            }
        }

        if (this.createDescriptionFolder) {
            if (!this.dryRun) {
                await this.context.$deviceService.Projects.save(
                    this.vaultId,
                    descriptionsFolder,
                    {
                        clientId: '*',
                    },
                );
            }
        }

        if (this.tasksWithoutPageIndex.length === 0) return;

        const content = `<ul>${this.tasksWithoutPageIndex.join('')}</ul>`;

        const page = {
            id: stringToUuidLike('Inbox' + this.vaultId),
            title: 'Inbox',
            vaultId: this.vaultId,
            content,
            updatedAt: new Date(),
            createdAt: new Date(),
            projectId: folder.id,
            order: 0,
        };

        if (this.documentIndex[page.id]) {
            page.content = `${content}${
                this.documentIndex[page.id].content || ''
            }}`;
        }

        if (this.updateIndex[page.id]) {
            page.content = `${content}${this.updateIndex[page.id].content}}`;
        }

        this.updatePage(page);
    }
}
