<template>
    <div class="github-view-labels">
        <GithubLabel
            v-for="label in entity.labels"
            :key="label.id"
            :label="label"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubLabel from '~/components/github/GithubViews/GithubLabel.vue';

@Component({
    name: 'GithubViewLabels',
    components: { GithubLabel },
})
export default class GithubViewLabels extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;
}
</script>
<style lang="scss" scoped>
.github-view-labels {
}
</style>
