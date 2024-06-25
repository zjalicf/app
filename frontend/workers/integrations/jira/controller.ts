// @ts-ignore
import type {
    Issue,
    Priority,
    Project,
    User,
    StatusDetails,
    // @ts-ignore
} from 'jira.js/out/version3/models';
import { v4 } from 'uuid';
import difference from 'lodash/difference';
import cloneDeep from 'lodash/cloneDeep';
import { format } from 'date-fns-tz';
import { StatusCodes } from 'http-status-codes';
import { defaultsDeep } from 'lodash';
import { sub } from 'date-fns';
import { WorkerContext, CloudResponse } from '~/@types/app';
import {
    IntegrationAuthStatus,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { ITask } from '~/components/task/model';
import {
    DatabaseServiceAction,
    IntegrationType,
    JiraIntegrationAction,
    ServiceKey,
} from '~/constants';
import { JiraIntegrationDataType } from '~/constants/jira';

export type JiraIntegrationConfig = Record<string, any>;
export type JiraIntegrationProject = Project & { syncEnabled?: boolean };

enum JiraStatusCategories {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done',
}

export class JiraIntegration {
    private context: WorkerContext;
    public integration: IntegrationConfig<JiraIntegrationConfig>;
    private statusCategories = [
        JiraStatusCategories.IN_PROGRESS,
        JiraStatusCategories.TODO,
    ];

    constructor(
        ctx: WorkerContext,
        integration: IntegrationConfig<JiraIntegrationConfig>,
    ) {
        this.context = ctx;
        this.integration = integration;
    }

    get config(): JiraIntegrationConfig {
        return this.integration.data;
    }

    get lastRunTimestamp() {
        return this.integration.lastRunTimestamp;
    }

    get enabledProjects(): JiraIntegrationProject[] {
        return this.integration.data.projects?.filter(
            (project: JiraIntegrationProject) => !!project.syncEnabled,
        );
    }

    get jiraCloud(): { id: string; url: string } {
        return this.config.clouds[0] ?? null;
    }

    get myself() {
        return this.config.myself;
    }

    async getIssue(
        project: any,
        key: string,
        options: { fetchUsers: boolean; fetchStatuses: boolean },
    ) {
        const response = await this.context.invoke<CloudResponse<Issue>>(
            ServiceKey.CLOUD,
            JiraIntegrationAction.GET_ISSUE,
            {
                integration: this.integration,
                key,
                callerContext: 'jira/controller.ts/getIssue',
            },
        );
        if (response.status !== StatusCodes.OK || !response.data) {
            return null;
        }
        const issue = response.data;

        return this.toACRTask(project, issue);
    }

    async getUsersPerProject(projects: JiraIntegrationProject[]) {
        if (!projects.length) {
            projects = this.enabledProjects;
        }
        const results = await Promise.all<any>(
            projects.map((project: Project) => this.getUsers(project)),
        );
        const usersPerProject = results.reduce((acc, val) => {
            acc.push(...val);
            return acc;
        }, []);

        this.saveIntegrationData(usersPerProject);
    }

    async getProjects(): Promise<(Project & { syncEnabled: boolean })[]> {
        let startAt = 0;
        const data = [];
        let response!: CloudResponse<Project[]>;
        do {
            response = await this.context.invoke<CloudResponse<Project[]>>(
                ServiceKey.CLOUD,
                JiraIntegrationAction.GET_PROJECTS,
                {
                    integration: this.integration,
                    vaultId: this.integration.vaultId,
                    integrationId: this.integration.id,
                    startAt,
                    maxResults: 50,
                    callerContext: 'jira/controller.ts/getProjects',
                },
            );
            data.push(response.data);
            startAt += response.data.length;
        } while (response && response.status < 300 && response.data.length > 0);

        const projects = data.flat();

        const integrationProjectsState = this.integration.data.projects.reduce(
            (acc: any, val: any) => {
                acc[val.id.split('/').pop()] = val.syncEnabled;
                return acc;
            },
            {},
        );
        return projects.map((project: Project) => {
            return {
                ...project,
                syncEnabled: integrationProjectsState[project.id] ?? false,
                integrationId: this.integration.id,
                integrationType: this.integration.type,
                id: [
                    JiraIntegrationDataType.PROJECT,
                    this.jiraCloud.id,
                    project.id,
                ].join('/'),
            };
        });
    }

    async getStatuses(
        project: Project,
    ): Promise<({ status: StatusDetails } & any)[]> {
        const { data } = await this.context.invoke<
            CloudResponse<{ values: any[] }>
        >(ServiceKey.CLOUD, JiraIntegrationAction.GET_STATUSES, {
            integration: this.integration,
            vaultId: this.integration.vaultId,
            integrationId: this.integration.id,
            project: project.id.split('/').pop(),
            callerContext: 'jira/controller.ts/getStatuses',
        });
        return (
            data?.values?.map((status: any) => {
                return {
                    status,
                    transitions: [],
                    integrationId: this.integration.id,
                    integrationType: this.integration.type,
                    id: [
                        JiraIntegrationDataType.STATUS,
                        this.jiraCloud.id,
                        project.id.split('/').pop(),
                        status.id,
                    ].join('/'),
                };
            }) ?? []
        );
    }

    async getPriorities(): Promise<Priority[]> {
        const { data } = await this.context.invoke<CloudResponse<Priority[]>>(
            ServiceKey.CLOUD,
            JiraIntegrationAction.GET_PRIORITIES,
            {
                integration: this.integration,
                vaultId: this.integration.vaultId,
                integrationId: this.integration.id,
                callerContext: 'jira/controller.ts/getPriorities',
            },
        );
        return data.map((priority: Priority) => {
            return {
                ...priority,
                integrationId: this.integration.id,
                integrationType: this.integration.type,
                id: [
                    JiraIntegrationDataType.PRIORITY,
                    this.jiraCloud.id,
                    priority.id,
                ].join('/'),
            };
        });
    }

    async getMyself(): Promise<User & { id: string }> {
        const { data } = await this.context.invoke<CloudResponse<User>>(
            ServiceKey.CLOUD,
            JiraIntegrationAction.GET_MYSELF,
            {
                integration: this.integration,
                vaultId: this.integration.vaultId,
                integrationId: this.integration.id,
                callerContext: 'jira/controller.ts/getMyself',
            },
        );
        return {
            ...data,
            integrationId: this.integration.id,
            integrationType: this.integration.type,
            id: [
                JiraIntegrationDataType.MYSELF,
                this.jiraCloud.id,
                data.accountId,
            ].join('/'),
        } as any;
    }

    async retrieveIssues(
        projects: JiraIntegrationProject[] = [],
        initial: boolean = false,
    ): Promise<void> {
        const lastRunTimestamp = this.integration.lastRunTimestamp;
        const lastUpdateKeys = initial
            ? cloneDeep(this.integration.updateProgress)
            : null;

        this.updateLastSync();

        const enabledProjects = projects.length
            ? projects
            : this.enabledProjects;

        const last14Days = sub(new Date(), {
            days: 14,
        }).getTime();
        const last30Days = sub(new Date(), {
            days: 30,
        }).getTime();
        const last180Days = sub(new Date(), {
            days: 180,
        }).getTime();

        const statusCategories = this.statusCategories;
        for (const project of enabledProjects) {
            for (const statusCategory of statusCategories) {
                await this.processIssues(
                    project,
                    () =>
                        this.getIssuesByProject(project, {
                            statusCategory,
                            initial,
                            lastRunTimestamp: initial ? 0 : lastRunTimestamp,
                            currentUser: true,
                            lastUpdateKeys,
                        }),
                    {
                        currentUser: true,
                        // @ts-ignore
                        statusCategory,
                        trackProgress: initial,
                        lastRunTimestamp: initial ? 0 : lastRunTimestamp,
                    },
                );
            }
            await this.processIssues(
                project,
                () =>
                    this.getIssuesByProject(project, {
                        statusCategory: JiraStatusCategories.DONE,
                        initial,
                        lastRunTimestamp: initial
                            ? last14Days
                            : Math.max(lastRunTimestamp, last14Days),
                        currentUser: true,
                        lastUpdateKeys,
                    }),
                {
                    currentUser: true,
                    // @ts-ignore
                    statusCategory: JiraStatusCategories.DONE,
                    trackProgress: initial,
                    lastRunTimestamp: initial
                        ? last14Days
                        : Math.max(lastRunTimestamp, last14Days),
                },
            );
        }

        for (const project of enabledProjects) {
            await this.processIssues(
                project,
                () =>
                    this.getIssuesByProject(project, {
                        statusCategory: JiraStatusCategories.IN_PROGRESS,
                        initial,
                        lastRunTimestamp: initial ? 0 : lastRunTimestamp,
                        lastUpdateKeys,
                    }),
                {
                    status: JiraStatusCategories.IN_PROGRESS,
                    trackProgress: initial,
                    lastRunTimestamp: initial ? 0 : lastRunTimestamp,
                },
            );
        }

        // load assigned to-do issues for the past 30 days
        for (const project of enabledProjects) {
            await this.processIssues(
                project,
                () =>
                    this.getIssuesByProject(project, {
                        assigned: true,
                        statusCategory: JiraStatusCategories.TODO,
                        initial,
                        lastRunTimestamp: initial
                            ? last30Days
                            : Math.max(lastRunTimestamp, last30Days),
                        lastUpdateKeys,
                    }),
                {
                    status: JiraStatusCategories.TODO,
                    trackProgress: initial,
                    lastRunTimestamp: initial
                        ? last30Days
                        : Math.max(lastRunTimestamp, last30Days),
                },
            );
        }
        // load unassigned to-do issues for the past 160 days
        for (const project of enabledProjects) {
            await this.processIssues(
                project,
                () =>
                    this.getIssuesByProject(project, {
                        unassigned: true,
                        statusCategory: JiraStatusCategories.TODO,
                        initial,
                        lastRunTimestamp: initial
                            ? last180Days
                            : Math.max(lastRunTimestamp, last180Days),
                        lastUpdateKeys,
                    }),
                {
                    status: JiraStatusCategories.TODO,
                    trackProgress: initial,
                    lastRunTimestamp: initial
                        ? last180Days
                        : Math.max(lastRunTimestamp, last180Days),
                },
            );
        }
        // load done issues for the past 14 days
        for (const project of enabledProjects) {
            await this.processIssues(
                project,
                () =>
                    this.getIssuesByProject(project, {
                        statusCategory: JiraStatusCategories.DONE,
                        initial,
                        lastRunTimestamp: initial
                            ? last14Days
                            : Math.max(lastRunTimestamp, last14Days),
                        lastUpdateKeys,
                    }),
                {
                    status: JiraStatusCategories.DONE,
                    trackProgress: initial,
                    lastRunTimestamp: initial
                        ? last14Days
                        : Math.max(lastRunTimestamp, last14Days),
                },
            );
        }
        if (!initial && this.integration.updateProgress) {
            return this.retrieveIssues(projects, true);
        }
        await this.updateIntegration({
            updateProgress: null,
        });

        this.updateLastSync();
    }

    public async getUsers(project: Project) {
        let startAt = 0;
        const data = [];
        let response!: CloudResponse<User[]>;
        do {
            response = await this.context.invoke<CloudResponse<User[]>>(
                ServiceKey.CLOUD,
                JiraIntegrationAction.GET_USERS,
                {
                    integration: this.integration,
                    vaultId: this.integration.vaultId,
                    integrationId: this.integration.id,
                    project: project.key,
                    startAt,
                    callerContext: 'jira/controller.ts/getUsers',
                },
            );
            data.push(response.data);
            startAt += response.data.length;
        } while (response && response.status < 300 && response.data.length > 0);

        return data.flat().map(user => {
            const id = [
                JiraIntegrationDataType.USER,
                this.jiraCloud.id,
                project.id.split('/').pop(),
                user.accountId,
            ].join('/');
            return {
                id,
                type: JiraIntegrationDataType.USER,
                integrationId: this.integration.id,
                integrationType: IntegrationType.JIRA,
                user,
            };
        });
    }

    private resolveStatusCategory(statusCategory: string) {
        return {
            [JiraStatusCategories.TODO]: 'TODO',
            [JiraStatusCategories.IN_PROGRESS]: 'IN_PROGRESS',
            [JiraStatusCategories.DONE]: 'DONE',
        }[statusCategory];
    }

    private processTransitions(project: Project, issue: Issue) {
        const transitions = issue.transitions;
        const status = {
            ...issue.fields.status,
            statusCategory: this.resolveStatusCategory(
                issue.fields.status!.statusCategory!.name!,
            ),
        };
        const acreomStatusId = this.createId(
            project,
            status.id!,
            JiraIntegrationDataType.STATUS,
        );

        return {
            id: acreomStatusId,
            type: JiraIntegrationDataType.STATUS,
            integrationId: this.integration.id,
            integrationType: IntegrationType.JIRA,
            status,
            transitions,
        };
    }

    private async processIssues(
        project: Project,
        fn: () => AsyncGenerator<any>,
        options: {
            trackProgress?: boolean;
            currentUser?: boolean;
            initial?: boolean;
            status: string;
            lastRunTimestamp: number;
        },
    ) {
        for await (const issuesBatch of fn()) {
            const batch = [];
            const issues = issuesBatch.issues;
            for (const issue of issues) {
                // batch.push(this.processTransitions(project, issue));
                batch.push(this.toACRTask(project, issue, options));
            }

            if (!batch.length) continue;
            await this.saveIntegrationData(batch).catch(e => {
                console.log(e);
                return null;
            });

            if (!options.trackProgress) continue;

            const lastKey = issues[issues.length - 1]?.key;
            const updateKey = this.createUpdatePropertyKey(options);

            if (lastKey) {
                this.updateIntegration({
                    updateProgress: {
                        ...(this.integration.updateProgress ?? {}),
                        [project.id]: {
                            ...(this.integration.updateProgress?.[project.id] ??
                                {}),
                            [updateKey]: lastKey,
                            loadProgress: {
                                status: options.status,
                                currentUser: options.currentUser ?? false,
                                total: issuesBatch.total,
                                current: issuesBatch.startAt + issues.length,
                            },
                        },
                    },
                });
            }
        }
    }

    updateLastSync() {
        const lastRunTimestamp = Date.now();

        this.context.emit(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'integrations',
            payload: {
                vaultId: this.integration.vaultId,
                entity: {
                    id: this.integration.id,
                    lastRunTimestamp,
                },
                meta: {
                    clientId: v4(),
                    postprocess: false,
                },
            },
        });
    }

    private updateIntegration(data: any) {
        this.integration = {
            ...this.integration,
            ...data,
        };
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'integrations',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: this.integration,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'jira/controller.ts/updateIntegration',
            },
        );
    }

    public saveIntegrationData(data: any[]) {
        return this.context.invoke<IntegrationConfig<JiraIntegrationConfig>>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE_BULK,
            {
                table: 'integrationsData',
                payload: {
                    vaultId: this.integration.vaultId,
                    entity: data,
                    meta: {
                        clientId: v4(),
                        postprocess: false,
                    },
                },
                callerContext: 'jira/controller.ts/saveIntegrationData',
            },
        );
    }

    getIssuesByProject(
        project: Project,
        options: {
            currentUser?: boolean;
            statusCategory?: string;
            unassigned?: boolean;
            assigned?: boolean;
            status?: string;
            backlog?: boolean;
            initial?: boolean;
            key?: string;
            lastRunTimestamp: number;
            lastUpdateKeys: any;
        },
    ): AsyncGenerator<any> {
        let query = `project="${project.key}"`;
        if (options.lastRunTimestamp) {
            query += ` and updated>="${this.lastUpdateQuery(
                options.lastRunTimestamp!,
            )}"`;
        }
        if (options.currentUser) {
            query += ' and assignee=currentuser()';
        } else if (options.unassigned) {
            query += ' and assignee=EMPTY';
        } else if (options.assigned) {
            query += ' and assignee != EMPTY AND assignee != currentUser()';
        } else {
            query += ' and (assignee!=currentuser() OR assignee=EMPTY)';
        }
        if (options.statusCategory) {
            query += ` and statusCategory="${options.statusCategory}"`;
        }
        if (options.status) {
            query += ` and status="${options.status}"`;
        }
        if (
            options.initial &&
            options.lastUpdateKeys &&
            this.getLastUpdateKey(project.id, options)
        ) {
            query += ` and key<${this.getLastUpdateKey(project.id, options)}`;
        }
        query += ' order by key desc';
        return this.getIssuesByJQL(query);
    }

    createUpdatePropertyKey(options: {
        currentUser?: boolean;
        statusCategory?: string;
        assigned?: boolean;
        unassigned?: boolean;
        status?: string;
    }) {
        return `${
            options.currentUser
                ? 'currentUser'
                : options.assigned
                ? 'assigned'
                : options.unassigned
                ? 'unassigned'
                : 'rest'
        } ${options.status || options.statusCategory}`;
    }

    getLastUpdateKey(
        project: string,
        options: {
            currentUser?: boolean;
            statusCategory?: string;
            status?: string;
            backlog?: boolean;
            initial?: boolean;
            key?: string;
            lastRunTimestamp: number;
            lastUpdateKeys: any;
        },
    ): string | null {
        const updateKey = this.createUpdatePropertyKey(options);
        return options.lastUpdateKeys?.[project]?.[updateKey] ?? null;
    }

    lastUpdateQuery(lastRunTimestamp: number): string {
        const timeBuffer = 60 * 1000; // 60 seconds before last saved timestamp;
        return format(
            new Date(lastRunTimestamp - timeBuffer),
            'yyyy/MM/dd HH:mm',
            {
                timeZone: 'UTC',
            },
        );
    }

    async processIncomingIssue(
        issue: Issue,
        oldIssue: any,
        options: {
            trackProgress?: boolean;
            updateLastRun?: boolean;
        } = {},
    ): Promise<any> {
        const config = defaultsDeep(options, {
            trackProgress: false,
            updateLastRun: true,
        }) as typeof options;
        const isMyself = [oldIssue.assignee, oldIssue.reporter].includes(
            this.myself.accountId,
        );
        const isWatching = oldIssue.watches.isWatching;
        const changelog =
            (isMyself || isWatching) && !options.trackProgress
                ? this.processChangelogNotifications(
                      oldIssue.changelog ?? [],
                      this.integration.lastRunTimestamp,
                  )
                : oldIssue.changelog ?? [];
        const processedIssue = {
            id: issue.id,
            properties: {
                transitions: issue.transitions,
                changelog,
            },
        };
        if (config.updateLastRun) {
            await this.updateLastSync();
        }
        await this.saveIntegrationData([processedIssue]);
    }

    async updateIssue(
        issue: Partial<Issue['fields']> & { key: string },
        mods: Partial<Issue['fields']>,
        previousState: Partial<Issue['fields']>,
    ): Promise<any> {
        const update = this.modsToUpdate(issue, mods, previousState);
        const fields = this.modsToFields(issue, mods, previousState);
        const transition = mods?.transition ?? undefined;

        if (!update && !fields && !transition) return;

        const { data, status } = await this.context.invoke<
            CloudResponse<Issue>
        >(ServiceKey.CLOUD, JiraIntegrationAction.SAVE_ISSUE, {
            integration: this.integration,
            vaultId: this.integration.vaultId,
            integrationId: this.integration.id,
            update,
            transition,
            fields,
            key: issue.key,
            callerContext: 'jira/controller.ts/updateIssue',
        });
        if (status !== StatusCodes.OK) return;
        await this.processIncomingIssue(data, issue, {
            trackProgress: true,
            updateLastRun: false,
        });
    }

    private modsToUpdate(
        issue: Partial<Issue['fields']> & { key: string },
        mods: Partial<Issue['fields']>,
        previousState: Partial<Issue['fields']>,
    ): Record<string, Record<string, any>[]> | undefined {
        const output: Record<string, Record<string, any>[]> = {};
        if (!mods) return undefined;
        const keys = Object.keys(mods);
        let toDelete;
        let toAdd;

        for (const field of keys) {
            switch (field) {
                case 'labels':
                    toDelete = difference<string>(
                        previousState.labels,
                        issue.labels!,
                    );
                    toAdd = difference<string>(
                        issue.labels!,
                        previousState.labels!,
                    );
                    output[field] = [
                        ...toAdd.map((label: string) => ({
                            add: label,
                        })),
                        ...toDelete.map((label: string) => ({
                            remove: label,
                        })),
                    ];
            }
        }
        return Object.keys(output).length ? output : undefined;
    }

    private modsToFields(
        issue: Partial<Issue['fields']> & { key: string },
        mods: Partial<Issue['fields']>,
        _previousState: Partial<Issue['fields']>,
    ): Record<string, any> | undefined {
        const output: Record<string, any> = {};
        if (!mods) return undefined;
        const keys = Object.keys(mods);
        for (const field of keys) {
            switch (field) {
                case 'assignee':
                case 'priority':
                    output[field] = issue[field + 'Obj'];
                    if (output[field].id) {
                        output[field].id = output[field].id.split('/').pop()!;
                    }
                    break;
            }
        }
        return Object.keys(output).length ? output : undefined;
    }

    async *getIssuesByJQL(jql: string): AsyncGenerator<any> {
        const status = {
            startAt: 0,
            maxResults: 50,
            total: 0,
        };

        do {
            const issues = await this.context.invoke<any>(
                ServiceKey.CLOUD,
                JiraIntegrationAction.GET_ISSUES,
                {
                    integration: this.integration,
                    startAt: status.startAt,
                    maxResults: status.maxResults,
                    jql,
                    integrationId: this.integration.id,
                    vaultId: this.integration.vaultId,
                    callerContext: 'jira/controller.ts/getIssuesByJQL',
                },
            );
            status.maxResults = issues.data.maxResults;
            status.startAt += issues.data.issues.length;
            if (!status.total) {
                status.total = issues.data.total;
            }
            yield issues.data;
        } while (status.startAt < status.total);
    }

    createId(
        project: any,
        id: string,
        type: string = JiraIntegrationDataType.ISSUE,
    ) {
        const cloudId = this.jiraCloud.id;
        return `${type}/${cloudId}/${project.id.split('/').pop()}/${id}`;
    }

    toACRTask(project: Project, issue: Issue, options: any = {}): ITask {
        const url = [this.jiraCloud.url, 'browse', issue.key].join('/');

        const id = this.createId(project, issue.id);
        const statusId = this.createId(
            project,
            issue.fields.status.id!,
            JiraIntegrationDataType.STATUS,
        );
        const assigneeId = issue.fields?.assignee?.accountId
            ? this.createId(
                  project,
                  issue.fields.assignee.accountId,
                  JiraIntegrationDataType.USER,
              )
            : null;
        const reporterId = issue.fields?.reporter?.accountId
            ? this.createId(
                  project,
                  issue.fields.reporter.accountId,
                  JiraIntegrationDataType.USER,
              )
            : null;
        const parentId = issue.fields.parent?.id
            ? this.createId(
                  project,
                  issue.fields.parent?.id!,
                  JiraIntegrationDataType.ISSUE,
              )
            : null;

        const isMyself = [
            issue.fields?.assignee?.accountId,
            issue.fields?.reporter?.accountId,
        ].includes(this.myself.accountId);

        const priorityId = issue.fields.priority?.id
            ? [
                  JiraIntegrationDataType.PRIORITY,
                  this.jiraCloud.id,
                  issue.fields.priority?.id,
              ].join('/')
            : null;
        const isWatching = issue.fields.watches.isWatching;

        const changelog =
            (isMyself || isWatching) && !options.trackProgress
                ? this.processChangelogNotifications(
                      issue.changelog?.histories ?? [],
                      options.lastRunTimestamp,
                  )
                : issue.changelog?.histories ?? [];

        const sortedHistory = changelog.sort((a: any, b: any) => {
            return (
                new Date(b.created).getTime() - new Date(a.created).getTime()
            );
        });
        const issueHasNotification =
            (issue as any).commentOnWatchedIssue ||
            sortedHistory?.[0]?.notification;

        return {
            id,
            text: issue.fields.summary,
            type: JiraIntegrationDataType.ISSUE,
            description: (issue.renderedFields as any)?.description,
            labels: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            key: issue.key,
            vaultId: this.integration.vaultId,
            url,
            integrationType: IntegrationType.JIRA,
            integrationId: this.integration.id,
            notification: issueHasNotification,
            properties: {
                ...issue.fields,
                sprints: issue.fields.customfield_10020,
                parent: parentId,
                priority: priorityId,
                project: project.id,
                assignee: assigneeId,
                reporter: reporterId,
                status: statusId,
                description: (issue.renderedFields as any)?.description,
                changelog,
                transitions: issue.transitions,
            },
        } as any;
    }

    processChangelogNotifications(history: any[], timestamp: number) {
        return history.map(event => {
            const createdDate = new Date(event.created).getTime();
            const hasNotification =
                event?.author?.accountId !== this.myself?.accountId &&
                createdDate > timestamp;
            return {
                ...event,
                notification: hasNotification,
            };
        });
    }
}
