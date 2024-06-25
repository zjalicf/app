<template>
    <component
        :is="resolveIcon.component"
        :style="{ color: resolveIcon.color }"
        :size="size"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubPullRequest } from '~/components/github/github';
import GithubPullRequestOpenIcon from '~/components/icons/GithubPullRequestOpenIcon.vue';
import GithubPullRequestMergedIcon from '~/components/icons/GithubPullRequestMergedIcon.vue';
import GithubPullRequestDraftIcon from '~/components/icons/GithubPullRequestDraftIcon.vue';
import GithubPullRequestClosedIcon from '~/components/icons/GithubPullRequestClosedIcon.vue';
import {
    isIssueOrPullRequestClosed,
    isIssueOrPullRequestOpen,
    isPullRequestMerged,
} from '~/plugins/entities/github';

@Component({
    name: 'GithubPullRequestIcon',
})
export default class GithubPullRequestIcon extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest;

    @Prop({ required: false, default: '14' })
    size: any;

    get resolveIcon() {
        if (isIssueOrPullRequestOpen(this.entity) && !this.entity.draft) {
            return {
                component: GithubPullRequestOpenIcon,
                color: 'var(--github-pr-open-color)',
            };
        } else if (isIssueOrPullRequestOpen(this.entity) && this.entity.draft) {
            return {
                component: GithubPullRequestDraftIcon,
                color: 'var(--github-pr-draft-color)',
            };
        } else if (
            isIssueOrPullRequestClosed(this.entity) &&
            isPullRequestMerged(this.entity)
        ) {
            return {
                component: GithubPullRequestMergedIcon,
                color: 'var(--github-pr-merged-color)',
            };
        } else if (
            isIssueOrPullRequestClosed(this.entity) &&
            !isPullRequestMerged(this.entity)
        ) {
            return {
                component: GithubPullRequestClosedIcon,
                color: 'var(--github-pr-rejected-color)',
            };
        }

        return {
            component: GithubPullRequestClosedIcon,
            color: 'var(--github-pr-rejected-color)',
        };
    }
}
</script>
