<template>
    <div class="github-timeline-cross-referenced">
        <span class="github-timeline-author">{{ event.actor.login }}</span
        ><span class="github-timeline-text" @click="openInBrowser">
            mentioned this {{ type }} in {{ refSource }} </span
        ><span class="github-timeline-date">{{ date() }}</span>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import {
    GithubEventCrossReferenced,
    GithubIssue,
    GithubPullRequest,
} from '~/components/github/github';
import { isGithubPullRequest } from '~/plugins/entities/github';

@Component({
    name: 'GithubTimelineCrossReferenced',
})
export default class GithubTimelineCrossReferenced extends Vue {
    @Prop({ required: true })
    event!: GithubEventCrossReferenced;

    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;

    get type() {
        return isGithubPullRequest(this.entity) ? 'pull request' : 'issue';
    }

    get refSource() {
        return `#${this.event.source.issue.number}`;
    }

    openInBrowser() {
        this.$utils.navigation.openExternalLink(
            this.event.source.issue.html_url,
        );
    }

    date() {
        const date = new Date(this.event.created_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-cross-referenced {
    margin-bottom: 8px;

    .label {
        @include font12-500;
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: var(--github-timeline-label-background);
        border: 1px solid var(--github-timeline-label-border-color);
        border-radius: 30px;
        gap: 4px;

        span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }
    }

    .panel & {
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jira-activity-divider-color);
    }
}
</style>
