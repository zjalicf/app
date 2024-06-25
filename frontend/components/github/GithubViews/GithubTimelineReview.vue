<template>
    <div class="github-timeline-review">
        <span class="github-timeline-author">{{ event.user.login }}</span
        ><span class="github-timeline-text" @click="openInBrowser">
            left a review </span
        ><span class="github-timeline-date">{{ date() }}</span>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import { GithubEventReviewed } from '~/components/github/github';

@Component({
    name: 'GithubTimelineReview',
})
export default class GithubTimelineReview extends Vue {
    @Prop({ required: true })
    event!: GithubEventReviewed;

    openInBrowser() {
        this.$utils.navigation.openExternalLink(this.event.html_url);
    }

    date() {
        const date = new Date(this.event.submitted_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-review {
    display: block;
    margin-bottom: 8px;

    .panel & {
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jira-activity-divider-color);
    }
}
</style>
