<template>
    <component
        :is="resolveIcon.component"
        :style="{ color: resolveIcon.color }"
        :size="size"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubStateReason } from '~/components/github/github';
import GithubIssueOpenIcon from '~/components/icons/GithubIssueOpenIcon.vue';
import GithubIssueClosedAcceptedIcon from '~/components/icons/GithubIssueClosedAcceptedIcon.vue';
import GithubIssueClosedRejectedIcon from '~/components/icons/GithubIssueClosedRejectedIcon.vue';
import {
    isIssueOrPullRequestClosed,
    isIssueOrPullRequestOpen,
} from '~/plugins/entities/github';

@Component({
    name: 'GithubIssueIcon',
})
export default class GithubIssueIcon extends Vue {
    @Prop({ required: true })
    entity!: GithubIssue;

    @Prop({ required: false, default: '14' })
    size: any;

    get resolveIcon() {
        if (isIssueOrPullRequestOpen(this.entity)) {
            return {
                component: GithubIssueOpenIcon,
                color: 'var(--github-issue-open-color)',
            };
        } else if (
            isIssueOrPullRequestClosed(this.entity) &&
            this.entity.state_reason === GithubStateReason.COMPLETED
        ) {
            return {
                component: GithubIssueClosedAcceptedIcon,
                color: 'var(--github-issue-accepted-color)',
            };
        } else if (
            isIssueOrPullRequestClosed(this.entity) &&
            this.entity.state_reason === GithubStateReason.NOT_PLANNED
        ) {
            return {
                component: GithubIssueClosedRejectedIcon,
                color: 'var(--github-issue-rejected-color)',
            };
        } else if (isIssueOrPullRequestClosed(this.entity)) {
            return {
                component: GithubIssueClosedAcceptedIcon,
                color: 'var(--github-issue-accepted-color)',
            };
        }

        return {
            component: GithubIssueOpenIcon,
            color: 'var(--github-issue-open-color)',
        };
    }
}
</script>
<style lang="scss" scoped>
.github-issue-icon {
}
</style>
