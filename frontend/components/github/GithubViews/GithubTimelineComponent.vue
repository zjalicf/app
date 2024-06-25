<template>
    <component :is="entityIconComponent" v-bind="{ event, entity }" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    GithubEventTypes,
    GithubIssue,
    GithubPullRequest,
    GithubTimelineEvent,
} from '~/components/github/github';
import GithubTimelineComment from '~/components/github/GithubViews/GithubTimelineComment.vue';
import GithubTimelineCommit from '~/components/github/GithubViews/GithubTimelineCommit.vue';
import GithubTimelineReview from '~/components/github/GithubViews/GithubTimelineReview.vue';
import GithubTimelineAssigned from '~/components/github/GithubViews/GithubTimelineAssigned.vue';
import GithubTimelineClosed from '~/components/github/GithubViews/GithubTimelineClosed.vue';
import GithubTimelineLabeled from '~/components/github/GithubViews/GithubTimelineLabeled.vue';
import GithubTimelineCrossReferenced from '~/components/github/GithubViews/GithubTimelineCrossReferenced.vue';

@Component({
    name: 'GithubTimelineComponent',
})
export default class GithubTimelineComponent extends Vue {
    @Prop({ required: true })
    event!: GithubTimelineEvent;

    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;

    get entityIconComponent() {
        if (this.event.event === GithubEventTypes.COMMENTED) {
            return GithubTimelineComment;
        }

        if (this.event.event === GithubEventTypes.COMMITED) {
            return GithubTimelineCommit;
        }

        if (this.event.event === GithubEventTypes.REVIEWED) {
            return GithubTimelineReview;
        }

        if (this.event.event === GithubEventTypes.ASSIGNED) {
            return GithubTimelineAssigned;
        }

        if (this.event.event === GithubEventTypes.CLOSED) {
            return GithubTimelineClosed;
        }

        if (this.event.event === GithubEventTypes.LABELED) {
            return GithubTimelineLabeled;
        }
        if (this.event.event === GithubEventTypes.CROSS_REFERENCED) {
            return GithubTimelineCrossReferenced;
        }
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-component {
}
</style>
