<template>
    <div class="github-view-participants"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';

@Component({
    name: 'GithubViewParticipants',
})
export default class GithubViewParticipants extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;
}
</script>
<style lang="scss" scoped>
.github-view-participants {
}
</style>
