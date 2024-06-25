<template>
    <div
        class="github-issue"
        :class="{ active }"
        @click="openModal"
        @contextmenu.stop.prevent="handleContextMenu"
    >
        <span
            class="github-issue__notification"
            :class="{ active: issue.acreomMeta?.notification }"
        ></span>
        <GithubIssueIcon :entity="issue" size="16" class="icon" />
        <p>
            <span v-if="displayProperty('repository')">{{
                $entities.github.getRepositoryName(issue)
            }}</span>
            {{ issue.title }}
            <span v-if="displayProperty('number')">#{{ issue.number }}</span>
        </p>
        <EntityLinksPill
            v-if="backlinks.length && showBacklinks && displayProperty('links')"
            :backlinks="backlinks"
            :source-meta="TrackingActionSourceMeta.GITHUB_ISSUE"
        />
        <div class="github-issue__comments">
            <GithubCommentPill
                v-if="issue.comments > 0 && displayProperty('comments')"
                :entity="issue"
            />
        </div>
        <div
            v-if="issue.labels.length > 0 && displayProperty('labels')"
            class="github-issue__labels"
        >
            <GithubLabelsPill :entity="issue" />
        </div>
        <div v-if="displayProperty('status')" class="github-issue__status">
            {{ $entities.github.getFormattedStatusIssue(issue, true) }}
        </div>
        <div class="github-issue__clip">
            <GithubClipButton
                :entity="issue"
                :source="TrackingActionSource.GITHUB_TAB"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue as GithubIssueType } from '~/components/github/github';
import GithubIssueIcon from '~/components/github/GithubIssueIcon.vue';
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
    name: 'GithubIssue',
    computed: {
        TrackingActionSourceMeta() {
            return TrackingActionSourceMeta;
        },
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        GithubLabelsPill,
        GithubCommentPill,
        EntityLinksPill,
        GithubClipButton,
        InterfaceArrowsDiagonalAlternate,
        GithubIssueIcon,
    },
})
export default class GithubIssue extends Vue {
    @Prop({ required: true })
    issue!: GithubIssueType;

    @Prop({ default: true })
    showBacklinks!: boolean;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    active: boolean = false;

    openModal() {
        this.$entities.github.openModal(
            this.issue,
            TrackingActionSource.GITHUB_TAB,
        );
    }

    get backlinks() {
        return this.$entities.github.getBacklinks(this.issue.id);
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
                entity: this.issue,
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.github-issue {
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

    span {
        color: var(--jira-issue-key-color);
    }

    p {
        @include ellipsis;
        color: var(--jira-issue-text-color);
    }

    .icon {
        flex-shrink: 0;
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
