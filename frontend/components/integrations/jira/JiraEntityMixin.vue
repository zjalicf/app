<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { AcreomJiraIssue } from '~/components/task/model';
import { JiraActions, JiraStatusColors, TabType } from '~/constants';
import { IDocument } from '~/components/document/model';
import { JiraIntegrationDataType } from '~/constants/jira';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceGeometricCircleAlternate from '~/components/streamline/InterfaceGeometricCircleAlternate.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'JiraEntityMixin',
})
export default class JiraEntityMixin extends Vue {
    entity!: AcreomJiraIssue;
    source!: TrackingActionSource | null;

    get _entity() {
        if (!this.entity) {
            throw new Error('Missing entity property');
        }
        return this.entity;
    }

    get integration() {
        return this.$store.getters['integration/byId'](
            this.entity.integrationId,
        );
    }

    get cloud() {
        return this.integration?.data.clouds[0];
    }

    get cloudUrl() {
        return this.integration?.data.cloudUrl;
    }

    get projectId() {
        return this._entity.id.split('/')[2];
    }

    get issues() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.ISSUE,
        );
    }

    get users() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.USER,
        )
            .filter(
                ({ id }: { id: string }) => this.projectId === id.split('/')[2],
            )
            .map(({ user }: any) => user);
    }

    get transitions() {
        return this._entity.properties.transitions ?? [];
    }

    get issueProject() {
        return this.projectById(this.integration.id, this.projectId);
    }

    get links() {
        const linkMap: any = {};
        const links = this._entity.properties.issuelinks ?? [];

        for (const link of links) {
            if (link.inwardIssue) {
                if (!linkMap[link.type.inward]) linkMap[link.type.inward] = [];
                const issue = this.$entities.jira.getByKey(
                    link.inwardIssue.key,
                );

                if (issue) {
                    linkMap[link.type.inward].push(issue);
                }
            }

            if (link.outwardIssue) {
                if (!linkMap[link.type.outward])
                    linkMap[link.type.outward] = [];

                const issue = this.$entities.jira.getByKey(
                    link.outwardIssue.key,
                );

                if (issue) {
                    linkMap[link.type.outward].push(issue);
                }
            }
        }

        return linkMap;
    }

    get timetracking() {
        return this._entity.properties.timetracking ?? null;
    }

    get projectIssues() {
        return this.issues.filter(
            ({ id, integrationId }: { id: string; integrationId: string }) =>
                this.projectId === id.split('/')[2] &&
                integrationId === this._entity.integrationId,
        );
    }

    get subIssues() {
        return this.projectIssues.filter((issue: any) => {
            if (!issue.properties.parent) return false;

            return issue.properties.parent === this._entity.id;
        });
    }

    get parentIssue() {
        return this.entity.properties.parent;
    }

    get projectStatuses() {
        return (
            this.$store.getters['integrationData/byType'](
                JiraIntegrationDataType.STATUS,
            ).filter(
                ({ id }: { id: string }) => this.projectId === id.split('/')[2],
            ) ?? []
        );
    }

    get statusesByEntity() {
        const transitions = this.transitions.map(({ id, name, to }: any) => ({
            id: name === to.name ? to.id : id,
            label: name === to.name ? name : `${name} (${to.name})`,
            icon: this._getStatusProperties(
                this.projectStatuses.find((status: any) =>
                    status.id.endsWith(to.id),
                )?.status.statusCategory,
            ),
        }));
        if (!transitions.some(({ id }: any) => id === this.status.id)) {
            transitions.push({
                id: this.status.id,
                label: this.status.name,
                icon: this._getStatusProperties(
                    this.projectStatuses.find((_status: any) =>
                        _status.id.endsWith(this.status.id),
                    )?.status.statusCategory,
                ),
            });
        }
        return transitions;
    }

    get sprints() {
        return this._entity.properties.customfield_10020 ?? [];
    }

    get status() {
        return this._entity.properties.status;
    }

    get statusCategory() {
        return this.projectStatuses.find((status: any) =>
            status.id.endsWith(this.status.id),
        )?.status.statusCategory;
    }

    get statusProperties() {
        return this._getStatusProperties(this.statusCategory);
    }

    _getStatusProperties(statusCategory: string) {
        switch (statusCategory) {
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
    }

    get labels() {
        return this._entity.properties.labels;
    }

    get priority() {
        return this._entity.properties.priority?.id ?? null;
    }

    get assignee() {
        return this._entity.properties.assignee?.accountId ?? null;
    }

    get labelsByEntity() {
        const issues = this.issues;
        const labelSet = issues.reduce((acc: Set<string>, issue: any) => {
            if (!issue.properties.labels?.length) return acc;
            for (const label of issue.properties.labels) {
                acc.add(label);
            }
            return acc;
        }, new Set<string>());
        return [...labelSet].map((label: string) => ({
            id: label,
            label,
        }));
    }

    get allPriorities() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PRIORITY,
        ).filter(
            ({ integrationId }: { integrationId: string }) =>
                this.entity.integrationId === integrationId,
        );
    }

    get prioritiesByEntity() {
        const priorities = [...this.allPriorities].map((priority: any) => ({
            id: priority.id,
            label: priority.name,
            img: priority.iconUrl,
            alt: priority.name,
        }));
        return priorities;
    }

    get allAssignees() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.USER,
        )
            .filter(
                ({
                    id,
                    integrationId,
                }: {
                    id: string;
                    integrationId: string;
                }) =>
                    this.projectId === id.split('/')[2] &&
                    this._entity.integrationId === integrationId,
            )
            .map(({ user }: any) => user);
    }

    get assigneesByEntity() {
        return [
            { id: null, label: 'No Assignee', icon: undefined },
            ...this.users.map(
                ({ accountId, displayName, avatarUrls }: any) => ({
                    id: accountId,
                    label: displayName,
                    img: avatarUrls['48x48'],
                    alt: displayName,
                }),
            ),
        ];
    }

    get flattenedProperties() {
        return (
            this.$store.getters['integrationData/byId'](this.entity.id)
                ?.properties ?? {}
        );
    }

    projectById(integrationId: string, projectId: string) {
        const integration =
            this.$store.getters['integration/byId'](integrationId);
        const composedId = `${JiraIntegrationDataType.PROJECT}/${integration?.data.clouds[0].id}/${projectId}`;
        return this.$store.getters['integrationData/byId'](composedId);
    }

    projects() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        );
    }

    projectPriorities(project: any) {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PRIORITY,
        );
    }

    setProperties(entity: any) {
        const status = this.$store.getters['integrationData/byId'](
            entity.properties.status,
        ) ?? { status: null, transitions: [] };
        const assignee =
            this.$store.getters['integrationData/byId'](
                entity.properties.assignee,
            )?.user ?? null;
        const reporter =
            this.$store.getters['integrationData/byId'](
                entity.properties.reporter,
            )?.user ?? null;
        const parent =
            this.$store.getters['integrationData/byId'](
                entity.properties.parent,
            ) ?? null;
        const project =
            this.projectById(entity.integrationId, entity.properties.project) ??
            null;
        return {
            ...entity,
            properties: {
                ...entity.properties,
                status: status.status,
                assignee,
                reporter,
                parent,
                project,
                priority: this.projectPriorities(project).find(
                    (priority: any) =>
                        priority.id === entity.properties.priority,
                ),
            },
        };
    }

    createId(
        projectId: string,
        id: string,
        type: string = JiraIntegrationDataType.ISSUE,
    ) {
        const cloudId = this.cloud.id;
        return `${type}/${cloudId}/${projectId}/${id}`;
    }

    changeStatus(newStatus: any, trackingSource?: TrackingActionSource) {
        const transition =
            this.entity.properties.transitions.find(
                ({ id }: { id: string; to: any }) =>
                    newStatus.transitionId === id,
            ) ??
            this.entity.properties.transitions.find(
                ({ to: { id } }: { id: string; to: any }) =>
                    newStatus.transitionId === id,
            );

        const statusId = this.createId(
            this.projectId,
            transition.to.id,
            JiraIntegrationDataType.STATUS,
        );
        this.$store.dispatch('integrationData/update', {
            id: this.entity.id,
            properties: {
                ...this.flattenedProperties,
                transition: { id: transition.id },
                status: statusId,
            },
        });
        this.$notification.show({
            component: () =>
                import('@/components/integrations/jira/JiraNotification.vue'),
            bind: {
                entityId: this.entity.id,
                action: JiraActions.UPDATE,
                property: 'Status',
            },
        });

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.CHANGE_STATUS,
            source: trackingSource,
        });
    }

    changeAssignee(newAssignee: any, trackingSource?: TrackingActionSource) {
        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.CHANGE_ASSIGNEE,
            source: trackingSource,
        });
        if (!newAssignee?.id) {
            this.$store.dispatch('integrationData/update', {
                id: this.entity.id,
                properties: {
                    ...this.flattenedProperties,
                    assignee: null,
                    assigneeObj: null,
                },
            });
            this.$notification.show({
                component: () =>
                    import(
                        '@/components/integrations/jira/JiraNotification.vue'
                    ),
                bind: {
                    entityId: this.entity.id,
                    action: JiraActions.UPDATE,
                    property: 'Assignee',
                },
            });
            return;
        }
        const assignee = this.allAssignees.find(
            (assignee: any) => assignee.accountId === newAssignee.id,
        ) as any;

        const assigneeId = this.createId(
            this.projectId,
            assignee.accountId!,
            JiraIntegrationDataType.USER,
        );
        this.$store.dispatch('integrationData/update', {
            id: this.entity.id,
            properties: {
                ...this.flattenedProperties,
                assignee: assigneeId,
                assigneeObj: assignee,
            },
        });
        this.$notification.show({
            component: () =>
                import('@/components/integrations/jira/JiraNotification.vue'),
            bind: {
                entityId: this.entity.id,
                action: JiraActions.UPDATE,
                property: 'Assignee',
            },
        });
    }

    changePriority(newPriority: any, trackingSource?: TrackingActionSource) {
        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.CHANGE_PRIORITY,
            source: trackingSource,
        });
        if (!newPriority.id) {
            this.$store.dispatch('integrationData/update', {
                id: this.entity.id,
                properties: {
                    ...this.flattenedProperties,
                    priority: null,
                },
            });
            this.$notification.show({
                component: () =>
                    import(
                        '@/components/integrations/jira/JiraNotification.vue'
                    ),
                bind: {
                    entityId: this.entity.id,
                    action: JiraActions.UPDATE,
                    property: 'Priority',
                },
            });
            return;
        }
        const priority = this.allPriorities.find(
            (priority: any) => priority.id === newPriority.id,
        ) as any;

        this.$store.dispatch('integrationData/update', {
            id: this.entity.id,
            properties: {
                ...this.flattenedProperties,
                priority: priority.id,
                priorityObj: priority,
            },
        });
        this.$notification.show({
            component: () =>
                import('@/components/integrations/jira/JiraNotification.vue'),
            bind: {
                entityId: this.entity.id,
                action: JiraActions.UPDATE,
                property: 'Priority',
            },
        });
    }

    changeLabels(props: any, trackingSource?: TrackingActionSource) {
        this.$store.dispatch('integrationData/update', {
            id: this.entity.id,
            properties: {
                ...this.flattenedProperties,
                ...props,
            },
        });

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.CHANGE_LABELS,
            source: trackingSource,
        });
    }

    clipDocument(id: string) {
        this.$entities.page.clipPage(id, this.entity.id);
    }

    async redirect(event: MouseEvent, page: IDocument) {
        this.$emit('click', event);
        const docId = page ? page.id : await this.createDocumentContent();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: this.source,
            sourceMeta: TrackingActionSourceMeta.JIRA,
        });
        const tab = this.$tabs.createNewTabObject(docId, TabType.DOCUMENT);
        this.$emit('close');
        await this.$tabs.openTabWithEvent(tab, event);
    }

    async createDocumentContent() {
        const timestamp = new Date();
        const clipData = this.$store.getters['integrationData/byId'](
            this.entity.id,
        );
        const id = v4();
        const title = clipData?.text
            ? `${clipData?.key} ${clipData?.text}`
            : '';
        await this.$store.dispatch('document/new', {
            id,
            title,
            content: '<p></p>',
            status: 'new',
            updatedAt: timestamp,
            createdAt: timestamp,
            clip: this.entity.id,
            template: false,
        });
        await this.clipDocument(id);

        // source
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.ADD_CLIP,
            source: this.source,
            sourceMeta: TrackingActionSourceMeta.JIRA,
            entityId: id,
        });

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: this.source,
            sourceMeta: TrackingActionSourceMeta.JIRA,
            entityId: id,
        });

        return id;
    }
}
</script>
