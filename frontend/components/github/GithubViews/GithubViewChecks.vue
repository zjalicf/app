<template>
    <div ref="container" class="github-view-checks" :class="[size]">
        <div class="github-view-checks__title">Checks</div>
        <div class="github-view-checks__summary">
            <div
                v-if="!showSkeleton && !isEmpty"
                class="github-view-checks__summary__heading"
                @click="toggle"
            >
                <div class="github-view-checks__summary__heading__icon">
                    <GithubStatusSuccessIcon
                        v-if="summaryTitle === 'All checks have passed'"
                        size="16"
                        :style="{ color: 'var(--github-pr-open-color)' }"
                    />
                    <GithubStatusFailureIcon
                        v-if="
                            summaryTitle === 'All checks have failed' ||
                            summaryTitle === 'Some checks were not successful'
                        "
                        size="18"
                        :style="{ color: 'var(--github-pr-rejected-color)' }"
                    />
                    <LoadingIcon
                        v-if="summaryTitle === 'Some checks are in progress'"
                        size="16"
                    />
                </div>
                <div class="github-view-checks__summary__heading__title">
                    <p>{{ summaryTitle }}</p>
                    <p class="subtitle">{{ summarySubtitle }}</p>
                </div>
                <div class="github-view-checks__summary__heading__action">
                    <InterfaceGeometricTriangle
                        v-if="open"
                        class="item__content__chevron__icon"
                        size="7"
                    />
                    <InterfaceGeometricTriangle
                        v-else
                        class="item__content__chevron__icon"
                        size="7"
                        style="transform: rotate(180deg)"
                    />
                </div>
            </div>
            <div
                v-else-if="!showSkeleton && isEmpty"
                class="github-view-checks__empty"
            >
                No checks
            </div>
            <div v-else class="wrapper">
                <div class="skeleton-loader skeleton-1"></div>
                <div class="skeleton-loader skeleton-2"></div>
                <div class="skeleton-loader skeleton-3"></div>
            </div>
            <div v-if="open" class="github-view-checks__summary__body">
                <div
                    v-for="e in entity.commitChecks"
                    :key="e.id"
                    class="github-view-checks__summary__body__item"
                >
                    <div class="github-view-checks__summary__body__item__icon">
                        <GithubCommitCheckIcon :entity="e" size="12" />
                    </div>
                    <img
                        v-if="e.app?.owner?.avatar_url"
                        :src="e.app?.owner?.avatar_url"
                        width="16"
                        height="16"
                    />
                    <p>
                        {{ e.name }}
                    </p>
                    <span>{{ humanReadableCheckStatus(e.status) }}</span>
                    <span
                        class="details"
                        @click="$utils.navigation.openExternalLink(e.html_url)"
                        >Details</span
                    >
                </div>
                <div
                    v-for="s in grouppedCommitStatuses"
                    :key="s.id"
                    class="github-view-checks__summary__body__item"
                >
                    <div class="github-view-checks__summary__body__item__icon">
                        <GithubCommitStatusIcon :entity="s" size="12" />
                    </div>
                    <img
                        v-if="s.avatar_url"
                        :src="s.avatar_url"
                        width="16"
                        height="16"
                    />
                    <p>{{ s.context }}</p>
                    <span>{{ humanReadableCommitStatus(s.state) }}</span>
                    <span
                        class="details"
                        @click="$utils.navigation.openExternalLink(e.html_url)"
                        >Details</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import {
    GithubCommitCheck,
    GithubCommitStatusesResponse,
    GithubPullRequest,
    GithubSymbols,
} from '~/components/github/github';
import GithubCommitStatusIcon from '~/components/github/GithubCommitStatusIcon.vue';
import GithubCommitCheckIcon from '~/components/github/GithubCommitCheckIcon.vue';
import GithubStatusSuccessIcon from '~/components/icons/GithubStatusSuccessIcon.vue';
import GithubStatusFailureIcon from '~/components/icons/GithubStatusFailureIcon.vue';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'GithubViewChecks',
    components: {
        LoadingIcon,
        InterfaceGeometricTriangle,
        GithubStatusFailureIcon,
        GithubStatusSuccessIcon,
        GithubCommitCheckIcon,
        GithubCommitStatusIcon,
    },
})
export default class GithubViewChecks extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest;

    private interval: any = null;
    open: boolean = false;
    size: string | null = null;

    $refs!: {
        container: HTMLDivElement;
    };

    @Inject(GithubSymbols.VIEW_CONTEXT)
    viewContext!: string;

    toggle() {
        this.open = !this.open;
    }

    humanReadableCheckStatus(status: GithubCommitCheck['status']) {
        switch (status) {
            case 'queued':
                return 'Queued';
            case 'in_progress':
                return 'In progress';
            case 'completed':
                return 'Completed';
        }
    }

    humanReadableCommitStatus(status: GithubCommitStatusesResponse['state']) {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'success':
                return 'Success';
            case 'failure':
                return 'Failure';
            case 'error':
                return 'Error';
        }
    }

    get summaryMap() {
        const statusCountMap = {
            failed: 0,
            success: 0,
            in_progress: 0,
            neutral: 0,
            pending: 0,
        };

        const checks = this.entity.commitChecks || [];
        const statuses = this.grouppedCommitStatuses || [];

        checks.forEach(check => {
            switch (check.status) {
                case 'queued':
                    statusCountMap.pending++;
                    break;
                case 'in_progress':
                    statusCountMap.in_progress++;
                    break;
                case 'completed':
                    switch (check.conclusion) {
                        case 'stale':
                        case 'skipped':
                        case 'neutral':
                            statusCountMap.neutral++;
                            break;
                        case 'success':
                            statusCountMap.success++;
                            break;
                        case 'failure':
                        case 'timed_out':
                        case 'action_required':
                        case 'cancelled':
                            statusCountMap.failed++;
                            break;
                        default:
                            statusCountMap.success++;
                            break;
                    }
                    break;
            }
        });

        statuses.forEach(status => {
            switch (status.state) {
                case 'pending':
                    statusCountMap.pending++;
                    break;
                case 'success':
                    statusCountMap.success++;
                    break;
                case 'failure':
                    statusCountMap.failed++;
                    break;
                case 'error':
                    statusCountMap.failed++;
                    break;
            }
        });

        return statusCountMap;
    }

    get summaryTitle() {
        if (this.summaryMap.failed > 0) {
            if (
                this.summaryMap.pending > 0 ||
                this.summaryMap.in_progress > 0 ||
                this.summaryMap.success > 0
            ) {
                return 'Some checks were not successful';
            }

            return 'All checks have failed';
        }

        if (this.summaryMap.pending > 0 || this.summaryMap.in_progress > 0) {
            return 'Some checks are in progress';
        }

        if (
            this.summaryMap.failed === 0 &&
            this.summaryMap.pending === 0 &&
            this.summaryMap.in_progress === 0 &&
            this.summaryMap.success > 0
        ) {
            return 'All checks have passed';
        }
    }

    get summarySubtitle() {
        const title = [];

        if (this.summaryMap.failed > 0) {
            title.push(`${this.summaryMap.failed} failed`);
        }

        if (this.summaryMap.pending > 0) {
            title.push(`${this.summaryMap.pending} pending`);
        }

        if (this.summaryMap.in_progress > 0) {
            title.push(`${this.summaryMap.in_progress} in progress`);
        }

        if (this.summaryMap.success > 0) {
            title.push(`${this.summaryMap.success} successful`);
        }

        if (this.summaryMap.neutral > 0) {
            title.push(`${this.summaryMap.neutral} neutral`);
        }

        return title.join(', ');
    }

    get grouppedCommitStatuses() {
        const groupped: Record<string, GithubCommitStatusesResponse> = {};

        this.entity.commitStatuses?.forEach(
            (s: GithubCommitStatusesResponse) => {
                if (!groupped[s.context]) {
                    groupped[s.context] = s;
                    return;
                }

                if (
                    new Date(s.updated_at) >
                    new Date(groupped[s.context].updated_at)
                ) {
                    groupped[s.context] = s;
                }
            },
        );

        return Object.values(groupped);
    }

    fetchData() {
        const commitId = this.entity.head?.sha;
        const repository = this.$entities.github.getRepositoryName(this.entity);

        if (!repository || !commitId) return;

        return Promise.all([
            this.$entities.github.fetchCommitChecks(
                repository,
                commitId,
                this.entity.id,
            ),
            this.$entities.github.fetchCommitStatuses(
                repository,
                commitId,
                this.entity.id,
            ),
        ]);
    }

    get showSkeleton() {
        const hasCommitStatuses =
            this.entity.commitStatuses && this.entity.commitStatuses.length > 0;
        const hasCommitChecks =
            this.entity.commitChecks && this.entity.commitChecks.length > 0;
        const isLoading = this.entity.acreomMeta?.loadingCommitChecks ?? true;

        return (!hasCommitStatuses || !hasCommitChecks) && isLoading;
    }

    get isEmpty() {
        if (!this.entity.commitStatuses && !this.entity.commitChecks)
            return true;

        return (
            this.entity.commitStatuses?.length === 0 &&
            this.entity.commitChecks?.length === 0
        );
    }

    async mounted() {
        this.size = this.viewContext === 'modal' ? null : 'small';

        this.$entities.github.updateAcreomMeta(this.entity, {
            loadingCommitChecks: true,
        });

        await this.fetchData();

        setTimeout(() => {
            this.$entities.github.updateAcreomMeta(this.entity, {
                loadingCommitChecks: false,
            });
        }, 500);

        this.interval = setInterval(() => {
            this.fetchData();
        }, 60 * 1000);
    }

    beforeDestroy() {
        clearInterval(this.interval);
    }
}
</script>
<style lang="scss" scoped>
@keyframes shine {
    to {
        background-position: calc(100% + 510px) 0;
    }
}

.github-view-checks {
    display: grid;
    grid-template-columns: 100px 1fr;
    align-items: flex-start;
    margin-bottom: 12px;
    width: 100%;
    overflow: hidden;
    cursor: default;
    user-select: none;

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

    &.small {
        display: block;
    }

    &__title {
        padding: 5px 0px;
        @include font10-700;
        text-transform: uppercase;
        color: var(--github-view-row-title-color);

        .small & {
            margin-bottom: 6px;
        }
    }

    &__empty {
        @include font12-400;
        font-style: italic;
        color: var(--github-activity-empty-color);
        padding: 6px 12px 6px 10px;
    }

    .wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px 6px 10px;
    }

    &__summary {
        overflow: hidden;
        backdrop-filter: blur(6px);
        border-radius: 8px;

        &:not(.empty):not(.loading) {
            border: 1px solid var(--github-checks-summary-border-color);
            background: var(--github-checks-summary-background);
        }

        &__heading {
            padding: 6px 12px 6px 10px;
            display: flex;
            align-items: center;

            &:hover {
                background: var(--github-checks-summary-background__hover);
            }

            &__icon {
                margin-right: 10px;

                .small & {
                    margin-right: 8px;
                }
            }

            &__title {
                @include font12-600;
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--github-checks-summary-title-color);

                .small & {
                    display: block;
                }

                .subtitle {
                    @include font12-400;
                    color: var(--github-checks-summary-subtitle-color);
                }
            }

            &__action {
                margin-left: auto;
            }
        }

        &__body {
            border-top: 1px solid var(--github-checks-summary-border-color);
            margin: 0 12px 0 10px;
            padding: 8px 0 6px 0;

            &__item {
                @include font12-500;
                display: flex;
                align-items: center;
                color: var(--github-checks-summary-body-item-color);

                p {
                    @include ellipsis;
                }

                &:not(:last-of-type) {
                    margin-bottom: 6px;
                }

                &__icon {
                    padding: 2px;
                    margin-right: 10px;

                    .small & {
                        margin-right: 8px;
                    }
                }

                .details {
                    margin-left: auto;
                    color: var(--accent-color);

                    &:hover {
                        text-decoration: underline;
                    }
                }

                img {
                    .small & {
                        display: none;
                    }

                    margin-right: 6px;
                    border-radius: 4px;
                }

                span {
                    .small & {
                        display: none;
                    }

                    @include font12-400;
                    margin-left: 4px;
                    margin-right: 4px;
                    color: var(--github-checks-summary-body-item-span-color);
                }
            }
        }
    }
}
</style>
