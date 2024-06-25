<template>
    <div
        class="github-pull-request"
        :class="{ active }"
        @click="openPullRequest"
        @contextmenu.stop.prevent="handleContextMenu"
    >
        <span
            class="github-pull-request__notification"
            :class="{ active: pullRequest.acreomMeta?.notification }"
        ></span>
        <GithubPullRequestIcon :entity="pullRequest" size="16" class="icon" />
        <p>
            <span v-if="displayProperty('repository')">{{
                $entities.github.getRepositoryName(pullRequest)
            }}</span>
            {{ pullRequest.title }}
            <span v-if="displayProperty('number')"
                >#{{ pullRequest.number }}</span
            >
        </p>
        <EntityLinksPill
            v-if="backlinks.length && showBacklinks && displayProperty('links')"
            :backlinks="backlinks"
            :source-meta="TrackingActionSourceMeta.GITHUB_PULL_REQUEST"
        />
        <div class="github-pull-request__comments">
            <GithubCommentPill
                v-if="pullRequest.comments > 0 && displayProperty('comments')"
                :entity="pullRequest"
            />
        </div>
        <div
            v-if="pullRequest.labels.length > 0 && displayProperty('labels')"
            class="github-pull-request__labels"
        >
            <GithubLabelsPill :entity="pullRequest" />
        </div>
        <div
            v-if="displayProperty('status')"
            class="github-pull-request__status"
        >
            {{
                $entities.github.getFormattedStatusPullRequest(
                    pullRequest,
                    true,
                )
            }}
        </div>
        <div class="github-pull-request__clip">
            <GithubClipButton
                :entity="pullRequest"
                :source="TrackingActionSource.GITHUB_TAB"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { GithubPullRequest as GithubPullRequestType } from '~/components/github/github';
import GithubPullRequestIcon from '~/components/github/GithubPullRequestIcon.vue';
import InterfaceArrowsDiagonalAlternate from '~/components/streamline/InterfaceArrowsDiagonalAlternate.vue';
import GithubClipButton from '~/components/github/GithubClipButton.vue';
import EntityLinksPill from '~/components/entities/EntityLinksPill.vue';
import GithubCommentPill from '~/components/github/GithubCommentPill.vue';
import GithubLabelsPill from '~/components/github/GithubLabelsPill.vue';
import { TabSymbols } from '~/constants/symbols';
import GithubContextMenu from '~/components/github/GithubContextMenu.vue';
import {
    TrackingActionSource,
    TrackingActionSourceMeta,
} from '~/@types/tracking';

@Component({
    name: 'GithubPullRequest',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
        TrackingActionSourceMeta() {
            return TrackingActionSourceMeta;
        },
    },
    components: {
        GithubLabelsPill,
        GithubCommentPill,
        EntityLinksPill,
        GithubClipButton,
        InterfaceArrowsDiagonalAlternate,
        GithubPullRequestIcon,
    },
})
export default class GithubPullRequest extends Vue {
    @Prop({ required: true })
    pullRequest!: GithubPullRequestType;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ default: true })
    showBacklinks!: boolean;

    active: boolean = false;

    openPullRequest() {
        this.$entities.github.openModal(
            this.pullRequest,
            TrackingActionSource.GITHUB_TAB,
        );
    }

    get backlinks() {
        return this.$entities.github.getBacklinks(this.pullRequest.id);
    }

    get displayProperties() {
        return (
            this.$store.getters['tabs/byId'](this.tabId).data
                .selectedDisplayProperties ?? []
        );
    }

    displayProperty(property: string) {
        return this.displayProperties.includes(property);
    }

    handleContextMenu(e: MouseEvent) {
        this.active = true;
        this.$contextMenu.show(e, {
            component: GithubContextMenu,
            bind: {
                entity: this.pullRequest,
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.github-pull-request {
    font-weight: 500;
    font-size: 13px;
    line-height: 24px;
    padding: 4px 5px 4px 7px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    cursor: default;
    user-select: none;

    .icon {
        flex-shrink: 0;
    }

    p {
        @include ellipsis;
        color: var(--jira-issue-text-color);
    }

    &__labels {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    &__notification {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;

        &.active {
            background: var(--orange-color);
        }
    }

    span {
        color: var(--jira-issue-key-color);
    }

    &:hover,
    &.active {
        background: var(--document-card-bg-color_hover);
        border-radius: 6px;
    }

    &__backlinks {
        @include font12-500;
        display: flex;
        align-items: center;
        gap: 5px;
        color: $blueGrey400;
        background: $blueGrey100-05;
        padding: 2px 12px;
        border-radius: 30px;

        &:hover,
        &.active {
            background: $blueGrey800;
            color: $white;
        }
    }

    &__comments {
        margin-left: auto;
    }

    &__status {
        @include font12-400;
        color: $blueGrey400;
        white-space: nowrap;
    }
}
</style>
