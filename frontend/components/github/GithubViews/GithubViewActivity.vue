<template>
    <div class="github-view-activity">
        <div class="github-view-activity__title">Activity</div>
        <div
            v-if="sortedTimeline?.length > 0"
            class="github-view-activity__list"
        >
            <GithubTimelineComponent
                v-for="event in sortedTimeline"
                :key="event.id"
                :event="event"
                :entity="entity"
                class="github-view-activity-event"
                :class="{ seen: isSeen(event) }"
            />
        </div>
        <div v-else class="github-view-activity__empty">
            <div
                v-if="showSkeleton"
                class="github-view-activity__empty__wrapper"
            >
                <div class="skeleton-loader skeleton-1"></div>
                <div class="skeleton-loader skeleton-2"></div>
                <div class="skeleton-loader skeleton-3"></div>
            </div>
            <div v-else>No activity</div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubTimelineComponent from '~/components/github/GithubViews/GithubTimelineComponent.vue';

@Component({
    name: 'GithubViewActivity',
    components: { GithubTimelineComponent },
})
export default class GithubViewActivity extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    get sortedTimeline() {
        return (
            this.entity.timeline?.sort((a: any, b: any) => {
                // sort by created_at descending;
                const aDate = new Date(a.created_at || a.committer?.date);
                const bDate = new Date(b.created_at || b.committer?.date);

                return aDate.getTime() - bDate.getTime();
            }) ?? []
        );
    }

    get showSkeleton() {
        const hasTimeline =
            this.entity.timeline && this.entity.timeline.length > 0;
        const isLoading = this.entity.acreomMeta?.loadingTimeline ?? true;

        return !hasTimeline && isLoading;
    }

    isSeen(event: any) {
        const lastActivitySeenTimestamp =
            this.entity.acreomMeta?.lastActivitySeenTimestamp;

        const ts =
            event.created_at || event.committer?.date || event.submitted_at;

        if (!ts || !lastActivitySeenTimestamp) return false;

        return new Date(ts) <= new Date(lastActivitySeenTimestamp);
    }

    async mounted() {
        const issueNumber = `${this.entity.number}`;
        const repository = this.$entities.github.getRepositoryName(this.entity);

        if (!repository || !issueNumber) return;

        this.$entities.github.updateAcreomMeta(this.entity, {
            loadingTimeline: true,
        });

        await this.$entities.github.fetchTimeline(
            repository,
            issueNumber,
            this.entity.id,
        );

        setTimeout(() => {
            this.$entities.github.updateAcreomMeta(this.entity, {
                loadingTimeline: false,
            });
        }, 200);
    }
}
</script>
<style lang="scss" scoped>
@keyframes shine {
    to {
        background-position: calc(100% + 510px) 0;
    }
}

.github-view-activity {
    cursor: default;

    .skeleton-loader:empty {
        width: 100%;
        display: block;
        background: linear-gradient(
                90deg,
                rgba(52, 60, 75, 0) 0%,
                rgba(107, 120, 143, 0.2) 52.08%,
                rgba(0, 0, 0, 0) 100%
            ),
            var(--sekeleton-color);
        background-repeat: repeat-y;
        animation: shine 1s infinite;
        height: 18px;
        border-radius: 20px;
    }

    .skeleton-1 {
        max-width: 72px;
        background-size: 72px 100%;
        background-position: calc(-100% - 72px) 0;
    }

    .skeleton-2 {
        max-width: 52px;
        background-size: 72px 100%;
        background-position: calc(-100% - 72px) 0;
    }

    .skeleton-3 {
        max-width: 132px;
        background-size: 72px 100%;
        background-position: calc(-100% - 72px) 0;
    }

    &__title {
        @include font10-700;
        text-transform: uppercase;
        color: var(--github-view-row-title-color);
        margin-bottom: 8px;
    }

    .github-view-activity-event.seen + .github-view-activity-event:not(.seen) {
        border-top: 1px solid var(--github-activity-border-color);
        padding-top: 10px;
        position: relative;

        &::before {
            @include font10-700;
            content: 'New Activity';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--github-new-activity-background);
            padding: 0 8px;
            border-radius: 4px;
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
            color: var(--github-new-activity-color);
            text-transform: uppercase;
        }
    }

    &__empty {
        @include font12-400;
        font-style: italic;
        color: var(--github-activity-empty-color);

        &__wrapper {
            display: flex;
            align-items: center;
            gap: 6px;
        }
    }
}
</style>
