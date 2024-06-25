<template>
    <div class="links-dropdown">
        <div v-if="backlinks.length" class="links-dropdown__section">
            <p class="links-dropdown__section__title">BACKLINKS</p>
            <div class="links-dropdown__section__links">
                <DocumentLink
                    v-for="document in backlinks"
                    :key="document.id"
                    :document="document"
                    :disable-preview="true"
                    :styled="false"
                    :open-panel-on-navigate="false"
                    :source="TrackingActionSource.BACKLINK_DROPDOWN"
                    :source-meta="sourceMeta"
                    @link:navigate="$emit('navigate', document.id)"
                />
            </div>
        </div>
        <div
            v-if="
                links.length ||
                githubLinks.length ||
                linearLinks.length ||
                jiraLinks.length
            "
            class="links-dropdown__section"
        >
            <p class="links-dropdown__section__title">LINKS</p>
            <div class="links-dropdown__section__links">
                <DocumentLink
                    v-for="document in links"
                    :key="document.id"
                    :document="document"
                    :disable-preview="true"
                    :open-panel-on-navigate="false"
                    :styled="false"
                    :source="TrackingActionSource.BACKLINK_DROPDOWN"
                    :source-meta="sourceMeta"
                    @link:navigate="$emit('navigate', document.id)"
                />
                <div v-for="link in githubLinks" :key="link.id">
                    <GithubEntityLink
                        v-if="
                            link.type === GithubIntegrationDataType.PR ||
                            link.type === GithubIntegrationDataType.ISSUE
                        "
                        :id="link.id"
                    />
                </div>
                <div v-for="link in jiraLinks" :key="link.id">
                    <JiraEntityLink :id="link.id" />
                </div>
                <div v-for="link in linearLinks" :key="link.id">
                    <LinearEntityLink :id="link.id" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import DocumentLink from '~/components/document/DocumentLink.vue';
import JiraIssue from '~/components/integrations/jira/issue/JiraIssue.vue';

import {
    GithubIntegrationDataType,
    GithubIssue,
    GithubPullRequest,
} from '~/components/github/github';
import GithubEntityLink from '~/components/github/GithubEntityLink.vue';
import JiraEntityLink from '~/components/jira/JiraEntityLink.vue';
import {
    TrackingActionSource,
    TrackingActionSourceMeta,
} from '~/@types/tracking';
import LinearEntityLink from '~/components/linear/app/LinearEntityLink.vue';

@Component({
    name: 'LinksDropdown',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
        GithubIntegrationDataType() {
            return GithubIntegrationDataType;
        },
    },
    components: {
        LinearEntityLink,
        JiraEntityLink,
        GithubEntityLink,
        DocumentLink,
        JiraIssue,
    },
})
export default class LinksDropdown extends Vue {
    @Prop({
        default: () => [],
    })
    links!: IDocument[];

    @Prop({
        default: () => [],
    })
    githubLinks!: (GithubPullRequest | GithubIssue)[];

    @Prop({
        default: () => [],
    })
    jiraLinks!: any[];

    @Prop({
        default: () => [],
    })
    linearLinks!: any[];

    @Prop({
        default: () => [],
    })
    backlinks!: IDocument[];

    @Prop({ default: undefined })
    sourceMeta!: TrackingActionSourceMeta | undefined;
}
</script>
<style lang="scss" scoped>
.links-dropdown {
    @include frostedGlassBackground;
    @include contextMenu(340px);
    max-width: 340px;

    &__section__title {
        padding: 4px 12px;
        @include font10-700;
        color: var(--context-menu-section-title);
    }
}
</style>
