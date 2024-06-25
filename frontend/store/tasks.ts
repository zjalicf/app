import {
    add,
    endOfDay,
    format,
    isBefore,
    isSameDay,
    parseISO,
    startOfDay,
    sub,
} from 'date-fns';
import { Context } from '@nuxt/types';
import Vue from 'vue';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import { validate } from 'uuid';
import {
    CANCELLED_EXCEPTION_TYPE,
    createRecurrentTaskBefore,
    createRecurrentTaskNext,
    createRecurrentTaskRange,
    currentTimezone,
    extractDate,
    getDateFromId,
    getZonedEndOfDay,
    isAllDay,
    isInRange,
} from '~/helpers/date';
import { ITask, TaskDateObject } from '~/components/task/model';
import { normalize } from '~/plugins/entities/label';
import { IDocument } from '~/components/document/model';

const EOD_DATE = new Date();
EOD_DATE.setHours(23, 59, 59);

interface AppState {
    tasks: { [key: string]: ITask };
    pageMap: { [key: string]: string[] };
    list: string[];
    recurrentParentTasks: string[];
    recurringExceptionTasks: { id: string; recurrentId: string }[];
    timer: any;
    timerMap: { [key: string]: string };
}

export const state: () => AppState = () => ({
    tasks: {},
    pageMap: {},
    list: [],
    recurrentParentTasks: [],
    recurringExceptionTasks: [],
    timer: null,
    timerMap: {},
});

export const deserializeTaskDateObject = (taskDate: TaskDateObject) => {
    const dateObj = taskDate
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
    return dateObj;
};

export const deserializeTask = (task: ITask): ITask => {
    try {
        const labels = task.labels.map((label: any) => {
            if (typeof label === 'string') {
                return `#${normalize(label)}`;
            }

            return `#${normalize(label.label)}`;
        });

        return {
            ...task,
            localCompleted: task.completed,
            start: deserializeTaskDateObject(task.start),
            end: deserializeTaskDateObject(task.end),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
            createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
            labels,
        };
    } catch (e) {
        return {
            ...task,
            localCompleted: task.completed,
            start: deserializeTaskDateObject(task.start),
            end: deserializeTaskDateObject(task.end),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
            createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
            labels: [],
        };
    }
};

export const serializeTaskDateObject = (taskDate: TaskDateObject) => {
    if (!taskDate || isEmpty(taskDate)) return null;

    let date = null;
    if (taskDate.date && isString(taskDate.date)) date = taskDate.date;
    if (taskDate.date && isDate(taskDate.date))
        date = format(taskDate.date, 'yyyy-MM-dd');

    let dateTime = null;
    if (taskDate.dateTime && isString(taskDate.dateTime))
        dateTime = taskDate.dateTime;
    if (taskDate.dateTime && isDate(taskDate.dateTime))
        dateTime = taskDate.dateTime.toISOString();

    return {
        date,
        dateTime,
        timeZone: taskDate.timeZone || null,
    };
};

export const getters = {
    byId: (state: AppState, getters: any) => (id: string) => {
        if (validate(id)) {
            return state.tasks[id] || null;
        }
        if (!id?.includes('__')) return null;
        const [parentId] = id.split('__');
        const recurringInstance = getters.byRecurrentId(id);

        if (!recurringInstance) {
            return getters.recurringAfterDate(parentId, getDateFromId(id));
        }
        return recurringInstance;
    },
    timer: (state: AppState) => {
        return state.timer;
    },
    timerMap: (state: AppState) => {
        return state.timerMap;
    },
    pageMap: (state: AppState) => {
        return state.pageMap;
    },
    recurringExceptions: (state: AppState) => {
        return state.recurringExceptionTasks.map(({ id }) => {
            const task = state.tasks[id];
            if (!task) return null;
            const [parentId] = task.recurrentId?.split('__') ?? [];
            if (!parentId) {
                return state.tasks[id];
            }
            return {
                ...state.tasks[id],
                text: state.tasks[parentId]?.text ?? state.tasks[id].text,
            };
        });
    },
    byRecurrentId: (state: AppState) => (id: string) => {
        const recurringObject = state.recurringExceptionTasks.find(
            ({ recurrentId }) => recurrentId === id,
        );
        if (!recurringObject) return null;

        const task = state.tasks[recurringObject.id];
        if (!task) return null;
        const [parentId] = task.recurrentId?.split('__') ?? [];
        if (!parentId) {
            return state.tasks[recurringObject.id];
        }
        return {
            ...state.tasks[recurringObject.id],
            text: state.tasks[parentId]?.text ?? state.tasks[id].text,
        };
    },
    recurringExceptionsById: (state: AppState, getters: any) => {
        const exceptions = getters.recurringExceptions;
        return (recurringTaskId: string) =>
            exceptions
                .filter(({ recurrentId }: any) =>
                    recurrentId.startsWith(recurringTaskId),
                )
                .map(({ id }: any) => state.tasks[id]);
    },
    recurringParents: (state: AppState) => {
        return state.recurrentParentTasks.map(id => state.tasks[id]);
    },
    recurringParentByRecurringId: (_state: AppState, getters: any) => {
        return (recurrentId: string) => {
            const [parentId] = recurrentId?.split('__') ?? [];
            return getters.byId(parentId);
        };
    },
    byDocumentId: (
        _state: AppState,
        getters: any,
        _rootState: any,
        rootGetters: any,
    ) => {
        const taskMap = rootGetters['document/taskMap'];

        return (docId: string) => {
            return Object.keys(taskMap)
                .filter(task => taskMap[task] === docId)
                .map(task => getters.byId(task));
        };
    },
    list: (
        state: AppState,
        _getters: any,
        _rootState: any,
        rootGetters: any,
    ): ITask[] => {
        const taskMap = rootGetters['document/taskMap'];
        const isFromArchivedPage = (id: string) => {
            return rootGetters['document/byId'](taskMap[id]).archived;
        };
        return state.list
            .filter(
                (task: string) => !taskMap[task] || !isFromArchivedPage(task),
            )
            .map(id => state.tasks[id]);
    },
    listWithoutRecurringParents: (state: AppState): ITask[] => {
        return state.list
            .filter(
                id =>
                    !state.recurrentParentTasks.includes(id) &&
                    !state.recurringExceptionTasks.some(
                        ({ id: _id }) => id === _id,
                    ),
            )
            .map(id => state.tasks[id]);
    },
    recurringAfterDate: (state: AppState, getters: any) => {
        return (parentId: string, date: Date) => {
            const parentTask = state.tasks[parentId];
            const recurrentInstance = createRecurrentTaskNext(
                state.tasks[parentId],
                date,
            );
            return {
                ...(getters.byRecurrentId(recurrentInstance?.recurrentId) ??
                    recurrentInstance),
                text: parentTask.text,
            };
        };
    },
    recurringBeforeDate: (state: AppState, getters: any) => {
        return (parentId: string, date: Date) => {
            const parentTask = state.tasks[parentId];
            const recurrentInstance = createRecurrentTaskBefore(
                state.tasks[parentId],
                getZonedEndOfDay(date, currentTimezone()),
            );
            return {
                ...(getters.byRecurrentId(recurrentInstance?.recurrentId) ??
                    recurrentInstance),
                text: parentTask.text,
            };
        };
    },
    recurringInstancesOverdue(_state: AppState, getters: any) {
        const parentTasks: ITask[] = getters.recurringParents;

        return (date: Date) => {
            return parentTasks
                .map((task: ITask) => {
                    const afterDate = getters.recurringAfterDate(task.id, date);
                    const beforeDate = getters.recurringBeforeDate(
                        task.id,
                        endOfDay(date),
                    );
                    if (!beforeDate) return null;
                    if (!afterDate) return beforeDate;
                    if (
                        isSameDay(
                            extractDate(afterDate.start),
                            extractDate(beforeDate.start),
                        )
                    ) {
                        return null;
                    }
                    if (beforeDate.type === CANCELLED_EXCEPTION_TYPE)
                        return null;
                    return beforeDate;
                })
                .filter(v => !!v);
        };
    },
    recurringInstancesRange: (_state: AppState, getters: any) => {
        const parentTasks: ITask[] = getters.recurringParents;

        return (range: { start: Date; end: Date }) => {
            return parentTasks
                .map(task => {
                    const tasks = createRecurrentTaskRange(task, range);
                    const existingInstances = getters.recurringExceptionsById(
                        task.id,
                    ) as ITask[];

                    return (
                        tasks.map(t => {
                            const instance = existingInstances.find(
                                existing =>
                                    existing.recurrentId === t.recurrentId,
                            );
                            if (!instance) {
                                return t;
                            }
                            if (instance.type === CANCELLED_EXCEPTION_TYPE)
                                return null;
                            return instance;
                        }) ?? []
                    );
                })
                .reduce((acc, v) => {
                    return [...acc, ...v];
                }, [])
                .filter(v => !!v);
        };
    },
    calendarTaskList: (_: AppState, getters: any) => {
        const tasks = getters.listWithoutRecurringParents;
        return (range: { start: Date; end: Date }) => {
            const allTasks = [
                ...tasks,
                ...getters.recurringInstancesRange(range),
            ];
            return allTasks
                .filter(
                    (task: ITask) =>
                        task.start &&
                        extractDate(task.start) &&
                        isInRange(task, range),
                )
                .map((task: ITask) => {
                    const calendarTask = { ...task, type: 'task' } as any;
                    calendarTask.name = task.text;
                    if (calendarTask.start) {
                        if (
                            task.start &&
                            task.end &&
                            new Date(extractDate(task.start)).getDate() !==
                                new Date(extractDate(task.end)).getDate()
                        ) {
                            calendarTask.timed = false;
                        } else {
                            calendarTask.timed = !isAllDay(task.start);
                        }

                        calendarTask.startObject = task.start
                            ? { ...task.start }
                            : null;
                        calendarTask.endObject = task.end
                            ? { ...task.end }
                            : null;
                        calendarTask.start = extractDate(task.start).getTime();

                        calendarTask.startTime = extractDate(task.start);

                        if (isAllDay(task.start) && isAllDay(task.end)) {
                            const endDate = sub(extractDate(task.end), {
                                days: 1,
                            });
                            calendarTask.end = extractDate(task.end)
                                ? endDate.getTime()
                                : calendarTask.start;

                            calendarTask.endTime = extractDate(task.end)
                                ? endDate
                                : calendarTask.startTime;
                        } else {
                            calendarTask.end = extractDate(task.end)
                                ? extractDate(task.end).getTime()
                                : calendarTask.start;

                            calendarTask.endTime = task.end
                                ? extractDate(task.end)
                                : calendarTask.startTime;
                        }
                    }
                    return calendarTask;
                });
        };
    },
    length: (state: AppState) => {
        return state.list.length;
    },
    review: (_: AppState, getters: any, __: any) => (date: Date) => {
        const today = startOfDay(date);

        return [
            ...getters
                .recurringInstancesOverdue(today)
                .filter(
                    (v: ITask) => !!v && isBefore(extractDate(v.start), today),
                ),
            ...getters.listWithoutRecurringParents,
        ]
            .filter((task: ITask) => {
                if (task.completed) return false;
                let start = null;
                let end = null;

                if (!task.start) return false;

                start = extractDate(task.start);

                const extractedEnd = extractDate(task.end) ?? null;
                if (extractedEnd) {
                    if (isAllDay(task.start)) {
                        end = sub(extractedEnd, { days: 1 });
                    } else {
                        end = extractedEnd;
                    }
                }

                if (start && !end && isBefore(start, today)) return true;
                return !!(start && end && isBefore(end, today));
            })
            .sort((a: ITask, b: ITask) => {
                return (
                    extractDate(b.start).getTime() -
                    extractDate(a.start).getTime()
                );
            });
    },
    agenda:
        (_: AppState, getters: any, __: any, rootGetters: any) =>
        (date: Date) => {
            const today = startOfDay(date);
            const dailyDoc = format(new Date(date), 'yyyy-MM-dd');
            const showCompleted =
                rootGetters['appSettings/editorOptions'].agendaShowCompleted;

            return [
                ...getters.recurringParents
                    .reduce((acc: ITask[], task: ITask) => {
                        const instance = getters.recurringAfterDate(
                            task.id,
                            today,
                        );
                        if (!instance) return acc;
                        if (instance.type === CANCELLED_EXCEPTION_TYPE)
                            return acc;
                        return [...acc, instance];
                    }, [])
                    .filter((v: ITask) => {
                        return !!v && isSameDay(extractDate(v.start), today);
                    }),
                ...getters.listWithoutRecurringParents,
            ]
                .filter((task: ITask) => {
                    if (!showCompleted && task.completed) return false;
                    let start = null;
                    let end = null;

                    if (!task.start) return false;

                    start = extractDate(task.start);

                    if (task.end) {
                        if (isAllDay(task.start)) {
                            end = sub(extractDate(task.end), { days: 1 });
                        } else {
                            end = extractDate(task.end);
                        }
                    }

                    if (start && !end && isSameDay(start, today)) return true;
                    return !!(start && end && isSameDay(end, today));
                })
                .sort((a: ITask, b: ITask) => {
                    return (
                        extractDate(b.start).getTime() -
                        extractDate(a.start).getTime()
                    );
                })
                .filter((task: ITask) => {
                    const doc = rootGetters['document/byDailyDoc'](dailyDoc);
                    const properties = rootGetters[
                        'document/postprocessingMap'
                    ](doc?.id);
                    if (!doc || !properties?.tasks) return true;
                    return !properties.tasks.includes(task.id);
                });
        },
};

export const mutations = {
    clearTimer: (state: AppState) => {
        clearTimeout(state.timer);
        state.timer = null;
    },
    clearTimerMap: (state: AppState) => {
        state.timerMap = {};
    },
    updateTimerMap: (state: AppState, { id, status }: any) => {
        Vue.set(state.timerMap, id, status);
    },
    setTimer: (state: AppState, timer: any) => {
        state.timer = timer;
    },
    update: (state: AppState, task: ITask) => {
        const id = task.id;
        const existingTask = state.tasks[id] || {};

        const newTask = { ...existingTask, ...task };

        if (task.labels) {
            newTask.labels = task.labels;
        }

        Vue.set(state.tasks, id, Object.freeze(newTask));
        const index = state.list.indexOf(id);
        Vue.set(state.list, index < 0 ? state.list.length : index, id);

        if (!task.rrule && !task.recurrentId) return;
        mutations.updateRecurrentTask(state, task);
    },
    updateRecurrentTask: (state: AppState, task: ITask) => {
        if (task.recurrentId) {
            const exceptionIndex = state.recurringExceptionTasks.findIndex(
                t => t.recurrentId === task.recurrentId,
            );
            Vue.set(
                state.recurringExceptionTasks,
                exceptionIndex < 0
                    ? state.recurringExceptionTasks.length
                    : exceptionIndex,
                {
                    recurrentId: task.recurrentId,
                    id: task.id,
                },
            );
        }
        if (task.rrule) {
            const parentIndex = state.recurrentParentTasks.indexOf(task.id);
            Vue.set(
                state.recurrentParentTasks,
                parentIndex < 0
                    ? state.recurrentParentTasks.length
                    : parentIndex,
                task.id,
            );
        }
    },
    delete: (state: AppState, id: string[] | string) => {
        if (typeof id === 'string') {
            id = [id];
        }
        id.forEach(id => {
            const index = state.list.indexOf(id);
            if (index >= 0) {
                Vue.delete(state.list, index);
            }
            const exceptionIndex = state.recurringExceptionTasks.findIndex(
                ({ id: _id }) => _id === id,
            );
            if (exceptionIndex >= 0) {
                Vue.delete(state.recurringExceptionTasks, exceptionIndex);
            }
            const parentIndex = state.recurrentParentTasks.indexOf(id);
            if (parentIndex >= 0) {
                Vue.delete(state.recurrentParentTasks, parentIndex);
            }
            Vue.delete(state.tasks, id);
        });
    },
    batchUpdate: (state: AppState, tasks: ITask[]) => {
        const tasksObj: Record<string, ITask> = { ...state.tasks };
        const list = [...state.list];
        const recurrentParentTasks = [...state.recurrentParentTasks];
        const recurringExceptionTasks = [...state.recurringExceptionTasks];
        for (const task of tasks) {
            const existingTask = tasksObj[task.id] || {};
            tasksObj[task.id] = { ...existingTask, ...task };

            let index;
            if (task.id && !task.recurrentId) {
                index = list.indexOf(task.id);
                if (index === -1) {
                    list.push(task.id);
                }
            }
            if (task.rrule) {
                index = recurrentParentTasks.indexOf(task.id);
                if (index === -1) {
                    recurrentParentTasks.push(task.id);
                }
            }

            if (task.recurrentId) {
                index = recurringExceptionTasks.findIndex(
                    ({ id, recurrentId }) =>
                        id === task.id && recurrentId === task.recurrentId,
                );
                if (index === -1) {
                    recurringExceptionTasks.push({
                        id: task.id,
                        recurrentId: task.recurrentId,
                    });
                }
            }
        }

        state.tasks = tasksObj;
        state.list = list;
        state.recurrentParentTasks = recurrentParentTasks;
        state.recurringExceptionTasks = recurringExceptionTasks;
    },
    addToPageMap: (
        state: AppState,
        { tasks, page }: { tasks: string[]; page: IDocument },
    ) => {
        tasks.forEach(task => {
            if (!state.pageMap[task]) {
                state.pageMap[task] = [];
            }
            state.pageMap[task] = [
                ...state.pageMap[task].filter(id => page.id !== id),
                page.id,
            ];
            state.pageMap = { ...state.pageMap };
        });
    },
    removeFromPageMap: (
        state: AppState,
        { tasks, page }: { tasks: string[]; page: IDocument },
    ) => {
        tasks.forEach(task => {
            if (!state.pageMap[task]) return;
            state.pageMap[task] = [
                ...state.pageMap[task].filter(id => page.id !== id),
            ];
            if (state.pageMap[task].length === 0) {
                delete state.pageMap[task];
            }
            state.pageMap = { ...state.pageMap };
        });
    },
    clear: (state: AppState) => {
        state.pageMap = {};
        state.tasks = {};
        state.list = [];
        state.recurrentParentTasks = [];
        state.recurringExceptionTasks = [];
    },
};

export const actions = {
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    queueStatus(
        this: Context,
        { commit, getters, dispatch }: any,
        { id, status }: any,
    ) {
        if (getters.timer) {
            commit('clearTimer');
        }

        commit('updateTimerMap', { id, status });

        const timer = setTimeout(async () => {
            await Promise.all([
                Object.keys(getters.timerMap).map(id => {
                    if (!getters.byId(id)) return Promise.resolve();

                    return dispatch('update', {
                        id,
                        completed: getters.timerMap[id],
                    });
                }),
            ]);

            commit('clearTimer');
            commit('clearTimerMap');
        }, 1500);

        commit('setTimer', timer);
    },
    socketUpdate(this: Context, { commit }: any, payload: any) {
        const { action, task } = JSON.parse(payload) as {
            action: string;
            task: ITask;
        };
        if (action === 'delete') {
            commit('delete', task.id);
            return;
        }
        commit('update', deserializeTask(task));
    },
    async update(
        this: Context,
        { commit, rootGetters, getters, dispatch }: any,
        task: ITask,
    ) {
        const id = task.id;
        const previousState = getters.byId(id);

        commit('update', {
            ...task,
        });

        this.$utils.refreshCalendarData();
        dispatch(
            'document/rewriteOnEntityUpdate',
            { kind: 'tasks', ids: [id] },
            { root: true },
        );
        if (previousState && previousState.completed !== task.completed) {
            this.$tracking.trackEvent('task', {
                action: task.completed ? 'completed' : 'uncompleted',
            });
        }
    },
    deleteRecurringException(
        this: Context,
        { getters, dispatch }: any,
        id: string,
    ) {
        const exception = getters.byId(id);
        return dispatch('update', {
            ...exception,
            type: CANCELLED_EXCEPTION_TYPE,
        });
    },
    async delete(
        this: Context,
        { getters, commit, _rootGetters, dispatch }: any,
        id: string[] | string,
    ) {
        if (!this.$workers.database) return;
        if (typeof id === 'string') {
            id = [id];
        }
        const recurringParents = id.filter(id => getters.byId(id)?.rrule);
        if (recurringParents.length) {
            const exceptions = recurringParents.reduce((acc, val) => {
                const ids = getters
                    .recurringExceptionsById(val)
                    .map(({ id }: ITask) => id);
                return [...acc, ...ids];
            }, [] as string[]);
            commit('delete', exceptions);
        }
        const exceptions = id.filter(_id => _id.includes('__'));
        id = id.filter(_id => !_id.includes('__'));
        if (exceptions.length > 0) {
            await Promise.all(
                exceptions.map(exception =>
                    dispatch('deleteRecurringException', exception),
                ),
            );
        }

        const previousState = getters.byId(id);
        commit('delete', id);
        await Promise.all(
            id.map(i => {
                this.$entities.label.updateEntity(
                    i,
                    previousState?.labels ?? [],
                    [],
                    'tasks',
                );
                return Promise.resolve();
            }),
        );
        this.$utils.refreshCalendarData();
    },
};
