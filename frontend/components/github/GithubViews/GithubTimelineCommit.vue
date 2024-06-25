<template>
    <div class="github-timeline-commit">
        <span class="github-timeline-author">{{ event.author.name }}</span>
        <span class="github-timeline-text" @click="openInBrowser">
            pushed 1 commit
            {{ event.message }} </span
        ><span class="github-timeline-date">{{ date() }}</span>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import { GithubEventCommited } from '~/components/github/github';

@Component({
    name: 'GithubTimelineCommit',
})
export default class GithubTimelineCommit extends Vue {
    @Prop({ required: true })
    event!: GithubEventCommited;

    openInBrowser() {
        this.$utils.navigation.openExternalLink(this.event.html_url);
    }

    date() {
        const date = new Date(this.event.author.date);
        return formatDistance(date, new Date(), { addSuffix: true });
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-commit {
    display: block;
    margin-bottom: 8px;

    .panel & {
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jira-activity-divider-color);
    }
}
</style>
