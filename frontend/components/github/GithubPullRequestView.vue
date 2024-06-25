<template>
    <div v-if="entity" class="github-pull-request-view">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <GithubViewHeader :entity="entity" @close="$emit('close')" />
        <div class="github-pull-request-view__wrapper">
            <GithubViewTitle :entity="entity" />
            <GithubViewRow>
                <template #title>Status</template>
                <GithubViewStatus :entity="entity" />
            </GithubViewRow>
            <GithubViewRow>
                <template #title>Branch</template>
                <GithubViewBranch :entity="entity" />
            </GithubViewRow>
            <GithubViewRow>
                <template #title>Repository</template>
                <GithubViewRepository :entity="entity" />
            </GithubViewRow>
            <GithubViewRow v-if="entity.assignees.length > 0">
                <template #title>Assignees</template>
                <GithubViewAssignees :entity="entity" />
            </GithubViewRow>
            <GithubViewRow v-if="hasReviewers">
                <template #title>Reviewers</template>
                <GithubViewReviewers :entity="entity" />
            </GithubViewRow>
            <GithubViewRow v-if="entity.labels.length > 0">
                <template #title>Labels</template>
                <GithubLabelsPill :entity="entity" />
            </GithubViewRow>
            <GithubViewChecks :entity="entity" />
            <GithubViewDescription :entity="entity" />
            <GithubViewActivity :entity="entity" />
            <GithubViewComment :entity="entity" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubPullRequest } from '~/components/github/github';
import GithubViewHeader from '~/components/github/GithubViews/GithubViewHeader.vue';
import GithubViewTitle from '~/components/github/GithubViews/GithubViewTitle.vue';
import GithubViewRow from '~/components/github/GithubViews/GithubViewRow.vue';
import GithubViewBranch from '~/components/github/GithubViews/GithubViewBranch.vue';
import GithubViewStatus from '~/components/github/GithubViews/GithubViewStatus.vue';
import GithubViewAssignees from '~/components/github/GithubViews/GithubViewAssignees.vue';
import GithubViewReviewers from '~/components/github/GithubViews/GithubViewReviewers.vue';
import GithubViewLabels from '~/components/github/GithubViews/GithubViewLabels.vue';
import GithubViewChecks from '~/components/github/GithubViews/GithubViewChecks.vue';
import GithubViewDescription from '~/components/github/GithubViews/GithubViewDescription.vue';
import GithubViewActivity from '~/components/github/GithubViews/GithubViewActivity.vue';
import GithubViewComment from '~/components/github/GithubViews/GithubViewComment.vue';
import GithubViewRepository from '~/components/github/GithubViews/GithubViewRepository.vue';
import GithubLabelsPill from '~/components/github/GithubLabelsPill.vue';
import { getRepositoryName } from '~/plugins/entities/github';

@Component({
    name: 'GithubPullRequestView',
    components: {
        GithubLabelsPill,
        GithubViewRepository,
        GithubViewComment,
        GithubViewActivity,
        GithubViewDescription,
        GithubViewChecks,
        GithubViewLabels,
        GithubViewReviewers,
        GithubViewAssignees,
        GithubViewStatus,
        GithubViewBranch,
        GithubViewRow,
        GithubViewTitle,
        GithubViewHeader,
    },
})
export default class GithubPullRequestView extends Vue {
    @Prop({ required: true })
    id!: GithubPullRequest['id'];

    get entity(): GithubPullRequest | null {
        return this.$entities.github.getById(
            this.id,
        ) as GithubPullRequest | null;
    }

    get hasReviewers() {
        if (!this.entity) return false;
        return (
            (this.entity.requested_reviewers &&
                this.entity.requested_reviewers.length > 0) ||
            (this.entity.requested_teams &&
                this.entity.requested_teams.length > 0)
        );
    }

    mounted() {
        if (!this.entity) return;

        const repository = getRepositoryName(this.entity);
        this.$entities.github.fetchPullRequest(
            repository,
            `${this.entity.number}`,
        );
    }
}
</script>
<style lang="scss" scoped>
.github-pull-request-view {
    cursor: default;
    user-select: none;

    &__wrapper {
        padding: 12px 30px 30px;

        .github-panel & {
            padding: 0px 15px 15px;
        }
    }
}
</style>
