<template>
    <div class="github-view">
        <div class="github-view--content">
            <tippy
                :content="getRefText"
                :delay="[300, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                target=".has-tippy"
            />
            <GithubVirtualList
                :flat-list="flatList"
                :tab-data="tabData"
                @collapse="handleCollapse"
                @updateOptions="updateOptions"
                @search="handleSearchChange"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Provide, Vue } from 'vue-property-decorator';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import JiraVirtualList from '~/components/integrations/jira/JiraVirtualList.vue';
import { TabSymbols } from '~/constants/symbols';
import { SortingOptions } from '~/constants';
import { VirtualGithubHeight } from '~/constants/github';
import GithubVirtualList from '~/components/github/GithubVirtualList.vue';
import {
    GithubIntegrationDataType,
    GithubIssue,
    GithubIssueState,
    GithubPullRequest,
    GithubSymbols,
} from '~/components/github/github';
import {
    isGithubIssue,
    isGithubPullRequest,
    isIssueOrPullRequestAssignedToUser,
    isIssueOrPullRequestCreatedByUser,
    isIssueOrPullRequestMentioningUser,
} from '~/plugins/entities/github';
import { TrackingAction, TrackingType } from '~/@types/tracking';

const capitalize = (value: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

@Component({
    name: 'GithubView',
    components: {
        GithubVirtualList,
        JiraVirtualList,
    },
})
export default class GithubView extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'list';

    searchQuery = '';

    handleSearchChange(value: string) {
        this.searchQuery = value;
    }

    tabFilter(item: GithubPullRequest | GithubIssue) {
        const activeTab = this.tabData.activeTab;
        const tabFilter = (item: any) => {
            switch (activeTab) {
                case 'issues':
                    return isGithubIssue(item);
                case 'pulls':
                    return isGithubPullRequest(item);
                default:
                    return true;
            }
        };

        return tabFilter(item);
    }

    groupFilter(item: GithubPullRequest | GithubIssue) {
        const activeTab = this.tabData.activeTab;
        const filterBy = this.tabData[activeTab].filterBy;
        const user = this.$entities.github.getUser();

        if (!user) return true;

        switch (filterBy) {
            case 'created':
                return isIssueOrPullRequestCreatedByUser(item, user);
            case 'assigned':
                return isIssueOrPullRequestAssignedToUser(item, user);
            case 'mentioned':
                return isIssueOrPullRequestMentioningUser(item, user);
            case 'review':
                return this.$entities.github.isInReview(
                    item as GithubPullRequest,
                );
            case 'all':
                return true;
            default:
                return true;
        }
    }

    notificationFilter(entity: GithubIssue | GithubPullRequest) {
        if (this.tabData.filterBy !== 'notification') return true;

        return entity.acreomMeta?.notification;
    }

    get flatList() {
        const header = {
            pageHeader: true,
            count: 0,
            pullRequests: 0,
            expanded: false,
        };

        const activeTab = this.tabData.activeTab;
        const banner = { banner: true, count: 0 };
        const flatStructure: any[] = [];
        let currentHeight = 0;

        const getHeight = (item: any) => {
            let itemHeight = 0;
            if (item.isHeader) {
                itemHeight = VirtualGithubHeight.HEADER;
            } else if (item.pageHeader) {
                if (item.expanded) {
                    itemHeight = VirtualGithubHeight.PAGE_HEADER_EXPANDED;
                } else if (activeTab === 'recent') {
                    itemHeight = VirtualGithubHeight.PAGE_HEADER_SMALL;
                } else {
                    itemHeight = VirtualGithubHeight.PAGE_HEADER;
                }
            } else if (item.banner) {
                itemHeight = VirtualGithubHeight.BANNER;
            } else {
                itemHeight = VirtualGithubHeight.ITEM_DESKTOP;
            }
            if (item.isLast) itemHeight += 14;
            return itemHeight;
        };

        if (activeTab === 'recent') {
            const group = 'all';
            const groupCollapsed = this.tabData[activeTab][group];

            const sectionHeader = {
                isHeader: true,
                id: group,
                name: capitalize(group),
                groupId: group,
                count: 0,
                isSelectable: true,
                collapsed: this.isCollapsible && groupCollapsed,
            };
            const pageFilter = (item: GithubPullRequest | GithubIssue) => {
                return (
                    this.tabFilter(item) &&
                    this.groupFilter(item) &&
                    this.notificationFilter(item)
                );
            };

            const issues = this.getOrderedResults(
                this.getFilteredIssues(() => {
                    return true;
                }).filter(pageFilter),
            ).map(issue => {
                if (issue.acreomMeta?.notification) {
                    banner.count++;
                    banner.banner = true;
                }

                return {
                    ...issue,
                    isIssue: isGithubIssue(issue),
                    isPullRequest: isGithubPullRequest(issue),
                    isSelectable: true,
                    height: VirtualGithubHeight.ITEM_DESKTOP,
                };
            });

            header.count += issues.length;
            sectionHeader.count = issues.length;

            if (sectionHeader.collapsed) {
                flatStructure.push(sectionHeader);
            } else {
                flatStructure.push(...issues);
            }
        } else {
            for (const group of [
                GithubIssueState.OPEN,
                GithubIssueState.CLOSED,
            ]) {
                const groupCollapsed = this.tabData[activeTab][group];

                const sectionHeader = {
                    isHeader: true,
                    id: group,
                    name: capitalize(group),
                    groupId: group,
                    count: 0,
                    isSelectable: true,
                    collapsed: this.isCollapsible && groupCollapsed,
                };

                const pageFilter = (item: GithubPullRequest | GithubIssue) => {
                    return this.tabFilter(item) && this.groupFilter(item);
                };

                const issues = this.getOrderedResults(
                    this.getFilteredIssues(
                        (issue: GithubPullRequest | GithubIssue) => {
                            return issue.state === group;
                        },
                    ).filter(pageFilter),
                ).map(issue => {
                    if (issue.acreomMeta?.notification) {
                        banner.count++;
                        banner.banner = true;
                    }

                    return {
                        ...issue,
                        isIssue: isGithubIssue(issue),
                        isPullRequest: isGithubPullRequest(issue),
                        groupId: group,
                        isSelectable: true,
                        height: VirtualGithubHeight.ITEM_DESKTOP,
                    };
                });

                if (issues.length) {
                    // @ts-ignore
                    issues[issues.length - 1].isLast = true;
                }

                header.count += issues.length;
                sectionHeader.count = issues.length;
                if (sectionHeader.collapsed) {
                    flatStructure.push(sectionHeader);
                    continue;
                }

                flatStructure.push(sectionHeader, ...issues);
            }
        }

        flatStructure.push({ placeholder: true });

        if (banner.count > 0 && activeTab === 'recent') {
            flatStructure.unshift(banner);
        }

        flatStructure.unshift(header);

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

    filterSearchResults(entities: (GithubIssue | GithubPullRequest)[]) {
        const preparedQuery: string[] = [];
        const matches = this.searchQuery.toLowerCase().matchAll(/(\S+)/g);

        for (const match of matches) {
            preparedQuery.push(match[1]);
        }

        return entities.filter(entity => {
            const repository = this.$entities.github
                .getRepositoryName(entity)
                .toLowerCase();
            const numbe = entity.number.toString();
            const title = entity.title.toLowerCase();
            const status = this.$entities.github
                .getFormattedStatus(entity)
                .toLowerCase();
            const statusOriginal = entity.state.toLowerCase();
            const labels = entity.labels
                .map(label => label.name.toLowerCase())
                .join(' ');

            const target = `${repository} ${numbe} ${title} ${status} ${statusOriginal} ${labels}`;

            return preparedQuery.every((word: string) => target.includes(word));
        });
    }

    get githubIssues() {
        let issues = this.$store.getters['integrationData/byType'](
            GithubIntegrationDataType.ISSUE,
        );

        if (this.searchQuery.length > 0) {
            issues = this.filterSearchResults(issues);
        }

        return issues;
    }

    get githubPullRequests() {
        let prs = this.$store.getters['integrationData/byType'](
            GithubIntegrationDataType.PR,
        );

        if (this.searchQuery.length > 0) {
            prs = this.filterSearchResults(prs);
        }

        return prs;
    }

    getRefText(reference: any) {
        return reference.getAttribute('data-tippy-content') ?? '';
    }

    get activeTab() {
        return this.tabData.activeTab;
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get isCollapsible(): boolean {
        return true;
    }

    get sortBy() {
        return this.tabData.sortBy;
    }

    get orderByAscending() {
        return this.tabData.sortDirection === 'asc';
    }

    get orderingFunction() {
        switch (this.sortBy) {
            case SortingOptions.TITLE:
                return (
                    a: GithubIssue | GithubPullRequest,
                    b: GithubIssue | GithubPullRequest,
                ) => a.title.localeCompare(b.title);
            case SortingOptions.UPDATED_AT:
                return (
                    a: GithubIssue | GithubPullRequest,
                    b: GithubIssue | GithubPullRequest,
                ) =>
                    Math.abs(new Date(a.updated_at).getTime()) -
                    Math.abs(new Date(b.updated_at).getTime());
            case SortingOptions.CREATED_AT:
                return (
                    a: GithubIssue | GithubPullRequest,
                    b: GithubIssue | GithubPullRequest,
                ) =>
                    Math.abs(new Date(a.created_at).getTime()) -
                    Math.abs(new Date(b.created_at).getTime());
            default:
                return (
                    a: GithubIssue | GithubPullRequest,
                    b: GithubIssue | GithubPullRequest,
                ) =>
                    Math.abs(new Date(a.updated_at).getTime()) -
                    Math.abs(new Date(b.updated_at).getTime());
        }
    }

    getOrderedResults(issues: (GithubIssue | GithubPullRequest)[]) {
        const ordered = [...issues].sort((a, b) => this.orderingFunction(a, b));
        return this.orderByAscending ? ordered : ordered.reverse();
    }

    getFilteredIssues(filter: Function) {
        return [...this.githubIssues, ...this.githubPullRequests].filter(
            issue => filter(issue),
        );
    }

    handleCollapse(id: string) {
        const data = cloneDeep(this.tabData);
        const activeTab = data.activeTab;
        const currentValue = data[activeTab][id];
        data[activeTab][id] = !currentValue;

        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data,
        });
    }

    updateOptions(options: any) {
        const currentViewOptions = cloneDeep(this.tabData);
        const oldDisplayProperties =
            currentViewOptions.selectedDisplayProperties;

        if (options.selectedDisplayProperties) {
            // delete because of the merge
            delete currentViewOptions.selectedDisplayProperties;
        }
        const data = merge(currentViewOptions, options);

        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data,
        });

        const type = this.$tracking.resolveTypeFromTab(this.tabId);
        if (!type) return;

        if (options.filterBy === 'notification') {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.SHOW_UPDATES,
            });
        }

        if (options.filterBy === 'all') {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.SHOW_ALL,
            });
        }

        if (options.activeTab === 'recent') {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.SHOW_RECENT,
            });
        }

        if (options.activeTab === 'issues') {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.SHOW_ISSUES,
            });
        }

        if (options.activeTab === 'pulls') {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.SHOW_PULL_REQUESTS,
            });
        }

        if (options.pulls?.filterBy) {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.CHANGE_SUB_CATEGORY,
                // @ts-ignore
                source: `Pull Requests ${options.pulls.filterBy}`,
            });
        }

        if (options.issues?.filterBy) {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.CHANGE_SUB_CATEGORY,
                // @ts-ignore
                source: `Issues ${options.issues.filterBy}`,
            });
        }

        this.$tracking.trackDropdownEvent(type, options, {
            ...currentViewOptions,
            selectedDisplayProperties: oldDisplayProperties,
        });
    }
}
</script>

<style lang="scss" scoped>
.github-view {
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
