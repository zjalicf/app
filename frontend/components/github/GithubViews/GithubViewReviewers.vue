<template>
    <div class="github-view-reviewers">
        <GithubViewAssignee
            v-for="reviewer in [
                ...submittedReviews,
                ...entity.requested_reviewers,
            ]"
            :key="reviewer.id"
            :assignee="reviewer"
        />
        <GithubViewTeam
            v-for="team in entity.requested_teams"
            :key="team.id"
            :team="team"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    GithubPullRequest,
    GithubTimelineEvent,
} from '~/components/github/github';
import GithubViewAssignee from '~/components/github/GithubViews/GithubViewAssignee.vue';
import GithubViewTeam from '~/components/github/GithubViews/GithubViewTeam.vue';

@Component({
    name: 'GithubViewReviewers',
    components: { GithubViewTeam, GithubViewAssignee },
})
export default class GithubViewReviewers extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest;

    get submittedReviews() {
        const timeline =
            this.entity.timeline?.sort(
                (a: GithubTimelineEvent, b: GithubTimelineEvent) => {
                    // sort by created_at descending;
                    // @ts-ignore
                    const aDate = new Date(a.created_at || a.committer?.date);
                    // @ts-ignore
                    const bDate = new Date(b.created_at || b.committer?.date);

                    return aDate.getTime() - bDate.getTime();
                },
            ) ?? [];

        // find all reviewed events and return latest by author
        const reviewedEvents = timeline.reduce(
            (
                acc: { [key: string]: GithubTimelineEvent },
                event: GithubTimelineEvent,
            ) => {
                if (event.event === 'reviewed') {
                    acc[event.user.id] = event;
                }

                return acc;
            },
            {},
        );

        // @ts-ignore
        return Object.values(reviewedEvents).map(event => ({
            // @ts-ignore
            ...event.user,
            // @ts-ignore,
            state: event.state,
            // @ts-ignore
            review_url: event.html_url,
        }));
    }
}
</script>
<style lang="scss" scoped>
.github-view-reviewers {
    padding: 4px 0px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
