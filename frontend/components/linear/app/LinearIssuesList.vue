<template>
    <LinearVirtualList
        :flat-list="flatList"
        :view-id="viewId"
        @search="handleSearch"
    />
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import isEqual from 'lodash/isEqual';
import LinearVirtualList from '~/components/linear/app/LinearVirtualList.vue';
import { VirtualGithubHeight } from '~/constants/github';
import {
    LinearGroupByOptions,
    LinearSortDirectionOptions,
    LinearSortingOptions,
} from '~/components/linear/constants';
import { TabSymbols } from '~/constants/symbols';
import { filterLinearIssuesByView } from '~/workers/integrations/linear/helpers';

@Component({
    name: 'LinearIssuesList',
    components: { LinearVirtualList },
})
export default class LinearIssuesList extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop()
    viewId!: string;

    previewIssues: any[] = [];

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId).data;
    }

    get viewDefinition() {
        if (this.isEditing) return this.editingDefinition;
        return this.originalDefinition;
    }

    get searchQuery() {
        return this.tabData.searchTerm?.trim() ?? '';
    }

    get isEditing() {
        return this.editingDefinition?.id === this.viewId;
    }

    get editingDefinition() {
        return this.tabData.editingView ?? {};
    }

    get originalDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get isSingleTab() {
        return this.$store.getters['tabs/singleTabOpen'];
    }

    get flatList() {
        const baseHeight = this.isEditing
            ? Math.max(this.tabData.viewEditorHeight + 44, 108)
            : 108;
        const multipleTabs = this.isSingleTab ? 0 : 37;
        let currentHeight = baseHeight + multipleTabs;

        const rawIssues = this.issues;
        let issues = this.sort(
            this.$entities.linear.deserializeIssues(rawIssues),
        );

        if (this.searchQuery.length > 0) {
            issues = this.filterIssuesByQuery(
                issues,
                this.searchQuery.toLowerCase(),
            );
        }

        const flatStructure: any[] = [];

        if (!issues.length) return flatStructure;

        if (this.viewDefinition.groupBy === LinearGroupByOptions.NONE) {
            for (const issue of issues) {
                const height = VirtualGithubHeight.ITEM_DESKTOP;
                const y = currentHeight;
                currentHeight += height;
                flatStructure.push({
                    ...issue,
                    isSelectable: true,
                    height,
                    y,
                });
            }
        } else {
            const groups = this.groupByGroups();
            const groupedIssues = this.groupIssues(issues);

            for (const group of groups) {
                const issues = groupedIssues[group?.id ?? 'none'] ?? [];
                if (issues.length === 0) continue;
                const headerY = currentHeight;
                const headerHeight = VirtualGithubHeight.HEADER;
                currentHeight += headerHeight;
                flatStructure.push({
                    ...group,
                    height: headerHeight,
                    y: headerY,
                    groupBy: this.viewDefinition.groupBy,
                    groupId: group.id,
                    isSection: true,
                    issueCount: issues.length,
                    collapsed: this.isCollapsed(this.viewId, group.id),
                });
                if (this.isCollapsed(this.viewId, group.id)) continue;
                for (const issue of issues) {
                    const height = VirtualGithubHeight.ITEM_DESKTOP;
                    const y = currentHeight;
                    currentHeight += height;
                    flatStructure.push({
                        ...issue,
                        isSelectable: true,
                        height,
                        y,
                    });
                }
            }
        }
        if (flatStructure.length === 0) return flatStructure;
        flatStructure[flatStructure.length - 1].isLast = true;
        flatStructure[flatStructure.length - 1].height += 14;
        return flatStructure;
    }

    isCollapsed(viewId: string, groupId: string) {
        const key = [viewId, groupId].join('_');
        return this.tabData.collapsedGroups?.[key];
    }

    handleSearch(query: string) {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data: { searchTerm: query },
        });
    }

    filterIssuesByQuery(issues: any[], query: string) {
        const output = [];
        for (const issue of issues) {
            if (issue.identifier.toLowerCase().includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.title.toLowerCase().includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.assignee?.name?.toLowerCase()?.includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.assignee?.displayName?.toLowerCase()?.includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.state?.name?.toLowerCase().includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.priority?.label?.toLowerCase().includes(query)) {
                output.push(issue);
                continue;
            }
            if (issue.project?.name?.toLowerCase().includes(query)) {
                output.push(issue);
                continue;
            }
            if (
                issue.labels.some((label: any) =>
                    label.name.toLowerCase().includes(query),
                )
            ) {
                output.push(issue);
            }
        }
        return output;
    }

    @Watch('viewDefinition.editing')
    async handleEditingChange(editing: boolean) {
        if (editing) return;
        await this.savePreview();
        this.previewIssues = [];
    }

    cache: Record<string, { ttl: number; entries: any[] }> = {};
    lastPreviewFetch = 0;
    @Watch('editingDefinition.filters', { deep: true })
    async handleFiltersChange(current: any, old: any) {
        if (!this.isEditing) {
            return;
        }
        if (isEqual(old, current)) return;
        const fetchTimestamp = Date.now();
        this.lastPreviewFetch = fetchTimestamp;

        const cacheKey = JSON.stringify(current);
        const cached = this.cache[cacheKey];
        if (cached) {
            if (cached.ttl > Date.now() && cached.entries.length) {
                this.previewIssues = cached.entries;
                return;
            }
            delete this.cache[cacheKey];
        }
        this.$emit('loading-start');

        const previewIssues = await this.$entities.linear
            .fetchPreview(this.editingDefinition)
            .catch(e => {
                console.log(e);
                return [];
            });
        if (fetchTimestamp !== this.lastPreviewFetch) return;
        if (!previewIssues?.length) {
            this.$emit('loading-end');
            return;
        }
        this.cache[cacheKey] = {
            ttl: Date.now() + 1000 * 60 * 2,
            entries: previewIssues,
        };
        this.previewIssues = previewIssues;

        this.$emit('loading-end');
    }

    savePreview() {
        if (!this.previewIssues.length) return;
        return this.$store.dispatch('integrationData/batchUpdate', [
            ...this.previewIssues,
        ]);
    }

    get issues() {
        if (
            this.isEditing &&
            !isEqual(this.editingDefinition, this.originalDefinition)
        ) {
            return filterLinearIssuesByView(
                this.previewIssues,
                this.editingDefinition,
            );
        }
        return this.$entities.linear.getIssuesByDefinition(this.viewDefinition);
    }

    get viewEditHeaderHeight() {
        return (
            (this.$entities.tab.getData(this.tabId)?.[this.viewId] ?? 154) + 38
        );
    }

    get headerHeight() {
        return this.isEditing
            ? this.viewEditHeaderHeight
            : this.viewDefinition.filters.length
            ? 130
            : 99;
    }

    sort(issues: any[]) {
        const sortModifier =
            this.viewDefinition.sortDirection ===
            LinearSortDirectionOptions.DESCENDING
                ? -1
                : 1;

        if (this.viewDefinition.sortBy === LinearSortingOptions.UPDATED) {
            return issues.sort((a, b) => {
                return (
                    (new Date(a.updatedAt).getTime() >
                    new Date(b.updatedAt).getTime()
                        ? 1
                        : -1) * sortModifier
                );
            });
        }
        if (this.viewDefinition.sortBy === LinearSortingOptions.CREATED) {
            return issues.sort((a, b) => {
                return (
                    (new Date(a.createdAt).getTime() >
                    new Date(b.createdAt).getTime()
                        ? 1
                        : -1) * sortModifier
                );
            });
        }
        if (this.viewDefinition.sortBy === LinearSortingOptions.PRIORITY) {
            return issues.sort((a, b) => {
                if (a.priority?.id === b.priority?.id) {
                    return (
                        a.identifier.localeCompare(b.identifier) * sortModifier
                    );
                }
                if (a.priority.id.endsWith('/0')) {
                    return -1 * sortModifier;
                }
                if (b.priority.id.endsWith('/0')) {
                    return 1 * sortModifier;
                }
                return (
                    b.priority?.id.localeCompare(a.priority?.id) * sortModifier
                );
            });
        }

        if (this.viewDefinition.sortBy === LinearSortingOptions.STATUS) {
            const statusTypeOrder = [
                'started',
                'unstarted',
                'backlog',
                'triage',
                'completed',
                'canceled',
            ];
            return issues.sort((a, b) => {
                if (a.state.type !== b.state.type) {
                    return statusTypeOrder.indexOf(a.state.type) >
                        statusTypeOrder.indexOf(b.state.type)
                        ? -1 * sortModifier
                        : 1 * sortModifier;
                }
                return (
                    (a.state.position > b.state.position ? 1 : -1) *
                    sortModifier
                );
            });
        }

        return issues.sort((a, b) => {
            if (a.identifier.length !== b.identifier.length) {
                return (
                    (a.identifier.length > b.identifier.length ? -1 : 1) *
                    sortModifier
                );
            }
            return a.identifier.localeCompare(b.identifier) * sortModifier;
        });
    }

    groupIssues(issues: any[]) {
        if (this.viewDefinition.groupBy === LinearGroupByOptions.STATUS) {
            return this.groupByState(issues);
        }
        if (this.viewDefinition.groupBy === LinearGroupByOptions.PRIORITY) {
            return this.groupByPriority(issues);
        }
        if (this.viewDefinition.groupBy === LinearGroupByOptions.PROJECT) {
            return this.groupByProject(issues);
        }
        return this.sort(issues);
    }

    groupByState(issues: any[]) {
        const groupedIssues: any = {};
        for (const issue of issues) {
            const key = issue.state.id;
            if (!groupedIssues[key]) {
                groupedIssues[key] = [];
            }
            groupedIssues[key].push(issue);
        }
        return this.sortGroups(groupedIssues);
    }

    groupByPriority(issues: any[]) {
        const groupedIssues: any = {};
        for (const issue of issues) {
            const key = issue.priority?.id;
            if (!groupedIssues[key]) {
                groupedIssues[key] = [];
            }
            groupedIssues[key].push(issue);
        }
        return this.sortGroups(groupedIssues);
    }

    groupByProject(issues: any[]) {
        const groupedIssues: any = {};
        for (const issue of issues) {
            const key = issue.project?.id ?? 'none';
            if (!groupedIssues[key]) {
                groupedIssues[key] = [];
            }
            groupedIssues[key].push(issue);
        }
        return this.sortGroups(groupedIssues);
    }

    groupByGroups() {
        const groupBy = this.viewDefinition.groupBy;
        if (groupBy === LinearGroupByOptions.STATUS) {
            return this.stateGroups();
        }
        if (groupBy === LinearGroupByOptions.PRIORITY) {
            return this.priorityGroups();
        }
        if (groupBy === LinearGroupByOptions.PROJECT) {
            return this.projectGroups();
        }
        return [];
    }

    priorityGroups() {
        const priorities = this.$entities.linear.linearPriorities;
        const mappedPriorities = priorities
            .sort((a: any, b: any) => {
                return a.id.localeCompare(b.id);
            })
            .map((priority: any) => {
                return {
                    ...priority,
                    id: priority.id,
                    name: priority.label,
                };
            });
        const noPrio = mappedPriorities.shift();
        mappedPriorities.push(noPrio);
        return mappedPriorities;
    }

    projectGroups() {
        const projects = this.$entities.linear.linearProjects;
        const mappedProjects = projects.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });
        mappedProjects.push({ id: 'none', name: 'No Project' });
        return mappedProjects;
    }

    stateGroups() {
        const states = this.$entities.linear.linearStates;
        const groupByState = states.reduce((acc: any, state: any) => {
            if (!acc[state.type]) {
                acc[state.type] = [];
            }
            acc[state.type].push(state);
            return acc;
        }, {} as Record<string, any>);
        for (const key of Object.keys(groupByState)) {
            groupByState[key] = groupByState[key].sort((a: any, b: any) =>
                a.position > b.position ? -1 : 1,
            );
        }
        const statusTypeOrder = [
            'started',
            'unstarted',
            'backlog',
            'triage',
            'completed',
            'canceled',
        ];
        const output = [];
        for (const type of statusTypeOrder) {
            output.push(groupByState[type]);
        }
        return output.flat();
    }

    sortGroups(groups: any) {
        const sortedGroups: any = {};
        for (const key of Object.keys(groups)) {
            sortedGroups[key] = this.sort(groups[key]);
        }
        return sortedGroups;
    }
}
</script>
<style scoped lang="scss"></style>
