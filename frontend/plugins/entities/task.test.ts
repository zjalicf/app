import { beforeEach, describe, it } from 'vitest';
import { v4 } from 'uuid';
import { Context } from '@nuxt/types';
import { add } from 'date-fns';
import { createStore } from '~/tests/store.setup';
import { createNewTaskObject } from '~/helpers/tasks';
import { ITask } from '~/components/task/model';
import { createTaskDateObject, extractDate } from '~/helpers';

describe('utils/task', () => {
    const context: Partial<Context> = {};
    beforeEach(() => {
        context.store = createStore();
    });

    const getBasicTask = () => {
        const vaultId = v4();
        return createNewTaskObject(vaultId) as any as ITask;
    };

    const setupStoreWithTasks = async () => {
        for (let i = -5; i <= 5; i++) {
            const task = getBasicTask();
            task.start = createTaskDateObject(
                null,
                add(new Date(), { days: i }),
            );
            await context.store?.dispatch('tasks/update', task);
        }
    };

    const dispatchAndGet = async (task: ITask) => {
        await context.store?.dispatch('tasks/update', task);
        return context.store?.getters['tasks/byId'](task.id);
    };

    it('Create basic task', async ({ expect }) => {
        const task = getBasicTask();

        const storedTask = await dispatchAndGet(task);
        expect(storedTask).not.toEqual(undefined);
    });

    it('Create task with start date', async ({ expect }) => {
        const task = getBasicTask();
        task.start = createTaskDateObject(new Date('2023-09-05'), null);

        const storedTask = await dispatchAndGet(task);
        expect(extractDate(storedTask.start)).toEqual(new Date('2023-09-05'));
    });

    it('Create task with start date and time', async ({ expect }) => {
        const task = getBasicTask();

        task.start = createTaskDateObject(
            null,
            new Date('2023-09-05T16:48:00'),
        );

        const storedTask = await dispatchAndGet(task);
        expect(extractDate(storedTask.start)).toEqual(
            new Date('2023-09-05T16:48:00'),
        );
    });

    it('Create task with start and end dates', async ({ expect }) => {
        const task = getBasicTask();
        task.start = createTaskDateObject(new Date('2023-09-05'), null);
        task.end = createTaskDateObject(new Date('2023-09-15'), null);

        const storedTask = await dispatchAndGet(task);
        expect(extractDate(storedTask.start)).toEqual(new Date('2023-09-05'));
        expect(extractDate(storedTask.end)).toEqual(new Date('2023-09-15'));
    });

    it('Create task with start and end datetimes', async ({ expect }) => {
        const task = getBasicTask();
        task.start = createTaskDateObject(
            null,
            new Date('2023-09-05T16:56:00'),
        );
        task.end = createTaskDateObject(null, new Date('2023-09-15T16:56:01'));

        const storedTask = await dispatchAndGet(task);
        expect(extractDate(storedTask.start)).toEqual(
            new Date('2023-09-05T16:56:00'),
        );
        expect(extractDate(storedTask.end)).toEqual(
            new Date('2023-09-15T16:56:01'),
        );
    });

    it('Create tasks with funny starts', async ({ expect }) => {
        const maxDate = new Date(8640000000000000);
        const minDate = new Date(-8640000000000000);

        const task1 = getBasicTask();
        task1.start = createTaskDateObject(null, new Date(maxDate.getTime()));

        const task2 = getBasicTask();
        task2.start = createTaskDateObject(null, new Date(minDate.getTime()));

        const task3 = getBasicTask();
        task3.start = createTaskDateObject(null, new Date(0));

        const storedTask1 = await dispatchAndGet(task1);
        const storedTask2 = await dispatchAndGet(task2);
        const storedTask3 = await dispatchAndGet(task3);

        expect(extractDate(storedTask1.start)).toEqual(
            new Date(maxDate.getTime()),
        );
        expect(extractDate(storedTask2.start)).toEqual(
            new Date(minDate.getTime()),
        );
        expect(extractDate(storedTask3.start)).toEqual(new Date(0));
    });

    it('Test review tasks correct retrieval', async ({ expect }) => {
        await setupStoreWithTasks();
        const reviewTasks = context.store?.getters['tasks/review'](new Date());
        expect(reviewTasks.length).toEqual(5);
    });

    it('Test agenda tasks correct retrieval', async ({ expect }) => {
        await setupStoreWithTasks();
        const agendaToday = context.store?.getters['tasks/agenda'](new Date());
        const agendaTomorrow = context.store?.getters['tasks/agenda'](
            add(new Date(), { days: 1 }),
        );
        const agendaInOneMonth = context.store?.getters['tasks/agenda'](
            add(new Date(), { months: 1 }),
        );
        expect(agendaToday.length).toEqual(1);
        expect(agendaTomorrow.length).toEqual(1);
        expect(agendaInOneMonth.length).toEqual(0);
    });
});
