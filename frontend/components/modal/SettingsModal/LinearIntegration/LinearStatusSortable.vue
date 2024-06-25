<template>
    <draggable v-model="orderedStatuses" v-bind="dragOptions">
        <transition-group ref="statuses" type="transition" name="statuses">
            <div v-for="status in orderedStatuses" :key="status.id">
                <div class="jira-sorted__status">
                    <div class="jira-sorted__status__wrapper">
                        <component
                            :is="getStatusIcon(status.status.statusCategory)"
                            class="jira-sorted__status__icon"
                            :style="{
                                color: getStatusColor(
                                    status.status.statusCategory,
                                ),
                            }"
                        />
                        <div class="jira-sorted__status__name">
                            {{ status.status.name }}
                        </div>
                    </div>
                    <div class="jira-sorted__status__drag-handle">
                        <ComputerConnectionSignalLoading size="12" />
                    </div>
                </div>
            </div>
        </transition-group>
    </draggable>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { JiraIntegrationDataType } from '~/constants/jira';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import { IntegrationType, JiraStatusColors } from '~/constants';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceGeometricCircleAlternate from '~/components/streamline/InterfaceGeometricCircleAlternate.vue';
import InterfaceArrowsRight from '~/components/streamline/InterfaceArrowsRight.vue';
import ComputerConnectionSignalLoading from '~/components/streamline/ComputerConnectionSignalLoading.vue';

@Component({
    name: 'JiraStatusSortable',
    components: {
        ComputerConnectionSignalLoading,
        InterfaceArrowsRight,
        draggable: () => import('vuedraggable'),
    },
})
export default class JiraStatusSortable extends Vue {
    @Prop()
    projectId!: string;

    get project() {
        return this.$store.getters['integrationData/byId'](this.projectId);
    }

    get integrations() {
        return (
            this.$store.getters['integration/byType'](IntegrationType.JIRA) ??
            []
        );
    }

    get dragOptions() {
        return {
            animation: 200,
            group: {
                name: 'status' + this.projectId,
                pull: true,
                put: ['status' + this.projectId],
            },
            disabled: false,
            ghostClass: 'ghost',
            dragClass: 'dragged-status',
        };
    }

    enabledProjects(id: string) {
        return this.projects[id].filter((p: any) => p.syncEnabled);
    }

    get orderedStatuses() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.STATUS,
        )
            .filter(
                (status: any) =>
                    status.id.split('/')[2] ===
                    this.project.id.split('/').pop(),
            )
            .sort((a: any, b: any) => a.order - b.order);
    }

    set orderedStatuses(values: any[]) {
        this.$store.dispatch(
            'integrationData/batchUpdate',
            values.map((status, index) => ({
                ...status,
                order: index,
            })),
        );
    }

    get projects() {
        return this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        ).reduce((acc: any, curr: any) => {
            if (!acc[curr.integrationId]) {
                acc[curr.integrationId] = [];
            }
            acc[curr.integrationId].push(curr);
            return acc;
        }, {});
    }

    getStatusIcon(statusCategory: string) {
        switch (statusCategory) {
            case 'TODO':
                return InterfaceEditSelectAreaCircleDash;
            case 'DONE':
                return InterfaceValidationCheckCircle;
            default:
                return InterfaceGeometricCircleAlternate;
        }
    }

    getStatusColor(statusCategory: string) {
        switch (statusCategory) {
            case 'TODO':
                return JiraStatusColors.TODO;
            case 'DONE':
                return JiraStatusColors.DONE;
            default:
                return JiraStatusColors.IN_PROGRESS;
        }
    }
}
</script>
<style lang="scss" scoped>
.jira-sorted {
    &__status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background: var(--settings-modal-jira-sortable-bg-color);
        border-radius: 5px;
        margin-bottom: 4px;

        &__wrapper {
            display: flex;
            align-items: center;
            justify-items: flex-start;
        }

        @include font12-500;

        cursor: move;

        &__icon {
            margin-right: 8px;
        }

        &__drag-handle {
            flex-shrink: 0;
            transform: rotate(90deg);
            color: var(--settings-modal-jira-sortable-icon-color);
            opacity: 0;
        }

        &:hover:not(.ghost) {
            background: var(--settings-modal-jira-sortable-bg-color__hover);

            .jira-sorted__status__name {
                color: var(--settings-modal-jira-sortable-text-color__hover);
            }

            .jira-sorted__status__drag-handle {
                opacity: 1;
            }
        }
    }
}
</style>
