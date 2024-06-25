<template>
    <div class="x-ray-links">
        <div class="x-ray-links--list x-ray-links--list__linked">
            <h4 v-if="links.length">Linked pages</h4>
            <DocumentLink
                v-for="document in links"
                :key="document.id"
                :document="document"
                :source="TrackingActionSource.BACKLINK_INFO_PANEL"
                @link:navigate="$emit('navigate', document.id)"
            />
        </div>
        <div class="x-ray-links--list">
            <h4 v-if="backlinks.length">Backlinks</h4>
            <DocumentLink
                v-for="document in backlinks"
                :key="`${document.id}-backlink`"
                :document="document"
                :parent-document="parentDocument"
                :source="TrackingActionSource.BACKLINK_INFO_PANEL"
                class="x-ray-links__link"
                @link:navigate="$emit('navigate', document.id)"
            />
            <h4 v-if="externalLinks > 0">Links</h4>
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import DocumentLink from '~/components/document/DocumentLink.vue';
import { TrackingActionSource } from '~/@types/tracking';
import JiraEntityLink from '~/components/jira/JiraEntityLink.vue';
import LinearEntityLink from '~/components/linear/app/LinearEntityLink.vue';
import GithubEntityLink from '~/components/github/GithubEntityLink.vue';
import {
    GithubIntegrationDataType,
    GithubIssue,
    GithubPullRequest,
} from '~/components/github/github';

@Component({
    name: 'XRayLinks',
    computed: {
        GithubIntegrationDataType() {
            return GithubIntegrationDataType;
        },
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        GithubEntityLink,
        LinearEntityLink,
        JiraEntityLink,
        DocumentLink,
    },
})
export default class XRayLinks extends Vue {
    @Prop({
        default: () => [],
    })
    links!: IDocument[];

    @Prop({
        default: () => [],
    })
    backlinks!: IDocument[];

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

    get externalLinks() {
        return (
            this.githubLinks.length +
            this.jiraLinks.length +
            this.linearLinks.length
        );
    }

    @Prop()
    parentDocument!: IDocument;
}
</script>

<style lang="scss" scoped>
.x-ray-links {
    &__link {
        margin-bottom: 2px;
    }

    &--list {
        &__linked {
            margin-bottom: 10px;
        }

        h4 {
            user-select: none;
            cursor: default;
            padding-left: 6px;
            font-weight: 600;
            font-size: 12px;
            line-height: 155.2%;
            color: var(--x-ray-title-color);
            margin-bottom: 4px;
        }
    }
}
</style>
