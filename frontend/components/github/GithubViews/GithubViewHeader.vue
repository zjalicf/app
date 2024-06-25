<template>
    <div class="github-view-header">
        <div class="github-view-header__meta">
            <div class="github-view-header__icon">
                <GithubEntityIcon :entity="entity" />
            </div>
            <div class="github-view-header__number">#{{ entity.number }}</div>
        </div>
        <div class="github-view-header__actions">
            <EntityLinksPill
                v-if="backlinks.length && viewContext === 'modal'"
                :backlinks="backlinks"
                :source-meta="linksSourceMeta"
            />
            <button
                class="quick-action-item has-tippy"
                :data-tippy-content="`<div tabindex='-1' class='tooltip'>Copy GitHub link</div>`"
                @click="copyToClipboard"
            >
                <InterfaceLink v-if="!success" />
                <InterfaceValidationCheck v-else class="icon" />
            </button>
            <button
                class="quick-action-item has-tippy"
                :data-tippy-content="`<div tabindex='-1' class='tooltip'>Open on Github</div>`"
                @click="openInBrowser"
            >
                <InterfaceLinkSquare />
            </button>
            <GithubClipButton
                v-if="viewContext === 'modal'"
                :entity="entity"
                :source="TrackingActionSource.GITHUB_MODAL"
                @close="$emit('close')"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import {
    GithubIntegrationDataType,
    GithubIssue,
    GithubPullRequest,
    GithubSymbols,
} from '~/components/github/github';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceArrowsExpandDiagonal1 from '~/components/streamline/InterfaceArrowsExpandDiagonal1.vue';
import InterfaceArrowsExpand3Alternate from '~/components/streamline/InterfaceArrowsExpand3Alternate.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import GithubClipButton from '~/components/github/GithubClipButton.vue';
import InterfaceArrowsDiagonalAlternate from '~/components/streamline/InterfaceArrowsDiagonalAlternate.vue';
import EntityLinksPill from '~/components/entities/EntityLinksPill.vue';
import InterfaceFileClipboard from '~/components/streamline/InterfaceFileClipboard.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubViewHeader',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        InterfaceLink,
        InterfaceValidationCheck,
        InterfaceFileClipboard,
        EntityLinksPill,
        InterfaceArrowsDiagonalAlternate,
        GithubClipButton,
        InterfaceDelete1,
        InterfaceArrowsExpand3Alternate,
        InterfaceArrowsExpandDiagonal1,
        InterfaceLinkSquare,
        GithubEntityIcon,
    },
})
export default class GithubViewHeader extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    @Inject(GithubSymbols.VIEW_CONTEXT)
    viewContext!: string;

    success: boolean = false;

    get backlinks() {
        return this.$entities.github.getBacklinks(this.entity.id);
    }

    get linksSourceMeta() {
        if (this.entity.type === GithubIntegrationDataType.PR) {
            return TrackingActionSourceMeta.GITHUB_PULL_REQUEST_MODAL;
        }

        return TrackingActionSourceMeta.GITHUB_ISSUE_MODAL;
    }

    openInBrowser() {
        if (this.entity.type === GithubIntegrationDataType.PR) {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.OPEN_GITHUB_PULL_REQUEST_IN_BROWSER,
                source: TrackingActionSource.GITHUB_PULL_REQUEST_MODAL,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.OPEN_GITHUB_ISSUE_IN_BROWSER,
                source: TrackingActionSource.GITHUB_ISSUE_MODAL,
            });
        }

        this.$entities.github.openInBrowser(this.entity);
    }

    copyToClipboard() {
        if (this.success) return;

        this.$utils.copyToClipboard(this.entity.html_url || '');

        this.success = true;

        setTimeout(() => {
            this.success = false;
        }, 4000);
    }
}
</script>
<style lang="scss" scoped>
.github-view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: var(--jira-panel-header-bg-color);
    -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
    backdrop-filter: blur(12px); /* Chrome and Opera */
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 24px 30px 16px 30px;
    z-index: 1;

    .panel & {
        background: var(--panel-header-background);
        padding: 14px 15px 14px;
    }

    &__meta {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
    }

    &__number {
        @include font12-500;
        color: var(--github-view-header-number-color);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .quick-action-item {
            color: var(--jira-panel-header-icon-color);
            padding: 7px;
            flex-shrink: 0;
            border-radius: 4px;

            &:hover {
                color: var(--jira-panel-header-icon-color__hover);
            }
        }
    }
}
</style>
