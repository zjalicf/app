<template>
    <div class="github-entity-view">
        <GithubIssueView v-if="type === 'issue'" issue="" />
        <GithubPullRequestView v-if="type === 'pull'" pull="" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import { isGithubIssue, isGithubPullRequest } from '~/plugins/entities/github';
import GithubIssueView from '~/components/github/GithubIssueView.vue';
import GithubPullRequestView from '~/components/github/GithubPullRequestView.vue';

@Component({
    name: 'GithubEntityView',
    components: { GithubPullRequestView, GithubIssueView },
})
export default class GithubEntityView extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    get type() {
        if (isGithubIssue(this.entity)) {
            return 'issue';
        }

        if (isGithubPullRequest(this.entity)) {
            return 'pull';
        }

        return 'repo';
    }
}
</script>
<style lang="scss" scoped>
.github-entity-view {
}
</style>
