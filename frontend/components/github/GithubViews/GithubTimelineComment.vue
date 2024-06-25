<template>
    <div class="github-timeline-comment">
        <div class="github-timeline-comment__content">
            <div class="github-timeline-comment__content__header">
                <div class="github-timeline-comment__content__author">
                    <span class="github-timeline-author">{{
                        event.user.login
                    }}</span>
                    <span class="github-timeline-text">commented </span
                    ><span class="github-timeline-date">{{ date() }}</span>
                </div>
                <div class="github-timeline-comment__content__actions">
                    <button
                        class="has-tippy"
                        :data-tippy-content="
                            $utils.tooltip.createTooltip(
                                'Copy text to clipboard',
                            )
                        "
                        @click="copyToClipboard"
                    >
                        <InterfaceFileDouble size="12" />
                    </button>
                    <button
                        class="has-tippy"
                        :data-tippy-content="
                            $utils.tooltip.createTooltip('Open on GitHub')
                        "
                        @click="openExternal"
                    >
                        <InterfaceLinkSquare size="12" />
                    </button>
                </div>
            </div>
            <GithubMarkdownContent :html="html" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import {
    GithubEventCommented,
    GithubSymbols,
} from '~/components/github/github';
import GithubMarkdownContent from '~/components/github/GithubMarkdownContent.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubTimelineComment',
    components: {
        InterfaceLinkSquare,
        InterfaceFileDouble,
        GithubMarkdownContent,
    },
})
export default class GithubTimelineComment extends Vue {
    @Prop({ required: true })
    event!: GithubEventCommented;

    @Inject(GithubSymbols.TRACKING_ACTION_SOURCE)
    trackingSource!: TrackingActionSource;

    html: string = '';

    date() {
        const date = new Date(this.event.created_at);
        return formatDistance(date, new Date(), { addSuffix: true });
    }

    mounted() {
        this.html = this.event.body_html;
    }

    openExternal() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.OPEN_COMMENT_ON_GITHUB,
            source: this.trackingSource,
        });

        const url = this.event.html_url;
        this.$utils.navigation.openExternalLink(url);
    }

    copyToClipboard() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.COPY_COMMENT_TEXT,
            source: this.trackingSource,
        });

        this.$utils.copyToClipboard(
            this.event.body_html,
            'Copied to clipboard',
            {
                format: 'text/html',
            },
        );
    }
}
</script>
<style lang="scss" scoped>
.github-timeline-comment {
    margin: 16px 0px;
    display: block;
    word-break: break-all;

    &__content {
        padding: 11px 21px;
        border: 1px solid var(--github-comment-border-color);
        background: var(--github-comment-backround-color);
        border-radius: 8px;

        .panel & {
            padding: 8px 16px;
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &__actions {
            display: flex;
            align-items: center;
            gap: 4px;

            button {
                padding: 4px;
                color: var(--github-properties-icon-color);

                &:hover {
                    color: var(--github-properties-icon-color__hover);
                }
            }
        }

        &__author {
            color: var(--github-comment-author-color);
            margin-bottom: 4px;
        }
    }
}
</style>
