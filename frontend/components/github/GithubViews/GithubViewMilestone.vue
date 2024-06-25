<template>
    <div class="github-view-milestones"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';

@Component({
    name: 'GithubViewMilestones',
})
export default class GithubViewMilestones extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;
}
</script>
<style lang="scss" scoped>
.github-view-milestones {
}
</style>
