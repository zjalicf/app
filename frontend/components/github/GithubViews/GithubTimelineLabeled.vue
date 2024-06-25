<template>
    <div class="github-timeline-closed">
        <span class="github-timeline-author">{{ event.actor.login }}</span
        ><span class="github-timeline-text"> added </span
        ><span class="label"
            ><span :style="{ background: `#${event.label.color}` }"></span
            >{{ event.label.name }}</span
        ><span class="github-timeline-text"> label </span
        ><span class="github-timeline-date">{{ date() }}</span>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import { GithubEventLabeled } from '~/components/github/github';

@Component({
    name: 'GithubTimelineClosed',
})
export default class GithubTimelineClosed extends Vue {
    @Prop({ required: true })
    event!: GithubEventLabeled;

    date() {
        const date = new Date(this.event.created_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }

    message() {
        const actor = this.event.actor.login;
        const date = this.date();

        return `<span>${actor}</span> closed this ${date}`;
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-closed {
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
