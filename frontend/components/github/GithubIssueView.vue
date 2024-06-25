<template>
    <div v-if="entity" class="github-issue-view">
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
        <div class="github-issue-view__wrapper">
            <GithubViewTitle :entity="entity" />
            <GithubViewRow>
                <template #title>Status</template>
                <GithubViewStatus :entity="entity" />
            </GithubViewRow>
            <GithubViewRow>
                <template #title>Repository</template>
                <GithubViewRepository :entity="entity" />
            </GithubViewRow>
            <GithubViewRow v-if="entity.assignees.length > 0">
                <template #title>Assignees</template>
                <GithubViewAssignees :entity="entity" />
            </GithubViewRow>
            <GithubViewRow v-if="entity.labels.length > 0">
                <template #title>Labels</template>
                <GithubLabelsPill :entity="entity" />
            </GithubViewRow>
            <GithubViewDescription :entity="entity" />
            <GithubViewActivity :entity="entity" />
            <GithubViewComment :entity="entity" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue } from '~/components/github/github';
import GithubViewBranch from '~/components/github/GithubViews/GithubViewBranch.vue';
import GithubViewActivity from '~/components/github/GithubViews/GithubViewActivity.vue';
import GithubViewChecks from '~/components/github/GithubViews/GithubViewChecks.vue';
import GithubViewDescription from '~/components/github/GithubViews/GithubViewDescription.vue';
import GithubViewTitle from '~/components/github/GithubViews/GithubViewTitle.vue';
import GithubViewAssignees from '~/components/github/GithubViews/GithubViewAssignees.vue';
import GithubViewHeader from '~/components/github/GithubViews/GithubViewHeader.vue';
import GithubViewLabels from '~/components/github/GithubViews/GithubViewLabels.vue';
import GithubViewRow from '~/components/github/GithubViews/GithubViewRow.vue';
import GithubViewStatus from '~/components/github/GithubViews/GithubViewStatus.vue';
import GithubViewComment from '~/components/github/GithubViews/GithubViewComment.vue';
import GithubViewRepository from '~/components/github/GithubViews/GithubViewRepository.vue';
import GithubLabelsPill from '~/components/github/GithubLabelsPill.vue';

@Component({
    name: 'GithubIssueView',
    components: {
        GithubLabelsPill,
        GithubViewRepository,
        GithubViewComment,
        GithubViewStatus,
        GithubViewRow,
        GithubViewLabels,
        GithubViewHeader,
        GithubViewAssignees,
        GithubViewTitle,
        GithubViewDescription,
        GithubViewChecks,
        GithubViewActivity,
        GithubViewBranch,
    },
})
export default class GithubIssueView extends Vue {
    @Prop({ required: true })
    id!: GithubIssue['id'];

    get entity() {
        return this.$entities.github.getById(this.id);
    }
}
</script>
<style lang="scss" scoped>
.github-issue-view {
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
