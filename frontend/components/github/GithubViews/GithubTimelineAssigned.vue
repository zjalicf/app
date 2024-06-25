<template>
    <div class="github-timeline-assigned" v-html="message()"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import { GithubEventAssigned } from '~/components/github/github';

@Component({
    name: 'GithubTimelineAssigned',
})
export default class GithubTimelineAssigned extends Vue {
    @Prop({ required: true })
    event!: GithubEventAssigned;

    date() {
        const date = new Date(this.event.created_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }

    message() {
        const actor = this.event.actor.login;
        const assignee = this.event.assignee.login;
        const date = this.date();

        if (actor === assignee) {
            return `<span class="github-timeline-author">${actor}</span><span class="github-timeline-text"> self-assigned this </span><span class="github-timeline-date">${date}</span>`;
        }

        return `<span class="github-timeline-author">${actor}</span><span class="github-timeline-text"> assigned </span><span class="github-timeline-author">${assignee}</span> <span class="github-timeline-date">${date}</span>`;
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-assigned {
    margin-bottom: 8px;

    .panel & {
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jira-activity-divider-color);
    }
}
</style>
