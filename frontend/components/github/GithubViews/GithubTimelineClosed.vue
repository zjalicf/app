<template>
    <div class="github-timeline-closed" v-html="message()"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import { GithubEventClosed } from '~/components/github/github';

@Component({
    name: 'GithubTimelineClosed',
})
export default class GithubTimelineClosed extends Vue {
    @Prop({ required: true })
    event!: GithubEventClosed;

    date() {
        const date = new Date(this.event.created_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }

    message() {
        const actor = this.event.actor.login;
        const date = this.date();

        return `<span class="github-timeline-author">${actor}</span><span class="github-timeline-text"> closed this </span><span class="github-timeline-date">${date}</span>`;
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-closed {
    margin-bottom: 8px;

    .panel & {
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jira-activity-divider-color);
    }
}
</style>
