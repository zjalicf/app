<template>
    <div v-if="entity" class="linear-issue-view">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <EntityHeader
            :clip="page"
            copy-link-text="Copy Linear link"
            external-open-text="Open in Linear"
            @close="$emit('close')"
            @copy-to-clipboard="copyToClipboard"
            @open-in-browser="openInBrowser"
            @clip-click="clipClick"
        >
            <template #meta>
                <LinearIcon :size="'18'" class="icon" />
                {{ entity.identifier }}
            </template>
            <template #backlinks></template>
        </EntityHeader>
        <div class="linear-issue-view__wrapper">
            <EntityViewTitle :title="entity.title" />
            <EntityViewRow>
                <template #title>Status</template>
                <LinearViewState
                    :state="entity.state"
                    @change="handleStateChange"
                />
            </EntityViewRow>
            <EntityViewRow>
                <template #title>Priority</template>
                <LinearViewPriority
                    :priority="entity.priority"
                    @change="handlePriorityChange"
                />
            </EntityViewRow>
            <EntityViewRow>
                <template #title>Assignee</template>
                <LinearViewUser
                    :team-id="teamId"
                    :user="entity.assignee"
                    :editable="true"
                    @change="handleAssigneeChange"
                />
            </EntityViewRow>
            <EntityViewRow>
                <template #title>Labels</template>
                <LinearViewLabels
                    :team-id="teamId"
                    :labels="entity.labels"
                    @change="handleLabelsChange"
                />
            </EntityViewRow>
            <EntityViewRow>
                <template #title>Project</template>
                <LinearViewProject
                    :team-id="teamId"
                    :project="entity.project"
                    @change="handleProjectChange"
                />
            </EntityViewRow>
            <EntityViewRow v-if="entity.cycle">
                <template #title>Cycle</template>
                <LinearViewCycle
                    :team-id="teamId"
                    :cycle="entity.cycle"
                    @change="handleCycleChange"
                />
            </EntityViewRow>
            <EntityViewRow v-if="entity.parent">
                <template #title>Parent</template>
            </EntityViewRow>
            <div v-if="parentIssue" class="entity-view-item__full">
                <LinearIssue
                    :entity="parentIssue"
                    :display-properties="issueDisplayProperties"
                    @click.native="
                        $entities.linear.openModal(
                            parentIssue.id,
                            TrackingActionSource.LINEAR_TAB,
                        )
                    "
                />
            </div>
            <EntityViewRow v-if="entity.children && entity.children.length > 0">
                <template #title>sub-issues</template>
            </EntityViewRow>
            <div v-if="childEntities.length > 0" class="entity-view-item__full">
                <LinearIssue
                    v-for="child in childEntities"
                    :key="child.id"
                    :entity="child"
                    :display-properties="issueDisplayProperties"
                    @click.native="
                        $entities.linear.openModal(
                            child.id,
                            TrackingActionSource.LINEAR_TAB,
                        )
                    "
                />
            </div>
            <EntityViewRow
                v-if="entity.description && entity.description !== ''"
            >
                <template #title>Description</template>
            </EntityViewRow>
            <LinearViewDescription
                v-if="entity.description && entity.description !== ''"
                :description="entity.description"
            />
            <EntityViewRow v-if="issueHistory.length || issueComments.length">
                <template #title>Activity</template>
            </EntityViewRow>
            <LinearViewHistoryComments
                :issue-id="entity.id"
                :history="issueHistory"
                :comments="issueComments"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EntityViewTitle from '~/components/linear/EntityViewTitle.vue';
import EntityViewRow from '~/components/integrations/modal/EntityViewRow.vue';
import EntityHeader from '~/components/integrations/modal/EntityHeader.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';
import LinearViewState from '~/components/linear/modal/LinearViewState.vue';
import LinearViewPriority from '~/components/linear/modal/LinearViewPriority.vue';
import LinearViewUser from '~/components/linear/modal/LinearViewUser.vue';
import LinearViewLabels from '~/components/linear/modal/LinearViewLabels.vue';
import LinearViewProject from '~/components/linear/modal/LinearViewProject.vue';
import LinearViewHistoryComments from '~/components/linear/modal/LinearViewHistoryComments.vue';
import LinearViewDescription from '~/components/linear/modal/LinearViewDescription.vue';
import LinearViewCycle from '~/components/linear/modal/LinearViewCycle.vue';
import { TabType } from '~/constants';
import { LinearDisplayPropertiesOptions } from '~/components/linear/constants';
import LinearIssue from '~/components/linear/app/LinearIssue.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'LinearIssueView',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        LinearIssue,
        LinearViewCycle,
        LinearViewDescription,
        LinearViewHistoryComments,
        LinearViewLabels,
        LinearViewUser,
        LinearViewPriority,
        LinearViewProject,
        LinearViewState,
        LinearIcon,
        EntityViewRow,
        EntityViewTitle,
        EntityHeader,
    },
})
export default class LinearIssueView extends Vue {
    @Prop({ required: true })
    id!: string;

    get entity() {
        return this.$entities.linear.deserializeIssue(
            this.$entities.linear.getById(this.id),
        );
    }

    get page() {
        return this.$entities.page.findByClipId(this.id);
    }

    get teamId() {
        return this.entity.team.split('/').pop()!;
    }

    get issueHistory() {
        return this.entity.history ?? [];
    }

    get issueComments() {
        return this.entity.comments ?? [];
    }

    get parentIssue() {
        const parent = this.$entities.linear.getById(this.entity.parent);
        if (!parent) return null;
        return this.$entities.linear.deserializeIssue(parent);
    }

    get issueDisplayProperties() {
        return [
            LinearDisplayPropertiesOptions.PRIORITY,
            LinearDisplayPropertiesOptions.STATUS,
            LinearDisplayPropertiesOptions.KEY,
            LinearDisplayPropertiesOptions.ASSIGNEE,
        ];
    }

    get childEntities() {
        const issues =
            this.entity.children
                ?.map((id: string) => this.$entities.linear.getById(id))
                .filter((v: any) => !!v) ?? [];
        return this.$entities.linear.deserializeIssues(issues);
    }

    handleStateChange(state: any) {
        this.$entities.linear.updateState(this.entity, state);
    }

    handlePriorityChange(priority: any) {
        this.$entities.linear.updatePriority(this.entity, priority);
    }

    handleAssigneeChange(assignee: any) {
        this.$entities.linear.updateAssignee(this.entity, assignee);
    }

    handleProjectChange(project: any) {
        this.$entities.linear.updateProject(this.entity, project);
    }

    handleCycleChange(cycle: any) {
        this.$entities.linear.updateCycle(this.entity, cycle);
    }

    handleLabelsChange(labels: any[]) {
        this.$entities.linear.updateLabels(this.entity, labels);
    }

    copyToClipboard() {
        this.$utils.copyToClipboard(
            this.entity.url || '',
            'Copied to clipboard',
        );
    }

    openInBrowser() {
        this.$entities.page.openClippedUrl(this.entity.url);
        this.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.OPEN_IN_BROWSER,
            source: TrackingActionSource.LIENAR_ISSUE_MODAL,
        });
    }

    clipClick() {
        if (!this.page) {
            this.$entities.linear.createPageFromEntity(this.entity);
            return;
        }
        this.$vfm.hideAll();
        const tab = this.$tabs.createNewTabObject(
            this.page.id,
            TabType.DOCUMENT,
        );
        this.$tabs.openTab(tab);
    }

    mounted() {
        this.$entities.linear.fetchIssue(
            this.$entities.linear.parseId(this.entity.id).id,
        );
        this.$entities.linear.fetchCommentsAndHistory(this.entity.id);
    }
}
</script>
<style lang="scss" scoped>
.entity-view-item__full {
    padding-bottom: 8px;
}

.linear-issue-view {
    cursor: default;
    user-select: none;

    &__header-meta {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    &__wrapper {
        padding: 12px 30px 30px;

        .linear-panel & {
            padding: 0px 15px 15px;
        }
    }
}
</style>
