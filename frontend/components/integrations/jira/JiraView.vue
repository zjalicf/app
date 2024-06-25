<template>
    <div class="jira-view">
        <div class="jira-view--content">
            <tippy
                :content="$utils.tooltip.getRefText"
                :delay="[300, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                target=".has-tippy"
            />
            <JiraVirtualList
                :flat-jira-list="flattenedJiraList"
                :collapsible="isCollapsible"
                @collapse="handleCollapse"
                @search="handleSearchChange"
                @refresh="handleJiraRefresh"
                @dismiss-notifications="dismissNotifications"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { VirtualJiraHeight } from './constants';
import JiraVirtualList from '~/components/integrations/jira/JiraVirtualList.vue';
import { TabSymbols } from '~/constants/symbols';
import { JiraIntegrationDataType } from '~/constants/jira';
import {
    IntegrationType,
    JiraIntegrationAction,
    JiraStatusColors,
    ServiceKey,
    SortingOptions,
} from '~/constants';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceGeometricCircleAlternate from '~/components/streamline/InterfaceGeometricCircleAlternate.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'JiraView',
    components: {
        JiraVirtualList,
    },
})
export default class JiraView extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    collapsed: Record<string, boolean> = { no_page: false };
    displayProperties: string[] = [
        'type',
        'priority',
        'status',
        'key',
        'labels',
        'updated',
        'created',
        'assignee',
    ];

    searchQuery = '';

    get jiraIntegrations() {
        return this.$store.getters['integration/byType'](IntegrationType.JIRA);
    }

    get activeProject() {
        return this.tabData.project;
    }

    get myJiraIds() {
        return (
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.MYSELF,
            )?.map((data: any) => data.accountId) ?? []
        );
    }

    get projects() {
        const projects =
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.PROJECT,
            ) ?? [];
        return projects.filter((proj: any) => proj.syncEnabled);
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get collapsedLists() {
        if (this.tabData?.collapsed) {
            return this.tabData.collapsed;
        }
        return {};
    }

    dismissNotifications() {
        const toDismiss = this.jiraIssues.filter(
            (issue: any) => issue.notification,
        );
        this.$entities.jira.dismissNotifications(toDismiss);

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.DISMISS_NOTIFICATIONS,
        });
    }

    projectStatuses(project: any) {
        return (
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.STATUS,
            ).filter((status: { id: string }) => {
                return project.id.split('/')[2] === status.id.split('/')[2];
            }) ?? []
        );
    }

    handleJiraRefresh() {
        const integrations = this.jiraIntegrations;
        for (const integration of integrations) {
            this.$serviceRegistry.emit(
                ServiceKey.INTEGRATIONS,
                JiraIntegrationAction.INITIALIZE,
                {
                    projects:
                        integration.data.projects?.filter(
                            (project: any) => project.syncEnabled,
                        ) ?? [],
                    config: integration,
                    initial: false,
                },
            );
        }

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.INTEGRATION_RELOAD,
        });
    }

    projectPriorities(project: any) {
        return (
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.PRIORITY,
            ).filter(
                ({ integrationId }: { integrationId: string }) =>
                    project?.integrationId === integrationId,
            ) ?? []
        );
    }

    get isCollapsible(): boolean {
        return true;
    }

    handleSearchChange(value: string) {
        this.searchQuery = value;
    }

    get jiraIssues() {
        const statusesMap = this.statuses.reduce((acc: any, status: any) => {
            acc[status.id] = status;
            return acc;
        }, {});
        const usersMap = this.users.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
        }, {});
        let issues = this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.ISSUE,
        ).filter((issue: any) => {
            return this.activeProject === issue.properties.project;
        });

        const issueMap = issues.reduce((acc: any, issue: any) => {
            acc[issue.id] = issue;
            return acc;
        }, {});
        const projectMap = this.projects.reduce((acc: any, project: any) => {
            acc[project.id] = project;
            return acc;
        }, {});

        issues = issues.map((issue: any) => {
            const status = statusesMap[issue.properties.status];

            const assignee = usersMap[issue.properties.assignee]?.user ?? null;
            const reporter = usersMap[issue.properties.reporter]?.user ?? null;
            const parent = issueMap[issue.properties.parent] ?? null;
            const project = projectMap[issue.properties.project] ?? null;
            const priorities = this.projectPriorities(project);
            const output = {
                ...issue,
                properties: {
                    ...issue.properties,
                    status: status?.status ?? null,
                    assignee,
                    reporter,
                    parent,
                    project,
                    priority: priorities.find(
                        (priority: any) =>
                            priority.id === issue.properties.priority,
                    ),
                },
            };

            return output;
        });

        if (this.searchQuery.length > 0) {
            issues = this.filterSearchResults(issues);
        }
        return issues;
    }

    filterSearchResults(issues: any[]) {
        const preparedQuery: string[] = [];
        const matches = this.searchQuery.toLowerCase().matchAll(/(\S+)/g);

        for (const match of matches) {
            preparedQuery.push(match[1]);
        }

        return issues.filter((issue: any) => {
            const title = issue.properties.summary.toLowerCase();
            const key = issue.key.toLowerCase();
            const assignee =
                issue.properties.assignee?.displayName?.toLowerCase();

            const target = [key, title, assignee ?? 'unassigned'].join(' ');
            return preparedQuery.every((word: string) => target.includes(word));
        });
    }

    get statuses() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.STATUS,
        );
    }

    get users() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.USER,
        );
    }

    get folderOptions() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get orderBy() {
        return (
            this.$store.getters['tabs/byId'](this.tabId)?.data?.sortBy ??
            SortingOptions.KEY
        );
    }

    get orderByAscending() {
        return (
            this.$store.getters['tabs/byId'](this.tabId)?.data
                ?.orderAscending ?? true
        );
    }

    get orderingFunction() {
        switch (this.orderBy) {
            case SortingOptions.TITLE:
                return (a: any, b: any) => a.text.localeCompare(b.text);
            case SortingOptions.KEY:
                return (a: any, b: any) => {
                    if (a.key.length === b.key.length) {
                        return a.key.localeCompare(b.key);
                    }
                    return a.key.length - b.key.length;
                };
            case SortingOptions.ASSIGNEE:
                return (a: any, b: any) =>
                    (a.properties.assignee?.displayName ?? '').localeCompare(
                        b.properties.assignee?.displayName ?? '',
                    );
            case SortingOptions.DATE:
                return (a: any, b: any) =>
                    Math.abs(new Date(b.properties.updated).getTime()) -
                    Math.abs(new Date(a.properties.updated).getTime());
            case SortingOptions.CREATED_AT:
                return (a: any, b: any) =>
                    Math.abs(new Date(a.properties.created).getTime()) -
                    Math.abs(new Date(b.properties.created).getTime());
            case SortingOptions.PRIORITY:
                return (a: any, b: any) => {
                    if (!a.properties.priority?.id) return -1;
                    if (!b.properties.priority?.id) return 1;
                    return b.properties.priority.id - a.properties.priority.id;
                };
            default:
                return (a: any, b: any) => a.text.localeCompare(b.text);
        }
    }

    get groupByStatus() {
        return this.projectStatuses({
            id: this.activeProject,
        }).sort((a: any, b: any) => a.order - b.order);
    }

    get issueGroups(): any[] {
        return this.groupByStatus;
    }

    get flattenedJiraList() {
        const header = {
            pageHeader: true,
            issues: 0,
            expanded:
                !this.folderOptions?.displayAll ||
                this.folderOptions?.filterByAssignee?.length,
        };

        const banner = { banner: true, count: 0 };
        const flatStructure: any[] = [header];
        let currentHeight = 0;
        const getHeight = (item: any) => {
            let itemHeight = 0;
            if (item.isHeader) {
                itemHeight = VirtualJiraHeight.HEADER;
            } else if (item.pageHeader) {
                if (item.expanded) {
                    itemHeight = VirtualJiraHeight.PAGE_HEADER_EXPANDED;
                } else {
                    itemHeight = VirtualJiraHeight.PAGE_HEADER;
                }
            } else if (item.banner) {
                itemHeight = VirtualJiraHeight.BANNER;
            } else {
                itemHeight = VirtualJiraHeight.ITEM_DESKTOP;
            }
            if (item.isLast) itemHeight += 8;
            return itemHeight;
        };

        const getSectionHeaderIcon = (category: string) => {
            switch (category) {
                case 'TODO':
                    return {
                        icon: InterfaceEditSelectAreaCircleDash,
                        color: JiraStatusColors.TODO,
                    };
                case 'DONE':
                    return {
                        icon: InterfaceValidationCheckCircle,
                        color: JiraStatusColors.DONE,
                    };
                default:
                    return {
                        icon: InterfaceGeometricCircleAlternate,
                        color: JiraStatusColors.IN_PROGRESS,
                    };
            }
        };
        const collapsed = this.collapsedLists;

        for (const group of this.issueGroups) {
            const issues = [];
            const sectionHeader = {
                isHeader: true,
                id: group.id.split('/').pop(),
                name: group.status.name,
                groupId: group.id,
                issuesCount: 0,
                isSelectable: true,
                collapsed: this.isCollapsible && !!collapsed[group.id],
                icon: getSectionHeaderIcon(group.status.statusCategory),
            };

            const groupIssues = this.getOrderedResults(
                this.getFilteredIssues((issue: any) => {
                    const isSameGroup =
                        issue.properties.status.id === sectionHeader.id;

                    const displayAll = this.folderOptions?.displayAll;
                    const hasAssignee = issue.properties.assignee;
                    const isMyself =
                        hasAssignee &&
                        this.myJiraIds.includes(
                            issue.properties.assignee.accountId,
                        );

                    const filterByNoAssignee =
                        this.folderOptions?.filterByAssignee?.includes(null) &&
                        !hasAssignee;

                    const filterByAssignee = this.folderOptions
                        ?.filterByAssignee?.length
                        ? filterByNoAssignee ||
                          this.folderOptions?.filterByAssignee.includes(
                              issue.properties.assignee?.accountId,
                          )
                        : true;

                    return (
                        isSameGroup &&
                        (displayAll || isMyself) &&
                        filterByAssignee
                    );
                }),
            );

            issues.push(
                ...groupIssues.map(item => {
                    if (
                        item.type === JiraIntegrationDataType.ISSUE &&
                        item.notification
                    ) {
                        banner.banner = true;
                        banner.count++;
                    }
                    return {
                        ...item,
                        issue: {
                            ...item,
                        },
                        isSelectable: true,
                    };
                }),
            );
            if (groupIssues.length) {
                issues[issues.length - 1].isLast = true;
            }

            if (!issues.length) continue;
            header.issues += issues.length;
            sectionHeader.issuesCount = issues.length;
            if (sectionHeader.collapsed) {
                flatStructure.push(sectionHeader);
                continue;
            }
            flatStructure.push(sectionHeader, ...issues);
        }
        flatStructure.push({ placeholder: true });
        if (banner.count > 0) {
            flatStructure.unshift(banner);
        }

        return flatStructure.map((item: any) => {
            const height = getHeight(item);
            const output = {
                height,
                y: currentHeight,
            };
            currentHeight += height;

            return {
                ...item,
                ...output,
            };
        });
    }

    getOrderedResults(issues: any[]) {
        const ordered = [...issues].sort((a, b) => this.orderingFunction(a, b));
        return this.orderByAscending ? ordered : ordered.reverse();
    }

    getFilteredIssues(filter: Function) {
        return [...this.jiraIssues].filter(issue => filter(issue));
    }

    handleCollapse(id: string) {
        this.updateTabData({
            collapsed: {
                ...this.collapsedLists,
                [id]: !this.collapsedLists[id],
            },
        });
    }

    get jiraOptions() {
        return (
            this.$store.getters['vaultSettings/integrationsOptions'].jira ?? {}
        );
    }
}
</script>

<style lang="scss" scoped>
.jira-view {
    width: 100%;
    height: 100%;

    &--content {
        position: relative;
        width: 100%;
        height: 100%;

        .mobile & {
            //padding-bottom: 70px;
        }
    }
}
</style>
