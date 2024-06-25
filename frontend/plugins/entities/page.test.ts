import { expect, describe, it, beforeEach } from 'vitest';
import { Context } from '@nuxt/types';
import { v4 } from 'uuid';
import {
    PageController,
    parseFromContentByRegexp,
} from '~/plugins/entities/page';
import { createStore } from '~/tests/store.setup';
import { IDocument } from '~/components/document/model';
import { LabelController } from '~/plugins/entities/label';
import { TaskController } from '~/plugins/entities/task';

describe('PageController', () => {
    const context: Partial<Context> = {};
    let pageController!: PageController;
    beforeEach(() => {
        const store = createStore();
        context.store = store;
        context.$entities = {
            event: {} as any,
            vault: {} as any,
            task: {} as TaskController,
        } as any;
        context.$entities!.label = new LabelController({
            store,
            $entities: context.$entities!,
        } as any);
        context.$entities!.page = new PageController({
            store,
            $entities: context.$entities!,
            $utils: {
                event: {
                    postprocessEvents: () => {},
                },
            },
        } as any);
        context.$entities!.task = new TaskController({
            store,
            $entities: context.$entities!,
        } as any);
        pageController = context.$entities!.page;
    });

    it('Create new empty page object', () => {
        const id = v4();
        const page = pageController.newPage(id);
        expect(page.createdAt).instanceof(Date);
        expect(page.updatedAt).instanceof(Date);
        expect(page).toEqual({
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
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
        });
    });

    it('Save entity to store', async ({ expect }) => {
        const id = v4();
        const page = pageController.newPage(id);

        context.store?.commit('document/update', page as IDocument);
        await pageController.saveToStore(page as IDocument);

        const savedDocument = context.store?.getters['document/byId'](id);
        expect(savedDocument).not.toBeNull();
        expect(savedDocument.updatedAt).instanceof(Date);
        page.updatedAt = savedDocument.updatedAt;
        expect(page).toEqual(savedDocument);
    });

    it('Postprocessing page without custom components', () => {
        const id = v4();
        const page = pageController.newPage(id);
        page.content = '<p>Test</p>';

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        expect(postprocessingMap).toEqual({
            fullTasks: {},
            events: [],
            tasks: [],
            linearIssues: [],
            labels: [],
        });
    });

    it('Postprocessing page with vue todo', () => {
        const id = v4();
        const page = pageController.newPage(id);
        const taskId1 = v4();
        const taskId2 = v4();
        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${taskId1}" completed="false">Recurring tasks are easy to set up</div></li><li><div data-type="taskItemContent" id="${taskId2}" completed="false">Recurring tasks are easy to set up</div></li></ul>`;

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        // @ts-ignore
        delete postprocessingMap.fullTasks[taskId1].hash; // TODO: handle hash somehow, it is not deterministic right now
        // @ts-ignore
        delete postprocessingMap.fullTasks[taskId2].hash; // TODO: handle hash somehow, it is not deterministic right now

        expect(postprocessingMap).toEqual({
            tasks: [taskId1, taskId2],
            fullTasks: {
                [taskId1]: {
                    id: taskId1,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
                [taskId2]: {
                    id: taskId2,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            events: [],
            labels: [],
            linearIssues: [],
        });
    });

    it('Postprocessing page with added vue todo', () => {
        const id = v4();
        const page = pageController.newPage(id);
        const oldPage = pageController.newPage(v4);
        const taskId1 = v4();
        const taskId2 = v4();

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${taskId1}" completed="false">Recurring tasks are easy to set up</div></li><li><div data-type="taskItemContent" id="${taskId2}" completed="false">Recurring tasks are easy to set up</div></li></ul>`;
        context.store?.commit('document/update', oldPage as IDocument);
        context.store?.commit('document/addToTaskMap', {
            tasks: [taskId1],
            doc: oldPage,
        });

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        // @ts-ignore
        delete postprocessingMap.fullTasks[taskId1].hash; // TODO: handle hash somehow, it is not deterministic right now
        // @ts-ignore
        delete postprocessingMap.fullTasks[taskId2].hash; // TODO: handle hash somehow, it is not deterministic right now

        expect(postprocessingMap).toEqual({
            tasks: [taskId1, taskId2],
            fullTasks: {
                [taskId1]: {
                    id: taskId1,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
                [taskId2]: {
                    id: taskId2,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            events: [],
            linearIssues: [],
            labels: [],
        });
    });

    it('Postprocessing page with added vue todo', () => {
        const id = v4();
        const page = pageController.newPage(id);
        const taskId1 = v4();
        const taskId2 = v4();

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${taskId1}" completed="false">Recurring tasks are easy to set up</div></li><li><div data-type="taskItemContent" id="${taskId2}" completed="false">Recurring tasks are easy to set up</div></li></ul>`;
        context.store?.commit('document/update', page as IDocument);
        pageController.updatePostprocessingMap(page.id!, {
            tasks: [taskId1, taskId2],
        });
        context.store?.commit('document/addToTaskMap', {
            tasks: [taskId1, taskId2],
            doc: page,
        });

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        // @ts-ignore
        delete postprocessingMap.fullTasks; // TODO

        expect(postprocessingMap).toEqual({
            tasks: [taskId1, taskId2],
            events: [],
            githubLinks: [],
            linearIssues: [],
            jiraIssues: [],
            links: [],
            labels: [],
            images: [],
        });
    });

    it('Postprocessing page with event', () => {
        const id = v4();
        const page = pageController.newPage(id);
        const eventId = v4();
        page.content = `<p>Test</p><inline-event id="${eventId}"></inline-event>`;

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        expect(postprocessingMap).toEqual({
            events: [eventId],
            fullTasks: {},
            tasks: [],
            labels: [],
            linearIssues: [],
        });
    });

    it('Postprocessing page with labels', () => {
        const id = v4();
        const page = pageController.newPage(id);
        page.content = `<p>Test #label</p>`;

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        expect(postprocessingMap).toEqual({
            labels: ['#label'],
            fullTasks: {},
            events: [],
            tasks: [],
            linearIssues: [],
        });
    });

    it('Postprocessing page with jira issue', () => {
        const id = v4();
        const jiraId = `JIN-55`;
        const page = pageController.newPage(id);
        page.content = `<p>Test</p><jira-link id="${jiraId}"></jira-link>`;

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        expect(postprocessingMap).toEqual({
            jiraIssues: [jiraId],
            fullTasks: {},
            events: [],
            tasks: [],
            labels: [],
            linearIssues: [],
        });
    });

    it('Postprocessing page with links', () => {
        const id = v4();
        const page = pageController.newPage(id);
        page.content = `<p>Test</p><inline-document-link id="${id}"></inline-document-link>`;

        const postprocessingMap = pageController.postprocessing(
            page as IDocument,
        );

        expect(postprocessingMap).toEqual({
            links: [id],
            fullTasks: {},
            events: [],
            tasks: [],
            labels: [],
            linearIssues: [],
        });
    });

    it('Postprocessing page with all entitites', async ({ expect }) => {
        const id = v4();
        const page = pageController.newPage(id);
        const jiraId = `JIN-44`;

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${id}" completed="false">Recurring tasks are easy to set up</div></li></ul><p><inline-event id="${id}"></inline-event> #label</p><jira-link id="${jiraId}"></jira-link><inline-document-link id="${id}"></inline-document-link>`;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess(page);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        // @ts-ignore
        delete postprocessingMap.fullTasks[id].hash; // TODO

        expect(postprocessingMap).toEqual({
            tasks: [id],
            fullTasks: {
                [id]: {
                    id,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            events: [id],
            jiraIssues: [jiraId],
            links: [id],
            labels: ['#label'],
            linearIssues: [],
        });
    });

    it('Postprocessing archived page with all entitites ', async ({
        expect,
    }) => {
        const id = v4();
        const page = pageController.newPage(id);
        const jiraId = `JIN-88`;

        page.archived = true;
        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${id}" completed="false">Recurring tasks are easy to set up</div></li></ul><p><inline-event id="${id}"></inline-event> #label</p><jira-link id="${jiraId}"></jira-link><inline-document-link id="${id}"></inline-document-link>`;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess(page);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        expect(postprocessingMap).toEqual({
            tasks: [],
            events: [],
            jiraIssues: [],
            links: [],
            labels: [],
            images: [],
        });
    });

    it('Postprocessing pages as array with all entitites ', async ({
        expect,
    }) => {
        const id = v4();
        const page = pageController.newPage(id);
        const jiraId = `JIN-45`;

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${id}" completed="false">Recurring tasks are easy to set up</div></li></ul><p><inline-event id="${id}"></inline-event> #label</p><jira-link id="${jiraId}"></jira-link><inline-document-link id="${id}"></inline-document-link>`;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess([page]);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        // @ts-ignore
        delete postprocessingMap.fullTasks[id].hash; // TODO: handle hash somehow, it is not deterministic right now

        expect(postprocessingMap).toEqual({
            tasks: [id],
            fullTasks: {
                [id]: {
                    id,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            events: [id],
            jiraIssues: [jiraId],
            links: [id],
            labels: ['#label'],
            linearIssues: [],
        });
    });

    it('Postprocessing page without content', async ({ expect }) => {
        const id = v4();
        const page = pageController.newPage(id);

        page.content = ``;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess([page]);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        expect(postprocessingMap).toEqual({
            tasks: [],
            events: [],
            githubLinks: [],
            jiraIssues: [],
            links: [],
            labels: [],
            images: [],
        });
    });

    it('Postprocessing page and notify with all entitites ', async ({
        expect,
    }) => {
        const id = v4();
        const page = pageController.newPage(id);
        const jiraId = `JIN-99`;

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${id}" completed="false">Recurring tasks are easy to set up</div></li></ul><p><inline-event id="${id}"></inline-event> #label</p><jira-link id="${jiraId}"></jira-link><inline-document-link id="${id}"></inline-document-link>`;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess([page] as any);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        // @ts-ignore
        delete postprocessingMap.fullTasks[id].hash; // TODO: handle hash somehow, it is not deterministic right now

        expect(postprocessingMap).toEqual({
            tasks: [id],
            fullTasks: {
                [id]: {
                    id,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            linearIssues: [],
            jiraIssues: [jiraId],
            events: [id],
            links: [id],
            labels: ['#label'],
        });
    });

    it('Postprocessing page as array and notify with all entitites ', async ({
        expect,
    }) => {
        const id = v4();
        const page = pageController.newPage(id);
        const jiraId = `JIN-44`;

        page.content = `<p>Test</p><ul><li><div data-type="taskItemContent" id="${id}" completed="false">Recurring tasks are easy to set up</div></li></ul><p><inline-event id="${id}"></inline-event> #label</p><jira-link id="JIN-44" url="https://acr-test.atlassian.net/browse/JIN-44"></jira-link><inline-document-link id="${id}"></inline-document-link>`;
        context.store?.commit('document/update', page as IDocument);

        await pageController.postprocess([page] as any);
        const postprocessingMap = pageController.getPostprocessingMap(id);

        // @ts-ignore
        delete postprocessingMap.fullTasks[id].hash; // TODO: handle hash somehow, it is not deterministic right now

        expect(postprocessingMap).toEqual({
            tasks: [id],
            fullTasks: {
                [id]: {
                    id,
                    completed: false,
                    start: null,
                    end: null,
                    text: 'Recurring tasks are easy to set up',
                    rrule: null,
                },
            },
            linearIssues: [],
            events: [id],
            jiraIssues: [jiraId],
            links: [id],
            labels: ['#label'],
        });
    });

    it('Update postprocessing map', async ({ expect }) => {
        const id = v4();
        const postprocessingMap = {
            tasks: [id],
            events: [],
            githubLinks: [],
            jiraIssues: [],
            links: [id],
            labels: [],
            images: [id],
        };

        await pageController.updatePostprocessingMap(id, postprocessingMap);
        const storePostprocessingMap =
            context.store?.getters['document/postprocessingMap'](id);
        expect(storePostprocessingMap).toEqual(postprocessingMap);
    });

    it('Get postprocessing map', async ({ expect }) => {
        const id = v4();
        const postprocessingMap = {
            tasks: [id],
            events: [],
            githubLinks: [],
            jiraIssues: [],
            links: [id],
            labels: [],
            images: [id],
        };

        await pageController.updatePostprocessingMap(id, postprocessingMap);
        const storePostprocessingMap = pageController.getPostprocessingMap(id);
        expect(storePostprocessingMap).toEqual(postprocessingMap);
    });

    it('Parse task from content', () => {
        const id = v4();
        const content = `<ul><li><div data-type="taskItemContent" id="${id}" completed="false" start="date:1699398000000" end="date:1699484400000" rrule="RRULE:FREQ=DAILY">Recurring tasks are easy to set up</div></li></ul>`;
        const taskMap = pageController.parseTasksFromContent(content);
        expect(Object.keys(taskMap)).toEqual([id]);
    });

    it('Parse entity from content using regexp', () => {
        const id = v4();
        const content = `<p>Test</p><inline-event id="${id}"></inline-event>`;
        const eventIds = parseFromContentByRegexp(
            content,
            /inline-event id=['"]([A-Za-z0-9-]+)['"]/g,
        );
        expect(eventIds).toEqual([id]);
    });

    it('Parse entity with new id from content using regexp', () => {
        const content = `<p>Test</p><inline-event id="new"></inline-event>`;
        const eventIds = parseFromContentByRegexp(
            content,
            /inline-event id=['"]([A-Za-z0-9-]+)['"]/g,
        );
        expect(eventIds).toEqual([]);
    });

    it('Parse entity with new id from content using regexp', () => {
        const content = `<p>Test</p><inline-event id="new"></inline-event>`;
        const eventIds = parseFromContentByRegexp(
            content,
            /inline-event id=['"]([A-Za-z0-9-]+)['"]/g,
        );
        expect(eventIds).toEqual([]);
    });

    it('Did change swap item', () => {
        const didChange = pageController.didChange(['abc'], ['efg']);
        expect(didChange).toBe(true);
    });

    it('Did change add item', () => {
        const didChange = pageController.didChange(['abc', 'efg'], ['efg']);
        expect(didChange).toBe(true);
    });

    it('Did change remove item', () => {
        const didChange = pageController.didChange(['efg'], ['abc', 'efg']);
        expect(didChange).toBe(true);
    });

    it('Did not change', () => {
        const didChange = pageController.didChange(['abc'], ['abc']);
        expect(didChange).toBe(false);
    });

    it('Should prepare template', () => {
        const template = `<ul><li><div data-type="taskItemContent" id="10efe608-440d-4886-81fd-25e1ca3f1a05" completed="false">idasdas</div></li></ul><p></p>`;
        const preparedTemplate = pageController.prepareTemplate(template);
        expect(preparedTemplate).not.toEqual(template);
    });
});
