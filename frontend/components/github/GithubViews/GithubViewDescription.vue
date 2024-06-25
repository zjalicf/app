<template>
    <div class="github-view-description">
        <div class="github-view-description__title">Description</div>
        <GithubMarkdownContent v-if="html" :html="html" />
        <div v-else class="github-view-description__empty">
            No description provided.
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubMarkdownContent from '~/components/github/GithubMarkdownContent.vue';

@Component({
    name: 'GithubViewDescription',
    components: { GithubMarkdownContent },
})
export default class GithubViewDescription extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    html: string | null = '';

    mounted() {
        this.html = this.entity.body_html;
    }
}
</script>
<style lang="scss" scoped>
.github-view-description {
    margin-bottom: 12px;
    @include font12-500;
    word-break: break-all;

    &__title {
        @include font10-700;
        text-transform: uppercase;
        color: var(--github-view-row-title-color);
        margin-bottom: 12px;
    }

    &__empty {
        @include font12-400;
        font-style: italic;
        color: $blueGrey600;
    }
}
</style>
